<template>
  <view class="page-container">
    <view class="nav-bar">
      <text class="nav-back" @tap="goBack">‹</text>
      <text class="nav-title">讲师课程</text>
      <view class="header-action" @tap="onAdd">
        <text class="action-text">+ 新建</text>
      </view>
    </view>

    <scroll-view scroll-y class="course-list">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="courses.length > 0" class="course-items">
        <view v-for="course in courses" :key="course.id" class="course-card">
          <view class="course-img-wrap">
            <image v-if="course.cover" :src="imgUrl(course.cover)" class="course-img" mode="aspectFill" />
            <view v-else class="img-placeholder">
              <text class="placeholder-icon">📚</text>
            </view>
          </view>
          <view class="course-info">
            <text class="course-name">{{ course.title }}</text>
            <view class="course-stats">
              <text class="stat-text">{{ course.studentCount || 0 }}人学习</text>
              <text class="stat-sep">·</text>
              <text class="stat-text">{{ course.totalLessons || 0 }}课时</text>
            </view>
            <view class="course-status" :class="'status-' + (course.status || 0)">
              <text class="status-text">{{ getStatusText(course.status) }}</text>
            </view>
          </view>
          <view class="course-actions">
            <text class="edit-btn" @tap="onEdit(course)">编辑</text>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <text class="empty-icon">📚</text>
        <text class="empty-text">还没有创建课程</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import http from '@/utils/http'
import { imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(true)
const courses = ref<any[]>([])

function goBack() {
  uni.navigateBack()
}

function getStatusText(status: number) {
  const map: Record<number, string> = { 0: '草稿', 1: '审核中', 2: '已上架', 3: '已下架' }
  return map[status] || '未知'
}

function onAdd() {
  uni.showToast({ title: '课程创建功能开发中', icon: 'none' })
}

function onEdit(course: any) {
  uni.showToast({ title: '课程编辑功能开发中', icon: 'none' })
}

async function loadCourses() {
  loading.value = true
  try {
    const res = await http.get('/course/lecturer/courses', { params: { userId: getCurrentUserId(), pageSize: 50 } })
    courses.value = res?.records || (Array.isArray(res) ? res : [])
  } catch {
    courses.value = []
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadCourses()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F5F6FA;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 44px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-back {
  font-size: 28px;
  font-weight: 300;
  color: #1a1a1a;
  padding: 4px 8px;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-action {
  padding: 4px 12px;
}

.action-text {
  font-size: 14px;
  color: #FF7A45;
  font-weight: 500;
}

.course-list {
  flex: 1;
  padding: 12px 16px;
}

.course-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-card {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.course-img-wrap {
  width: 80px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.course-img {
  width: 100%;
  height: 100%;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  background: #F5F6FA;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 24px;
}

.course-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-stats {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-text {
  font-size: 12px;
  color: #999;
}

.stat-sep {
  font-size: 12px;
  color: #ccc;
}

.course-status {
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-0 {
  background: #F5F6FA;
}

.status-0 .status-text {
  color: #999;
}

.status-1 {
  background: #FFF7E6;
}

.status-1 .status-text {
  color: #FAAD14;
}

.status-2 {
  background: #F6FFED;
}

.status-2 .status-text {
  color: #52C41A;
}

.status-3 {
  background: #F5F6FA;
}

.status-3 .status-text {
  color: #999;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
}

.course-actions {
  display: flex;
  align-items: center;
}

.edit-btn {
  font-size: 12px;
  color: #FF7A45;
  padding: 4px 12px;
  border: 1px solid #FF7A45;
  border-radius: 20px;
}

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
  border-top-color: #FF7A45;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 40px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}
</style>
