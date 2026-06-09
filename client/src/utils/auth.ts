const TOKEN_KEY = 'token'
const USER_KEY = 'mall_user'

export function getToken(): string | null {
  return uni.getStorageSync(TOKEN_KEY) || null
}

export function setToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function removeToken() {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
}

export function setUser(user: any) {
  uni.setStorageSync(USER_KEY, JSON.stringify(user))
}

export function getUser(): any {
  const u = uni.getStorageSync(USER_KEY)
  if (!u) return null
  try {
    return typeof u === 'string' ? JSON.parse(u) : u
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
