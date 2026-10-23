<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="aside">
      <div class="logo">病历管理系统</div>
      <el-menu default-active="1" class="menu">
        <el-menu-item index="1">
          <el-icon><User /></el-icon>
          <span>患者管理</span>
        </el-menu-item>
        <el-menu-item index="2">
          <el-icon><Document /></el-icon>
          <span>病历管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主体 -->
    <el-container>
      <el-header class="header">
        <span>欢迎回来，医生{{ doctorName }}</span>
        <el-button type="danger" link @click="handleLogout">退出登录</el-button>
      </el-header>

      <el-main>
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>患者列表</span>
            </div>
          </template>

          <el-table :data="patients" v-loading="loading" style="width: 100%" border stripe>
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="gender" label="性别" width="80" align="center" />
            <el-table-column prop="phone" label="手机号" width="150" />
          </el-table>
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { User, Document } from '@element-plus/icons-vue'

const router = useRouter()
const doctorName = ref('')
const patients = ref([]) // 用来存患者列表
const loading = ref(false) // 加载动画

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  try {
    // 1. 获取医生信息
    const resMe = await axios.get('http://localhost:8000/me', config)
    doctorName.value = resMe.data.real_name

    // 2. 获取患者列表
    loading.value = true
    const resPatients = await axios.get('http://localhost:8000/patients', config)
    patients.value = resPatients.data
  } catch (error) {
    ElMessage.error('获取数据失败，请重新登录')
    localStorage.removeItem('token')
    router.push('/login')
  } finally {
    loading.value = false
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.card-header {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.layout-container {
  height: 100vh;
}
.aside {
  background-color: #304156;
  color: #fff;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid #1f2d3d;
}
.menu {
  border-right: none;
  background-color: #304156;
}
.menu :deep(.el-menu-item) {
  color: #bfcbd9;
}
.menu :deep(.el-menu-item.is-active),
.menu :deep(.el-menu-item:hover) {
  background-color: #263445;
  color: #409eff;
}
.header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
}
</style>