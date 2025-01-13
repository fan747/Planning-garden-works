import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '@/components/MainPage.vue'
import Authorization from '@/components/Authorization.vue'
import { useGardenTasksStore } from '@/stores/garendTasksStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: MainPage,
      meta: { requiresAuth: true } 
    },
    {
      path: '/login',
      name: 'Login',
      component: Authorization,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const gardenTasksStore = useGardenTasksStore();
  
  if (to.meta.requiresAuth && !gardenTasksStore.isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router
