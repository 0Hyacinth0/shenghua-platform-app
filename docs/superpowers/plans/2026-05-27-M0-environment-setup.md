# M0 立项准备与基础搭建 · 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 初始化 UniApp + Vue3 项目骨架，搭建底部 Tab 框架、全局样式、请求封装和本地缓存工具，确保项目能启动、四个 Tab 可切换。

**Architecture:** 单一 UniApp 项目，Vue3 + Composition API。页面通过 `pages.json` 注册，底部 Tab 使用悬浮胶囊样式。所有 API 请求经 `utils/request.js` 统一处理 Token、401、错误和 loading。mock 数据通过拦截器注入，由 `config.js` 中 `MOCK_MODE` 全局开关控制。

**Tech Stack:** UniApp + Vue3 + Composition API，系统字体（iOS PingFang SC / Android system-ui），CSS 变量管理设计 Token。

---

## 前置确认（你手动完成，非 Claude Code 任务）

- [ ] 确认 JEECG Boot 版本和部署方式（后端团队）
- [ ] 确认短信服务供应商
- [ ] 确认视频存储/播放服务（对象存储或云点播）
- [ ] 确认 UniApp 开发工具：HBuilderX 或 CLI

---

## 文件结构总览

```
edu-app/
├── pages/
│   ├── index/index.vue        # 首页（空壳）
│   ├── course/index.vue       # 课程列表（空壳）
│   ├── message/index.vue      # 消息中心（空壳）
│   └── mine/index.vue         # 我的（空壳）
├── api/
│   └── .gitkeep
├── utils/
│   ├── request.js             # 请求封装（拦截器 + Token + 错误处理）
│   ├── storage.js             # 本地缓存工具
│   └── router.js              # 路由跳转封装
├── mock/
│   └── index.js               # mock 注册入口
├── styles/
│   └── variables.css          # CSS 变量（颜色/字号/间距/圆角）
├── static/
│   └── .gitkeep
├── pages.json                 # 页面注册 + Tab 配置 + 全局窗口
├── App.vue                    # 应用入口
├── main.js                    # Vue 初始化
├── manifest.json              # UniApp 应用配置
├── config.js                  # 全局配置（MOCK_MODE / API_BASE_URL）
└── .gitignore
```

---

### Task 1: 创建 UniApp 项目骨架

**Files:**
- Create: `edu-app/main.js`
- Create: `edu-app/App.vue`
- Create: `edu-app/manifest.json`
- Create: `edu-app/.gitignore`

- [ ] **Step 1: 创建 main.js**

```javascript
// edu-app/main.js
import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
```

- [ ] **Step 2: 创建 App.vue**

```vue
<!-- edu-app/App.vue -->
<script setup>
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('[App] Launch')
})
</script>

<style>
/* 全局样式在 styles/variables.css 中，通过 @import 引入 */
</style>
```

- [ ] **Step 3: 创建 manifest.json**

```json
{
  "name": "教育App",
  "appid": "__UNI__EDUAPP",
  "description": "教育移动应用",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "app-plus": {
    "usingComponents": true,
    "nvueStyleCompiler": "uni-app",
    "compilerVersion": 3,
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "safearea": {
      "bottom": {
        "offset": "auto"
      }
    }
  },
  "h5": {
    "routerMode": "hash"
  },
  "mp-weixin": {
    "appid": "",
    "setting": {
      "urlCheck": false
    }
  }
}
```

- [ ] **Step 4: 创建 .gitignore**

```text
# edu-app/.gitignore
node_modules/
.DS_Store
*.log
dist/
unpackage/
```

- [ ] **Step 5: 验证**

在 HBuilderX 或 CLI 中打开 `edu-app/` 目录，确认项目能被识别。

---

### Task 2: CSS 变量与全局样式

**Files:**
- Create: `edu-app/styles/variables.css`

- [ ] **Step 1: 创建 CSS 变量文件**

```css
/* edu-app/styles/variables.css */

/* ========== 品牌色 ========== */
:root {
  --color-primary: #F0524A;
  --color-primary-light: #FFF1EF;
  --color-primary-border: #FFD8D4;
  --color-warning: #F6B75C;
  --color-link: #4AA3FF;

  /* ========== 中性色 ========== */
  --color-text-primary: #202331;
  --color-text-secondary: #5E6370;
  --color-text-tertiary: #9AA0AA;
  --color-border: #EEF0F4;
  --color-page-bg: #F7F8FB;
  --color-card-bg: #FFFFFF;

  /* ========== 功能图标底色 ========== */
  --color-icon-blue-bg: #EEF9FF;
  --color-icon-blue-border: #CBEFFF;
  --color-icon-red-bg: #FFF0F0;
  --color-icon-red-border: #FFD8D8;
  --color-icon-yellow-bg: #FFF8E7;
  --color-icon-yellow-border: #FFE8A8;
  --color-icon-green-bg: #EEFFF6;
  --color-icon-green-border: #CFF2DD;
  --color-icon-purple-bg: #F3F0FF;
  --color-icon-purple-border: #DDD4FF;

  /* ========== 字号（rpx 适配） ========== */
  --font-title-page: 60rpx;       /* 30px → 60rpx */
  --font-title-section: 48rpx;    /* 24px → 48rpx */
  --font-title-card: 36rpx;       /* 18px → 36rpx */
  --font-body: 30rpx;             /* 15px → 30rpx */
  --font-auxiliary: 26rpx;        /* 13px → 26rpx */
  --font-tab: 24rpx;              /* 12px → 24rpx */

  /* ========== 间距 ========== */
  --spacing-page-h: 32rpx;        /* 16px */
  --spacing-card-padding: 32rpx;
  --spacing-section-gap: 56rpx;
  --spacing-icon-text: 18rpx;
  --spacing-list-item: 28rpx;

  /* ========== 圆角 ========== */
  --radius-search: 44rpx;
  --radius-icon-container: 36rpx;
  --radius-card: 32rpx;
  --radius-cover: 24rpx;
  --radius-bottom-nav: 64rpx;
  --radius-button: 48rpx;

  /* ========== 底部导航 ========== */
  --nav-height: 140rpx;
  --nav-bg: rgba(255, 255, 255, 0.92);
  --nav-shadow: 0 16rpx 56rpx rgba(32, 35, 49, 0.10);
  --nav-selected-bg: #EEF0F4;
  --nav-selected-color: #F0524A;
  --nav-unselected-color: #202331;

  /* ========== 安全区 ========== */
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
}

/* ========== 全局 reset ========== */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC',
               'SF Pro', system-ui, 'Noto Sans CJK SC', sans-serif;
  font-size: var(--font-body);
  color: var(--color-text-primary);
  background-color: var(--color-page-bg);
  -webkit-font-smoothing: antialiased;
}

view, text, image, scroll-view, swiper, swiper-item {
  box-sizing: border-box;
}
```

- [ ] **Step 2: 在 App.vue 中引入全局样式**

```vue
<!-- edu-app/App.vue -->
<script setup>
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('[App] Launch')
})
</script>

<style>
@import '@/styles/variables.css';
</style>
```

- [ ] **Step 3: 验证**

在任意页面中写一个使用 CSS 变量的 view，确认变量生效：
```vue
<view style="color: var(--color-primary)">红色文字测试</view>
```

---

### Task 3: pages.json 配置 + 底部悬浮胶囊导航

**Files:**
- Create: `edu-app/pages.json`

- [ ] **Step 1: 创建 pages.json**

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/course/index",
      "style": {
        "navigationBarTitleText": "课程",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/message/index",
      "style": {
        "navigationBarTitleText": "消息",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/mine/index",
      "style": {
        "navigationBarTitleText": "我的",
        "navigationStyle": "custom"
      }
    }
  ],
  "tabBar": {
    "custom": true,
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/course/index",
        "text": "课程"
      },
      {
        "pagePath": "pages/message/index",
        "text": "消息"
      },
      {
        "pagePath": "pages/mine/index",
        "text": "我的"
      }
    ]
  },
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#F7F8FB"
  },
  "easycom": {
    "autoscan": true,
    "custom": {}
  }
}
```

- [ ] **Step 2: 验证**

在 HBuilderX 中运行项目，确认底部出现四个 Tab（先不管自定义导航的样式，页面能切换即可）。

---

### Task 4: 自定义底部导航组件

**Files:**
- Create: `edu-app/components/CustomTabBar.vue`

- [ ] **Step 1: 创建自定义底部导航组件**

DESIGN.md 第 11 节规定了悬浮胶囊样式：距底部安全区 10-16px，高度 64-72px，圆角 32-36px，半透明白底，选中项浅灰圆形底 + 红色图标文字。

```vue
<!-- edu-app/components/CustomTabBar.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['change'])

const tabs = [
  { text: '首页', icon: 'home', path: '/pages/index/index' },
  { text: '课程', icon: 'course', path: '/pages/course/index' },
  { text: '消息', icon: 'message', path: '/pages/message/index' },
  { text: '我的', icon: 'mine', path: '/pages/mine/index' }
]

function switchTab(index) {
  if (index === props.current) return
  emit('change', index)
  uni.switchTab({ url: tabs[index].path })
}
</script>

<template>
  <view class="custom-tab-bar">
    <view
      v-for="(item, index) in tabs"
      :key="index"
      class="tab-item"
      :class="{ active: current === index }"
      @tap="switchTab(index)"
    >
      <view class="tab-icon">
        <text class="icon-placeholder">{{ item.text.slice(0, 1) }}</text>
      </view>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<style scoped>
.custom-tab-bar {
  position: fixed;
  bottom: calc(20rpx + var(--safe-area-bottom));
  left: 32rpx;
  right: 32rpx;
  height: var(--nav-height);
  background: var(--nav-bg);
  border-radius: var(--radius-bottom-nav);
  box-shadow: var(--nav-shadow);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 999;
  backdrop-filter: blur(20px);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 28rpx;
  border-radius: 48rpx;
  transition: background 0.2s;
}

.tab-item.active {
  background: var(--nav-selected-bg);
}

.tab-icon {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-placeholder {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--nav-unselected-color);
}

.tab-item.active .icon-placeholder {
  color: var(--nav-selected-color);
}

.tab-text {
  font-size: var(--font-tab);
  font-weight: 500;
  color: var(--nav-unselected-color);
  margin-top: 4rpx;
}

.tab-item.active .tab-text {
  color: var(--nav-selected-color);
  font-weight: 600;
}
</style>
```

- [ ] **Step 2: 验证**

在首页中引入 CustomTabBar，确认悬浮胶囊导航渲染正常，点击可切换 Tab。

---

### Task 5: 四个空页面

**Files:**
- Create: `edu-app/pages/index/index.vue`
- Create: `edu-app/pages/course/index.vue`
- Create: `edu-app/pages/message/index.vue`
- Create: `edu-app/pages/mine/index.vue`

- [ ] **Step 1: 创建首页 pages/index/index.vue**

```vue
<!-- edu-app/pages/index/index.vue -->
<script setup>
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const currentTab = ref(0)
</script>

<template>
  <view class="page">
    <view class="page-placeholder">首页</view>
    <CustomTabBar :current="currentTab" @change="currentTab = $event" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #FFFFFF;
  padding-bottom: 200rpx;
}
.page-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
  font-size: var(--font-title-page);
  color: var(--color-text-tertiary);
}
</style>
```

- [ ] **Step 2: 创建课程页 pages/course/index.vue**

```vue
<!-- edu-app/pages/course/index.vue -->
<script setup>
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const currentTab = ref(1)
</script>

<template>
  <view class="page">
    <view class="page-placeholder">课程</view>
    <CustomTabBar :current="currentTab" @change="currentTab = $event" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-page-bg);
  padding-bottom: 200rpx;
}
.page-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
  font-size: var(--font-title-page);
  color: var(--color-text-tertiary);
}
</style>
```

- [ ] **Step 3: 创建消息页 pages/message/index.vue**

```vue
<!-- edu-app/pages/message/index.vue -->
<script setup>
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const currentTab = ref(2)
</script>

<template>
  <view class="page">
    <view class="page-placeholder">消息</view>
    <CustomTabBar :current="currentTab" @change="currentTab = $event" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #FFFFFF;
  padding-bottom: 200rpx;
}
.page-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
  font-size: var(--font-title-page);
  color: var(--color-text-tertiary);
}
</style>
```

- [ ] **Step 4: 创建我的页 pages/mine/index.vue**

```vue
<!-- edu-app/pages/mine/index.vue -->
<script setup>
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const currentTab = ref(3)
</script>

<template>
  <view class="page">
    <view class="page-placeholder">我的</view>
    <CustomTabBar :current="currentTab" @change="currentTab = $event" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-page-bg);
  padding-bottom: 200rpx;
}
.page-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
  font-size: var(--font-title-page);
  color: var(--color-text-tertiary);
}
</style>
```

- [ ] **Step 5: 验证**

在 HBuilderX 中运行，确认四个 Tab 可切换，每个页面显示对应的占位文字，底部导航保持悬浮状态。

---

### Task 6: 全局配置 + 请求封装

**Files:**
- Create: `edu-app/config.js`
- Create: `edu-app/utils/request.js`

- [ ] **Step 1: 创建 config.js**

```javascript
// edu-app/config.js
const config = {
  // API 基础路径
  API_BASE_URL: '/api/app/edu/v1',

  // Mock 模式开关：true 时所有请求走 mock 数据
  MOCK_MODE: true,

  // 请求超时（毫秒）
  REQUEST_TIMEOUT: 15000,

  // Token 在本地缓存中的 key
  TOKEN_KEY: 'edu_token',

  // 用户信息缓存 key
  USER_KEY: 'edu_user_info',
}

export default config
```

- [ ] **Step 2: 创建 utils/request.js**

CLAUDE.md §6 要求：统一处理 Token、401、错误提示和 loading。

```javascript
// edu-app/utils/request.js
import config from '@/config'
import { getToken, removeToken } from '@/utils/storage'
import { mockInterceptor } from '@/mock'

class Request {
  constructor() {
    this.baseUrl = config.API_BASE_URL
    this.timeout = config.REQUEST_TIMEOUT
    this.loadingCount = 0
  }

  // 请求拦截 —— 注入 Token + 注入 mock
  async beforeRequest(options) {
    // Mock 模式
    if (config.MOCK_MODE) {
      const mockResponse = mockInterceptor(options)
      if (mockResponse) {
        return { _mock: true, _mockResponse: mockResponse }
      }
    }

    // 注入 Token
    const token = getToken()
    if (token) {
      options.header = options.header || {}
      options.header['Authorization'] = `Bearer ${token}`
    }

    return options
  }

  // 响应拦截 —— 统一错误处理
  afterResponse(response, options) {
    const { statusCode, data } = response

    // 200 正常
    if (statusCode === 200) {
      if (data.success === false) {
        uni.showToast({ title: data.message || '请求失败', icon: 'none' })
        return Promise.reject(data)
      }
      return data
    }

    // 401 Token 过期
    if (statusCode === 401) {
      removeToken()
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      // 跳转到登录页（后续 M1 实现）
      return Promise.reject(response)
    }

    // 其他错误
    uni.showToast({
      title: data?.message || `请求异常(${statusCode})`,
      icon: 'none',
    })
    return Promise.reject(response)
  }

  // 通用请求方法
  async request(options) {
    const processed = await this.beforeRequest({ ...options })

    // Mock 直接返回
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

  // 模拟网络延迟（mock 用）
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
```

- [ ] **Step 3: 验证**

控制台确认 config.js 和 request.js 无报错。此时因 utils/storage.js 和 mock 尚未创建，验证仅限语法正确性。

---

### Task 7: 本地缓存工具

**Files:**
- Create: `edu-app/utils/storage.js`

- [ ] **Step 1: 创建 storage.js**

CLAUDE.md §6 要求：本地缓存用于隐私协议状态、Token、首页 schema、最近学习位置。

```javascript
// edu-app/utils/storage.js

const PREFIX = 'edu_'

/**
 * 同步写入
 */
export function setStorage(key, value) {
  try {
    uni.setStorageSync(PREFIX + key, value)
  } catch (e) {
    console.error('[Storage] set failed:', key, e)
  }
}

/**
 * 同步读取，返回 defaultValue 如果不存在
 */
export function getStorage(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(PREFIX + key)
    return value !== '' && value !== undefined ? value : defaultValue
  } catch (e) {
    console.error('[Storage] get failed:', key, e)
    return defaultValue
  }
}

/**
 * 删除
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(PREFIX + key)
  } catch (e) {
    console.error('[Storage] remove failed:', key, e)
  }
}

// ====== 语义化快捷方法 ======

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
```

- [ ] **Step 2: 验证**

在 App.vue 的 onLaunch 中测试写入和读取：
```javascript
import { setStorage, getStorage } from '@/utils/storage'
// 在 onLaunch 中：
setStorage('test', 'hello')
console.log('[Test] storage read:', getStorage('test')) // 应输出 'hello'
```

---

### Task 8: 路由封装

**Files:**
- Create: `edu-app/utils/router.js`

- [ ] **Step 1: 创建 router.js**

```javascript
// edu-app/utils/router.js

/**
 * 页面路径映射表
 * 不要在组件内拼接散乱路径，统一从这里引用
 */
export const ROUTES = {
  // Tab 页
  HOME: '/pages/index/index',
  COURSE: '/pages/course/index',
  MESSAGE: '/pages/message/index',
  MINE: '/pages/mine/index',

  // 功能页（后续阶段逐步添加）
  LOGIN: '/pages/login/index',
  COURSE_DETAIL: '/pages/course/detail',
  LESSON_PLAY: '/pages/course/play',
  INFO_DETAIL: '/pages/info/detail',
}

/**
 * 跳转到非 Tab 页面
 */
export function navigateTo(url, params = {}) {
  const query = Object.keys(params)
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&')
  const fullUrl = query ? `${url}?${query}` : url
  uni.navigateTo({ url: fullUrl })
}

/**
 * 跳转到 Tab 页面
 */
export function switchTab(url) {
  uni.switchTab({ url })
}

/**
 * 重定向（替换当前页）
 */
export function redirectTo(url, params = {}) {
  const query = Object.keys(params)
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&')
  const fullUrl = query ? `${url}?${query}` : url
  uni.redirectTo({ url: fullUrl })
}

/**
 * 返回上一页
 */
export function goBack(delta = 1) {
  uni.navigateBack({ delta })
}

/**
 * 跳转到登录页，登录成功后回到当前页
 */
export function navigateToLogin(fromPath) {
  navigateTo(ROUTES.LOGIN, { redirect: fromPath })
}
```

- [ ] **Step 2: 验证**

在页面中调用 `navigateTo` 和 `goBack`，确认路由跳转正常。

---

### Task 9: Mock 基础设施

**Files:**
- Create: `edu-app/mock/index.js`

- [ ] **Step 1: 创建 mock 入口**

```javascript
// edu-app/mock/index.js

// 后续阶段按模块扩充此映射表
const mockRoutes = {
  // 'GET /course/categories': () => require('./course/categories.json'),
  // 'GET /course/list': () => require('./course/list.json'),
}

/**
 * Mock 拦截器
 * 匹配到路由时返回对应的 mock 数据，匹配不到返回 null
 */
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
```

- [ ] **Step 2: 验证**

在 request.js 已有 `mockInterceptor` 调用。启动项目，控制台应能看到 mock 未匹配的 warn 日志，确认拦截器链路通畅。

---

### Task 10: 创建 api 目录

**Files:**
- Create: `edu-app/api/.gitkeep`

- [ ] **Step 1: 创建占位文件**

```text
<!-- edu-app/api/.gitkeep (empty file) -->
```

后续 M1 阶段开始在此目录下按模块创建业务 API 文件（如 `api/auth.js`、`api/course.js`）。

---

### Task 11: 全量验证

- [ ] **Step 1: 项目能启动**

在 HBuilderX 中运行到 H5 或微信小程序，确认无编译错误。

- [ ] **Step 2: 四个 Tab 可切换**

点击底部导航四个 Tab（首页/课程/消息/我的），确认页面正确切换，占位文字正确显示。

- [ ] **Step 3: 底部导航悬浮正常**

确认底部导航在页面底部悬浮，不随页面滚动消失。

- [ ] **Step 4: CSS 变量生效**

在各页面中验证主色 `#F0524A`、背景色 `#F7F8FB`、文字色 `#202331` 等 CSS 变量可用。

- [ ] **Step 5: request 和 mock 链路通畅**

在任意页面的 `onLoad` 中调用 request.get 测试 mock 响应：
```javascript
import request from '@/utils/request'
request.get('/test').then(console.log).catch(console.error)
```
控制台应打印 `[Mock] 未匹配: GET /test` 警告。

- [ ] **Step 6: 页面背景色正确**

首页和消息页白底，课程页和我的页浅灰底（`#F7F8FB`）。

---

## M0 验收标准（对齐 SCHEDULE.md §5.1）

- [ ] UniApp 项目能启动（H5 或小程序）
- [ ] App 可打开四个 Tab（首页/课程/消息/我的）
- [ ] 底部悬浮胶囊导航样式符合 DESIGN.md §11 规范
- [ ] CSS 变量文件完整覆盖 DESIGN.md §4 色彩规范
- [ ] request.js 统一处理 Token、401、错误提示
- [ ] storage.js 提供 Token、用户信息、隐私状态、首页 schema、播放位置等语义化方法
- [ ] router.js 提供统一的路由跳转方法
- [ ] config.js 中 MOCK_MODE 开关可用
- [ ] mock 拦截器链路通畅
- [ ] 后端团队确认 JEECG 版本和接口文档路径
