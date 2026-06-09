<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-title-wrap">
        <text class="header-eyebrow">LEARNING CENTER</text>
        <text class="header-title">学习中心</text>
      </view>
      <view class="header-actions">
        <view class="header-btn" @tap="goSettings">
          <Icon icon="solar:settings-bold" :size="20" color="#fff" />
        </view>
      </view>
    </view>

    <!-- 丁香紫/深色统计看板 -->
    <view class="dashboard-container">
      <view class="dashboard-block">
        <view class="dashboard-deco" />
        <view class="dashboard-top">
          <view class="dashboard-welcome">
            <text class="welcome-en">HELLO, LEARNER.</text>
            <text class="welcome-cn">今天也要坚持学习</text>
          </view>
          <view class="streak-badge-btn" :class="{ 'is-signed': isSigned }" @tap="handleSignIn">
            <Icon :icon="isSigned ? 'solar:check-circle-bold' : 'solar:fire-bold'" :size="14" :color="isSigned ? 'var(--color-accent)' : '#fff'" />
            <text class="streak-btn-text">{{ isSigned ? '已签到' : '签到' }}</text>
          </view>
        </view>
        
        <view class="dashboard-divider" />
        
        <view class="dashboard-stats">
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
      </view>
    </view>

    <!-- 快捷入口 (限时特惠、优惠券、签到、拼团、免费课) -->
    <view class="quick-actions">
      <view class="action-item" v-for="a in quickActions" :key="a.label" @tap="navigateTo(a.route)">
        <view class="action-icon" :style="{ background: a.bg }">
          <Icon :icon="a.icon" :size="20" :color="a.color" />
        </view>
        <text class="action-label">{{ a.label }}</text>
      </view>
    </view>

    <!-- 功能入口网格 -->
    <view class="func-grid">
      <view class="func-item" @tap="goPage('/pages/course/my')">
        <view class="func-icon" style="background:#F5F3FF">
          <Icon icon="solar:notebook-bold" :size="20" color="#8B5CF6" />
        </view>
        <text class="func-label">我的课程</text>
      </view>
      <view class="func-item" @tap="goPage('/pages/course/index')">
        <view class="func-icon" style="background:#E0F2FE">
          <Icon icon="solar:calendar-bold" :size="20" color="#0EA5E9" />
        </view>
        <text class="func-label">学习计划</text>
      </view>
      <view class="func-item" @tap="goPage('/pages/profile/index')">
        <view class="func-icon" style="background:#F0FDF4">
          <Icon icon="solar:cup-bold" :size="20" color="#22C55E" />
        </view>
        <text class="func-label">我的证书</text>
      </view>
      <view class="func-item" @tap="goPage('/pages/profile/index')">
        <view class="func-icon" style="background:#FEF3C7">
          <Icon icon="solar:star-bold" :size="20" color="#F59E0B" />
        </view>
        <text class="func-label">我的收藏</text>
      </view>
    </view>

    <!-- 明星讲师 -->
    <view class="page-section">
      <view class="section-header">
        <view class="section-title-wrap">
          <text class="section-eyebrow">FACULTY</text>
          <text class="section-title">明星讲师</text>
        </view>
        <view class="section-more">
          <text class="more-text">全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      
      <scroll-view scroll-x class="lecturer-scroll" :show-scrollbar="false">
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

    <!-- 继续学习 -->
    <view class="page-section">
      <view class="section-header">
        <view class="section-title-wrap">
          <text class="section-eyebrow">RESUME</text>
          <text class="section-title">继续学习</text>
        </view>
        <view class="section-more" @tap="goPage('/pages/course/my')">
          <text class="more-text">全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      
      <view
        class="continue-card"
        v-for="c in continueCourses"
        :key="c.id"
        @tap="goWatch(c.id)"
      >
        <view class="continue-img-wrap" :style="{ background: c.coverColor || 'linear-gradient(135deg,#667eea,#764ba2)' }">
          <view class="play-btn-circle">
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
        <view class="continue-btn btn-pill-arrow">
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-accent)" />
        </view>
      </view>
    </view>

    <!-- 我的课程 -->
    <view class="page-section" style="margin-bottom: 24px;">
      <view class="section-header">
        <view class="section-title-wrap">
          <text class="section-eyebrow">MY COURSES</text>
          <text class="section-title">我的课程</text>
        </view>
        <view class="section-more" @tap="goPage('/pages/course/my')">
          <text class="more-text">全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      
      <!-- 药丸 Tab 切换器 -->
      <view class="course-tabs-wrapper">
        <view class="course-tabs-base">
          <view
            v-for="tab in courseTabs"
            :key="tab.key"
            class="course-tab-pill"
            :class="{ active: activeTab === tab.key }"
            @tap="activeTab = tab.key"
          >
            <text class="course-tab-text" :class="{ active: activeTab === tab.key }">{{ tab.label }}</text>
          </view>
        </view>
      </view>

      <view
        class="my-course-card"
        v-for="c in myCourses"
        :key="c.id"
        @tap="goWatch(c.id)"
      >
        <view class="my-course-img-wrap" :style="{ background: c.coverColor || 'linear-gradient(135deg,#f093fb,#f5576c)' }">
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
import { onShow } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const activeTab = ref('learning')
const isSigned = ref(false)

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
  const tabPages = ['/pages/home/index', '/pages/mall/index', '/pages/learn/index', '/pages/community/index', '/pages/profile/index']
  if (tabPages.includes(url)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

function goPage(url: string) { uni.navigateTo({ url }) }
function goSettings() { uni.showToast({ title: '设置功能开发中', icon: 'none' }) }

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

.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 24px;
  box-sizing: border-box;
}

/* ---- 顶部导航栏 ---- */
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 44px 16px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom-left-radius: var(--radius-2xl);
  border-bottom-right-radius: var(--radius-2xl);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.header-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-eyebrow {
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  letter-spacing: var(--letter-spacing-mono, 1.5px);
  color: rgba(255, 255, 255, 0.45);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
}

.header-title {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  background: linear-gradient(135deg, #ffffff 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: var(--letter-spacing-display, -0.5px);
}

.header-actions {
  display: flex;
}

.header-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-circle);
  transition: transform 0.2s;
}

.header-btn:active {
  transform: scale(0.95);
}

/* ---- 统计看板 ---- */
.dashboard-container {
  padding: 16px 16px 8px;
}

.dashboard-block {
  padding: 20px;
  margin-bottom: 0;
  background: linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%);
  border-radius: var(--radius-xl);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dashboard-deco {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 90px;
  height: 90px;
  border-radius: var(--radius-circle);
  background: rgba(139, 92, 246, 0.2);
}

.dashboard-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.dashboard-welcome {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.welcome-en {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: #fff;
  letter-spacing: -0.5px;
}

.welcome-cn {
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.5);
  font-weight: var(--weight-medium);
}

/* 签到药丸按钮 */
.streak-badge-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
}

.streak-badge-btn:active {
  transform: scale(0.95);
}

.streak-badge-btn.is-signed {
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.5);
}

.streak-btn-text {
  font-size: var(--font-sm);
  font-weight: var(--weight-bold);
  color: #ffffff;
}

.dashboard-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
}

.dashboard-stats {
  display: flex;
  justify-content: space-around;
  position: relative;
  z-index: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  color: #fff;
  letter-spacing: -1px;
  text-shadow: 0 2px 10px rgba(139, 92, 246, 0.5);
}

.stat-label {
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
  text-align: center;
}

.stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  align-self: stretch;
  margin: 4px 0;
}

/* ---- 快捷网格 ---- */
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
  transform: scale(0.95);
  transition: transform 0.2s;
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

/* ---- 功能网格 ---- */
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
  transform: scale(0.95);
  transition: transform 0.2s;
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

/* ---- 通用 Section ---- */
.page-section {
  padding: 16px 16px 4px;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 12px;
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
  color: var(--text-hint);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
}

.section-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  letter-spacing: -0.3px;
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
  width: 100%;
  white-space: nowrap;
  padding-bottom: 4px;
}

.lecturer-card {
  display: inline-block;
  width: 80px;
  margin-right: 12px;
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
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  border: 2px solid #fff;
}

.lecturer-avatar:active {
  transform: scale(0.95);
}

.lecturer-avatar-text {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}

.lecturer-name {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
  margin-top: 8px;
  display: block;
}

.lecturer-tag {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 8px;
  background: var(--color-accent-light);
  border-radius: var(--radius-full);
}

.lecturer-tag-text {
  font-size: 9px;
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

/* ---- 继续学习 ---- */
.continue-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.continue-card:active {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.continue-img-wrap {
  width: 80px;
  height: 60px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.play-btn-circle {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.9);
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
  min-width: 0;
}

.continue-title {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.continue-lesson {
  font-size: var(--font-xs);
  color: var(--text-hint);
  margin-top: 2px;
}

.continue-progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-gray);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), #a78bfa);
  border-radius: 2px;
}

.progress-text {
  font-size: 10px;
  font-weight: var(--weight-semibold);
  color: var(--color-accent);
}

.btn-pill-arrow {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-circle);
  background: var(--color-accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.continue-card:active .btn-pill-arrow {
  transform: translateX(2px);
}

/* ---- 我的课程 Tab ---- */
.course-tabs-wrapper {
  margin-bottom: 14px;
}

.course-tabs-base {
  display: flex;
  background: var(--bg-gray);
  border-radius: var(--radius-full);
  padding: 3px;
}

.course-tab-pill {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
}

.course-tab-pill.active {
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

/* ---- 我的课程卡片 ---- */
.my-course-card {
  display: flex;
  gap: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.my-course-card:active {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.my-course-img-wrap {
  width: 90px;
  height: 60px;
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
  font-size: 8px;
  color: #fff;
}

.my-course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.my-course-header-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.my-course-title {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.my-course-meta {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

.my-course-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.my-course-progress-info {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.my-course-progress-num {
  font-size: var(--font-md);
  font-weight: var(--weight-bold);
  color: var(--color-accent);
}

.my-course-progress-label {
  font-size: 10px;
  color: var(--text-hint);
}

.btn-primary-pill {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--color-accent), #7C3AED);
  padding: 5px 14px;
  border-radius: var(--radius-full);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
  transition: opacity 0.2s;
}

.btn-primary-pill:active {
  opacity: 0.9;
}

.my-course-btn-text {
  font-size: var(--font-xs);
  color: #ffffff;
  font-weight: var(--weight-bold);
}

.bottom-spacer {
  height: 90px;
}
</style>
