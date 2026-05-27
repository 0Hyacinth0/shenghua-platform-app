const mockRoutes = {
  // M1 开始逐步扩充：
  // 'GET /course/categories': () => require('./course/categories.json'),
  // 'GET /course/list': () => require('./course/list.json'),
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
  console.log(`[Mock] ${key}`, data)
  return data
}
