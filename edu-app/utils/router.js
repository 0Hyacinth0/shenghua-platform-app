export const ROUTES = {
  HOME: '/pages/index/index',
  COURSE: '/pages/course/index',
  MESSAGE: '/pages/message/index',
  MINE: '/pages/mine/index',

  LOGIN: '/pages/login/index',
  COURSE_DETAIL: '/pages/course/detail',
  LESSON_PLAY: '/pages/course/play',
  INFO_DETAIL: '/pages/info/detail',
}

export function navigateTo(url, params = {}) {
  const query = Object.keys(params)
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&')
  const fullUrl = query ? `${url}?${query}` : url
  uni.navigateTo({ url: fullUrl })
}

export function switchTab(url) {
  uni.switchTab({ url })
}

export function redirectTo(url, params = {}) {
  const query = Object.keys(params)
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&')
  const fullUrl = query ? `${url}?${query}` : url
  uni.redirectTo({ url: fullUrl })
}

export function goBack(delta = 1) {
  uni.navigateBack({ delta })
}

export function navigateToLogin(fromPath) {
  navigateTo(ROUTES.LOGIN, { redirect: fromPath })
}
