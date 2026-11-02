import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建统一的 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})

// 请求拦截器：每次发请求前，自动带上 token
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：处理全局错误
request.interceptors.response.use(
  response => response.data, // 直接返回数据，省去每次 .data
  error => {
    if (error.response) {
      const status = error.response.status
      const msg = error.response.data.error?.message || '请求失败'

      if (status === 401) {
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        router.push('/login')
      } else {
        ElMessage.error(msg)
      }
    } else {
      ElMessage.error('服务器连接失败')
    }
    return Promise.reject(error)
  }
)

export default request