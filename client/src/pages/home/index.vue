<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-content">
        <view class="search-bar" @tap="goSearch">
          <Icon icon="solar:magnifer-bold" :size="18" color="rgba(255,255,255,0.4)" />
          <text class="search-placeholder">搜索课程、讲师</text>
        </view>
        <view class="header-btn" @tap="goMessages">
          <Icon icon="solar:bell-bold" :size="20" color="#fff" />
          <view v-if="msgBadge > 0" class="header-badge">
            <text class="badge-text">{{ msgBadge > 99 ? '99+' : msgBadge }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Banner 横滑 -->
    <view class="banner">
      <scroll-view scroll-x class="banner-scroll">
        <view class="banner-card" v-for="b in banners" :key="b.id" @tap="navigateTo(b.route)">
          <view class="banner-deco" />
          <text class="banner-eyebrow">{{ b.eyebrow }}</text>
          <text class="banner-title">{{ b.title }}</text>
          <text class="banner-sub">{{ b.subtitle }}</text>
          <view class="banner-btn">
            <text class="banner-btn-text">{{ b.btnText }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 课程分类 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">课程分类</text>
        <view class="section-more" @tap="goCategory">
          <text class="more-text">查看全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <view class="category-grid">
        <view class="cat-item" v-for="cat in categories" :key="cat.name" :style="{ background: cat.bg }" @tap="navigateTo(cat.route)">
          <Icon :icon="cat.icon" :size="24" :color="cat.color" />
          <text class="cat-name">{{ cat.name }}</text>
          <text class="cat-count">{{ cat.count }} 门课程</text>
        </view>
      </view>
    </view>

    <!-- 频道 Tab + 课程列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门课程</text>
        <view class="section-more" @tap="goCourseList">
          <text class="more-text">更多</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <view class="channel-tabs">
        <view v-for="ch in channels" :key="ch.key" class="channel-tab" :class="{ active: activeChannel === ch.key }" @tap="activeChannel = ch.key">
          <text class="channel-tab-text" :class="{ active: activeChannel === ch.key }">{{ ch.label }}</text>
        </view>
      </view>
      <view class="course-list">
        <view class="course-card" v-for="c in recommendCourses" :key="c.id" @tap="goCourse(c.id)">
          <view class="course-img" :style="{ background: c.coverColor }">
            <view class="play-icon-wrap">
              <Icon icon="solar:play-bold" :size="16" color="#8B5CF6" />
            </view>
          </view>
          <view class="course-info">
            <text class="course-title">{{ c.title }}</text>
            <view class="course-meta">
              <text class="course-lecturer">{{ c.lecturer }}</text>
              <text class="course-dot">·</text>
              <text class="course-lessons">{{ c.lessons }}课时</text>
            </view>
            <view class="course-bottom">
              <text class="course-price" :class="{ free: c.free }">
                {{ c.free ? '免费' : '¥' + c.price }}
              </text>
              <view class="students-row">
                <Icon icon="solar:users-group-rounded-bold" :size="12" color="var(--text-hint)" />
                <text class="course-students">{{ c.students }}人学习</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 免费公开课 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">免费公开课</text>
        <view class="section-more" @tap="goCourseList">
          <text class="more-text">全部</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <view class="course-list">
        <view class="course-card" v-for="c in freeCourses" :key="c.id" @tap="goCourse(c.id)">
          <view class="course-img" :style="{ background: c.coverColor }">
            <view class="free-tag">
              <text class="free-tag-text">免费</text>
            </view>
          </view>
          <view class="course-info">
            <text class="course-title">{{ c.title }}</text>
            <view class="course-meta">
              <text class="course-lecturer">{{ c.lecturer }}</text>
              <text class="course-dot">·</text>
              <text class="course-lessons">{{ c.students }}次播放</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 精选好课 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">精选好课</text>
        <view class="section-more" @tap="goCourseList">
          <text class="more-text">更多</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
        </view>
      </view>
      <view class="course-list">
        <view class="course-card" v-for="c in featuredCourses" :key="c.id" @tap="goCourse(c.id)">
          <view class="course-img" :style="{ background: c.coverColor }">
            <view class="play-icon-wrap">
              <Icon icon="solar:play-bold" :size="16" color="#8B5CF6" />
            </view>
          </view>
          <view class="course-info">
            <text class="course-title">{{ c.title }}</text>
            <view class="course-meta">
              <text class="course-lecturer">{{ c.lecturer }}</text>
            </view>
            <view class="course-bottom">
              <text class="course-price" :class="{ free: c.free }">
                {{ c.free ? '免费' : '¥' + c.price }}
                <text v-if="c.originalPrice" class="original-price">¥{{ c.originalPrice }}</text>
              </text>
              <view class="students-row">
                <Icon icon="solar:users-group-rounded-bold" :size="12" color="var(--text-hint)" />
                <text class="course-students">{{ c.students }}人学习</text>
              </view>
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

const msgBadge = ref(3)
const activeChannel = ref('recommend')

const banners = [
  { id: '1', eyebrow: 'NEW TERM', title: '探索新学期', subtitle: '发现你的下一门课程', btnText: '立即探索', route: '/pages/course/index' },
  { id: '2', eyebrow: 'LIMITED', title: '开学季大促', subtitle: '精选好课限时优惠', btnText: '查看优惠', route: '/pages/coupon/index' },
  { id: '3', eyebrow: 'GROUP', title: '拼团学习更划算', subtitle: '邀请好友一起学习', btnText: '立即拼团', route: '/pages/groupBuy/index' },
]

const categories = [
  { name: '编程开发', icon: 'solar:code-bold', bg: '#F5F3FF', color: '#8B5CF6', count: 128, route: '/pages/course/index' },
  { name: '设计创作', icon: 'solar:palette-bold', bg: '#FFF4EE', color: '#FF6B35', count: 86, route: '/pages/course/index' },
  { name: '语言学习', icon: 'solar:global-bold', bg: '#F0FDF4', color: '#22C55E', count: 64, route: '/pages/course/index' },
  { name: 'AI 技能', icon: 'solar:cpu-bold', bg: '#FEF3C7', color: '#F59E0B', count: 42, route: '/pages/course/index' },
]

const channels = [
  { key: 'recommend', label: '推荐' },
  { key: 'hot', label: '热门' },
  { key: 'new', label: '新课' },
  { key: 'live', label: '直播' },
]

const recommendCourses = [
  { id: '1', title: 'Vue 3 + TypeScript 实战教程', coverColor: 'linear-gradient(135deg,#667eea,#764ba2)', lecturer: '张明远', free: true, price: 0, lessons: 24, students: 2341 },
  { id: '2', title: 'UI/UX 设计思维与方法论', coverColor: 'linear-gradient(135deg,#f093fb,#f5576c)', lecturer: '李思琪', free: false, price: 199, lessons: 18, students: 892 },
  { id: '3', title: 'Python 数据分析从入门到精通', coverColor: 'linear-gradient(135deg,#4facfe,#00f2fe)', lecturer: '王建国', free: false, price: 299, lessons: 32, students: 5621 },
]

const freeCourses = [
  { id: 'f1', title: '算法与数据结构精讲', coverColor: 'linear-gradient(135deg,#a8edea,#fed6e3)', lecturer: '刘老师', students: 4503 },
  { id: 'f2', title: 'React Native 跨平台开发', coverColor: 'linear-gradient(135deg,#ffecd2,#fcb69f)', lecturer: '王老师', students: 1892 },
  { id: 'f3', title: '英语口语速成班', coverColor: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)', lecturer: '陈老师', students: 3201 },
]

const featuredCourses = [
  { id: 'v1', title: 'React Native 跨平台移动开发实战', coverColor: 'linear-gradient(135deg,#667eea,#764ba2)', lecturer: '王老师', price: 299, originalPrice: 799, students: 1892, free: false },
  { id: 'v2', title: 'AI 人工智能入门到实战', coverColor: 'linear-gradient(135deg,#f093fb,#f5576c)', lecturer: '王建国', price: 399, students: 3456, free: false },
  { id: 'v3', title: '商务英语口语提升课', coverColor: 'linear-gradient(135deg,#43e97b,#38f9d7)', lecturer: '陈雨薇', price: 0, students: 7821, free: true },
]

function navigateTo(url: string) {
  const tabPages = ['/pages/home/index', '/pages/learn/index', '/pages/community/index', '/pages/profile/index']
  if (tabPages.includes(url)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

function goSearch() { uni.showToast({ title: '搜索功能开发中', icon: 'none' }) }
function goMessages() { uni.navigateTo({ url: '/pages/message/index' }) }
function goCategory() { uni.switchTab({ url: '/pages/learn/index' }) }
function goCourseList() { uni.navigateTo({ url: '/pages/course/index' }) }
function goCourse(id: string) { uni.navigateTo({ url: '/pages/course/detail?id=' + id }) }
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 16px;
}

/* ---- 顶部导航 ---- */
.header {
  background: var(--color-primary);
  padding: 44px 16px 14px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-2xl);
  padding: 9px 14px;
}

.search-placeholder {
  font-size: var(--font-md);
  color: rgba(255, 255, 255, 0.4);
}

.header-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-circle);
}

.header-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  background: var(--color-danger);
  border-radius: var(--radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--color-primary);
}

.badge-text {
  font-size: 10px;
  color: #fff;
  font-weight: var(--weight-bold);
}

/* ---- Banner ---- */
.banner {
  padding: 16px;
}

.banner-scroll {
  white-space: nowrap;
}

.banner-card {
  display: inline-block;
  width: calc(100vw - 32px);
  border-radius: var(--radius-xl);
  padding: 22px;
  position: relative;
  overflow: hidden;
  background: var(--color-primary);
  vertical-align: top;
  white-space: normal;
  box-sizing: border-box;
}

.banner-card + .banner-card {
  margin-left: 12px;
}

.banner-deco {
  position: absolute;
  right: -15px;
  top: -15px;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-circle);
  background: rgba(139, 92, 246, 0.2);
}

.banner-eyebrow {
  font-size: var(--font-xs);
  color: rgba(255, 255, 255, 0.4);
  font-weight: var(--weight-semibold);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.banner-title {
  font-size: var(--font-2xl);
  font-weight: var(--weight-bold);
  color: #fff;
  margin-top: 6px;
  display: block;
}

.banner-sub {
  font-size: var(--font-md);
  color: rgba(255, 255, 255, 0.45);
  margin-top: 4px;
  display: block;
}

.banner-btn {
  display: inline-block;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: var(--radius-2xl);
  margin-top: 12px;
}

.banner-btn-text {
  font-size: var(--font-sm);
  color: #fff;
  font-weight: var(--weight-semibold);
}

/* ---- Section ---- */
.section {
  background: var(--bg-card);
  margin: 0 16px;
  margin-top: 12px;
  border-radius: var(--radius-lg);
  padding: 16px;
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

/* ---- 分类 ---- */
.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.cat-item {
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cat-item:active {
  opacity: 0.8;
}

.cat-name {
  font-size: var(--font-md);
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.cat-count {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* ---- 频道 Tab ---- */
.channel-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 14px;
}

.channel-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  position: relative;
}

.channel-tab-text {
  font-size: var(--font-md);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.channel-tab-text.active {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.channel-tab.active::after {
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

/* ---- 课程列表 ---- */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-card {
  display: flex;
  gap: 12px;
  background: var(--bg-page);
  border-radius: var(--radius-lg);
  padding: 12px;
}

.course-card:active {
  background: #eef0f4;
}

.course-img {
  width: 100px;
  height: 75px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.play-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.free-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  background: var(--color-success);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.free-tag-text {
  font-size: 10px;
  color: #fff;
  font-weight: var(--weight-semibold);
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.course-title {
  font-size: var(--font-lg);
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
  gap: 4px;
  margin-top: 4px;
}

.course-lecturer {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.course-dot {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.course-lessons {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.course-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.course-price {
  font-size: var(--font-lg);
  font-weight: var(--weight-bold);
  color: var(--color-warning);
}

.course-price.free {
  color: var(--color-success);
}

.original-price {
  font-size: var(--font-xs);
  color: var(--text-hint);
  text-decoration: line-through;
  font-weight: var(--weight-normal);
  margin-left: 4px;
}

.students-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-students {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

.bottom-spacer {
  height: 16px;
}
</style>
