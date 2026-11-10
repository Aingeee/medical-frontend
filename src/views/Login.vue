<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="title">病历管理系统</h2>
      <el-form :model="loginForm" label-width="0">
        <el-form-item>
          <el-input v-model="loginForm.username" placeholder="用户名" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginForm.password" type="password" placeholder="密码" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" @click="handleLogin" :loading="loading">
            登 录
          </el-button>
          <el-link style="width: 100%" @click="router.push('/register')">还没有账号？去注册</el-link>

        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from '../utils/request' // 1. 换成我们封装好的 request
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    // 2. 使用 request 发请求，不需要加完整的 http 地址
    const res = await request.post('/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    // 3. 拦截器已经处理了，直接拿 access_token
    const token = res.access_token
    localStorage.setItem('token', token)
    ElMessage.success('登录成功！')

    router.push('/dashboard')
  } catch (error) {
    // 错误已经被 request.js 拦截处理并弹出提示了，这里兜底一下
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  width: 400px;
  padding: 20px;
  border-radius: 10px;
}
.title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}
</style>