<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:arrow-left-bold" width="20" height="20" color="#fff" />
      </view>
      <view class="nav-actions">
        <view class="nav-btn" @tap="onShare">
          <Icon icon="solar:share-bold" width="20" height="20" color="#fff" />
        </view>
        <view class="nav-btn" @tap="onFavorite">
          <Icon :icon="favorited ? 'solar:heart-bold' : 'solar:heart-linear'" width="20" height="20" color="#fff" />
        </view>
      </view>
    </view>

    <!-- 课程封面 -->
    <view class="course-cover">
      <image v-if="course.coverImage" :src="imgUrl(course.coverImage)" class="cover-image" mode="aspectFill" />
      <view v-else class="cover-placeholder" :style="{ background: coverGradient }">
        <view class="play-icon">
          <Icon icon="solar:play-bold" width="28" height="28" color="var(--color-accent)" />
        </view>
      </view>
    </view>

    <!-- 价格栏 -->
    <view class="price-section">
      <view class="price-left">
        <text class="current-price" :class="{ free: course.price === 0 }">
          {{ course.price === 0 ? '免费' : '¥' + course.price }}
        </text>
        <text v-if="course.originalPrice" class="original-price">¥{{ course.originalPrice }}</text>
      </view>
      <view class="price-tags">
        <view v-if="course.price === 0" class="tag tag-free">
          <text class="tag-text-free">免费课程</text>
        </view>
        <view v-else class="tag tag-hot">
          <Icon icon="solar:fire-bold" width="12" height="12" color="var(--color-danger)" style="margin-right: 2px; vertical-align: -1px;" />
          <text class="tag-text-hot">热门</text>
        </view>
        <text class="students-text">{{ course.studentCount || 0 }}人学习</text>
      </view>
    </view>

    <!-- 课程标题 -->
    <view class="title-section">
      <text class="course-title">{{ course.title || '加载中...' }}</text>
      <view class="course-meta">
        <text class="meta-item">{{ course.totalLessons || 0 }}课时</text>
        <text class="meta-dot">·</text>
        <text class="meta-item">{{ course.level || '入门' }}</text>
        <text class="meta-dot">·</text>
        <text class="meta-item">{{ course.duration || '待更新' }}</text>
      </view>
    </view>

    <!-- 讲师信息 -->
    <view v-if="course.lecturerName" class="lecturer-card" @tap="goLecturer">
      <view class="lecturer-avatar">
        <text class="avatar-text">{{ course.lecturerName?.charAt(0) || '师' }}</text>
      </view>
      <view class="lecturer-info">
        <text class="lecturer-name">{{ course.lecturerName }}</text>
        <text class="lecturer-title">{{ course.lecturerTitle || '资深讲师' }}</text>
      </view>
      <view class="lecturer-stats">
        <text class="stats-text">{{ course.lecturerCourses || 12 }}门课</text>
      </view>
      <Icon icon="solar:alt-arrow-right-bold" width="16" height="16" color="var(--text-hint)" />
    </view>

    <!-- 课程介绍 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">课程介绍</text>
      </view>
      <text class="course-desc">{{ course.description || '暂无介绍' }}</text>
    </view>

    <!-- 课程目录 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">课程目录</text>
        <text class="lesson-count">共{{ lessons.length }}节</text>
      </view>
      <view v-if="lessons.length > 0" class="lesson-list">
        <view
          v-for="(lesson, idx) in lessons"
          :key="lesson.id"
          class="lesson-item"
          @tap="goWatch(lesson)"
        >
          <view class="lesson-index" :class="{ active: lesson.free }">
            <text class="index-text">{{ idx + 1 }}</text>
          </view>
          <view class="lesson-info">
            <text class="lesson-title">{{ lesson.title }}</text>
            <view class="lesson-meta">
              <text class="lesson-duration">{{ lesson.duration || '00:00' }}</text>
              <text v-if="lesson.free" class="lesson-free-badge">试看</text>
            </view>
          </view>
          <view class="lesson-status">
            <Icon v-if="lesson.completed" icon="solar:check-circle-bold" width="18" height="18" color="var(--color-success)" />
            <text v-else-if="lesson.progress > 0" class="status-progress">{{ lesson.progress }}%</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-lessons">
        <text class="empty-text">暂无课程内容</text>
      </view>
    </view>

    <!-- 课程评价 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">学员评价</text>
        <text class="rating-score">4.8分</text>
      </view>
      <view class="rating-summary">
        <view class="rating-stars">
          <Icon v-for="i in 4" :key="i" icon="solar:star-bold" width="18" height="18" color="var(--color-warning)" />
          <Icon icon="solar:star-linear" width="18" height="18" color="var(--text-hint)" />
        </view>
        <text class="rating-count">({{ course.reviewCount || 128 }}条评价)</text>
      </view>
      <view class="review-tags">
        <view class="review-tag" v-for="tag in reviewTags" :key="tag">
          <text class="tag-text">{{ tag }}</text>
        </view>
      </view>
    </view>

    <!-- 推荐课程 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">相关推荐</text>
        <text class="section-more" @tap="goCourseList">更多 ›</text>
      </view>
      <scroll-view scroll-x class="recommend-scroll">
        <view class="recommend-card" v-for="c in recommendCourses" :key="c.id" @tap="goCourse(c.id)">
          <view class="recommend-img">
            <image v-if="c.coverImage" :src="imgUrl(c.coverImage)" class="recommend-cover" mode="aspectFill" />
            <view v-else class="recommend-play">
              <Icon icon="solar:play-bold" width="16" height="16" color="var(--color-accent)" />
            </view>
          </view>
          <view class="recommend-info">
            <text class="recommend-title">{{ c.title }}</text>
            <view class="recommend-meta">
              <text class="recommend-price" :class="{ free: c.price === 0 }">
                {{ c.price === 0 ? '免费' : '¥' + c.price }}
              </text>
              <text class="recommend-students">{{ c.studentCount || 0 }}人在学</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="bottom-spacer" />

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <view class="bar-action" @tap="onFavorite">
          <Icon :icon="favorited ? 'solar:heart-bold' : 'solar:heart-linear'" width="22" height="22" :color="favorited ? 'var(--color-accent)' : 'var(--text-hint)'" />
          <text class="bar-label">收藏</text>
        </view>
        <view class="bar-action" @tap="onShare">
          <Icon icon="solar:share-bold" width="22" height="22" color="var(--text-hint)" />
          <text class="bar-label">分享</text>
        </view>
      </view>
      <view class="bar-right">
        <button v-if="course.price === 0" class="btn-free" @tap="onBuy">
          <text class="btn-free-text">免费学习</text>
        </button>
        <template v-else>
          <button class="btn-cart" @tap="onAddCart">
            <text class="btn-cart-text">加入购物车</text>
          </button>
          <button class="btn-buy" @tap="onBuy">
            <text class="btn-buy-text">立即购买</text>
          </button>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import http from '@/utils/http'
import { imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(true)
const course = ref<any>({})
const lessons = ref<any[]>([])
const favorited = ref(false)
const activeTab = ref('intro')
let courseId = ''

const coverGradient = computed(() => {
  const gradients = [
    'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #1A1A2E 0%, #3B3B6B 100%)',
    'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
  ]
  return gradients[Math.floor(Math.random() * gradients.length)]
})

const reviewTags = ['讲解清晰', '内容实用', '案例丰富', '通俗易懂', '值得推荐']

const recommendCourses = ref<any[]>([])

function goBack() {
  uni.navigateBack()
}

function goLecturer() {
  // TODO: 讲师主页
}

function goWatch(lesson: any) {
  uni.navigateTo({ url: '/pages/course/watch?courseId=' + courseId + '&lessonId=' + lesson.id })
}

function goCourseList() {
  uni.navigateTo({ url: '/pages/course/index' })
}

function goCourse(id: string) {
  uni.redirectTo({ url: '/pages/course/detail?id=' + id })
}

function onShare() {
  uni.setClipboardData({
    data: '盛桦课程: ' + (course.value?.title || '') + ' https://shenghua.com/course/' + courseId,
    success: () => uni.showToast({ title: '链接已复制', icon: 'success' }),
  });
}

async function onFavorite() {
  try {
    await http.post('/course/favorite/toggle', null, { params: { courseId, userId: getCurrentUserId() } })
    favorited.value = !favorited.value
    uni.showToast({ title: favorited.value ? '已收藏' : '已取消收藏', icon: 'success' })
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

function onAddCart() {
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}

function onBuy() {
  if (course.value.price === 0) {
    if (lessons.value.length > 0) {
      goWatch(lessons.value[0])
    }
    return
  }
  uni.navigateTo({ url: '/pages/course/checkout?courseId=' + courseId })
}

async function loadCourse() {
  try {
    const res = await http.get('/course/queryById', { params: { id: courseId } })
    course.value = res || {}
  } catch {
    course.value = {}
  }
}

async function loadLessons() {
  try {
    const res = await http.get('/course/lesson/list', { params: { courseId, pageSize: 100 } })
    lessons.value = res?.records || (Array.isArray(res) ? res : [])
  } catch {
    lessons.value = []
  }
}

onLoad(async (options: any) => {
  courseId = options?.id || ''
  loading.value = true
  Promise.all([loadCourse(), loadLessons()]).finally(() => {
    loading.value = false
  })

  // 加载推荐课程
  try {
    const recRes: any = await http.get('/course/frontList', { params: { pageNo: 1, pageSize: 4 } })
    const records = recRes?.records || []
    recommendCourses.value = records.filter((r: any) => r.id !== courseId).slice(0, 3)
  } catch {
    recommendCourses.value = []
  }
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 80px;
}

/* 顶部导航 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px var(--space-lg) 10px;
  background: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.nav-back {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-actions {
  display: flex;
  gap: var(--space-md);
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

/* 课程封面 */
.course-cover {
  width: 100%;
  height: 220px;
  overflow: hidden;
  margin-top: 88px; /* 导航栏高度占位 */
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

/* 价格栏 */
.price-section {
  background: var(--bg-card);
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-divider);
}

.price-left {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.current-price {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-danger);
}

.current-price.free {
  color: var(--color-success);
}

.original-price {
  font-size: var(--font-base);
  color: var(--text-hint);
  text-decoration: line-through;
}

.price-tags {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag {
  padding: 3px var(--space-sm);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
}

.tag-free {
  background: var(--color-success-light);
}

.tag-text-free {
  font-size: var(--font-sm);
  color: var(--color-success);
  font-weight: var(--weight-medium);
}

.tag-hot {
  background: var(--color-danger-light);
}

.tag-text-hot {
  font-size: var(--font-sm);
  color: var(--color-danger);
  font-weight: var(--weight-medium);
}

.students-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* 标题区 */
.title-section {
  background: var(--bg-card);
  padding: 16px var(--space-lg) var(--space-lg);
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.course-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
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
  gap: 6px;
  margin-top: 10px;
}

.meta-item {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.meta-dot {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* 讲师卡片 */
.lecturer-card {
  background: var(--bg-card);
  margin-top: 12px;
  margin-left: 12px;
  margin-right: 12px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.lecturer-card:active {
  background: #fafafa;
}

.lecturer-avatar {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-circle);
  background: var(--color-accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--color-accent);
}

.lecturer-info {
  flex: 1;
}

.lecturer-name {
  font-size: var(--font-lg);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}

.lecturer-title {
  font-size: var(--font-sm);
  color: var(--text-hint);
  margin-top: 2px;
}

.lecturer-stats {
  margin-right: var(--space-sm);
}

.stats-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* 内容区块 */
.section-card {
  background: var(--bg-card);
  margin-top: 12px;
  margin-left: 12px;
  margin-right: 12px;
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: var(--font-lg);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}

.section-more {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.lesson-count {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* 课程介绍 */
.course-desc {
  font-size: var(--font-md);
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 课程目录 */
.lesson-list {
  display: flex;
  flex-direction: column;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-divider);
}

.lesson-item:last-child {
  border-bottom: none;
}

.lesson-item:active {
  background: #fafafa;
}

.lesson-index {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-circle);
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lesson-index.active {
  background: var(--color-accent-light);
}

.index-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
  font-weight: var(--weight-medium);
}

.lesson-index.active .index-text {
  color: var(--color-accent);
}

.lesson-info {
  flex: 1;
  min-width: 0;
}

.lesson-title {
  font-size: var(--font-md);
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: var(--weight-medium);
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
}

.lesson-duration {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.lesson-free-badge {
  font-size: 10px;
  color: var(--color-accent);
  background: var(--color-accent-light);
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.lesson-status {
  flex-shrink: 0;
}

.status-progress {
  font-size: var(--font-sm);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

/* 评价区 */
.rating-summary {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-count {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.rating-score {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--color-warning);
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.review-tag {
  background: var(--bg-gray);
  padding: 6px var(--space-md);
  border-radius: var(--radius-full);
}

.tag-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* 推荐课程 */
.recommend-scroll {
  display: flex;
  gap: var(--space-md);
  white-space: nowrap;
  padding-bottom: var(--space-xs);
}

.recommend-card {
  display: inline-block;
  vertical-align: top;
  width: 150px;
  margin-right: 12px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-page);
  box-shadow: var(--shadow-sm);
}

.recommend-card:active {
  transform: scale(0.98);
}

.recommend-img {
  width: 150px;
  height: 94px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-gray);
}

.recommend-cover {
  width: 100%;
  height: 100%;
}

.recommend-play {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-circle);
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.recommend-info {
  padding: 8px 10px;
}

.recommend-title {
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
  white-space: normal;
  min-height: 32px;
}

.recommend-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.recommend-price {
  font-size: var(--font-sm);
  font-weight: var(--weight-bold);
  color: var(--color-danger);
}

.recommend-price.free {
  color: var(--color-success);
}

.recommend-students {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

/* 空状态 */
.empty-lessons {
  padding: var(--space-3xl);
  text-align: center;
}

.empty-text {
  font-size: var(--font-md);
  color: var(--text-hint);
}

.bottom-spacer {
  height: 16px;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px var(--space-lg);
  padding-bottom: calc(var(--space-md) + var(--safe-area-bottom));
  background: var(--bg-card);
  border-top: 1px solid var(--color-divider);
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.02);
}

.bar-left {
  display: flex;
  gap: 20px;
}

.bar-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.bar-label {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

.bar-right {
  display: flex;
  gap: 10px;
}

.btn-free {
  flex: 1;
  height: 40px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-3xl);
}

.btn-free:active {
  opacity: 0.9;
}

.btn-free-text {
  font-size: var(--font-md);
  font-weight: var(--weight-bold);
  color: #ffffff;
}

.btn-cart {
  height: 40px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.btn-cart:active {
  background: #e8dffc;
}

.btn-cart-text {
  font-size: var(--font-sm);
  color: var(--color-accent);
  font-weight: var(--weight-bold);
}

.btn-buy {
  height: 40px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-3xl);
}

.btn-buy:active {
  opacity: 0.9;
}

.btn-buy-text {
  font-size: var(--font-sm);
  font-weight: var(--weight-bold);
  color: #ffffff;
}

/* 隐藏滚动条 */
.recommend-scroll::-webkit-scrollbar {
  display: none;
}
</style>
