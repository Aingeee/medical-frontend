import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Register from '../views/Register.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
      { path: '/login', name: 'Login', component: Login },
      { path: '/dashboard', name: 'Dashboard', component: Dashboard },
      { path: '/register', name: 'Register', component: Register },
      { path: '/', redirect: '/login' }
  ]
})

export default router