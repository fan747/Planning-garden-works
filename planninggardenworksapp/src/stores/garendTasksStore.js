import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from "vue-toastification";
import { useRouter } from 'vue-router';

axios.defaults.baseURL = "http://localhost:3000";

export const useGardenTasksStore = defineStore('gardenTasks', {
  state: () => ({
    advices: [],
    gardenWorkTasks: [],
    todayGardenWorkTasks: [],
    futureGardenWorkTasks: [],
    pastGardenWorkTasks: [],
    calendarAttributes: [],
    selectedMonth: null,
    currentAdvice: '',
    currentAdviceLink: '',
    isNotificationNotSent: true,
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token, // Проверяем, залогинен ли пользователь
  },

  actions: {
    async loadAdvices() {
      try {
        const response = await axios.get('/garden-advices');
        this.advices = response.data;
      } catch (error) {
        console.error("Error fetching advices:", error);
      }
    },

    getAdvice() {
      if (this.advices.length > 0) {
        const advice = this.advices.find(item => item.month === this.selectedMonth);
        if (advice) {
          this.currentAdvice = advice.data;
          this.currentAdviceLink = advice.list_of_work_link;
        }
      }
    },

    async loadGardenWorkTasks() {
      try {
        const user_id_key = this.loadUserIDFromLocalStorage();
        const response = await axios.get('/garden-tasks', {
          params: { user_id: user_id_key }
        });
        this.gardenWorkTasks = response.data;
        this.initializeCalendarAttributes();
        this.initializeTasks();
        this.sendTodayTasksNotification();
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    },

    async saveGardenWorkTask(taskName, taskType, taskDescription, taskData) {
      const toast = useToast();
      try {
        await axios.post('/garden-tasks/', {
          user_id: this.loadTokenFromStorage(),
          name: taskName,
          description: taskDescription,
          task_type: taskType,
          date: taskData
        });
        toast.success("Задание успешно добавлено!", { timeout: 2000 });
        this.loadGardenWorkTasks();
      } catch (error) {
        console.error("Error saving task:", error);
        toast.error("Заполните все поля!", { timeout: 2000 });
      }
    },

    async switchIsFinished(taskId, isFinished) {
      const toast = useToast();
      try {
        await axios.put('/garden-tasks/', {
          is_finished: !isFinished
        }, {
          params: { id: taskId }
        });
        toast.success("Задание успешно изменено!", { timeout: 2000 });
        this.loadGardenWorkTasks();
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    },

    async deleteGardenWorkTask(taskId) {
      const toast = useToast();
      try {
        await axios.delete('/delete-tasks/', {
          params: { id: taskId }
        });
        toast.success("Задание успешно удалено!", { timeout: 2000 });
        this.loadGardenWorkTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },

    async loginUser(username, password, router) {
      const toast = useToast();
      try {
        const response = await axios.post('/login', { username, password });
        const { token } = response.data;
    
        if (token) {
          this.token = token;
          localStorage.setItem('authToken', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
    
          toast.success("Вы успешно вошли!", { timeout: 2000 });
          this.loadGardenWorkTasks(); 
    
          if (router) {
            router.push({ name: 'Home' });
          }
        }
      } catch (error) {
        console.error("Error logging in:", error);
        toast.error("Ошибка входа. Проверьте логин и пароль.", { timeout: 2000 });
      }
    },
    

    async registerUser(username, email, password, router) {
      const toast = useToast();
      try {
        const response = await axios.post('/register', { username, email, password });
        const { token } = response.data;
        toast.success("Регистрация успешна!", { timeout: 2000 });

        this.token = token;
        localStorage.setItem('authToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; 

        if (router)
        {
          router.push({ name: 'Home' });
        }
      } catch (error) {
        console.error("Error registering:", error);
        toast.error(`Ошибка регистрации. Проверьте введенные данные. ${error.response.data.error}`, { timeout: 2000 });
      }
    },

    loadTokenFromStorage() {
      const token = localStorage.getItem('authToken');
      if (token) {
        this.token = token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
      }
    },

    logoutUser(router) {
      const toast = useToast();

      this.token = null;
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization']; 

      if (router) {
        toast.success("Вы успешно вышли!", { timeout: 2000 });
        router.push({ name: 'Login' }); 
      }
    },

    initializeCalendarAttributes() {
      this.calendarAttributes = this.gardenWorkTasks.map(task => {
        const date = new Date(task.date);
        return {
          dates: [date],
          popover: { label: `${task.name} - ${task.description} - ${task.task_type}`, hideIndicator: true, },
          dot: { color: task.is_finished ? 'gray' : 'green' }
        };
      });
    },

    initializeTasks() {
      this.todayGardenWorkTasks = [];
      this.futureGardenWorkTasks = [];
      this.pastGardenWorkTasks = [];

      this.gardenWorkTasks.forEach(task => {
        if (this.isTodayTask(task)) {
          this.todayGardenWorkTasks.push(task);
        } else if (this.isPastTask(task)) {
          this.pastGardenWorkTasks.push(task);
        } else {
          this.futureGardenWorkTasks.push(task);
        }
      });
    },

    isTodayTask(task) {
      const currentDate = new Date();
      const taskDate = new Date(task.date);
      return currentDate.getDate() === taskDate.getDate() &&
        currentDate.getMonth() === taskDate.getMonth() &&
        currentDate.getFullYear() === taskDate.getFullYear();
    },

    isPastTask(task) {
      const currentDate = new Date();
      const taskDate = new Date(task.date);
      return currentDate > taskDate;
    },

    sendTodayTasksNotification() {
      if (!this.todayGardenWorkTasks.length || !this.isNotificationNotSent) return;

      if (!('Notification' in window)) {
        console.log('Браузер не поддерживает уведомления.');
        return;
      }

      const todayTasks = this.todayGardenWorkTasks.map(task => `${task.name} - ${task.description}`).join('\n');

      if (Notification.permission === 'granted') {
        const notification = new Notification('Today tasks:', {
          body: todayTasks,
          icon: 'icon.png'
        });

        notification.onclick = () => window.focus();
          this.isNotificationNotSent = false;       
      } else {
        console.log('Разрешение на уведомления не получено.');
      }
    },

    loadUserIDFromLocalStorage() {
      let user_id = localStorage.getItem('userID');

      if (!user_id) {
        user_id = this.generateRandomString();
        localStorage.setItem('userID', user_id);
      }

      return user_id;
    },



    generateRandomString(length = 32) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
    }
  }
});
