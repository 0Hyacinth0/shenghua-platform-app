const PREFIX = 'edu_'

export function setStorage(key, value) {
  try {
    uni.setStorageSync(PREFIX + key, value)
  } catch (e) {
    console.error('[Storage] set failed:', key, e)
  }
}

export function getStorage(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(PREFIX + key)
    return value !== '' && value !== undefined ? value : defaultValue
  } catch (e) {
    console.error('[Storage] get failed:', key, e)
    return defaultValue
  }
}

export function removeStorage(key) {
  try {
    uni.removeStorageSync(PREFIX + key)
  } catch (e) {
    console.error('[Storage] remove failed:', key, e)
  }
}

export function getToken() {
  return getStorage('token')
}

export function setToken(token) {
  setStorage('token', token)
}

export function removeToken() {
  removeStorage('token')
}

export function getUserInfo() {
  return getStorage('user_info', null)
}

export function setUserInfo(info) {
  setStorage('user_info', info)
}

export function getPrivacyAgreed() {
  return getStorage('privacy_agreed', false)
}

export function setPrivacyAgreed(value) {
  setStorage('privacy_agreed', value)
}

export function getHomeSchema() {
  return getStorage('home_schema', null)
}

export function setHomeSchema(schema) {
  setStorage('home_schema', schema)
}

export function getLastPlayPosition(lessonId) {
  return getStorage(`play_pos_${lessonId}`, 0)
}

export function setLastPlayPosition(lessonId, position) {
  setStorage(`play_pos_${lessonId}`, position)
}

export function clearAll() {
  try {
    uni.clearStorageSync()
  } catch (e) {
    console.error('[Storage] clearAll failed:', e)
  }
}
