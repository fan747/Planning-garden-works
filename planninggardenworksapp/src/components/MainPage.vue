<script setup>
import { ref, onMounted } from 'vue'
import { GardenWorkTask } from "@/models/GardenWorkTask"

const gardenWorkTasks = ref([])
var taskName = ref('')
var taskType = ref('')
var taskDescription = ref('')
var taskData = ref('')

function saveGardenWorkTaskToLocalStorage(taskName, taskType, taskDescription, taskData) {
    const newGardenWorkTask = new GardenWorkTask(taskName, taskType, taskDescription, taskData);
    localStorage.setItem(taskName, JSON.stringify(newGardenWorkTask));
    console.log(newGardenWorkTask.name + " added to local storage!")
}

function loadGardenWorkTaskFromLocalStorage() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        
        try {
            const parsedGardenWorkTask = JSON.parse(value);
            
            if (parsedGardenWorkTask && typeof parsedGardenWorkTask === 'object' && 
                'name' in parsedGardenWorkTask && 'type' in parsedGardenWorkTask) {
                gardenWorkTasks.value.push(Object.assign(new GardenWorkTask(), parsedGardenWorkTask));
                console.log(parsedGardenWorkTask.name + " loaded from local storage!");
            }
        } catch (error) {
            console.warn(`Failed to parse item with key "${key}" from localStorage:`, error);
        }
    }
}

function saveGardenWorkTask(taskName, taskType, taskDescription, taskData) {
    saveGardenWorkTaskToLocalStorage(taskName, taskType, taskDescription, taskData);
    loadGardenWorkTaskFromLocalStorage(); 
    console.log(taskName + " saved to storage!")
}
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
            </select>

            <label for="taskDescription">Task description: </label>
            <input type="text" id="taskDescription" v-model="taskDescription" required/>
            
            <label for="taskData">Task data: </label>
            <input type="date" id="taskData"  v-model="taskData" required/>

            <button type="submit" @click.prevent="saveGardenWorkTask(taskName, taskType, taskDescription, taskData)">Save Task</button>
        </form>
    </section>
</template>

<style scoped></style>
