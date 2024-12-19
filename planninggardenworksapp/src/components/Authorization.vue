<template>
    <div id="auth-app">
        <div class="modal">
            <div class="modal-content">
                <div v-if="isLogin" class="login-content">
                    <h2>Вход</h2>
                    <form @submit.prevent="handleLogin">
                        <div class="input-container">
                            <label for="login-username">Логин:</label>
                            <input v-model="loginForm.username" type="text" id="login-username" required />
                        </div class="input-container">

                        <div class="input-container">
                            <label for="login-password">Пароль:</label>
                            <input v-model="loginForm.password" type="password" id="login-password" required />
                        </div>

                        <div class="button-container">
                            <button type="submit">Войти</button>
                            <button @click="isLogin = false">Регистрация</button>
                        </div>
                    </form>

                </div>

                <div v-else>
                    <h2>Регистрация</h2>
                    <form @submit.prevent="handleRegister">
                        <div class="input-container">
                            <label for="register-username">Логин:</label>
                            <input v-model="registerForm.username" type="text" id="register-username" required />
                        </div>

                        <div class="input-container">
                            <label for="register-email">Почта:</label>
                            <input v-model="registerForm.email" type="email" id="register-email" required />
                        </div>

                        <div class="input-container">
                            <label for="register-password">Пароль:</label>
                            <input v-model="registerForm.password" type="password" id="register-password" required />
                        </div>

                        <div class="input-container">
                            <label for="register-confirm-password">Подтвердите пароль:</label>
                            <input v-model="registerForm.confirmPassword" type="password" id="register-confirm-password"
                                required />
                        </div>

                        <div class="button-container">
                            <button type="submit">Зарегистрироваться</button>
                            <button @click="isLogin = true">Назад к входу</button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useGardenTasksStore } from '@/stores/garendTasksStore';
import { useRouter } from 'vue-router';

const store = useGardenTasksStore();
const router = useRouter();

var isLogin = ref(true);
var loginForm = ref({
    username: '',
    password: ''
});
var registerForm= ref( {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

function handleLogin() {
    try {
    console.log("Логин: ", loginForm); 
    store.loginUser(loginForm.value.username, loginForm.value.password, router)
    }
    catch (error) {
        console.error("Ошибка при входе: ", error);
        alert("Ошибка при входе");
    }
}

function handleRegister() {
    try {
        if (registerForm.value.password !== registerForm.value.confirmPassword) {
            alert("Пароли не совпадают");
            return;
        }
        store.registerUser(registerForm.value.username, registerForm.value.email, registerForm.value.password, router)
        console.log("Регистрация: ", registerForm);

    } catch (error) {
        console.error("Ошибка при регистрации: ", error);
        alert("Ошибка при регистрации");
    }
}
</script>
<style scoped>
div h2{
    text-align: center;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 40px;
}
.modal-content {
    min-width: fit-content;
}
.input-container{
    display: flex;
    flex-direction: column;
    align-content: baseline;
    align-items: center;
    justify-content: space-between;
}
label{
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16px;
}
input{
    border-radius: 5px;
    border-width: 1px;
    min-height: 30px;
    min-width: 200px;
}
.button-container{
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 30px;
    max-width: 300px;
}
form {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    align-content: space-between;
    gap: 10px;
    margin-top: 30px;
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
</style>