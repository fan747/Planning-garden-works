<script setup>
import { ref, onMounted } from 'vue';
import { useGardenTasksStore } from '@/stores/garendTasksStore';

const store = useGardenTasksStore();
const masks = ref({
    modelValue: 'YYYY-MM-DD',
});
var firstStart = ref(true);
var taskName = ref('');
var taskType = ref('');
var taskDescription = ref('');
var taskData = ref('');

function resetForm() {
    taskName.value = '';
    taskType.value = '';
    taskDescription.value = '';
    taskData.value = '';
}

onMounted(() => {
    store.loadGardenWorkTasks();
    store.loadAdvices();

    Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
            console.log('Разрешение на уведомления получено.');
        } else {
            console.log('Разрешение на уведомления отклонено.');
        }
    });
});

function saveGardenWorkTask() {
    store.saveGardenWorkTask(taskName.value, taskType.value, taskDescription.value, taskData.value);
    resetForm();
}

function switchIsFinished(taskId, isFinished) {
    store.switchIsFinished(taskId, isFinished);
}

function deleteGardenWorkTask(taskId) {
    store.deleteGardenWorkTask(taskId);
}

function onDateChange(page) {
    store.selectedMonth = page[0].month;
    store.getAdvice();
}
</script>

<template>
    <section class="main">
        <section class="tasks" v-if="store.gardenWorkTasks.length > 0">
            <h2>Садовые задачи:</h2>
            <h3 v-if="store.todayGardenWorkTasks.length > 0">Сегодня:</h3>
            <TaskList :tasks="store.todayGardenWorkTasks" :switchIsFinished="switchIsFinished"
                :deleteTask="deleteGardenWorkTask" />
            <h3 v-if="store.futureGardenWorkTasks.length > 0">Предстоящие задачи:</h3>
            <TaskList :tasks="store.futureGardenWorkTasks" :switchIsFinished="switchIsFinished"
                :deleteTask="deleteGardenWorkTask" />
            <h3 v-if="store.pastGardenWorkTasks.length > 0">Прошедшие задачи:</h3>
            <TaskList :tasks="store.pastGardenWorkTasks" :switchIsFinished="switchIsFinished"
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
                    @click.prevent="saveGardenWorkTask">Сохранить
                    задачу</button>
            </form>
        </section>
        <section class="dataPicker">
            <VDatePicker :masks="masks" :attributes="store.calendarAttributes" @update:pages="onDateChange" />
        </section>

        <section class="advice">
            <h2>Советы для выбранного месяца:</h2>
            <p>{{ store.currentAdvice }}</p>
            <a :href="store.currentAdviceLink" target="_blank" open>Подрабнее по ссылке</a>
        </section>
    </section>
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

button {
    padding: 10px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

button:hover {
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
    }

    section {
        width: 100%;
        max-width: 500px;
    }
}
</style>

