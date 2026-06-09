<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">&lsaquo;</text>
      </view>
      <text class="nav-title">我的课程</text>
      <view class="nav-right">
        <view class="nav-filter" @tap="onFilter">
          <Icon icon="solar:settings-bold" width="20" height="20" color="var(--text-secondary)" />
        </view>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-tags">
          <view
            v-for="f in filters"
            :key="f.key"
            class="filter-tag"
            :class="{ active: activeFilter === f.key }"
            @tap="activeFilter = f.key"
          >
            <text class="tag-text" :class="{ active: activeFilter === f.key }">{{ f.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 学习统计 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-value">{{ totalCourses }}</text>
        <text class="stats-label">在学课程</text>
      </view>
      <view class="stats-divider" />
      <view class="stats-item">
        <text class="stats-value">{{ totalHours }}</text>
        <text class="stats-label">学习时长</text>
      </view>
      <view class="stats-divider" />
      <view class="stats-item">
        <text class="stats-value">{{ completedCourses }}</text>
        <text class="stats-label">已完成</text>
      </view>
    </view>

    <!-- 课程列表 -->
    <scroll-view scroll-y class="course-list" @scrolltolower="loadMore">
      <view v-if="loading && courses.length === 0" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="filteredCourses.length > 0" class="course-items">
        <view
          v-for="course in filteredCourses"
          :key="course.id"
          class="course-card"
          @tap="goWatch(course)"
        >
          <view class="card-cover" :style="{ background: course.coverColor || defaultGradient }">
            <view class="card-play">
              <Icon icon="solar:play-bold" width="20" height="20" color="var(--color-primary)" />
            </view>
            <view v-if="course.progress >= 100" class="card-badge completed">
              <text class="badge-text">已完成</text>
            </view>
          </view>
          <view class="card-info">
            <text class="card-title">{{ course.title }}</text>
            <view class="card-meta">
              <view class="lecturer-info">
                <view class="lecturer-avatar">
                  <text class="avatar-text">{{ (course.lecturerName || '师').charAt(0) }}</text>
                </view>
                <text class="lecturer-name">{{ course.lecturerName || '未知讲师' }}</text>
              </view>
              <text class="card-lessons">{{ course.totalLessons || 0 }}课时</text>
            </view>
            <view class="card-progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: (course.progress || 0) + '%' }" />
              </view>
              <text class="progress-text">已学{{ course.progress || 0 }}%</text>
            </view>
            <view class="card-bottom">
              <text class="card-lesson">继续学习：{{ course.currentLesson || '第1节' }}</text>
              <view class="card-btn">
                <text class="btn-text">{{ course.progress >= 100 ? '复习' : '继续' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:notebook-bold" width="48" height="48" color="var(--text-hint)" />
        <text class="empty-text">还没有学习记录</text>
        <view class="empty-btn" @tap="goCourseList">
          <text class="empty-btn-text">去看看课程</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading && courses.length > 0" class="loading-more">
        <view class="loading-spinner-sm" />
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(true)
const courses = ref<any[]>([])
const activeFilter = ref('all')

const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

const filters = [
  { key: 'all', label: '全部' },
  { key: 'learning', label: '学习中' },
  { key: 'completed', label: '已完成' },
  { key: 'free', label: '免费课' },
]

// 模拟数据
const mockCourses = [
  { id: '1', title: 'Vue 3 + TypeScript 实战教程', lecturerName: '张明远', coverColor: 'linear-gradient(135deg,#667eea,#764ba2)', totalLessons: 24, progress: 75, currentLesson: '第18节 组合式API', price: 0 },
  { id: '2', title: 'React 18 新特性深度解析', lecturerName: '李思琪', coverColor: 'linear-gradient(135deg,#f093fb,#f5576c)', totalLessons: 18, progress: 100, currentLesson: '已完成', price: 199 },
  { id: '3', title: 'Python 数据分析从入门到精通', lecturerName: '王建国', coverColor: 'linear-gradient(135deg,#4facfe,#00f2fe)', totalLessons: 32, progress: 30, currentLesson: '第10节 Pandas基础', price: 299 },
  { id: '4', title: 'AI 人工智能基础与实战', lecturerName: '王建国', coverColor: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', totalLessons: 36, progress: 0, currentLesson: '未开始', price: 0 },
]

const totalCourses = computed(() => courses.value.length)
const totalHours = computed(() => {
  const total = courses.value.reduce((sum, c) => sum + (c.totalLessons || 0) * 0.5, 0)
  return Math.round(total) + 'h'
})
const completedCourses = computed(() => courses.value.filter(c => c.progress >= 100).length)

const filteredCourses = computed(() => {
  if (activeFilter.value === 'all') return courses.value
  if (activeFilter.value === 'learning') return courses.value.filter(c => c.progress > 0 && c.progress < 100)
  if (activeFilter.value === 'completed') return courses.value.filter(c => c.progress >= 100)
  if (activeFilter.value === 'free') return courses.value.filter(c => c.price === 0)
  return courses.value
})

function goBack() {
  uni.navigateBack()
}

function goCourseList() {
  uni.navigateTo({ url: '/pages/course/index' })
}

function goWatch(course: any) {
  uni.navigateTo({ url: '/pages/course/watch?courseId=' + course.id })
}

function onFilter() {
  // TODO: 更多筛选
}

async function loadCourses() {
  loading.value = true
  try {
    const res = await http.get('/course/myCourses', { params: { userId: getCurrentUserId(), pageSize: 50 } })
    courses.value = res?.records || (Array.isArray(res) ? res : [])
    if (courses.value.length === 0) {
      courses.value = mockCourses
    }
  } catch {
    courses.value = mockCourses
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadCourses()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.nav-bar {
  background: var(--bg-card);
  display: flex;
  align-items: center;
  padding: 44px var(--space-lg) var(--space-md);
  gap: var(--space-md);
}

.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: var(--font-3xl);
  color: var(--text-primary);
  font-weight: var(--weight-normal);
}

.nav-title {
  flex: 1;
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.nav-right {
  display: flex;
  gap: var(--space-md);
}

.nav-filter {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 筛选标签 */
.filter-bar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--bg-gray);
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
}

.filter-tag {
  flex-shrink: 0;
  padding: 6px var(--space-lg);
  border-radius: var(--radius-full);
  background: var(--bg-gray);
  cursor: pointer;
}

.filter-tag:active {
  opacity: 0.7;
}

.filter-tag.active {
  background: var(--color-primary);
}

.tag-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.tag-text.active {
  color: var(--text-white);
}

/* 学习统计 */
.stats-card {
  background: var(--color-primary-gradient);
  margin: var(--space-md) var(--space-lg) 0;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  justify-content: space-around;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
}

.stats-item {
  text-align: center;
  position: relative;
  z-index: 1;
}

.stats-value {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  color: var(--text-white);
  display: block;
}

.stats-label {
  font-size: var(--font-sm);
  color: rgba(255,255,255,0.8);
  margin-top: var(--space-xs);
  display: block;
}

.stats-divider {
  width: 1px;
  background: rgba(255,255,255,0.3);
  align-self: stretch;
  margin: var(--space-xs) 0;
}

/* 课程列表 */
.course-list {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
}

.course-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.course-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.course-card:active {
  transform: scale(0.99);
}

.card-cover {
  width: 100%;
  height: 140px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-play {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.card-badge {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  padding: 3px 10px;
  border-radius: var(--radius-sm);
}

.card-badge.completed {
  background: var(--color-success);
}

.badge-text {
  font-size: var(--font-xs);
  color: var(--text-white);
  font-weight: var(--weight-semibold);
}

.card-info {
  padding: 14px;
}

.card-title {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.lecturer-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.lecturer-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: var(--font-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
}

.lecturer-name {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.card-lessons {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.card-progress {
  margin-bottom: 10px;
}

.progress-bar {
  height: 6px;
  background: var(--bg-gray);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.progress-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
  margin-top: var(--space-xs);
  display: block;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-lesson {
  font-size: var(--font-sm);
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

.card-btn {
  padding: 6px 14px;
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
}

.btn-text {
  font-size: var(--font-sm);
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

/* 加载状态 */
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-gray);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-spinner-sm {
  width: 24px;
  height: 24px;
  border: 2px solid var(--bg-gray);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
}

.empty-text {
  font-size: var(--font-base);
  color: var(--text-hint);
  margin-bottom: var(--space-lg);
  margin-top: var(--space-md);
}

.empty-btn {
  padding: 10px var(--space-3xl);
  background: var(--color-primary);
  border-radius: var(--radius-xl);
}

.empty-btn:active {
  opacity: 0.9;
}

.empty-btn-text {
  font-size: var(--font-base);
  color: var(--text-white);
  font-weight: var(--weight-medium);
}

.bottom-spacer {
  height: var(--space-lg);
}
</style>
