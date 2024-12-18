<script setup>
import { ref, onMounted } from 'vue'
import { GardenWorkTask } from "@/models/GardenWorkTask"
import { useToast } from "vue-toastification";
import axios from "axios"
axios.defaults.baseURL = "http://localhost:3000";

const toast = useToast();
const advices = ref([])
const gardenWorkTasks = ref([])
const todayGardenWorkTasks = ref([])
const futureGardenWorkTasks = ref([]);
const pastGardenWorkTasks = ref([]);
const masks = ref({
    modelValue: 'YYYY-MM-DD',
});
var firstStart = ref(true);
var taskName = ref('')
var taskType = ref('')
var taskDescription = ref('')
var taskData = ref('')
var calendarAttributes = ref([])
var selectedMonth = ref()
var currentAdvice = ref('')
var currentAdviceLink = ref('')

async function loadAdvices() {
    try {
        let responce = await axios.get('/garden-advices')
        advices.value = responce.data
    }
    catch (error) {
        console.error("Error fetching advices:", error);
    }
}

function getAdvice() {
    if (advices.value.length > 0) {
        currentAdvice.value = advices.value.find(item => item.month === selectedMonth.value).data
        currentAdviceLink.value = advices.value.find(item => item.month === selectedMonth.value).list_of_work_link;
        console.log(currentAdviceLink.value)
    }
}

function generateRandomString(length = 32) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function initializeCalendarAttributes() {
    let index = 0;
    calendarAttributes.value = [];
    if (gardenWorkTasks.value.length > 0) {
        gardenWorkTasks.value.forEach(element => {
            let date = new Date(element.date)
            calendarAttributes.value[index] = { dates: [date], popover: { label: `${element.name} - ${element.description}` }, dot: { color: element.is_finished ? 'gray' : 'green', } };
            index++;
        });
    }
}

async function loadGardenWorkTasks() {
    try {
        let user_id_key = loadUserIDFromLocalStorage();
        let response = await axios.get('/garden-tasks', {
            params: {
                user_id: user_id_key
            }
        });
        gardenWorkTasks.value = response.data;
        initializeCalendarAttributes();
        initializeTasks();
        sendTodayTasksNotification();
    }
    catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

async function saveGardenWorkTask(taskName, taskType, taskDescription, taskData) {
    try {
        await axios.post('/garden-tasks/', {
            user_id: loadUserIDFromLocalStorage(),
            name: taskName,
            description: taskDescription,
            task_type: taskType,
            date: taskData
        });
        console.log("Tasks added!");
        toast.success("Задание успешно добавлено!", { timeout: 2000 });
        loadGardenWorkTasks();
        resetForm();
    } catch (error) {
        console.error("Error saving task:", error);
        toast.error("Заполните все поля!", { timeout: 2000 });
    }
}

function loadUserIDFromLocalStorage() {
    let user_id = localStorage.getItem('userID');

    if (!user_id) {
        user_id = generateRandomString();
        localStorage.setItem('userID', user_id.toString());
    }
    return user_id.toString();
}

function initializeTasks() {
    todayGardenWorkTasks.value = [];
    futureGardenWorkTasks.value = [];
    pastGardenWorkTasks.value = [];

    gardenWorkTasks.value.forEach(element => {
        if (IsTodayTask(element)) {
            todayGardenWorkTasks.value.push(element);
            return;
        }
        if (IsPastTask(element)) {
            pastGardenWorkTasks.value.push(element);
            return;
        }

        futureGardenWorkTasks.value.push(element);
    });
}

async function switchIsFinished(taskId, isFinished) {
    try {
        await axios.put('/garden-tasks/', {
            is_finished: !isFinished
        }, {
            params: {
                id: taskId
            }
        });
        console.log("Task status updated!");
        toast.success("Задание успешно изменено!", { timeout: 2000 });
        loadGardenWorkTasks();
    } catch (error) {
        console.error("Error updating task status:", error);
    }
}

async function deleteGardenWorkTask(taskId) {
    try {
        await axios.delete('/delete-tasks/', {
            params: {
                id: taskId
            }
        });
        console.log("Task status deleted!");
        toast.success("Задание успешно удалено!", { timeout: 2000 });
        loadGardenWorkTasks();
    } catch (error) {
        console.error("Error updating task status:", error);
    }
}

function IsTodayTask(task) {
    let currentDate = new Date();
    let taskDate = new Date(task.date);
    return currentDate.getDate() === taskDate.getDate() && currentDate.getMonth() === taskDate.getMonth() && currentDate.getFullYear() === taskDate.getFullYear();
}

function IsPastTask(task) {
    let currentDate = new Date()
    let taskDate = new Date(task.date);
    return currentDate.getTime() > taskDate.getTime();
}

function sendTodayTasksNotification() {
    if (!firstStart || todayGardenWorkTasks.value.length === 0) {
        return;
    }

    if (!('Notification' in window)) {
        console.log('Браузер не поддерживает уведомления.');
        return;
    }

    let todayTasks = ''

    todayGardenWorkTasks.value.forEach(task => {
        todayTasks += `${task.name} - ${task.description}\n`;
    });

    if (Notification.permission === 'granted') {
        const notification = new Notification('Today tasks: ', {
            body: todayTasks,
            icon: 'icon.png'
        });

        notification.onclick = function () {
            window.focus();
        };
    } else {
        console.log('Разрешение на уведомления не получено.');
    }

    firstStart = false;
}

function onDateChange(page) {
    selectedMonth.value = page[0].month;
    getAdvice();
}

function resetForm() {
    taskName.value = '';
    taskType.value = '';
    taskDescription.value = '';
    taskData.value = '';
}

onMounted(() => {
    loadGardenWorkTasks();
    loadAdvices();

    Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
            console.log('Разрешение на уведомления получено.');
        } else {
            console.log('Разрешение на уведомления отклонено.');
        }
    });
});
</script>

<template>
    <div class="container">
    <header class="header">
        <div class="logo">
            <img src="/favicon.ico" alt="GWT Logo" />
        </div>
        <h1>GWT - сайт планирования садовых работ</h1> 
    </header>
    <section class="main">
        <section class="tasks" v-if="gardenWorkTasks.length > 0">
            <h2>Садовые задачи:</h2>
            <h3 v-if="todayGardenWorkTasks.length > 0">Сегодня:</h3>
            <TaskList :tasks="todayGardenWorkTasks" :switchIsFinished="switchIsFinished"
                :deleteTask="deleteGardenWorkTask" />
            <h3 v-if="futureGardenWorkTasks.length > 0">Предстоящие задачи:</h3>
            <TaskList :tasks="futureGardenWorkTasks" :switchIsFinished="switchIsFinished"
                :deleteTask="deleteGardenWorkTask" />
            <h3 v-if="pastGardenWorkTasks.length > 0">Прошедшие задачи:</h3>
            <TaskList :tasks="pastGardenWorkTasks" :switchIsFinished="switchIsFinished"
                :deleteTask="deleteGardenWorkTask" />
        </section>
        <section>
            <form>
                <label for="taskName">Введите название задачи:</label>
                <input type="text" id="taskName" autocomplete="off" v-model="taskName" required />

                <label for="taskTypes">Выберите тип задачи:</label>
                <select id="taskTypes" v-model="taskType" name="taskTypes">
                    <option value="Посадка">Посадка</option>
                    <option value="Полив">Полив</option>
                    <option value="Удобрение">Удобрение</option>
                    <option value="Обрезка">Обрезка</option>
                    <option value="Другое">Другое</option>
                    <option value="" selected disabled hidden>Выберите здесь</option>
                </select>

                <label for="taskDescription">Введите описание задачи: </label>
                <input type="text" id="taskDescription" autocomplete="off" v-model="taskDescription" required />

                <label for="taskData">Выберите дату задачи: </label>
                <input type="date" id="taskData" v-model="taskData" required />

                <button type="submit"
                    @click.prevent="saveGardenWorkTask(taskName, taskType, taskDescription, taskData)">Сохранить
                    задачу</button>
            </form>
        </section>
        <section class="dataPicker">
            <VDatePicker :masks="masks" :attributes="calendarAttributes" @update:pages="onDateChange" />
        </section>

        <section class="advice">
            <h2>Советы для выбранного месяца:</h2>
            <p>{{ currentAdvice }}</p>
            <a :href="currentAdviceLink" target="_blank" open>Подрабнее по ссылке</a>
        </section>
    </section>
    <footer>
        <div class="footer">
            <p>&copy; 2024 Garden Work Tasks. All rights reserved.</p>
            <div class="social-links">
                <a href="https://t.me/olegsus2" target="_blank" class="social-icon">Telegram</a>
                <a href="https://vk.com/olegik336" target="_blank" class="social-icon">VK</a>
            </div>
        </div>
    </footer>
</div>
</template>

<style scoped>
.dataPicker{
    display: flex;
    align-items: center;
    justify-content: center;
}

.container{
    display: block;
}

footer {
    position: relative;
    margin: 30px;
    color: white;
    text-align: center;
    padding: 20px;
    font-size: 14px;
    margin-top: 30px;
}

.footer p {
    margin: 10px 0;
}

.social-links {
    margin-top: 10px;
}

.social-icon {
    color: white;
    text-decoration: none;
    margin: 0 15px;
    font-size: 16px;
}

.social-icon:hover {
    text-decoration: underline;
}
.header {
    margin-top: 0;
    position: absolute;
    top: 0;
    left: 0;
    margin: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    padding: 10px 20px;
    align-self: flex-start;
}

.logo img {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    margin-right: 20px;
}

h1 {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
}

.advice {
    width: 100%;
    max-width: 500px;
    min-width: 300px;
    text-align: center;
    margin: 0 auto;
}

.main {
    font-family: Arial, sans-serif;
    background-color: #181818;
    padding: 20px;
    display: flex;
    align-items: center;
    color: white;
    max-width: fit-content;
    justify-content: center; 
}

.tasks {
    overflow-y: auto;
    min-width:fit-content;
    min-height: fit-content;
}
section {
    width: 100%;
    margin: 20px auto;
    padding: 20px;
    max-height: fit-content;
}

form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    margin: 0 auto;
}

form label {
    font-weight: bold;
    margin-bottom: 5px;
}

form input,
form select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    width: 100%;
}

form button {
    padding: 10px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

form button:hover {
    background-color: #45a049;
}

h2, h3 {
    font-weight: bold;
    text-align: center;
}

p {
    font-size: 14px;
    color: #ccc;
    text-align: center;
    margin-top: 20px;
}

.logoText{
    font-size: 14px;
    color: #ccc;
    text-align: center;
    margin-left: 10px;
    margin-bottom: 20px;
}

.tasks {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
}

li {
    display: flex;
    flex-direction: column;
    gap: 10px;

    background: #2b2b2b;
    border-radius: 5px;
}

@media (max-width: 1500px) {
    .main {
        flex-wrap: wrap;
        margin-top: 100px;
    }

    section {
        width: 100%;
        max-width: 500px;
    }
}
</style>

