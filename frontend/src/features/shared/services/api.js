import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://loan-approval-platform.onrender.com/api',
  timeout: 30000, // 30s to handle Render cold starts
})

// Attach JWT token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cw_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalize error messages
api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api
