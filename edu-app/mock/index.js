import categoriesResponse from './course/categories.json'
import listResponse from './course/list.json'
import detailResponse from './course/detail.json'
import playInfoResponse from './lesson/play-info.json'

const mockRoutes = {
  'POST /auth/sms-code': () => require('./auth/sms-code.json'),
  'POST /auth/login-by-sms': () => require('./auth/login.json'),
  'GET /course-categories': () => categoriesResponse,
  'GET /courses': () => listResponse,
  'GET /courses/1': () => detailResponse,
  'GET /lessons/1/play': () => playInfoResponse,
}

export function mockInterceptor(options) {
  const method = options.method || 'GET'
  let key = `${method} ${options.url}`

  // 动态路由匹配：/courses/数字 → 统一返回详情 mock
  if (/^GET \/courses\/\d+$/.test(key)) {
    key = 'GET /courses/1'
  }
  if (/^GET \/lessons\/\d+\/play$/.test(key)) {
    key = 'GET /lessons/1/play'
  }

  const handler = mockRoutes[key]
  if (!handler) {
    console.warn(`[Mock] 未匹配: ${key}`)
    return null
  }

  const data = handler()
  console.log(`[Mock] ${key}`, JSON.stringify(data))
  return data
}
