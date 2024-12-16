import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const gardenWorkTasksStore = defineStore('gardenWorkTasks', () => {
  state: () => ({
    /** @type {{ name: string, description: string, date: string }[]} */
    gardenWorkTasks : ref([])
  });
})
