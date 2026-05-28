import smsCodeResponse from './auth/sms-code.json'
import loginResponse from './auth/login.json'

const mockRoutes = {
  'POST /auth/sms-code': () => smsCodeResponse,
  'POST /auth/login-by-sms': () => loginResponse,
}

export function mockInterceptor(options) {
  const method = options.method || 'GET'
  const key = `${method} ${options.url}`

  const handler = mockRoutes[key]
  if (!handler) {
    console.warn(`[Mock] 未匹配: ${key}`)
    return null
  }

  const data = handler()
  console.log(`[Mock] ${key}`, JSON.stringify(data))
  return data
}
