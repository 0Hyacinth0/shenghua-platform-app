<script setup>
import { ref, onMounted } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { getCategories, getCourseList } from '@/api/course'
import { navigateTo, ROUTES } from '@/utils/router'

const currentTab = ref(1)

const categories = ref([])
const activeCategory = ref(0)
const courses = ref([])
const loading = ref(false)

onMounted(() => {
  fetchCategories()
  fetchCourses()
})

function fetchCategories() {
  getCategories().then((res) => {
    categories.value = res.result || []
  })
}

function fetchCourses(categoryId) {
  loading.value = true
  const params = { pageNo: 1, pageSize: 20 }
  if (categoryId) params.categoryId = categoryId
  getCourseList(params)
    .then((res) => {
      courses.value = (res.result && res.result.records) || []
    })
    .finally(() => {
      loading.value = false
    })
}

function onCategoryTap(id) {
  activeCategory.value = id
  fetchCourses(id)
}

function onCourseTap(course) {
  navigateTo(ROUTES.COURSE_DETAIL, { id: course.id })
}

function formatCount(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}
</script>

<template>
  <view class="page">
    <!-- 顶部分类 -->
    <view class="category-bar">
      <view
        class="category-item"
        :class="{ active: activeCategory === 0 }"
        @tap="onCategoryTap(0)"
      >全部</view>
      <view
        v-for="cat in categories"
        :key="cat.id"
        class="category-item"
        :class="{ active: activeCategory === cat.id }"
        @tap="onCategoryTap(cat.id)"
      >{{ cat.name }}</view>
    </view>

    <!-- 课程列表 -->
    <scroll-view scroll-y class="course-list" v-if="!loading">
      <view
        v-for="course in courses"
        :key="course.id"
        class="course-card"
        @tap="onCourseTap(course)"
      >
        <view class="card-cover">
          <view class="cover-placeholder"></view>
        </view>
        <view class="card-info">
          <view class="card-title">{{ course.title }}</view>
          <view class="card-meta">
            <text class="card-teacher">{{ course.teacherName }}</text>
            <text class="card-lessons">{{ course.lessonCount }}课时</text>
          </view>
          <view class="card-bottom">
            <view class="card-tags" v-if="course.tags">
              <text v-for="tag in course.tags" :key="tag" class="card-tag">{{ tag }}</text>
            </view>
            <text class="card-students">{{ formatCount(course.studentCount) }}人学习</text>
          </view>
        </view>
      </view>
      <view v-if="courses.length === 0" class="empty-state">暂无课程</view>
    </scroll-view>

    <CustomTabBar :current="currentTab" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-page-bg);
  padding-bottom: 200rpx;
}

/* 分类横滚 */
.category-bar {
  display: flex;
  gap: 0;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  overflow-x: auto;
  white-space: nowrap;
}
.category-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14rpx 32rpx;
  font-size: var(--font-body);
  color: var(--color-text-secondary);
  border-radius: 48rpx;
  flex-shrink: 0;
}
.category-item.active {
  background: var(--color-primary);
  color: #FFFFFF;
  font-weight: 600;
}

/* 课程列表 */
.course-list {
  padding: 24rpx 32rpx;
}
.course-card {
  display: flex;
  gap: 24rpx;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.card-cover {
  width: 240rpx;
  height: 160rpx;
  border-radius: var(--radius-cover);
  overflow: hidden;
  flex-shrink: 0;
}
.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFE8E0, #FFD0D0);
  border-radius: var(--radius-cover);
}
.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta {
  display: flex;
  gap: 16rpx;
  font-size: var(--font-auxiliary);
  color: var(--color-text-tertiary);
}
.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-tags {
  display: flex;
  gap: 8rpx;
}
.card-tag {
  font-size: 22rpx;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border: 1rpx solid var(--color-primary-border);
  border-radius: 8rpx;
  padding: 2rpx 10rpx;
}
.card-students {
  font-size: var(--font-auxiliary);
  color: var(--color-text-tertiary);
}
.empty-state {
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-body);
  padding: 120rpx 0;
}
</style>
