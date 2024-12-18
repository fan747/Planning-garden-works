<template>
    <ul>
        <li v-for="task in tasks" :key="task.id">
            <div v-if="task.is_finished" class="Finished taskContainer">
                <div class="task-info">
                    <p>{{ task.name }} : {{ task.description }} - {{ task.task_type }} - {{ task.date }}</p>
                </div>
                <input type="checkbox" @input="switchIsFinished(task._id, task.is_finished)" checked required />
                <button @click.prevent="deleteTask(task._id)">Удалить</button>
            </div>
            <div v-else class="taskContainer">
                <div class="task-info">
                    <p>{{ task.name }} : {{ task.description }} - {{ task.task_type }} - {{ task.date }}</p>
                </div>
                <input type="checkbox" @input="switchIsFinished(task._id, task.is_finished)" checked required />
                <button @click.prevent="deleteTask(task._id)">Удалить</button>
            </div>
        </li>
    </ul>
</template>
  
  <script>
  export default {
    name: "TaskList",
    props: {
      tasks: {
        type: Array,
        required: true,
      },
      switchIsFinished: {
        type: Function,
        required: true,
      },
      deleteTask: {
        type: Function,
        required: true,
      }
    },
  };
  </script>
  
  <style scoped>
  .taskContainer{
    display: flex;
    text-align: center;
    align-items: center;
    gap: 5px;
  }
li {
    display: flex;
    align-items: center; 
    justify-content: center; 
    padding: 10px;
    transition: transform 0.2s;
}

.task-info {
    flex-wrap: wrap;
    overflow: hidden; 
    text-overflow: ellipsis; 
    flex-grow: 1; 
}

.task-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

button {
    padding: 8px 12px;
    background-color: #ff5c5c;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #e04747;
}
  </style>
  