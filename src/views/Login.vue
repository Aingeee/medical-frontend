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
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from "../router/index.js";
import { useRouter } from 'vue-router'

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
    const res = await axios.post('http://localhost:8000/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    // 登录成功，拿到 token
    const token = res.data.access_token
    localStorage.setItem('token', token)
    ElMessage.success('登录成功！')

    router.push('/dashboard')
  } catch (error) {
    // 处理统一错误格式
    if (error.response && error.response.data.error) {
      ElMessage.error(error.response.data.error.message)
    } else {
      ElMessage.error('服务器连接失败')
    }
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