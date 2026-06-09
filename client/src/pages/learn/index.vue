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
