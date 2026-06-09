<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">&lsaquo;</text>
      </view>
      <text class="nav-title">全部课程</text>
      <view class="nav-right">
        <view class="nav-search" @tap="goSearch">
          <Icon icon="solar:magnifer-bold" width="20" height="20" />
        </view>
        <view class="nav-my" @tap="goMyCourses">
          <text class="my-text">我的</text>
        </view>
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-bar">
      <scroll-view scroll-x class="category-scroll">
        <view class="category-tags">
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="category-tag"
            :class="{ active: activeCategory === cat.id }"
            @tap="onSelectCategory(cat.id)"
          >
            <text class="tag-text" :class="{ active: activeCategory === cat.id }">{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-tabs">
        <view
          v-for="f in filters"
          :key="f.key"
          class="filter-tab"
          :class="{ active: activeFilter === f.key }"
          @tap="onSelectFilter(f.key)"
        >
          <text class="filter-text" :class="{ active: activeFilter === f.key }">{{ f.label }}</text>
        </view>
      </view>
    </view>

    <!-- 课程列表 -->
    <scroll-view scroll-y class="course-list" @scrolltolower="loadMore">
      <view v-if="loading && courses.length === 0" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="courses.length > 0" class="course-items">
        <view
          v-for="course in courses"
          :key="course.id"
          class="course-card"
          @tap="goDetail(course.id)"
        >
          <view class="card-cover" :style="{ background: course.coverColor || defaultGradient }">
            <view class="card-play">
              <Icon icon="solar:play-bold" width="20" height="20" color="var(--color-accent)" />
            </view>
            <view v-if="course.price === 0" class="card-badge free">
              <text class="badge-text">免费</text>
            </view>
            <view v-else-if="course.isHot" class="card-badge hot">
              <text class="badge-text">热门</text>
            </view>
            <view class="card-lessons">
              <text class="lessons-text">{{ course.totalLessons || 0 }}课时</text>
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
            </view>
            <view class="card-bottom">
              <view class="card-price">
                <text class="price-current" :class="{ free: course.price === 0 }">
                  {{ course.price === 0 ? '免费' : '¥' + course.price }}
                </text>
                <text v-if="course.originalPrice" class="price-original">¥{{ course.originalPrice }}</text>
              </view>
              <text class="card-students">
                <Icon icon="solar:users-group-rounded-bold" width="14" height="14" color="var(--text-hint)" style="margin-right: 2px; vertical-align: -2px;" />{{ course.studentCount || 0 }}人在学
              </text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:notebook-bold" width="48" height="48" color="var(--text-hint)" />
        <text class="empty-text">暂无课程</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading && courses.length > 0" class="loading-more">
        <view class="loading-spinner-sm" />
      </view>

      <view v-if="noMore && courses.length > 0" class="no-more">
        <text class="no-more-text">— 没有更多了 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import http from '@/utils/http'
import { imgUrl } from '@/api'

const loading = ref(false)
const categories = ref([{ id: '', name: '全部' }])
const activeCategory = ref('')
const activeFilter = ref('recommend')
const courses = ref<any[]>([])
const pageNo = ref(1)
const noMore = ref(false)

const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

const filters = [
  { key: 'recommend', label: '推荐' },
  { key: 'newest', label: '最新' },
  { key: 'popular', label: '最热' },
  { key: 'free', label: '免费' },
]

// 模拟数据
const mockCourses = [
  { id: '1', title: 'Vue 3 + TypeScript 实战教程', lecturerName: '张明远', coverColor: 'linear-gradient(135deg,#667eea,#764ba2)', price: 0, originalPrice: 0, studentCount: 2341, totalLessons: 24, isHot: true },
  { id: '2', title: 'React 18 新特性深度解析', lecturerName: '李思琪', coverColor: 'linear-gradient(135deg,#f093fb,#f5576c)', price: 199, originalPrice: 399, studentCount: 892, totalLessons: 18, isHot: true },
  { id: '3', title: 'Python 数据分析从入门到精通', lecturerName: '王建国', coverColor: 'linear-gradient(135deg,#4facfe,#00f2fe)', price: 299, originalPrice: 599, studentCount: 5621, totalLessons: 32, isHot: false },
  { id: '4', title: 'Node.js 后端开发实战', lecturerName: '陈雨薇', coverColor: 'linear-gradient(135deg,#43e97b,#38f9d7)', price: 259, originalPrice: 499, studentCount: 1892, totalLessons: 28, isHot: false },
  { id: '5', title: 'Flutter 跨平台开发入门', lecturerName: '刘志强', coverColor: 'linear-gradient(135deg,#fa709a,#fee140)', price: 0, originalPrice: 0, studentCount: 3456, totalLessons: 20, isHot: false },
  { id: '6', title: 'AI 人工智能基础与实战', lecturerName: '王建国', coverColor: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', price: 399, originalPrice: 799, studentCount: 7821, totalLessons: 36, isHot: true },
]

function goBack() {
  uni.navigateBack()
}

function goSearch() {
  // TODO: 搜索页
}

function goMyCourses() {
  uni.navigateTo({ url: '/pages/course/my' })
}

function goDetail(id: string) {
  uni.navigateTo({ url: '/pages/course/detail?id=' + id })
}

function onSelectCategory(id: string) {
  activeCategory.value = id
  pageNo.value = 1
  noMore.value = false
  courses.value = []
  loadCourses()
}

function onSelectFilter(key: string) {
  activeFilter.value = key
  pageNo.value = 1
  noMore.value = false
  courses.value = []
  loadCourses()
}

function loadMore() {
  if (noMore.value || loading.value) return
  pageNo.value++
  loadCourses(true)
}

async function loadCategories() {
  try {
    const res = await http.get('/course/category/list')
    const list: any[] = Array.isArray(res) ? res : (res?.records || [])
    categories.value = [{ id: '', name: '全部' }, ...list]
  } catch {
    // 使用默认分类
    categories.value = [
      { id: '', name: '全部' },
      { id: 'frontend', name: '前端开发' },
      { id: 'backend', name: '后端开发' },
      { id: 'mobile', name: '移动开发' },
      { id: 'ai', name: 'AI/大数据' },
      { id: 'design', name: '设计创作' },
      { id: 'language', name: '语言学习' },
    ]
  }
}

async function loadCourses(append = false) {
  if (!append) loading.value = true
  try {
    const params: any = { pageNo: pageNo.value, pageSize: 10 }
    if (activeCategory.value) params.categoryId = activeCategory.value
    if (activeFilter.value) params.sort = activeFilter.value
    const res = await http.get('/course/list', { params })
    const records: any[] = res?.records || []
    if (append) {
      courses.value = [...courses.value, ...records]
    } else {
      courses.value = records.length > 0 ? records : mockCourses
    }
    noMore.value = records.length < 10
  } catch {
    if (!append) courses.value = mockCourses
    noMore.value = true
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadCategories()
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
  align-items: center;
  gap: var(--space-md);
}

.nav-search {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-my {
  padding: 6px var(--space-md);
  background: var(--color-accent-light);
  border-radius: var(--radius-full);
}

.my-text {
  font-size: var(--font-sm);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

/* 分类标签 */
.category-bar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--bg-gray);
}

.category-scroll {
  white-space: nowrap;
}

.category-tags {
  display: inline-flex;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
}

.category-tag {
  flex-shrink: 0;
  padding: 6px var(--space-lg);
  border-radius: var(--radius-full);
  background: var(--bg-gray);
  cursor: pointer;
}

.category-tag:active {
  opacity: 0.7;
}

.category-tag.active {
  background: var(--color-accent);
}

.tag-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.tag-text.active {
  color: var(--text-white);
}

/* 筛选栏 */
.filter-bar {
  background: var(--bg-card);
  padding: 0 var(--space-lg);
  border-bottom: 1px solid var(--bg-gray);
}

.filter-tabs {
  display: flex;
  gap: 0;
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: var(--space-md) 0;
  position: relative;
}

.filter-text {
  font-size: var(--font-base);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.filter-text.active {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.filter-tab.active::after {
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
  height: 160px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-play {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-circle);
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

.card-badge.free {
  background: var(--color-success);
}

.card-badge.hot {
  background: var(--color-danger);
}

.badge-text {
  font-size: var(--font-xs);
  color: var(--text-white);
  font-weight: var(--weight-semibold);
}

.card-lessons {
  position: absolute;
  bottom: var(--space-sm);
  right: var(--space-sm);
  background: rgba(0,0,0,0.5);
  padding: 2px var(--space-sm);
  border-radius: var(--radius-sm);
}

.lessons-text {
  font-size: var(--font-xs);
  color: var(--text-white);
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
  margin-bottom: 10px;
}

.lecturer-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.lecturer-avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-circle);
  background: var(--color-accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: var(--space-md);
  font-weight: var(--weight-semibold);
  color: var(--color-accent);
}

.lecturer-name {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-current {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--color-accent);
}

.price-current.free {
  color: var(--color-success);
}

.price-original {
  font-size: var(--font-sm);
  color: var(--text-hint);
  text-decoration: line-through;
}

.card-students {
  font-size: var(--font-sm);
  color: var(--text-hint);
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
  border-top-color: var(--color-accent);
  border-radius: var(--radius-circle);
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
  border-top-color: var(--color-accent);
  border-radius: var(--radius-circle);
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
  margin-top: var(--space-md);
}

/* 加载更多 */
.no-more {
  padding: var(--space-lg) 0;
  text-align: center;
}

.no-more-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.bottom-spacer {
  height: var(--space-lg);
}
</style>
