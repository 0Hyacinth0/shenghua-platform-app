import config from '@/config'
import { getToken, removeToken } from '@/utils/storage'
import { mockInterceptor } from '@/mock'

class Request {
  constructor() {
    this.baseUrl = config.API_BASE_URL
    this.timeout = config.REQUEST_TIMEOUT
    this.loadingCount = 0
  }

  async beforeRequest(options) {
    if (config.MOCK_MODE) {
      const mockResponse = mockInterceptor(options)
      if (mockResponse) {
        return { _mock: true, _mockResponse: mockResponse }
      }
    }

    const token = getToken()
    if (token) {
      options.header = options.header || {}
      options.header['Authorization'] = `Bearer ${token}`
    }

    return options
  }

  afterResponse(response, options) {
    const { statusCode, data } = response

    if (statusCode === 200) {
      if (data.success === false) {
        uni.showToast({ title: data.message || '请求失败', icon: 'none' })
        return Promise.reject(data)
      }
      return data
    }

    if (statusCode === 401) {
      removeToken()
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      return Promise.reject(response)
    }

    uni.showToast({
      title: data?.message || `请求异常(${statusCode})`,
      icon: 'none',
    })
    return Promise.reject(response)
  }

  async request(options) {
    const processed = await this.beforeRequest({ ...options })

    if (processed._mock) {
      return this.simulateDelay(processed._mockResponse)
    }

    return new Promise((resolve, reject) => {
      uni.request({
        url: this.baseUrl + processed.url,
        method: processed.method || 'GET',
        data: processed.data || {},
        header: processed.header || {},
        timeout: this.timeout,
        success: (res) => {
          this.afterResponse(res, processed).then(resolve).catch(reject)
        },
        fail: (err) => {
          uni.showToast({ title: '网络异常，请检查网络', icon: 'none' })
          reject(err)
        },
      })
    })
  }

  simulateDelay(data, ms = 200) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), ms)
    })
  }

  get(url, params) {
    return this.request({ url, method: 'GET', data: params })
  }

  post(url, data) {
    return this.request({ url, method: 'POST', data })
  }

  put(url, data) {
    return this.request({ url, method: 'PUT', data })
  }

  delete(url) {
    return this.request({ url, method: 'DELETE' })
  }
}

export default new Request()
