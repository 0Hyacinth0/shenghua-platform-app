import { getUser } from './auth'

const DEFAULT_USER_ID = 'demo_user_001'

/**
 * 获取当前用户ID
 * 优先从登录状态获取，未登录时返回默认演示用户ID
 */
export function getCurrentUserId(): string {
  const user = getUser()
  if (user && (user.id || user.userId)) {
    return user.id || user.userId
  }
  return DEFAULT_USER_ID
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentUser(): any | null {
  return getUser()
}
