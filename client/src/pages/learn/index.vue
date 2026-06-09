<template>
  <view class="page">
    <!-- 顶部导航栏 (Figma 无边框留白风格) -->
    <view class="header">
      <view class="header-title-wrap">
        <text class="header-eyebrow">ACADEMY / 学堂</text>
        <text class="header-title">LEARNING / 学习中心</text>
      </view>
      <view class="header-actions">
        <view class="header-btn" @tap="goSettings">
          <Icon icon="solar:settings-bold" :size="20" color="#111" />
        </view>
      </view>
    </view>

    <!-- 融为一体的 Lilac 学堂看板 -->
    <view class="dashboard-container">
      <view class="color-block-section color-block-section-lilac dashboard-block">
        <view class="dashboard-top">
          <view class="dashboard-welcome">
            <text class="welcome-en">HELLO, LEARNER.</text>
            <text class="welcome-cn">今天也要坚持学习</text>
          </view>
          <view class="streak-badge-btn" :class="{ 'is-signed': isSigned }" @tap="handleSignIn">
            <Icon :icon="isSigned ? 'solar:check-circle-bold' : 'solar:fire-bold'" :size="14" :color="isSigned ? '#111' : '#fff'" />
            <text class="streak-btn-text">{{ isSigned ? 'SIGNED 已签到' : 'SIGN IN 签到' }}</text>
          </view>
        </view>
        
        <view class="dashboard-divider" />
        
        <view class="dashboard-stats">
          <view class="stat-item">
            <text class="stat-value">12</text>
            <text class="stat-label">COURSES / 已购课程</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-value">86.5</text>
            <text class="stat-label">HOURS / 学习时长</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-value">3</text>
            <text class="stat-label">CERTIFICATES / 获得证书</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 工具栏式快捷入口 (Tool Bar) -->
    <view class="toolbar-section">
      <scroll-view scroll-x class="toolbar-scroll" :show-scrollbar="false">
        <view class="toolbar-row">
          <view class="toolbar-pill" v-for="a in quickActions" :key="a.label" @tap="navigateTo(a.route)">
            <view class="pill-icon-wrap" :style="{ color: a.color }">
              <Icon :icon="a.icon" :size="14" />
            </view>
            <text class="pill-label">{{ a.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 明星讲师 -->
    <view class="page-section">
      <view class="section-header">
        <view class="section-title-wrap">
          <text class="section-eyebrow">FACULTY / 讲师</text>
          <text class="section-title">明星讲师</text>
        </view>
        <view class="section-more">
          <text class="more-text">ALL / 全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-text-hint)" />
        </view>
      </view>
      
      <scroll-view scroll-x class="lecturer-scroll" :show-scrollbar="false">
        <view class="lecturer-card" v-for="l in lecturers" :key="l.name">
          <view class="lecturer-avatar">
            <text class="lecturer-avatar-text">{{ l.initial }}</text>
          </view>
          <text class="lecturer-name">{{ l.name }}</text>
          <view class="lecturer-tag">
            <text class="lecturer-tag-text">{{ l.tag }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 继续学习 -->
    <view class="page-section">
      <view class="section-header">
        <view class="section-title-wrap">
          <text class="section-eyebrow">RESUME / 上次学到</text>
          <text class="section-title">继续学习</text>
        </view>
        <view class="section-more" @tap="goPage('/pages/course/my')">
          <text class="more-text">ALL / 全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-text-hint)" />
        </view>
      </view>
      
      <view
        class="continue-card"
        v-for="c in continueCourses"
        :key="c.id"
        @tap="goWatch(c.id)"
      >
        <view class="continue-img-wrap">
          <view class="play-btn-circle">
            <Icon icon="solar:play-bold" :size="12" color="#fff" />
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
        <view class="continue-btn btn-pill-arrow">
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="#111" />
        </view>
      </view>
    </view>

    <!-- 我的课程 -->
    <view class="page-section" style="margin-bottom: 24px;">
      <view class="section-header">
        <view class="section-title-wrap">
          <text class="section-eyebrow">COURSES / 课程库</text>
          <text class="section-title">我的课程</text>
        </view>
        <view class="section-more" @tap="goPage('/pages/course/my')">
          <text class="more-text">ALL / 全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-text-hint)" />
        </view>
      </view>
      
      <!-- Figma 药丸 Tab 切换器 -->
      <view class="course-tabs-wrapper">
        <view class="course-tabs-base">
          <view
            v-for="tab in courseTabs"
            :key="tab.key"
            class="course-tab-pill"
            :class="{ active: activeTab === tab.key }"
            @tap="activeTab = tab.key"
          >
            <text class="course-tab-text">{{ tab.label }}</text>
          </view>
        </view>
      </view>

      <view
        class="my-course-card"
        v-for="c in myCourses"
        :key="c.id"
        @tap="goWatch(c.id)"
      >
        <view class="my-course-img-wrap">
          <text class="my-course-img-letter">{{ c.title[0] || 'C' }}</text>
          <view class="resume-badge">
            <Icon icon="solar:play-bold" :size="8" color="#fff" />
            <text class="resume-badge-text">继续</text>
          </view>
        </view>
        <view class="my-course-info">
          <view class="my-course-header-row">
            <text class="my-course-title">{{ c.title }}</text>
            <text class="my-course-meta">{{ c.lecturer }} · {{ c.lessons }}课时</text>
          </view>
          <view class="my-course-bottom">
            <view class="my-course-progress-info">
              <text class="my-course-progress-num">{{ c.progress }}%</text>
              <text class="my-course-progress-label">进度</text>
            </view>
            <view class="my-course-btn btn-primary-pill">
              <text class="my-course-btn-text">继续学习</text>
              <Icon icon="solar:alt-arrow-right-bold" :size="12" color="#fff" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-spacer" />
    <!-- 自定义悬浮 TabBar -->
    <CustomTabBar :active="2" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const activeTab = ref('learning')
const isSigned = ref(false)

const quickActions = [
  { label: '限时特惠', icon: 'solar:fire-bold', color: '#EF4444', route: '/pages/seckill/index' },
  { label: '优惠券', icon: 'solar:ticket-bold', color: '#D97706', route: '/pages/coupon/index' },
  { label: '签到', icon: 'solar:check-circle-bold', color: '#4F7E04', route: '/pages/signIn/index' },
  { label: '拼团', icon: 'solar:users-group-rounded-bold', color: '#0D9488', route: '/pages/groupBuy/index' },
  { label: '免费课', icon: 'solar:play-circle-bold', color: '#6366F1', route: '/pages/course/index' },
]

const lecturers = [
  { name: '张明远', initial: '张', tag: '编程名师' },
  { name: '李思琪', initial: '李', tag: '设计导师' },
  { name: '王建国', initial: '王', tag: 'AI专家' },
  { name: '陈雨薇', initial: '陈', tag: '语言名师' },
  { name: '刘志强', initial: '刘', tag: '考研辅导' },
]

const courseTabs = [
  { key: 'learning', label: '在学' },
  { key: 'done', label: '已完成' },
  { key: 'bought', label: '已购' },
]

const continueCourses = [
  { id: '1', title: 'Vue 3 + TypeScript 实战教程', lastLesson: '第 8 课 组合式 API', progress: 33 },
  { id: '2', title: 'Python 数据分析从入门到精通', lastLesson: '第 15 课 Pandas 进阶', progress: 47 },
]

const myCourses = [
  { id: 'm1', title: 'UI/UX 设计思维与方法论', lecturer: '李思琪', lessons: 18, progress: 56 },
  { id: 'm2', title: '商务英语口语提升课', lecturer: '陈雨薇', lessons: 20, progress: 15 },
  { id: 'm3', title: 'AI 人工智能入门到实战', lecturer: '王建国', lessons: 30, progress: 8 },
]

function navigateTo(url: string) {
  const tabPages = ['/pages/home/index', '/pages/mall/index', '/pages/learn/index', '/pages/community/index', '/pages/profile/index']
  if (tabPages.includes(url)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

function goPage(url: string) { uni.navigateTo({ url }) }
function goSettings() { uni.showToast({ title: '设置功能即将上线', icon: 'none' }) }

function handleSignIn() {
  if (isSigned.value) return
  isSigned.value = true
  uni.showToast({
    title: '签到成功！已连续学习8天',
    icon: 'success'
  })
}

function goWatch(id: string) { uni.navigateTo({ url: '/pages/course/watch?courseId=' + id }) }

onShow(() => {
  uni.hideTabBar({ animation: false })
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

/* ---- 页面通用 ---- */
.page {
  min-height: 100vh;
  background: var(--color-bg-page, #F8F9FA);
  padding-bottom: 24px;
  box-sizing: border-box;
}

/* ---- 顶部导航栏 (Figma 无边框留白风格) ---- */
.header {
  background: var(--color-card, #fff);
  padding: 56px 20px 16px; /* 增加留白 */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-eyebrow {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  letter-spacing: var(--letter-spacing-mono, 1.5px);
  color: var(--color-text-secondary, #666);
  font-weight: var(--weight-bold, 700);
  text-transform: uppercase;
}

.header-title {
  font-size: 22px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-primary, #111);
  letter-spacing: var(--letter-spacing-display, -0.5px);
}

.header-actions {
  display: flex;
}

.header-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-card, #fff);
  border: 1px solid var(--color-primary, #111);
  border-radius: var(--radius-full, 999px);
  transition: transform 0.2s;
}

.header-btn:active {
  transform: scale(0.95);
}

/* ---- 丁香紫合并大看板 ---- */
.dashboard-container {
  padding: 8px 16px 16px;
}

.dashboard-block {
  padding: 24px 20px;
  margin-bottom: 0;
  border: 1px solid var(--color-primary, #111); /* 细黑边框 */
  border-radius: var(--radius-lg, 16px);
  box-shadow: none;
}

.dashboard-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-welcome {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.welcome-en {
  font-size: 18px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-primary, #111);
  letter-spacing: -0.5px;
}

.welcome-cn {
  font-size: 11px;
  color: var(--color-text-secondary, #666);
  font-weight: var(--weight-medium, 500);
}

/* 签到药丸按钮 */
.streak-badge-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary, #111);
  padding: 8px 16px;
  border-radius: var(--radius-full, 999px);
  border: 1px solid var(--color-primary, #111);
  transition: all 0.25s ease;
}

.streak-badge-btn:active {
  transform: scale(0.95);
}

.streak-badge-btn.is-signed {
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.streak-btn-text {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  font-weight: var(--weight-bold, 700);
  color: #ffffff;
  letter-spacing: 0.5px;
}

.streak-badge-btn.is-signed .streak-btn-text {
  color: var(--color-primary, #111);
}

.dashboard-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 18px 0;
}

.dashboard-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-primary, #111);
  letter-spacing: -1px;
}

.stat-label {
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary, #666);
  font-weight: var(--weight-bold, 700);
  margin-top: 4px;
  text-align: center;
}

.stat-divider {
  width: 1px;
  background: rgba(0, 0, 0, 0.06);
  align-self: stretch;
  margin: 4px 0;
}

/* ---- 工具栏式快捷入口 (Tool Bar) ---- */
.toolbar-section {
  padding: 0 16px 12px;
}

.toolbar-scroll {
  width: 100%;
  white-space: nowrap;
}

.toolbar-row {
  display: flex;
  gap: 10px;
  padding: 2px 0;
}

.toolbar-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid var(--color-border, #eee);
  padding: 8px 14px;
  border-radius: var(--radius-full, 999px);
  transition: all 0.2s;
}

.toolbar-pill:active {
  background: #f1f2f4;
  border-color: var(--color-primary, #111);
}

.pill-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pill-label {
  font-size: 11px;
  font-weight: var(--weight-semibold, 600);
  color: var(--color-primary, #111);
}

/* ---- 通用版式块 (Figma 风格) ---- */
.page-section {
  padding: 16px var(--page-padding) 4px;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-eyebrow {
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  letter-spacing: var(--letter-spacing-mono, 1.5px);
  color: var(--color-text-hint, #999);
  font-weight: var(--weight-bold, 700);
  text-transform: uppercase;
}

.section-title {
  font-size: 16px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-primary, #111);
  letter-spacing: -0.3px;
}

.section-more {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 2px;
}

.more-text {
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary, #666);
  font-weight: var(--weight-bold, 700);
}

/* ---- 明星讲师 ---- */
.lecturer-scroll {
  width: 100%;
  white-space: nowrap;
}

.lecturer-card {
  display: inline-block;
  width: 86px;
  margin-right: 12px;
  vertical-align: top;
  text-align: center;
}

.lecturer-card:last-child {
  margin-right: 0;
}

.lecturer-avatar {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f2f4; /* 统一高级灰色底座 */
  border: 1px solid var(--color-primary, #111); /* 细黑边框 */
  margin: 0 auto;
  transition: transform 0.2s;
}

.lecturer-avatar:active {
  transform: scale(0.95);
}

.lecturer-avatar-text {
  font-size: 20px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-primary, #111);
}

.lecturer-name {
  font-size: 11px;
  color: var(--color-primary, #111);
  font-weight: var(--weight-bold, 700);
  margin-top: 8px;
  display: block;
}

.lecturer-tag {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 6px;
  background: #ffffff;
  border: 1px solid var(--color-primary, #111); /* 精致细线框药丸 */
  border-radius: var(--radius-full, 999px);
}

.lecturer-tag-text {
  font-size: 8px;
  color: var(--color-primary, #111);
  font-weight: var(--weight-bold, 700);
}

/* ---- 继续学习 ---- */
.continue-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border: 1px solid var(--color-primary, #111); /* 1px 经典细黑边框 */
  border-radius: var(--radius-lg, 16px);
  padding: 14px;
  margin-bottom: 12px;
  transition: background-color 0.2s;
}

.continue-card:active {
  background: #fcfcfc;
}

.continue-img-wrap {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-sm, 8px);
  background: var(--color-block-navy, #1A1D36); /* 统一高冷深靛蓝 */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.play-btn-circle {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full, 999px);
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.continue-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  height: 72px;
  padding: 2px 0;
}

.continue-title {
  font-size: 13px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-primary, #111);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.continue-lesson {
  font-size: 10px;
  color: var(--color-text-secondary, #666);
}

.continue-progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

/* 3px 极细深色进度条 */
.progress-bar {
  flex: 1;
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 1.5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary, #111);
  border-radius: 1.5px;
}

.progress-text {
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-primary, #111);
}

.btn-pill-arrow {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full, 999px);
  border: 1px solid var(--color-primary, #111);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.continue-card:active .btn-pill-arrow {
  transform: translateX(2px);
}

/* ---- 我的课程 Tab 切换器 (Figma 药丸底座) ---- */
.course-tabs-wrapper {
  margin-bottom: 16px;
}

.course-tabs-base {
  display: flex;
  background: #f1f2f4; /* 灰色底座 */
  border-radius: var(--radius-full, 999px);
  padding: 3px;
}

.course-tab-pill {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  border-radius: var(--radius-full, 999px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.course-tab-pill.active {
  background: var(--color-primary, #111); /* 选中项纯黑背景 */
}

.course-tab-text {
  font-size: 11px;
  font-weight: var(--weight-semibold, 600);
  color: var(--color-text-secondary, #666);
  transition: color 0.2s;
}

.course-tab-pill.active .course-tab-text {
  color: #ffffff; /* 选中项白色文字 */
  font-weight: var(--weight-bold, 700);
}

/* ---- 我的课程卡片 (Figma 高对比度海报版式) ---- */
.my-course-card {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border, #eee);
}

.my-course-card:last-child {
  border-bottom: none;
}

.my-course-img-wrap {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md, 12px);
  background: #f1f2f4; /* 统一灰底 */
  border: 1px solid var(--color-border, #eee);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.my-course-img-letter {
  font-size: 28px;
  font-weight: var(--weight-bold, 700);
  color: rgba(17, 17, 17, 0.15); /* 淡淡的大首字母，有设计感 */
}

.resume-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: var(--color-primary, #111);
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.resume-badge-text {
  font-size: 8px;
  color: #fff;
  font-weight: var(--weight-bold, 700);
}

.my-course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  height: 80px;
}

.my-course-header-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.my-course-title {
  font-size: 13px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-primary, #111);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.my-course-meta {
  font-size: 10px;
  color: var(--color-text-secondary, #666);
}

.my-course-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.my-course-progress-info {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.my-course-progress-num {
  font-size: 13px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-commerce, #D9383A); /* 高亮电商红 */
}

.my-course-progress-label {
  font-size: 9px;
  color: var(--color-text-hint, #999);
}

.btn-primary-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--color-primary, #111);
  padding: 6px 12px;
  border-radius: var(--radius-full, 999px);
  transition: transform 0.2s;
}

.btn-primary-pill:active {
  transform: scale(0.95);
}

.my-course-btn-text {
  font-size: 10px;
  color: #ffffff;
  font-weight: var(--weight-bold, 700);
}

.bottom-spacer {
  height: 90px; /* 适当增加底边距 */
}
</style>
