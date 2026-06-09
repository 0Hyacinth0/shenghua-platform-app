import axios from 'axios'

const http: any = axios.create({
  baseURL: '/jeecg-boot',
  timeout: 15000,
})

// 请求拦截器
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['X-Access-Token'] = token
  }
  return config
})

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data.success) {
      return data.result ?? data as any
    }
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default http
