import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

import App from './App.vue'
import router from './router'

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import TaskList from './props/TaskList.vue';

const app = createApp(App)

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
            console.log('Service Worker зарегистрирован с областью:', registration.scope);
        })
        .catch(function(error) {
            console.error('Ошибка регистрации Service Worker:', error);
        });
}

app.use(VCalendar, {})
app.use(createPinia())
app.use(router)
app.use(Toast)
app.component('TaskList', TaskList);
app.mount('#app')
