<script setup>
import { ref, onMounted } from 'vue'
import { GardenWorkTask } from "@/models/GardenWorkTask"
import axios from "axios"
axios.defaults.baseURL = "http://localhost:3000";


const gardenWorkTasks = ref([])
const masks = ref({
  modelValue: 'YYYY-MM-DD',
});
var taskName = ref('')
var taskType = ref('')
var taskDescription = ref('')
var taskData = ref('')
var calendarAttributes = ref([])

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
    gardenWorkTasks.value.forEach(element => {       
        let date = new Date(element.date)
        console.log(date);
        calendarAttributes.value[index] = {dates : [date], popover: {label: element.description}, dot: {color: element.is_finished ? 'gray' : 'green',}};
        index++;
    });
    console.log(calendarAttributes.value);
}

async function loadGardenWorkTask() {
    try {
        let user_id_key = loadUserIDFromLocalStorage();
        let response = await axios.get('/garden-tasks', {
            params: {
                user_id: user_id_key
            }});
        gardenWorkTasks.value = response.data;
        initializeCalendarAttributes();
        console.log(gardenWorkTasks.value)
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
        loadGardenWorkTask();
    } catch (error) {
        console.error("Error saving task:", error);
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
        loadGardenWorkTask();
    } catch (error) {
        console.error("Error updating task status:", error);
    }
}

onMounted(() => {
    loadGardenWorkTask();
});
</script>

<template>
    <section>
        <form>
            <label for="taskName">Task Name:</label>
            <input type="text" id="taskName" v-model="taskName" required />
            
            <label for="taskTypes" >Task Type:</label>
            <select id="taskTypes" v-model="taskType" name="taskTypes">
                <option value="Посадка">Посадка</option>
                <option value="Полив">Полив</option>
                <option value="Удобрение">Удобрение</option>
                <option value="Обрезка">Обрезка</option>
                <option value="Другое">Другое</option>
            </select>

            <label for="taskDescription">Task description: </label>
            <input type="text" id="taskDescription" v-model="taskDescription" required/>
            
            <label for="taskData">Task data: </label>
            <input type="date" id="taskData"  v-model="taskData" required/>

            <button type="submit" @click.prevent="saveGardenWorkTask(taskName, taskType, taskDescription, taskData)">Save Task</button>
        </form>
    </section>
    <section>
        <h2>Garden Work Tasks:</h2>
        <ul>
            <li v-for="task in gardenWorkTasks" :key="task.id">
                <div v-if="task.is_finished" class="Finished">
                    <strong>{{ task.name }}</strong>: {{ task.description }} - {{ task.task_type }} - {{ task.date }}
                    <input type="checkbox" @input="switchIsFinished(task._id, task.is_finished)" checked required/>
                </div>
                <div v-else>
                    <strong>{{ task.name }}</strong>: {{ task.description }} - {{ task.task_type }} - {{ task.date }}
                    <input type="checkbox" @input="switchIsFinished(task._id, task.is_finished)"  required/>
                </div>    
            </li>
        </ul>
    </section>
    <section>
            <VDatePicker :masks="masks" :attributes="calendarAttributes"/>
    </section>
</template>

<style scoped>
.Finished {
    text-decoration: line-through
}

</style>
