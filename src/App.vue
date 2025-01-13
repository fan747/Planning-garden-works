<script>
import { RouterLink, RouterView } from 'vue-router';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGardenTasksStore } from './stores/garendTasksStore';

export default {
  name: 'App',
  setup() {
    try {
    const gardenTasksStore = useGardenTasksStore();
    gardenTasksStore.loadTokenFromStorage();
    const router = useRouter();

    const isAuthenticated = computed(() => !!gardenTasksStore.token);

    const logout = () => {
      try {
      gardenTasksStore.logoutUser(router);
      }
      catch (e) {
        console.error('Error in logout:', e);
      }
    };

    return {
      isAuthenticated,
      logout,
    };
  } catch (error) {
    console.error('Error in setup:', error);
  }
  },
};
</script>

<template>
  <div class="container">
    <header>
      <div class="logo-container">
        <div class="logo">
          <img src="/favicon.ico" alt="GWT Logo" />
        </div>
        <h1>GWT - сайт планирования садовых работ</h1>
      </div>
      <a class="logout" v-if="isAuthenticated" href="#" @click.prevent="logout">Выйти</a>
    </header>
    <RouterView class="router" />
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
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box
}
h1 {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
}
.logo img {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    margin-right: 20px;
}

.logo-container{
  margin: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    padding: 10px 20px;
    align-self: flex-start;
    justify-content: start;
}
footer {
    position: relative;
    margin: 30px;
    color: white;
    text-align: center;
    padding: 20px;
    font-size: 14px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer p {
    margin: 10px 0;
}
</style>
