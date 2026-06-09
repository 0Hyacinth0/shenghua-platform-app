/**
 * UniApp HTTP 请求封装
 * 替代原 Axios 实例，使用 uni.request
 */

const BASE_URL = '/jeecg-boot'
const TIMEOUT = 15000

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  params?: Record<string, any>
  header?: Record<string, string>
  timeout?: number
}

interface ApiResponse {
  success: boolean
  code?: number
  result?: any
  message?: string
}

/** 将 params 对象拼接到 URL 上 */
function buildUrl(url: string, params?: Record<string, any>): string {
  if (!params) return url
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  if (entries.length === 0) return url
  const qs = entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
  return url + (url.includes('?') ? '&' : '?') + qs
}

/** 核心请求函数 */
function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.header,
    }
    if (token) {
      header['X-Access-Token'] = token
    }

    const fullUrl = buildUrl(BASE_URL + options.url, options.params)

    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data,
      header,
      timeout: options.timeout || TIMEOUT,
      success: (res) => {
        const data = res.data as ApiResponse
        if (data.success) {
          resolve(data.result ?? (data as any))
        } else {
          const msg = data.message || '请求失败'
          uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常', icon: 'none' })
        reject(new Error(err.errMsg || '网络异常'))
      },
    })
  })
}

/** HTTP 工具对象，兼容原有调用风格 */
const http = {
  get<T = any>(url: string, options?: { params?: Record<string, any> }): Promise<T> {
    return request<T>({ url, method: 'GET', params: options?.params })
  },
  post<T = any>(url: string, data?: any, options?: { params?: Record<string, any> }): Promise<T> {
    return request<T>({ url, method: 'POST', data, params: options?.params })
  },
  put<T = any>(url: string, data?: any, options?: { params?: Record<string, any> }): Promise<T> {
    return request<T>({ url, method: 'PUT', data, params: options?.params })
  },
  delete<T = any>(url: string, options?: { params?: Record<string, any> }): Promise<T> {
    return request<T>({ url, method: 'DELETE', params: options?.params })
  },
}

export default http
