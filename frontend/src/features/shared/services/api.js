import axios from 'axios'

// Always use a relative /api path.
// • In dev  → Vite proxy forwards to Render backend
// • In prod → Vercel rewrites forward to Render backend
// Either way, the browser talks to the SAME host → zero CORS issues.
const api = axios.create({
  baseURL: '/api',
  timeout: 35000, // 35s to handle Render cold starts (free tier can take ~30s)
})

// Attach JWT token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cw_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalize error messages — give a clear hint on network failures
api.interceptors.response.use(
  res => res,
  err => {
    let message
    if (!err.response) {
      message = 'Cannot reach the server. Please try again in a moment.'
    } else {
      message = err.response.data?.message || err.message || 'Something went wrong'
    }
    return Promise.reject(new Error(message))
  }
)

export default api
