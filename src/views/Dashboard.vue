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
        <span>欢迎回来，医生 {{ doctorName }}</span>
        <el-button type="danger" link @click="handleLogout">退出登录</el-button>
      </el-header>

      <el-main>
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 患者管理标签页 -->
          <el-tab-pane label="患者管理" name="patients">
            <el-card shadow="never" class="inner-card">
              <template #header>
                <div class="card-header">
                  <span>患者列表</span>
                  <el-button type="primary" size="small" @click="openAddPatientDialog">
                    + 新增患者
                  </el-button>
                </div>
              </template>
              <el-table :data="patients" v-loading="loading" style="width: 100%" border stripe>
                <el-table-column prop="id" label="ID" width="80" align="center" />
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="gender" label="性别" width="80" align="center" />
                <el-table-column prop="phone" label="手机号" width="150" />
              </el-table>
            </el-card>
          </el-tab-pane>

          <!-- 病历管理标签页 -->
          <el-tab-pane label="病历管理" name="records">
            <el-card shadow="never" class="inner-card">
              <template #header>
              <div class="card-header">
                  <span>病历列表</span>
                  <el-button type="primary" size="small" @click="openAddRecordDialog">
                    + 新增病历
                  </el-button>
              </div>
              </template>
                <el-table :data="records" v-loading="loadingRecords" style="width: 100%" border stripe>
                <el-table-column prop="record_no" label="病历号" width="180" />
                <el-table-column label="患者" width="120">
                  <template #default="scope">
                    {{ getPatientName(scope.row.patient_id) }}
                  </template>
                </el-table-column>
                <el-table-column prop="visit_type" label="类型" width="80" />
                <el-table-column prop="visit_time" label="就诊时间" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.visit_time) }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'draft' ? 'info' : 'success'">
                      {{ scope.row.status === 'draft' ? '草稿' : '已签名' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" size="small" @click="openRecordDetail(scope.row)">
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </el-container>

  <!-- 新增患者弹窗 -->
  <el-dialog v-model="patientDialogVisible" title="新增患者" width="400px">
    <el-form :model="newPatient" label-width="80px">
      <el-form-item label="姓名">
        <el-input v-model="newPatient.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="newPatient.gender">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="newPatient.phone" placeholder="请输入手机号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="patientDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPatient" :loading="submitLoading">确定</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 新增病历弹窗 -->
  <el-dialog v-model="recordDialogVisible" title="新增病历" width="500px">
    <el-form :model="newRecord" label-width="90px">
      <el-form-item label="患者">
        <el-select v-model="newRecord.patient_id" placeholder="请选择患者" style="width: 100%">
          <el-option
            v-for="p in patients"
            :key="p.id"
            :label="`${p.name} (ID:${p.id})`"
            :value="p.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="就诊类型">
        <el-select v-model="newRecord.visit_type" style="width: 100%">
          <el-option label="门诊" value="门诊" />
          <el-option label="急诊" value="急诊" />
          <el-option label="住院" value="住院" />
        </el-select>
      </el-form-item>

      <el-form-item label="就诊时间">
        <el-date-picker
          v-model="newRecord.visit_time"
          type="datetime"
          placeholder="选择日期时间"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="主诉">
        <el-input v-model="newRecord.chief_complaint" placeholder="简要描述症状" />
      </el-form-item>

      <el-form-item label="现病史">
        <el-input v-model="newRecord.present_illness" type="textarea" :rows="2" />
      </el-form-item>

      <el-form-item label="过敏史">
        <el-input v-model="newRecord.allergy_history" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecord" :loading="submitRecordLoading">确定</el-button>
      </span>
    </template>
  </el-dialog>

    <!-- 病历详情抽屉 -->
  <el-drawer v-model="drawerVisible" title="病历详情" size="50%">
    <div v-if="currentRecord" class="record-detail">
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="病历号">{{ currentRecord.record_no }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentRecord.status === 'draft' ? 'info' : 'success'">
            {{ currentRecord.status === 'draft' ? '草稿' : '已签名' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="患者">{{ getPatientName(currentRecord.patient_id) }}</el-descriptions-item>
        <el-descriptions-item label="就诊类型">{{ currentRecord.visit_type }}</el-descriptions-item>
        <el-descriptions-item label="就诊时间">{{ formatDate(currentRecord.visit_time) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-descriptions title="病史信息" :column="1" border>
        <el-descriptions-item label="主诉">{{ currentRecord.chief_complaint || '无' }}</el-descriptions-item>
        <el-descriptions-item label="现病史">{{ currentRecord.present_illness || '无' }}</el-descriptions-item>
        <el-descriptions-item label="过敏史">{{ currentRecord.allergy_history || '无' }}</el-descriptions-item>
      </el-descriptions>

      <div class="drawer-footer" v-if="currentRecord.status === 'draft'">
        <el-alert title="注意：签名后病历将被锁定，不可再修改" type="warning" show-icon :closable="false" style="margin-bottom: 20px;" />
        <el-button type="success" size="large" @click="handleSignRecord" style="width: 100%;">
          确认无误，签名锁定
        </el-button>
      </div>
      <div class="drawer-footer" v-else>
        <el-alert title="该病历已签名锁定" type="success" show-icon :closable="false" />
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { User, Document } from '@element-plus/icons-vue'

const router = useRouter()
const doctorName = ref('')
const activeTab = ref('patients')

// 患者数据
const patients = ref([])
const loading = ref(false)
const patientDialogVisible = ref(false)
const submitLoading = ref(false)
const newPatient = ref({ name: '', gender: '男', phone: '' })

// 病历数据
const records = ref([])
const loadingRecords = ref(false)
const recordDialogVisible = ref(false)
const submitRecordLoading = ref(false)
const newRecord = ref({
  patient_id: null,
  visit_type: '门诊',
  visit_time: new Date(),
  chief_complaint: '',
  present_illness: '',
  allergy_history: ''
})

// 页面加载时获取数据
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  const config = { headers: { Authorization: `Bearer ${token}` } }

  try {
    const resMe = await axios.get('http://localhost:8000/me', config)
    doctorName.value = resMe.data.real_name

    loading.value = true
    const resPatients = await axios.get('http://localhost:8000/patients', config)
    patients.value = resPatients.data

    loadingRecords.value = true
    const resRecords = await axios.get('http://localhost:8000/records', config)
    records.value = resRecords.data
  } catch (error) {
    ElMessage.error('获取数据失败，请重新登录')
    localStorage.removeItem('token')
    router.push('/login')
  } finally {
    loading.value = false
    loadingRecords.value = false
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  ElMessage.success('已退出登录')
  router.push('/login')
}

// 患者相关方法
const openAddPatientDialog = () => {
  newPatient.value = { name: '', gender: '男', phone: '' }
  patientDialogVisible.value = true
}

const submitPatient = async () => {
  if (!newPatient.value.name) {
    ElMessage.warning('请输入患者姓名')
    return
  }
  submitLoading.value = true
  const token = localStorage.getItem('token')
  try {
    const res = await axios.post('http://localhost:8000/patients', newPatient.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success('患者添加成功！')
    patientDialogVisible.value = false
    patients.value.unshift(res.data)
  } catch (error) {
    ElMessage.error('添加失败')
  } finally {
    submitLoading.value = false
  }
}

// 病历相关方法
const openAddRecordDialog = () => {
  newRecord.value = {
    patient_id: patients.value.length > 0 ? patients.value[0].id : null,
    visit_type: '门诊',
    visit_time: new Date(),
    chief_complaint: '',
    present_illness: '',
    allergy_history: ''
  }
  recordDialogVisible.value = true
}

const submitRecord = async () => {
  if (!newRecord.value.patient_id) {
    ElMessage.warning('请选择患者')
    return
  }

  submitRecordLoading.value = true
  const token = localStorage.getItem('token')

  try {
    const payload = {
      ...newRecord.value,
      visit_time: newRecord.value.visit_time.toISOString()
    }
    const res = await axios.post('http://localhost:8000/records', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success('病历创建成功！')
    recordDialogVisible.value = false
    records.value.unshift(res.data)
  } catch (error) {
    if (error.response && error.response.data.error) {
      ElMessage.error(error.response.data.error.message)
    } else {
      ElMessage.error('创建失败')
    }
  } finally {
    submitRecordLoading.value = false
  }
}

// 把 ID 转成患者姓名
const getPatientName = (id) => {
  const p = patients.value.find(item => item.id === id)
  return p ? p.name : '未知患者'
}

// 格式化时间
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 详情抽屉的变量
const drawerVisible = ref(false)
const currentRecord = ref(null)

// 打开详情抽屉
// 打开详情抽屉（从后端拉取最新、最全的数据）
const openRecordDetail = async (row) => {
  const token = localStorage.getItem('token')
  try {
    // 请求后端的详情接口
    const res = await axios.get(`http://localhost:8000/records/${row.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    currentRecord.value = res.data
    drawerVisible.value = true
  } catch (error) {
    ElMessage.error(error.response?.data?.error?.message || '获取详情失败')
  }
}

// 签名锁定功能
const handleSignRecord = async () => {
  if (!currentRecord.value) return

  const token = localStorage.getItem('token')
  try {
    // 调用后端即将写的签名接口
    await axios.post(`http://localhost:8000/records/${currentRecord.value.id}/sign`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success('病历签名锁定成功，无法再修改！')

    // 更新本地表格里的状态
    currentRecord.value.status = 'signed'
    const index = records.value.findIndex(r => r.id === currentRecord.value.id)
    if (index !== -1) {
      records.value[index].status = 'signed'
    }
    drawerVisible.value = false
  } catch (error) {
    ElMessage.error(error.response?.data?.error?.message || '签名失败')
  }
}
</script>

<style scoped>
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}
.inner-card {
  border: none;
}

.record-detail {
  padding: 0 20px;
}
.drawer-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>