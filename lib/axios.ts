import axios from 'axios'
import { APP_CONFIG } from './config'

const axiosInstance = axios.create({
  baseURL: APP_CONFIG.apiUrl,
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      const isOperateur = window.location.pathname.startsWith('/operateur')
      window.location.href = isOperateur ? '/rfid-login' : '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance