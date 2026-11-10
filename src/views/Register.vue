<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 class="title">医生/护士注册</h2>
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="form.real_name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="form.role">
            <el-radio label="doctor">医生</el-radio>
            <el-radio label="nurse">护士</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属科室">
          <el-select v-model="form.department_id" placeholder="请选择科室" style="width: 100%">
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="handleRegister" :loading="loading">注 册</el-button>
        </el-form-item>
        <div style="text-align: center;">
          <el-link type="primary" @click="goToLogin">已有账号？去登录</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const departments = ref([])
const form = ref({
  username: '',
  password: '',
  real_name: '',
  role: 'doctor',
  department_id: null
})

// 加载科室列表供选择
onMounted(async () => {
  try {
    departments.value = await request.get('/departments')
  } catch (error) {
    console.error(error)
  }
})

const handleRegister = async () => {
  if (!form.value.username || !form.value.password || !form.value.real_name) {
    ElMessage.warning('请填写完整信息')
    return
  }
  loading.value = true
  try {
    await request.post('/register', form.value)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    // 错误由拦截器统一处理
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.register-card {
  width: 450px;
  padding: 20px;
  border-radius: 10px;
}
.title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}
</style>