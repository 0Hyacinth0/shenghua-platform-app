const TOKEN_KEY = 'token'
const USER_KEY = 'mall_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function setUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): any {
  const u = localStorage.getItem(USER_KEY)
  return u ? JSON.parse(u) : null
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
