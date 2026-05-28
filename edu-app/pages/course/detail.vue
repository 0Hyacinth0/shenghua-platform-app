<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourseDetail } from '@/api/course'
import { navigateTo, ROUTES } from '@/utils/router'

const course = ref(null)
const loading = ref(true)

onLoad((options) => {
  const courseId = options.id || 1
  getCourseDetail(courseId)
    .then((res) => {
      course.value = res.result
    })
    .finally(() => {
      loading.value = false
    })
})

function onLessonTap(lesson) {
  navigateTo(ROUTES.LESSON_PLAY, { lessonId: lesson.id, courseId: course.value.id })
}

function onStartLearn() {
  if (course.value && course.value.lessons && course.value.lessons.length > 0) {
    const first = course.value.lessons[0]
    navigateTo(ROUTES.LESSON_PLAY, { lessonId: first.id, courseId: course.value.id })
  }
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>

<template>
  <view class="page" v-if="!loading && course">
    <!-- 封面 -->
    <view class="detail-cover">
      <view class="cover-placeholder"></view>
    </view>

    <!-- 基本信息 -->
    <view class="detail-section">
      <view class="detail-title">{{ course.title }}</view>
      <view class="detail-subtitle" v-if="course.subtitle">{{ course.subtitle }}</view>
      <view class="detail-stats">
        <text>{{ course.lessonCount }}课时</text>
        <text>·</text>
        <text>{{ course.studentCount }}人学习</text>
        <text>·</text>
        <text class="tag-free">免费</text>
      </view>
    </view>

    <!-- 讲师 -->
    <view class="detail-section teacher-section">
      <view class="section-title">讲师介绍</view>
      <view class="teacher-card" v-if="course.teacher">
        <view class="teacher-avatar">
          <view class="avatar-placeholder"></view>
        </view>
        <view class="teacher-info">
          <text class="teacher-name">{{ course.teacher.name }}</text>
          <text class="teacher-title" v-if="course.teacher.title">{{ course.teacher.title }}</text>
          <text class="teacher-intro" v-if="course.teacher.intro">{{ course.teacher.intro }}</text>
        </view>
      </view>
    </view>

    <!-- 课节目录 -->
    <view class="detail-section">
      <view class="section-title">课节目录（{{ course.lessons.length }}课时）</view>
      <view class="lesson-list">
        <view
          v-for="lesson in course.lessons"
          :key="lesson.id"
          class="lesson-item"
          @tap="onLessonTap(lesson)"
        >
          <view class="lesson-left">
            <text class="lesson-num">{{ lesson.sortNo }}</text>
            <view class="lesson-text">
              <text class="lesson-title">{{ lesson.title }}</text>
              <view class="lesson-meta">
                <text v-if="lesson.isTrial" class="trial-tag">试看</text>
                <text class="lesson-duration">{{ formatDuration(lesson.duration) }}</text>
              </view>
            </view>
          </view>
          <text class="lesson-arrow">▶</text>
        </view>
      </view>
    </view>

    <!-- 课程简介 -->
    <view class="detail-section">
      <view class="section-title">课程简介</view>
      <view class="intro-text">{{ course.intro }}</view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="btn-start" @tap="onStartLearn">开始学习</view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-page-bg);
  padding-bottom: 160rpx;
}

/* 封面 */
.detail-cover {
  width: 100%;
  height: 400rpx;
  background: #F5F6F8;
}
.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFE0D0, #F0524A);
}

/* 通用 section */
.detail-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;
}
.detail-title {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
}
.detail-subtitle {
  font-size: var(--font-body);
  color: var(--color-text-tertiary);
  margin-top: 12rpx;
}
.detail-stats {
  display: flex;
  gap: 12rpx;
  font-size: var(--font-auxiliary);
  color: var(--color-text-tertiary);
  margin-top: 20rpx;
}
.tag-free {
  color: var(--color-primary);
  font-weight: 600;
}

/* 讲师 */
.section-title {
  font-size: var(--font-title-card);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 24rpx;
}
.teacher-card {
  display: flex;
  gap: 20rpx;
}
.teacher-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFE8E0, #FFC0C0);
}
.teacher-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.teacher-name {
  font-size: var(--font-body);
  font-weight: 600;
  color: var(--color-text-primary);
}
.teacher-title {
  font-size: var(--font-auxiliary);
  color: var(--color-primary);
}
.teacher-intro {
  font-size: var(--font-auxiliary);
  color: var(--color-text-tertiary);
}

/* 课节目录 */
.lesson-list {
  display: flex;
  flex-direction: column;
}
.lesson-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid var(--color-border);
}
.lesson-item:last-child {
  border-bottom: none;
}
.lesson-left {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  flex: 1;
  min-width: 0;
}
.lesson-num {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F6F8;
  border-radius: 50%;
  font-size: var(--font-auxiliary);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.lesson-text {
  flex: 1;
  min-width: 0;
}
.lesson-title {
  font-size: var(--font-body);
  color: var(--color-text-primary);
}
.lesson-meta {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}
.trial-tag {
  font-size: 22rpx;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 6rpx;
  padding: 0 8rpx;
}
.lesson-duration {
  font-size: var(--font-auxiliary);
  color: var(--color-text-tertiary);
}
.lesson-arrow {
  color: var(--color-text-tertiary);
  font-size: 24rpx;
}

/* 简介 */
.intro-text {
  font-size: var(--font-body);
  color: var(--color-text-secondary);
  line-height: 1.8;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + var(--safe-area-bottom));
  background: #FFFFFF;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}
.btn-start {
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: #FFFFFF;
  border-radius: var(--radius-button);
  font-size: var(--font-body);
  font-weight: 600;
}
</style>
