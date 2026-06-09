<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">&lsaquo;</text>
      </view>
      <text class="nav-title">{{ lesson.title || course.title || '课程播放' }}</text>
      <view class="nav-actions">
        <view class="nav-btn" @tap="onShare">
          <Icon icon="solar:share-bold" width="20" height="20" color="var(--text-secondary)" />
        </view>
      </view>
    </view>

    <!-- 视频播放区 -->
    <view class="video-area">
      <view class="video-placeholder">
        <view class="play-btn">
          <Icon icon="solar:play-bold" width="30" height="30" color="var(--color-primary)" />
        </view>
        <text class="video-hint">视频播放区域</text>
      </view>
    </view>

    <!-- 课程信息 -->
    <view class="course-info">
      <text class="course-title">{{ lesson.title || course.title || '课程播放' }}</text>
      <view class="course-meta">
        <text class="meta-text">{{ course.studentCount || 0 }}人学习</text>
        <text class="meta-dot">·</text>
        <text class="meta-text">{{ lesson.duration || '' }}</text>
        <text class="meta-dot">·</text>
        <text class="meta-text">第{{ currentLessonIndex + 1 }}节</text>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @tap="activeTab = tab.key"
      >
        <text class="tab-text" :class="{ active: activeTab === tab.key }">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 课程目录 -->
    <scroll-view v-if="activeTab === 'lessons'" scroll-y class="lesson-list">
      <view
        v-for="(item, idx) in lessons"
        :key="item.id"
        class="lesson-item"
        :class="{ active: item.id === lesson.id }"
        @tap="switchLesson(item)"
      >
        <view class="lesson-index" :class="{ active: item.id === lesson.id }">
          <text class="index-text">{{ idx + 1 }}</text>
        </view>
        <view class="lesson-info">
          <text class="lesson-title" :class="{ active: item.id === lesson.id }">{{ item.title }}</text>
          <view class="lesson-meta">
            <text class="lesson-duration">{{ item.duration || '' }}</text>
            <text v-if="item.free" class="lesson-free">试看</text>
          </view>
        </view>
        <view v-if="item.id === lesson.id" class="playing-badge">
          <Icon icon="solar:play-bold" width="12" height="12" color="#fff" style="margin-right: 2px;" />
          <text class="playing-text">播放中</text>
        </view>
        <Icon v-else-if="item.completed" icon="solar:check-circle-bold" width="18" height="18" color="var(--color-success)" />
      </view>
    </scroll-view>

    <!-- 课程介绍 -->
    <scroll-view v-else-if="activeTab === 'desc'" scroll-y class="desc-area">
      <view class="desc-section">
        <text class="desc-label">课程简介</text>
        <text class="desc-text">{{ course.description || '暂无介绍' }}</text>
      </view>
      <view class="desc-section">
        <text class="desc-label">讲师信息</text>
        <view class="lecturer-card">
          <view class="lecturer-avatar">
            <text class="avatar-text">{{ (course.lecturerName || '师').charAt(0) }}</text>
          </view>
          <view class="lecturer-info">
            <text class="lecturer-name">{{ course.lecturerName || '未知讲师' }}</text>
            <text class="lecturer-title">{{ course.lecturerTitle || '资深讲师' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 课程评价 -->
    <scroll-view v-else scroll-y class="review-area">
      <view class="review-summary">
        <view class="review-score">
          <text class="score-value">4.8</text>
          <text class="score-label">综合评分</text>
        </view>
        <view class="review-tags">
          <view class="review-tag" v-for="tag in reviewTags" :key="tag">
            <text class="tag-text">{{ tag }}</text>
          </view>
        </view>
      </view>
      <view class="review-list">
        <view class="review-item" v-for="(review, idx) in reviews" :key="idx">
          <view class="review-header">
            <view class="review-user">
              <view class="user-avatar">
                <text class="avatar-text">{{ review.user.charAt(0) }}</text>
              </view>
              <text class="user-name">{{ review.user }}</text>
            </view>
            <view class="review-rating">
              <Icon v-for="i in 5" :key="i" icon="solar:star-bold" width="14" height="14" color="var(--color-warning)" />
            </view>
          </view>
          <text class="review-content">{{ review.content }}</text>
          <text class="review-time">{{ review.time }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <view class="bar-action" @tap="onPrev" :class="{ disabled: currentLessonIndex <= 0 }">
          <text class="bar-icon">&lsaquo;</text>
          <text class="bar-label">上一节</text>
        </view>
        <view class="bar-action" @tap="onNext" :class="{ disabled: currentLessonIndex >= lessons.length - 1 }">
          <text class="bar-icon">&rsaquo;</text>
          <text class="bar-label">下一节</text>
        </view>
      </view>
      <view class="bar-right">
        <button class="btn-note" @tap="onNote">
          <Icon icon="solar:notebook-bold" width="16" height="16" color="var(--color-primary)" style="margin-right: 4px;" />
          <text class="btn-note-text">记笔记</text>
        </button>
        <button class="btn-done" @tap="onMarkDone">
          <Icon icon="solar:check-circle-bold" width="16" height="16" color="#fff" style="margin-right: 4px;" />
          <text class="btn-done-text">完成本节</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import http from '@/utils/http'

const tabs = [
  { key: 'lessons', label: '目录' },
  { key: 'desc', label: '介绍' },
  { key: 'review', label: '评价' },
]

const activeTab = ref('lessons')
const course = ref<any>({})
const lesson = ref<any>({})
const lessons = ref<any[]>([])
let courseId = ''

const reviewTags = ['讲解清晰', '内容实用', '案例丰富', '通俗易懂']

const reviews = [
  { user: '张同学', content: '老师讲得很清楚，案例也很实用，学完就能用到项目里。', time: '2024-01-15' },
  { user: '李同学', content: '课程内容很系统，从基础到进阶都有覆盖，推荐！', time: '2024-01-10' },
  { user: '王同学', content: '视频画质清晰，老师声音也很清楚，学习体验很好。', time: '2024-01-05' },
]

const currentLessonIndex = computed(() => {
  return lessons.value.findIndex(l => l.id === lesson.value.id)
})

function goBack() {
  uni.navigateBack()
}

function onShare() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

function switchLesson(item: any) {
  lesson.value = item
  // TODO: 切换视频源
}

function onPrev() {
  if (currentLessonIndex.value > 0) {
    lesson.value = lessons.value[currentLessonIndex.value - 1]
  }
}

function onNext() {
  if (currentLessonIndex.value < lessons.value.length - 1) {
    lesson.value = lessons.value[currentLessonIndex.value + 1]
  }
}

function onNote() {
  uni.showToast({ title: '笔记功能开发中', icon: 'none' })
}

function onMarkDone() {
  uni.showToast({ title: '已标记完成', icon: 'success' })
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
    if (lessons.value.length > 0 && !lesson.value.id) {
      lesson.value = lessons.value[0]
    }
  } catch {
    lessons.value = []
  }
}

onLoad((options: any) => {
  courseId = options?.courseId || ''
  const lessonId = options?.lessonId || ''
  loadCourse()
  loadLessons().then(() => {
    if (lessonId) {
      const found = lessons.value.find((l: any) => l.id === lessonId)
      if (found) lesson.value = found
    }
  })
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
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-actions {
  display: flex;
  gap: var(--space-md);
}

.nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 视频播放区 */
.video-area {
  width: 100%;
  height: 210px;
  background: #000;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.play-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.video-hint {
  font-size: var(--font-sm);
  color: rgba(255,255,255,0.5);
}

/* 课程信息 */
.course-info {
  background: var(--bg-card);
  padding: 14px var(--space-lg);
}

.course-title {
  font-size: 17px;
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
  gap: 6px;
  margin-top: var(--space-sm);
}

.meta-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.meta-dot {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* 标签切换 */
.tab-bar {
  display: flex;
  background: var(--bg-card);
  border-bottom: 1px solid var(--bg-gray);
  padding: 0 var(--space-lg);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: var(--space-md) 0;
  position: relative;
}

.tab-text {
  font-size: var(--font-base);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.tab-text.active {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-primary);
}

/* 课程目录 */
.lesson-list {
  flex: 1;
  background: var(--bg-card);
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 14px var(--space-lg);
  border-bottom: 1px solid var(--bg-gray);
}

.lesson-item:active {
  background: var(--bg-gray);
}

.lesson-item.active {
  background: var(--color-primary-light);
}

.lesson-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lesson-index.active {
  background: var(--color-primary);
}

.index-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
  font-weight: var(--weight-medium);
}

.lesson-index.active .index-text {
  color: var(--text-white);
}

.lesson-info {
  flex: 1;
  min-width: 0;
}

.lesson-title {
  font-size: var(--font-base);
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lesson-title.active {
  color: var(--color-primary);
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

.lesson-free {
  font-size: var(--font-xs);
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}

.playing-badge {
  background: var(--color-primary);
  padding: 3px 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.playing-text {
  font-size: var(--font-xs);
  color: var(--text-white);
  font-weight: var(--weight-medium);
}

/* 课程介绍 */
.desc-area {
  flex: 1;
  background: var(--bg-card);
  padding: var(--space-lg);
}

.desc-section {
  margin-bottom: 20px;
}

.desc-label {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: 10px;
}

.desc-text {
  font-size: var(--font-base);
  color: var(--text-secondary);
  line-height: 1.8;
}

.lecturer-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-gray);
  border-radius: var(--radius-md);
}

.lecturer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
}

.lecturer-info {
  flex: 1;
}

.lecturer-name {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.lecturer-title {
  font-size: var(--font-sm);
  color: var(--text-hint);
  margin-top: 2px;
}

/* 课程评价 */
.review-area {
  flex: 1;
  background: var(--bg-card);
}

.review-summary {
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  border-bottom: 1px solid var(--bg-gray);
}

.review-score {
  text-align: center;
}

.score-value {
  font-size: var(--space-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-warning);
  display: block;
}

.score-label {
  font-size: var(--font-sm);
  color: var(--text-hint);
  margin-top: var(--space-xs);
  display: block;
}

.review-tags {
  flex: 1;
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

.review-list {
  padding: 0 var(--space-lg);
}

.review-item {
  padding: 14px 0;
  border-bottom: 1px solid var(--bg-gray);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.review-user {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: var(--space-md);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
}

.user-name {
  font-size: var(--font-base);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-content {
  font-size: var(--font-base);
  color: var(--text-secondary);
  line-height: 1.6;
}

.review-time {
  font-size: var(--font-sm);
  color: var(--text-hint);
  margin-top: var(--space-sm);
  display: block;
}

/* 底部操作栏 */
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px var(--space-lg);
  padding-bottom: var(--space-3xl);
  background: var(--bg-card);
  border-top: 1px solid var(--bg-gray);
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

.bar-action.disabled {
  opacity: 0.4;
}

.bar-icon {
  font-size: var(--font-2xl);
  color: var(--text-secondary);
}

.bar-label {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.bar-right {
  display: flex;
  gap: 10px;
}

.btn-note {
  height: 36px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-lg);
}

.btn-note:active {
  background: var(--color-primary-light);
}

.btn-note-text {
  font-size: var(--font-sm);
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

.btn-done {
  height: 36px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.btn-done:active {
  opacity: 0.9;
}

.btn-done-text {
  font-size: var(--font-sm);
  color: var(--text-white);
  font-weight: var(--weight-semibold);
}
</style>
