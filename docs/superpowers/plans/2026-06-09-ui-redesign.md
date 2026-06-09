# 盛桦学堂 UI 重设计实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 client/ 前端项目从粗糙的橙红色 UI 全面升级为「现代清新」风格 — 深色导航 + 紫色强调 + 柔和色块卡片。

**Architecture:** 更新 tokens.css 设计变量作为基础，然后逐页重写 template 和 style。所有页面统一使用深色导航栏 (#1A1A2E)、白色圆角卡片、药丸按钮。图标统一使用 @iconify/vue 的 Icon 组件，禁止 emoji。

**Tech Stack:** Vue 3 + UniApp + @iconify/vue + CSS variables

**设计文档:** `docs/superpowers/specs/2026-06-09-ui-redesign-design.md`

---

## 文件结构

### 修改的文件

| 文件 | 职责 |
|------|------|
| `client/src/styles/tokens.css` | 设计变量（颜色、圆角、阴影、字号） |
| `client/src/pages/home/index.vue` | 首页 |
| `client/src/pages/learn/index.vue` | 学习中心（新增快捷入口+明星讲师） |
| `client/src/pages/community/index.vue` | 社区 |
| `client/src/pages/profile/index.vue` | 个人中心 |
| `client/src/pages/course/detail.vue` | 课程详情 |

### 不修改的文件

- `client/src/utils/` — 工具函数不变
- `client/src/api/` — API 层不变
- `client/src/components/` — 通用组件不变（Icon.vue 已使用 @iconify/vue）
- `client/src/pages.json` — 路由配置不变

---

## Task 1: 更新设计变量

**Files:**
- Modify: `client/src/styles/tokens.css`

- [ ] **Step 1: 替换 tokens.css 全部内容**

```css
:root {
  /* 主色 */
  --color-primary: #1A1A2E;
  --color-primary-light: #F5F3FF;
  --color-primary-dark: #0D0D1A;
  --color-primary-gradient: linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%);

  /* 强调色 */
  --color-accent: #8B5CF6;
  --color-accent-light: #F5F3FF;

  /* 语义色 */
  --color-success: #22C55E;
  --color-success-light: #F0FDF4;
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;
  --color-danger: #EF4444;
  --color-danger-light: #FEE2E2;
  --color-info: #0EA5E9;
  --color-info-light: #E0F2FE;

  /* 文字 */
  --text-primary: #1A1A2E;
  --text-secondary: #64748B;
  --text-hint: #94A3B8;
  --text-white: #FFFFFF;

  /* 背景 */
  --bg-page: #F7F8FA;
  --bg-card: #FFFFFF;
  --bg-gray: #F1F5F9;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;

  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 14px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 20px;
  --radius-circle: 50%;

  /* 阴影 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.03);

  /* 字号 */
  --font-xs: 11px;
  --font-sm: 12px;
  --font-base: 13px;
  --font-md: 14px;
  --font-lg: 15px;
  --font-xl: 17px;
  --font-2xl: 22px;
  --font-3xl: 24px;
  --font-4xl: 28px;

  /* 字重 */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

- [ ] **Step 2: 验证变量生效**

运行 `cd client && pnpm dev:h5`，在浏览器打开首页，确认页面背景色变为 `#F7F8FA`。

- [ ] **Step 3: 提交**

```bash
git add client/src/styles/tokens.css
git commit -m "style: update design tokens for modern fresh theme"
```

---

## Task 2: 重设计首页

**Files:**
- Modify: `client/src/pages/home/index.vue`

- [ ] **Step 1: 替换首页 template**

```vue
<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-content">
        <view class="search-bar" @tap="goSearch">
          <Icon icon="solar:magnifer-bold" :size="18" color="rgba(255,255,255,0.4)" />
          <text class="search-placeholder">搜索课程、讲师</text>
        </view>
        <view class="header-btn" @tap="goMessages">
          <Icon icon="solar:bell-bold" :size="20" color="#fff" />
          <view v-if="msgBadge > 0" class="header-badge">
            <text class="badge-text">{{ msgBadge > 99 ? '99+' : msgBadge }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Banner 轮播 -->
    <view class="banner">
      <swiper class="banner-swiper" :autoplay="true" :interval="4000" :circular="true" indicator-dots indicator-color="rgba(255,255,255,0.2)" indicator-active-color="#8B5CF6">
        <swiper-item v-for="b in banners" :key="b.id">
          <view class="banner-card" @tap="navigateTo(b.route)">
            <view class="banner-deco" />
            <text class="banner-eyebrow">{{ b.eyebrow }}</text>
            <text class="banner-title">{{ b.title }}</text>
            <text class="banner-sub">{{ b.subtitle }}</text>
            <view class="banner-btn">
              <text class="banner-btn-text">{{ b.btnText }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 课程分类 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">课程分类</text>
        <view class="section-more" @tap="goCategory">
          <text class="more-text">查看全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <view class="category-grid">
        <view class="cat-item" v-for="cat in categories" :key="cat.name" :style="{ background: cat.bg }" @tap="navigateTo(cat.route)">
          <Icon :icon="cat.icon" :size="24" :color="cat.color" />
          <text class="cat-name">{{ cat.name }}</text>
          <text class="cat-count">{{ cat.count }} 门课程</text>
        </view>
      </view>
    </view>

    <!-- 频道 Tab + 课程列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门课程</text>
        <view class="section-more" @tap="goCourseList">
          <text class="more-text">更多</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <view class="channel-tabs">
        <view v-for="ch in channels" :key="ch.key" class="channel-tab" :class="{ active: activeChannel === ch.key }" @tap="activeChannel = ch.key">
          <text class="channel-tab-text" :class="{ active: activeChannel === ch.key }">{{ ch.label }}</text>
        </view>
      </view>
      <view class="course-list">
        <view class="course-card" v-for="c in recommendCourses" :key="c.id" @tap="goCourse(c.id)">
          <view class="course-img" :style="{ background: c.coverColor }">
            <view class="play-icon-wrap">
              <Icon icon="solar:play-bold" :size="16" color="#8B5CF6" />
            </view>
          </view>
          <view class="course-info">
            <text class="course-title">{{ c.title }}</text>
            <view class="course-meta">
              <text class="course-lecturer">{{ c.lecturer }}</text>
              <text class="course-dot">·</text>
              <text class="course-lessons">{{ c.lessons }}课时</text>
            </view>
            <view class="course-bottom">
              <text class="course-price" :class="{ free: c.free }">
                {{ c.free ? '免费' : '¥' + c.price }}
              </text>
              <view class="students-row">
                <Icon icon="solar:users-group-rounded-bold" :size="12" color="var(--text-hint)" />
                <text class="course-students">{{ c.students }}人学习</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 免费公开课 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">免费公开课</text>
        <view class="section-more" @tap="goCourseList">
          <text class="more-text">全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <view class="course-list">
        <view class="course-card" v-for="c in freeCourses" :key="c.id" @tap="goCourse(c.id)">
          <view class="course-img" :style="{ background: c.coverColor }">
            <view class="free-tag">
              <text class="free-tag-text">免费</text>
            </view>
          </view>
          <view class="course-info">
            <text class="course-title">{{ c.title }}</text>
            <view class="course-meta">
              <text class="course-lecturer">{{ c.lecturer }}</text>
              <text class="course-dot">·</text>
              <text class="course-lessons">{{ c.students }}次播放</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 精选好课 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">精选好课</text>
        <view class="section-more" @tap="goCourseList">
          <text class="more-text">更多</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <view class="course-list">
        <view class="course-card" v-for="c in featuredCourses" :key="c.id" @tap="goCourse(c.id)">
          <view class="course-img" :style="{ background: c.coverColor }">
            <view class="play-icon-wrap">
              <Icon icon="solar:play-bold" :size="16" color="#8B5CF6" />
            </view>
          </view>
          <view class="course-info">
            <text class="course-title">{{ c.title }}</text>
            <view class="course-meta">
              <text class="course-lecturer">{{ c.lecturer }}</text>
            </view>
            <view class="course-bottom">
              <text class="course-price" :class="{ free: c.free }">
                {{ c.free ? '免费' : '¥' + c.price }}
                <text v-if="c.originalPrice" class="original-price">¥{{ c.originalPrice }}</text>
              </text>
              <view class="students-row">
                <Icon icon="solar:users-group-rounded-bold" :size="12" color="var(--text-hint)" />
                <text class="course-students">{{ c.students }}人学习</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>
```

- [ ] **Step 2: 替换首页 script**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const msgBadge = ref(3)
const activeChannel = ref('recommend')

const banners = [
  { id: '1', eyebrow: 'NEW TERM', title: '探索新学期', subtitle: '发现你的下一门课程', btnText: '立即探索', route: '/pages/course/index' },
  { id: '2', eyebrow: 'LIMITED', title: '开学季大促', subtitle: '精选好课限时优惠', btnText: '查看优惠', route: '/pages/coupon/index' },
  { id: '3', eyebrow: 'GROUP', title: '拼团学习更划算', subtitle: '邀请好友一起学习', btnText: '立即拼团', route: '/pages/groupBuy/index' },
]

const categories = [
  { name: '编程开发', icon: 'solar:code-bold', bg: '#F5F3FF', color: '#8B5CF6', count: 128, route: '/pages/course/index' },
  { name: '设计创作', icon: 'solar:palette-bold', bg: '#FFF4EE', color: '#FF6B35', count: 86, route: '/pages/course/index' },
  { name: '语言学习', icon: 'solar:global-bold', bg: '#F0FDF4', color: '#22C55E', count: 64, route: '/pages/course/index' },
  { name: 'AI 技能', icon: 'solar:cpu-bold', bg: '#FEF3C7', color: '#F59E0B', count: 42, route: '/pages/course/index' },
]

const channels = [
  { key: 'recommend', label: '推荐' },
  { key: 'hot', label: '热门' },
  { key: 'new', label: '新课' },
  { key: 'live', label: '直播' },
]

const recommendCourses = [
  { id: '1', title: 'Vue 3 + TypeScript 实战教程', coverColor: 'linear-gradient(135deg,#667eea,#764ba2)', lecturer: '张明远', free: true, price: 0, lessons: 24, students: 2341 },
  { id: '2', title: 'UI/UX 设计思维与方法论', coverColor: 'linear-gradient(135deg,#f093fb,#f5576c)', lecturer: '李思琪', free: false, price: 199, lessons: 18, students: 892 },
  { id: '3', title: 'Python 数据分析从入门到精通', coverColor: 'linear-gradient(135deg,#4facfe,#00f2fe)', lecturer: '王建国', free: false, price: 299, lessons: 32, students: 5621 },
]

const freeCourses = [
  { id: 'f1', title: '算法与数据结构精讲', coverColor: 'linear-gradient(135deg,#a8edea,#fed6e3)', lecturer: '刘老师', students: 4503 },
  { id: 'f2', title: 'React Native 跨平台开发', coverColor: 'linear-gradient(135deg,#ffecd2,#fcb69f)', lecturer: '王老师', students: 1892 },
  { id: 'f3', title: '英语口语速成班', coverColor: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)', lecturer: '陈老师', students: 3201 },
]

const featuredCourses = [
  { id: 'v1', title: 'React Native 跨平台移动开发实战', coverColor: 'linear-gradient(135deg,#667eea,#764ba2)', lecturer: '王老师', price: 299, originalPrice: 799, students: 1892, free: false },
  { id: 'v2', title: 'AI 人工智能入门到实战', coverColor: 'linear-gradient(135deg,#f093fb,#f5576c)', lecturer: '王建国', price: 399, students: 3456, free: false },
  { id: 'v3', title: '商务英语口语提升课', coverColor: 'linear-gradient(135deg,#43e97b,#38f9d7)', lecturer: '陈雨薇', price: 0, students: 7821, free: true },
]

function navigateTo(url: string) {
  const tabPages = ['/pages/home/index', '/pages/learn/index', '/pages/community/index', '/pages/profile/index']
  if (tabPages.includes(url)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

function goSearch() { uni.showToast({ title: '搜索功能开发中', icon: 'none' }) }
function goMessages() { uni.navigateTo({ url: '/pages/message/index' }) }
function goCategory() { uni.switchTab({ url: '/pages/learn/index' }) }
function goCourseList() { uni.navigateTo({ url: '/pages/course/index' }) }
function goCourse(id: string) { uni.navigateTo({ url: '/pages/course/detail?id=' + id }) }
</script>
```

- [ ] **Step 3: 替换首页 style**

```vue
<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 16px;
}

/* ---- 顶部导航 ---- */
.header {
  background: var(--color-primary);
  padding: 44px 16px 14px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-2xl);
  padding: 9px 14px;
}

.search-placeholder {
  font-size: var(--font-md);
  color: rgba(255, 255, 255, 0.4);
}

.header-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-circle);
}

.header-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  background: var(--color-danger);
  border-radius: var(--radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--color-primary);
}

.badge-text {
  font-size: 10px;
  color: #fff;
  font-weight: var(--weight-bold);
}

/* ---- Banner ---- */
.banner {
  padding: 16px;
}

.banner-swiper {
  height: 140px;
}

.banner-card {
  height: 130px;
  border-radius: var(--radius-xl);
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: var(--color-primary);
}

.banner-deco {
  position: absolute;
  right: -15px;
  top: -15px;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-circle);
  background: rgba(139, 92, 246, 0.2);
}

.banner-eyebrow {
  font-size: var(--font-xs);
  color: rgba(255, 255, 255, 0.4);
  font-weight: var(--weight-semibold);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.banner-title {
  font-size: var(--font-2xl);
  font-weight: var(--weight-bold);
  color: #fff;
  margin-top: 6px;
  display: block;
}

.banner-sub {
  font-size: var(--font-md);
  color: rgba(255, 255, 255, 0.45);
  margin-top: 4px;
  display: block;
}

.banner-btn {
  display: inline-block;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: var(--radius-2xl);
  margin-top: 12px;
}

.banner-btn-text {
  font-size: var(--font-sm);
  color: #fff;
  font-weight: var(--weight-semibold);
}

/* ---- Section ---- */
.section {
  background: var(--bg-card);
  margin: 0 16px;
  margin-top: 12px;
  border-radius: var(--radius-lg);
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.section-more {
  display: flex;
  align-items: center;
  gap: 2px;
}

.more-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* ---- 分类 ---- */
.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.cat-item {
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cat-item:active {
  opacity: 0.8;
}

.cat-name {
  font-size: var(--font-md);
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.cat-count {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* ---- 频道 Tab ---- */
.channel-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 14px;
}

.channel-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  position: relative;
}

.channel-tab-text {
  font-size: var(--font-md);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.channel-tab-text.active {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.channel-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-accent);
}

/* ---- 课程列表 ---- */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-card {
  display: flex;
  gap: 12px;
  background: var(--bg-page);
  border-radius: var(--radius-lg);
  padding: 12px;
}

.course-card:active {
  background: #eef0f4;
}

.course-img {
  width: 100px;
  height: 75px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.play-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.free-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  background: var(--color-success);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.free-tag-text {
  font-size: 10px;
  color: #fff;
  font-weight: var(--weight-semibold);
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.course-title {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.course-lecturer {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.course-dot {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.course-lessons {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.course-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.course-price {
  font-size: var(--font-lg);
  font-weight: var(--weight-bold);
  color: var(--color-warning);
}

.course-price.free {
  color: var(--color-success);
}

.original-price {
  font-size: var(--font-xs);
  color: var(--text-hint);
  text-decoration: line-through;
  font-weight: var(--weight-normal);
  margin-left: 4px;
}

.students-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-students {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

.bottom-spacer {
  height: 16px;
}
</style>
```

- [ ] **Step 4: 验证首页效果**

运行 `pnpm dev:h5`，确认：
- 顶部导航栏为深色背景 (#1A1A2E)
- Banner 为深色卡片 + 紫色圆点装饰
- 分类为 2 列色块卡片
- 课程为竖向列表
- 无 emoji 出现
- 频道 Tab 在热门课程上方

- [ ] **Step 5: 提交**

```bash
git add client/src/pages/home/index.vue
git commit -m "style: redesign homepage with modern fresh theme"
```

---

## Task 3: 重设计学习中心（含快捷入口+明星讲师）

**Files:**
- Modify: `client/src/pages/learn/index.vue`

- [ ] **Step 1: 替换学习中心全部内容**

```vue
<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <text class="header-title">学习中心</text>
      <view class="header-actions">
        <view class="header-btn" @tap="goSettings">
          <Icon icon="solar:settings-bold" :size="20" color="#fff" />
        </view>
      </view>
    </view>

    <!-- 学习统计 -->
    <view class="stats-card">
      <view class="stats-deco" />
      <view class="stat-item">
        <text class="stat-value">12</text>
        <text class="stat-label">已购课程</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">86.5</text>
        <text class="stat-label">学习时长(h)</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">3</text>
        <text class="stat-label">获得证书</text>
      </view>
    </view>

    <!-- 快捷入口（从首页移入） -->
    <view class="quick-actions">
      <view class="action-item" v-for="a in quickActions" :key="a.label" @tap="navigateTo(a.route)">
        <view class="action-icon" :style="{ background: a.bg }">
          <Icon :icon="a.icon" :size="20" :color="a.color" />
        </view>
        <text class="action-label">{{ a.label }}</text>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="func-grid">
      <view class="func-item" @tap="goPage('/pages/course/my')">
        <view class="func-icon" style="background:#FEF2F2">
          <Icon icon="solar:notebook-bold" :size="20" color="#EF4444" />
        </view>
        <text class="func-label">我的课程</text>
      </view>
      <view class="func-item" @tap="goPage('/pages/course/index')">
        <view class="func-icon" style="background:#EFF6FF">
          <Icon icon="solar:calendar-bold" :size="20" color="#3B82F6" />
        </view>
        <text class="func-label">学习计划</text>
      </view>
      <view class="func-item" @tap="goPage('/pages/community/favorites')">
        <view class="func-icon" style="background:#F0FDF4">
          <Icon icon="solar:cup-bold" :size="20" color="#22C55E" />
        </view>
        <text class="func-label">我的证书</text>
      </view>
      <view class="func-item" @tap="goPage('/pages/community/favorites')">
        <view class="func-icon" style="background:#FFFBEB">
          <Icon icon="solar:star-bold" :size="20" color="#F59E0B" />
        </view>
        <text class="func-label">我的收藏</text>
      </view>
    </view>

    <!-- 明星讲师（从首页移入） -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">明星讲师</text>
        <view class="section-more">
          <text class="more-text">全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <scroll-view scroll-x class="lecturer-scroll">
        <view class="lecturer-card" v-for="l in lecturers" :key="l.name">
          <view class="lecturer-avatar" :style="{ background: l.avatarBg }">
            <text class="lecturer-avatar-text">{{ l.initial }}</text>
          </view>
          <text class="lecturer-name">{{ l.name }}</text>
          <view class="lecturer-tag">
            <text class="lecturer-tag-text">{{ l.tag }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 连续学习 -->
    <view class="section" style="padding-bottom:0;">
      <view class="streak-card">
        <Icon icon="solar:fire-bold" :size="24" color="#F59E0B" />
        <view class="streak-info">
          <text class="streak-title">已连续学习 7 天</text>
          <text class="streak-sub">坚持学习，解锁更多成就</text>
        </view>
        <view class="streak-btn" @tap="goSignIn">
          <Icon icon="solar:check-circle-bold" :size="14" color="var(--color-accent)" />
          <text class="streak-btn-text">签到</text>
        </view>
      </view>
    </view>

    <!-- 继续学习 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">继续学习</text>
        <view class="section-more" @tap="goPage('/pages/course/my')">
          <text class="more-text">全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <view class="continue-card" v-for="c in continueCourses" :key="c.id" @tap="goWatch(c.id)">
        <view class="continue-img" :style="{ background: c.coverColor }">
          <view class="play-btn-wrap">
            <Icon icon="solar:play-bold" :size="12" color="var(--color-accent)" />
          </view>
        </view>
        <view class="continue-info">
          <text class="continue-title">{{ c.title }}</text>
          <text class="continue-lesson">上次学到：{{ c.lastLesson }}</text>
          <view class="continue-progress-wrap">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: c.progress + '%' }" />
            </view>
            <text class="progress-text">已完成 {{ c.progress }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 我的课程 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">我的课程</text>
        <view class="section-more" @tap="goPage('/pages/course/my')">
          <text class="more-text">全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <view class="course-tabs">
        <view v-for="tab in courseTabs" :key="tab.key" class="course-tab" :class="{ active: activeTab === tab.key }" @tap="activeTab = tab.key">
          <text class="course-tab-text" :class="{ active: activeTab === tab.key }">{{ tab.label }}</text>
        </view>
      </view>
      <view class="my-course-card" v-for="c in myCourses" :key="c.id" @tap="goWatch(c.id)">
        <view class="my-course-img" :style="{ background: c.coverColor }">
          <view class="resume-badge">
            <Icon icon="solar:play-bold" :size="8" color="#fff" />
            <text class="resume-badge-text">继续</text>
          </view>
        </view>
        <view class="my-course-info">
          <text class="my-course-title">{{ c.title }}</text>
          <view class="my-course-meta-row">
            <Icon icon="solar:user-bold" :size="12" color="var(--text-hint)" />
            <text class="my-course-meta">{{ c.lecturer }} · {{ c.lessons }}课时</text>
          </view>
          <view class="my-course-bottom">
            <text class="my-course-progress">进度 {{ c.progress }}%</text>
            <view class="my-course-btn">
              <text class="my-course-btn-text">继续学习</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const activeTab = ref('learning')

const quickActions = [
  { label: '限时特惠', icon: 'solar:fire-bold', bg: '#FEF2F2', color: '#EF4444', route: '/pages/seckill/index' },
  { label: '优惠券', icon: 'solar:ticket-bold', bg: '#FFFBEB', color: '#F59E0B', route: '/pages/coupon/index' },
  { label: '签到', icon: 'solar:check-circle-bold', bg: '#F0FDF4', color: '#22C55E', route: '/pages/signIn/index' },
  { label: '拼团', icon: 'solar:users-group-rounded-bold', bg: '#EFF6FF', color: '#3B82F6', route: '/pages/groupBuy/index' },
  { label: '免费课', icon: 'solar:play-circle-bold', bg: '#F5F3FF', color: '#8B5CF6', route: '/pages/course/index' },
]

const lecturers = [
  { name: '张明远', initial: '张', tag: '编程名师', avatarBg: 'linear-gradient(135deg, #FFE0D0, #FFB088)' },
  { name: '李思琪', initial: '李', tag: '设计导师', avatarBg: 'linear-gradient(135deg, #E0D0FF, #B088FF)' },
  { name: '王建国', initial: '王', tag: 'AI专家', avatarBg: 'linear-gradient(135deg, #D0E8FF, #88C0FF)' },
  { name: '陈雨薇', initial: '陈', tag: '语言名师', avatarBg: 'linear-gradient(135deg, #D0FFE0, #88FFB0)' },
  { name: '刘志强', initial: '刘', tag: '考研辅导', avatarBg: 'linear-gradient(135deg, #FFE8D0, #FFC088)' },
]

const courseTabs = [
  { key: 'learning', label: '在学' },
  { key: 'done', label: '已完成' },
  { key: 'bought', label: '已购' },
]

const continueCourses = [
  { id: '1', title: 'Vue 3 + TypeScript 实战教程', coverColor: 'linear-gradient(135deg,#667eea,#764ba2)', lastLesson: '第 8 课 组合式 API', progress: 33 },
  { id: '2', title: 'Python 数据分析从入门到精通', coverColor: 'linear-gradient(135deg,#4facfe,#00f2fe)', lastLesson: '第 15 课 Pandas 进阶', progress: 47 },
]

const myCourses = [
  { id: 'm1', title: 'UI/UX 设计思维与方法论', coverColor: 'linear-gradient(135deg,#f093fb,#f5576c)', lecturer: '李思琪', lessons: 18, progress: 56 },
  { id: 'm2', title: '商务英语口语提升课', coverColor: 'linear-gradient(135deg,#43e97b,#38f9d7)', lecturer: '陈雨薇', lessons: 20, progress: 15 },
  { id: 'm3', title: 'AI 人工智能入门到实战', coverColor: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)', lecturer: '王建国', lessons: 30, progress: 8 },
]

function navigateTo(url: string) {
  const tabPages = ['/pages/home/index', '/pages/learn/index', '/pages/community/index', '/pages/profile/index']
  if (tabPages.includes(url)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

function goPage(url: string) { uni.navigateTo({ url }) }
function goSettings() { uni.showToast({ title: '设置功能开发中', icon: 'none' }) }
function goSignIn() { uni.navigateTo({ url: '/pages/signIn/index' }) }
function goWatch(id: string) { uni.navigateTo({ url: '/pages/course/watch?courseId=' + id }) }
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 16px;
}

/* ---- 顶部 ---- */
.header {
  background: var(--color-primary);
  padding: 44px 16px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: var(--font-2xl);
  font-weight: var(--weight-bold);
  color: #fff;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-circle);
}

/* ---- 统计卡 ---- */
.stats-card {
  margin: 12px 16px 0;
  background: var(--color-primary);
  border-radius: var(--radius-xl);
  padding: 20px;
  display: flex;
  justify-content: space-around;
  position: relative;
  overflow: hidden;
}

.stats-deco {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  border-radius: var(--radius-circle);
  background: rgba(139, 92, 246, 0.2);
}

.stat-item {
  text-align: center;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: var(--font-4xl);
  font-weight: var(--weight-bold);
  color: #fff;
  display: block;
}

.stat-label {
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
  display: block;
}

.stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.15);
  align-self: stretch;
  margin: 4px 0;
}

/* ---- 快捷入口 ---- */
.quick-actions {
  background: var(--bg-card);
  margin: 12px 16px 0;
  border-radius: var(--radius-lg);
  padding: 16px 8px;
  display: flex;
  justify-content: space-around;
  box-shadow: var(--shadow-sm);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.action-item:active {
  opacity: 0.7;
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-label {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

/* ---- 功能入口 ---- */
.func-grid {
  background: var(--bg-card);
  margin: 12px 16px 0;
  border-radius: var(--radius-lg);
  padding: 16px 8px;
  display: flex;
  justify-content: space-around;
  box-shadow: var(--shadow-sm);
}

.func-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.func-item:active {
  opacity: 0.7;
}

.func-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.func-label {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

/* ---- Section ---- */
.section {
  background: var(--bg-card);
  margin: 12px 16px 0;
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.section-more {
  display: flex;
  align-items: center;
  gap: 2px;
}

.more-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* ---- 讲师 ---- */
.lecturer-scroll {
  white-space: nowrap;
  padding-bottom: 4px;
}

.lecturer-card {
  display: inline-block;
  width: 80px;
  margin-right: 14px;
  vertical-align: top;
  text-align: center;
}

.lecturer-card:last-child {
  margin-right: 0;
}

.lecturer-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: var(--shadow-md);
  margin: 0 auto;
}

.lecturer-avatar-text {
  font-size: 18px;
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
}

.lecturer-name {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
  text-align: center;
  margin-top: 8px;
  display: block;
}

.lecturer-tag {
  background: var(--color-accent-light);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  display: inline-block;
  margin-top: 4px;
}

.lecturer-tag-text {
  font-size: 10px;
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

/* ---- 连续学习 ---- */
.streak-card {
  background: linear-gradient(135deg, #FFFBEB, #FEF3C7);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.streak-info {
  flex: 1;
}

.streak-title {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.streak-sub {
  font-size: var(--font-sm);
  color: var(--text-hint);
  margin-top: 2px;
}

.streak-btn {
  background: var(--bg-card);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 4px;
}

.streak-btn:active {
  background: #fafafa;
}

.streak-btn-text {
  font-size: var(--font-sm);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

/* ---- 继续学习卡 ---- */
.continue-card {
  display: flex;
  gap: 12px;
  background: var(--bg-page);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.continue-card:active {
  background: #eef0f4;
}

.continue-img {
  width: 100px;
  height: 70px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.play-btn-wrap {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.continue-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.continue-title {
  font-size: var(--font-md);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.continue-lesson {
  font-size: var(--font-sm);
  color: var(--text-hint);
  margin-top: 2px;
}

.continue-progress-wrap {
  margin-top: 6px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 2px;
}

.progress-text {
  font-size: var(--font-xs);
  color: var(--text-hint);
  margin-top: 4px;
}

/* ---- 课程 Tab ---- */
.course-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 14px;
  background: var(--bg-gray);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.course-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  border-radius: 6px;
}

.course-tab.active {
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.course-tab-text {
  font-size: var(--font-md);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.course-tab-text.active {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

/* ---- 我的课程卡 ---- */
.my-course-card {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.my-course-card:last-child {
  border-bottom: none;
}

.my-course-card:active {
  opacity: 0.8;
}

.my-course-img {
  width: 110px;
  height: 74px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.resume-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: var(--color-accent);
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.resume-badge-text {
  font-size: 10px;
  color: #fff;
}

.my-course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.my-course-title {
  font-size: var(--font-md);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.my-course-meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.my-course-meta {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.my-course-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.my-course-progress {
  font-size: var(--font-sm);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

.my-course-btn {
  background: var(--color-accent-light);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

.my-course-btn:active {
  background: #e8dffc;
}

.my-course-btn-text {
  font-size: var(--font-xs);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

.bottom-spacer {
  height: 16px;
}
</style>
```

- [ ] **Step 2: 验证学习中心效果**

运行 `pnpm dev:h5`，切换到学习中心 tab，确认：
- 顶部为深色背景
- 统计卡为深色背景 + 紫色装饰圆
- 快捷入口（限时特惠、优惠券、签到、拼团、免费课）在统计卡下方
- 明星讲师横向滚动正常
- 进度条为紫色
- 无 emoji 出现

- [ ] **Step 3: 提交**

```bash
git add client/src/pages/learn/index.vue
git commit -m "style: redesign learn center with quick actions and lecturers"
```

---

## Task 4: 重设计社区页面

**Files:**
- Modify: `client/src/pages/community/index.vue`

- [ ] **Step 1: 替换社区页面 style 部分**

将现有 style 中的 `.page` 从 `min-height: 100vh` 改为 `height: 100vh; overflow: hidden`（已在之前修复），然后更新导航栏和标签样式：

替换整个 `<style scoped>` 部分：

```vue
<style scoped>
@import url('@/styles/tokens.css');

.page {
  height: 100vh;
  overflow: hidden;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

/* ---- 顶部导航 ---- */
.nav-bar {
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
}

.nav-title {
  font-size: var(--font-2xl);
  font-weight: var(--weight-bold);
  color: #fff;
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.nav-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-btn {
  background: rgba(139, 92, 246, 0.3);
}

/* ---- 话题标签 ---- */
.topic-scroll {
  background: var(--bg-card);
  padding: 8px 16px 12px;
  white-space: nowrap;
  border-bottom: 1px solid #f0f0f0;
}

.topic-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  margin-right: 8px;
  background: var(--bg-gray);
}

.topic-tag.active {
  background: var(--color-primary);
}

.topic-text {
  font-size: var(--font-md);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.topic-text.active {
  color: #fff;
}

/* ---- 帖子列表 ---- */
.post-list {
  flex: 1;
  padding: 12px 16px;
}

.post-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.post-card:active {
  background: #fafafa;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-circle);
  background: linear-gradient(135deg, #FFE0D0, #FFB088);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 16px;
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.post-time {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

.topic-badge {
  background: var(--color-accent-light);
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.topic-badge-text {
  font-size: var(--font-xs);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

.post-content {
  font-size: var(--font-md);
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ---- 图片网格 ---- */
.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.post-images.grid-1 .post-img {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-sm);
}

.post-images.grid-2 .post-img {
  width: calc(50% - 3px);
  height: 160px;
  border-radius: var(--radius-sm);
}

.post-images.grid-3 .post-img,
.post-images:not(.grid-1):not(.grid-2) .post-img {
  width: calc(33.33% - 4px);
  height: 110px;
  border-radius: 6px;
}

/* ---- 互动栏 ---- */
.post-actions {
  display: flex;
  align-items: center;
  gap: 32px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-count {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* ---- 加载/空状态 ---- */
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top-color: var(--color-accent);
  border-radius: var(--radius-circle);
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
  gap: 12px;
}

.empty-text {
  font-size: var(--font-md);
  color: var(--text-hint);
}

.empty-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  margin-top: 8px;
}

.empty-btn:active {
  opacity: 0.9;
}

.empty-btn-text {
  font-size: var(--font-md);
  color: #fff;
  font-weight: var(--weight-medium);
}

.no-more {
  padding: 16px 0;
  text-align: center;
}

.no-more-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.bottom-spacer {
  height: 16px;
}
</style>
```

- [ ] **Step 2: 验证社区页面效果**

运行 `pnpm dev:h5`，切换到社区 tab，确认：
- 导航栏为深色背景
- 话题标签选中态为深色背景
- 帖子卡片圆角 14px
- tabBar 可以正常切换

- [ ] **Step 3: 提交**

```bash
git add client/src/pages/community/index.vue
git commit -m "style: redesign community page with dark nav bar"
```

---

## Task 5: 重设计个人中心

**Files:**
- Modify: `client/src/pages/profile/index.vue`

- [ ] **Step 1: 替换个人中心 style**

将现有 style 中的 hero 区域改为深色背景，更新所有颜色引用：

替换整个 `<style scoped>` 部分：

```vue
<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 16px;
}

/* ---- Hero 区域 ---- */
.profile-hero {
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: var(--color-primary);
}

.hero-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 48px 20px 20px;
}

.hero-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 28px;
  color: #fff;
  font-weight: var(--weight-bold);
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: #fff;
  margin-bottom: 4px;
}

.hero-login {
  color: #fff;
}

.hero-sub {
  font-size: var(--font-md);
  color: rgba(255, 255, 255, 0.5);
}

.hero-tag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-text {
  font-size: var(--font-xs);
  color: #fff;
  font-weight: var(--weight-semibold);
}

.points-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hero-points {
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.5);
}

.hero-setting {
  position: absolute;
  top: 48px;
  right: 16px;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- 订单快捷入口 ---- */
.order-shortcuts {
  margin: -12px 16px 0;
  position: relative;
  z-index: 1;
}

.order-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.order-title-text {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.order-all {
  display: flex;
  align-items: center;
  gap: 2px;
}

.order-all-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.order-grid {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  justify-content: space-around;
  box-shadow: var(--shadow-md);
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.order-item:active {
  opacity: 0.7;
}

.order-icon-wrap {
  position: relative;
}

.order-dot {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.order-dot-text {
  color: #fff;
  font-size: 10px;
  font-weight: var(--weight-bold);
}

.order-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* ---- 工具栏 ---- */
.profile-tools {
  margin: 12px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.tool-grid {
  display: flex;
  justify-content: space-around;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tool-item:active {
  opacity: 0.7;
}

.tool-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-label {
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

/* ---- 菜单 ---- */
.profile-menu {
  margin: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-group {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 16px;
}

.menu-item:active {
  background: #fafafa;
}

.menu-item + .menu-item {
  border-top: 0.5px solid #f0f0f0;
}

.menu-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-label {
  flex: 1;
  font-size: var(--font-md);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

/* ---- 退出登录 ---- */
.profile-logout {
  margin: 20px 16px;
  padding-bottom: 16px;
}

.logout-btn {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: var(--shadow-sm);
}

.logout-btn:active {
  background: var(--color-accent-light);
}

.logout-text {
  font-size: var(--font-md);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}
</style>
```

- [ ] **Step 2: 验证个人中心效果**

运行 `pnpm dev:h5`，切换到我的 tab，确认：
- 头像区域为深色背景
- 统计卡使用紫色强调色
- 退出按钮使用紫色
- 无 emoji 出现

- [ ] **Step 3: 提交**

```bash
git add client/src/pages/profile/index.vue
git commit -m "style: redesign profile page with dark header and purple accents"
```

---

## Task 6: 重设计课程详情页

**Files:**
- Modify: `client/src/pages/course/detail.vue`

由于课程详情页文件较长，需要先读取当前内容，然后更新 style 部分。

- [ ] **Step 1: 读取课程详情页当前内容**

- [ ] **Step 2: 更新课程详情页 style**

将所有 `var(--color-primary)` 引用更新为新主题色，确保：
- 封面区域渐变使用深色
- 标签使用药丸形状 + 对应色块
- 按钮使用药丸形状
- 讲师卡片使用浅灰背景
- 课程目录使用紫色序号
- 底部 CTA 使用深色主按钮

- [ ] **Step 3: 验证课程详情页效果**

- [ ] **Step 4: 提交**

```bash
git add client/src/pages/course/detail.vue
git commit -m "style: redesign course detail page"
```

---

## Task 7: 检查剩余页面

**Files:**
- 所有剩余 .vue 页面文件

- [ ] **Step 1: 逐页检查并更新**

检查以下页面，确保：
- 所有 `var(--color-primary)` 引用正确
- 所有 emoji 替换为 Icon 组件
- 导航栏样式统一

页面列表：
- `client/src/pages/course/index.vue` — 全部课程
- `client/src/pages/course/watch.vue` — 课程播放
- `client/src/pages/course/checkout.vue` — 课程结算
- `client/src/pages/course/my.vue` — 我的课程
- `client/src/pages/order/list.vue` — 订单列表
- `client/src/pages/order/detail.vue` — 订单详情
- `client/src/pages/address/index.vue` — 收货地址
- `client/src/pages/coupon/index.vue` — 优惠券
- `client/src/pages/seckill/index.vue` — 限时抢购
- `client/src/pages/signIn/index.vue` — 签到
- `client/src/pages/groupBuy/index.vue` — 拼团
- `client/src/pages/groupBuy/checkout.vue` — 拼团结算
- `client/src/pages/message/index.vue` — 消息
- `client/src/pages/message/chat.vue` — 聊天
- `client/src/pages/distributor/index.vue` — 分销中心
- `client/src/pages/login/index.vue` — 登录
- `client/src/pages/login/register.vue` — 注册
- `client/src/pages/merchant/apply.vue` — 商家入驻
- `client/src/pages/merchant/products.vue` — 商品管理
- `client/src/pages/product/detail.vue` — 商品详情
- `client/src/pages/checkout/index.vue` — 确认订单
- `client/src/pages/cart/index.vue` — 购物车
- `client/src/pages/mall/index.vue` — 商城分类

- [ ] **Step 2: 最终验证**

运行 `pnpm dev:h5`，遍历所有页面，确认：
- 无 emoji 出现
- 所有导航栏为深色背景
- 所有按钮为药丸形状
- 所有标签为药丸形状
- 颜色主题统一

- [ ] **Step 3: 最终提交**

```bash
git add -A
git commit -m "style: complete UI redesign across all pages"
```
