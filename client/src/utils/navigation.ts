const TAB_PAGE_URLS = new Set([
  '/pages/home/index',
  '/pages/mall/index',
  '/pages/learn/index',
  '/pages/community/index',
  '/pages/profile/index',
])

export function isTabPage(url: string): boolean {
  const path = url.split('?')[0]
  return TAB_PAGE_URLS.has(path)
}

export function navigateToPage(url: string) {
  if (isTabPage(url)) {
    uni.switchTab({ url: url.split('?')[0] })
    return
  }
  uni.navigateTo({ url })
}

export function goHome() {
  uni.switchTab({ url: '/pages/home/index' })
}

export function goMall() {
  uni.switchTab({ url: '/pages/mall/index' })
}

export function goLearn() {
  uni.switchTab({ url: '/pages/learn/index' })
}

export function goCommunity() {
  uni.switchTab({ url: '/pages/community/index' })
}

export function goProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}

export function goCart() {
  uni.navigateTo({ url: '/pages/cart/index' })
}
