import axios from 'axios'

// Always use a relative /api path.
// • In dev  → Vite proxy forwards to Render backend
// • In prod → Vercel rewrites forward to Render backend
// Either way, the browser talks to the SAME host → zero CORS issues.
const api = axios.create({
  baseURL: '/api',
  timeout: 65000, // 65s — covers Render free-tier cold start (can take up to 60s)
})

// Attach JWT token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cw_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalize error messages — give clear hints based on failure type
api.interceptors.response.use(
  res => res,
  err => {
    let message
    if (!err.response) {
      // No response = network/timeout issue
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        message = 'The server is taking too long to respond. Please try again in a moment.'
      } else {
        message = 'Cannot reach the server. Please check your connection and try again.'
      }
    } else {
      message = err.response.data?.message || err.message || 'Something went wrong'
    }
    return Promise.reject(new Error(message))
  }
)

export default api
