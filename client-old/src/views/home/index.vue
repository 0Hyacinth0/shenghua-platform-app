<template>
  <div class="home-page">
    <!-- 顶部搜索栏 -->
    <header class="home-header">
      <div class="header-inner">
        <div class="search-bar" @click="onFocusSearch">
          <SearchOutlined class="search-icon" />
          <span class="search-placeholder">搜索商品、课程</span>
        </div>
        <button class="header-btn" @click="$router.push('/messages')">
          <BellOutlined />
          <span v-if="msgBadge" class="header-badge">{{ msgBadge > 99 ? '99+' : msgBadge }}</span>
        </button>
      </div>
    </header>

    <!-- Banner 轮播 -->
    <section class="banner-section">
      <a-carousel autoplay :autoplay-speed="4000" dots-class="banner-dots">
        <div v-for="b in banners" :key="b.id" class="banner-slide" :style="{ background: b.bg }" @click="$router.push(b.route)">
          <div class="banner-content">
            <div class="banner-tag">{{ b.tag }}</div>
            <div class="banner-title">{{ b.title }}</div>
            <div class="banner-sub">{{ b.subtitle }}</div>
          </div>
          <div class="banner-deco" />
        </div>
      </a-carousel>
    </section>

    <!-- 快捷入口 -->
    <section class="quick-actions">
      <div class="action-grid">
        <div v-for="a in quickActions" :key="a.label" class="action-item" @click="$router.push(a.route)">
          <div class="action-icon" :style="{ background: a.bg }">
            <component :is="a.icon" :style="{ color: a.color, fontSize: '22px' }" />
          </div>
          <span class="action-label">{{ a.label }}</span>
        </div>
      </div>
    </section>

    <!-- 分类宫格 -->
    <section class="category-section">
      <div class="section-header">
        <span class="section-title">全部分类</span>
        <span class="section-more" @click="$router.push('/category')">更多 <RightOutlined /></span>
      </div>
      <div class="category-grid">
        <div v-for="cat in categories" :key="cat.id" class="category-item" @click="$router.push(cat.route)">
          <div class="category-icon" :style="{ background: cat.bg }">
            <component :is="cat.icon" :style="{ color: cat.color, fontSize: '20px' }" />
          </div>
          <span class="category-name">{{ cat.name }}</span>
        </div>
      </div>
    </section>

    <!-- 频道切换 + 推荐内容 -->
    <section class="recommend-section">
      <div class="channel-tabs">
        <button
          v-for="ch in channels"
          :key="ch.key"
          class="channel-tab"
          :class="{ active: activeChannel === ch.key }"
          @click="onChannelChange(ch.key)"
        >{{ ch.label }}</button>
      </div>

      <a-spin :spinning="recLoading">
        <div v-if="filteredItems.length > 0" class="product-grid">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="product-card"
            @click="$router.push(item.route)"
          >
            <div class="product-img" :style="{ background: item.coverColor }">
              <img v-if="item.image" :src="item.image" :alt="item.title" />
              <span v-if="item.tag" class="product-tag" :style="{ background: item.tagColor || 'var(--color-primary)' }">{{ item.tag }}</span>
            </div>
            <div class="product-info">
              <div class="product-name">{{ item.title }}</div>
              <div class="product-meta">
                <span class="product-price">
                  <span class="price-symbol">¥</span>{{ item.price === 0 ? '免费' : item.price }}
                </span>
                <span v-if="item.originalPrice" class="price-original">¥{{ item.originalPrice }}</span>
              </div>
              <div class="product-stats" v-if="item.students">
                <span>{{ item.students }}{{ item.studentsLabel || '人购买' }}</span>
                <span v-if="item.rating" class="product-rating">{{ item.rating }}分</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!recLoading" class="empty-state">
          <a-empty :description="activeChannel === 'mall' ? '暂无商品' : '暂无内容'" />
        </div>
      </a-spin>
    </section>

    <!-- 免费课程 -->
    <section class="free-course-section" v-if="freeCourses.length > 0">
      <div class="section-header">
        <span class="section-title">免费公开课</span>
        <span class="section-more" @click="$router.push('/course')">全部 <RightOutlined /></span>
      </div>
      <div class="course-scroll">
        <div v-for="c in freeCourses" :key="c.id" class="course-card" @click="$router.push(c.route)">
          <div class="course-img" :style="{ background: c.coverColor }">
            <span class="course-duration">{{ c.duration }}</span>
          </div>
          <div class="course-name">{{ c.title }}</div>
          <div class="course-meta">{{ c.level }} · {{ c.students }}次播放</div>
        </div>
      </div>
    </section>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  SearchOutlined, BellOutlined, RightOutlined,
  ThunderboltOutlined, GiftOutlined, CheckCircleOutlined,
  TeamOutlined, ReadOutlined, ShoppingOutlined,
  CodeOutlined, BgColorsOutlined, GlobalOutlined,
  TrophyOutlined, PlayCircleOutlined, RobotOutlined,
  AppstoreOutlined,
} from '@ant-design/icons-vue'
import { getFrontProductList, imgUrl } from '@/api'
import http from '@/utils/http'

// ==================== Banner ====================
const banners = [
  { id: 'seckill', title: '限时秒杀', subtitle: '超值好物低至1折', tag: '限时', bg: 'linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%)', route: '/seckill' },
  { id: 'groupbuy', title: '拼团优惠', subtitle: '一起买更划算', tag: '拼团', bg: 'linear-gradient(135deg, #FA8C16 0%, #FFA940 100%)', route: '/groupBuy' },
  { id: 'coupon', title: '领券中心', subtitle: '满减优惠券等你拿', tag: '优惠', bg: 'linear-gradient(135deg, #722ED1 0%, #B37FEB 100%)', route: '/coupon' },
]

// ==================== 快捷入口 ====================
const quickActions = [
  { label: '秒杀', icon: ThunderboltOutlined, bg: '#FFF1F0', color: '#FF4D4F', route: '/seckill' },
  { label: '优惠券', icon: GiftOutlined, bg: '#FFF7E6', color: '#FA8C16', route: '/coupon' },
  { label: '签到', icon: CheckCircleOutlined, bg: '#F6FFED', color: '#52C41A', route: '/signIn' },
  { label: '拼团', icon: TeamOutlined, bg: '#F0F5FF', color: '#2F54EB', route: '/groupBuy' },
  { label: '课程', icon: ReadOutlined, bg: '#FFF0F6', color: '#EB2F96', route: '/course' },
]

// ==================== 分类 ====================
const categories = [
  { id: '1', name: '课程', icon: CodeOutlined, bg: '#E8F4FD', color: '#1890FF', route: '/course' },
  { id: '2', name: '设计', icon: BgColorsOutlined, bg: '#FDE8F4', color: '#EB2F96', route: '/category' },
  { id: '3', name: '语言', icon: GlobalOutlined, bg: '#E8FDEC', color: '#52C41A', route: '/category' },
  { id: '4', name: '考证', icon: TrophyOutlined, bg: '#FDF3E8', color: '#FA8C16', route: '/category' },
  { id: '5', name: '商城', icon: ShoppingOutlined, bg: '#EEE8FD', color: '#722ED1', route: '/category' },
  { id: '6', name: '直播', icon: PlayCircleOutlined, bg: '#FDE8E8', color: '#F5222D', route: '/learn' },
  { id: '7', name: 'AI技能', icon: RobotOutlined, bg: '#E8FDF5', color: '#13C2C2', route: '/category' },
  { id: '8', name: '全部', icon: AppstoreOutlined, bg: '#F5F5F5', color: '#666666', route: '/category' },
]

// ==================== 频道切换 ====================
const channels = [
  { key: 'recommend', label: '推荐' },
  { key: 'course', label: '课程' },
  { key: 'live', label: '直播' },
  { key: 'mall', label: '商城' },
]

// ==================== 推荐内容 ====================
interface RecItem {
  id: string; type: 'course' | 'product' | 'live'; title: string
  coverColor: string; author: string; price: number; originalPrice?: number
  tag?: string; tagColor?: string; rating?: number; students?: number; route: string
  image?: string; studentsLabel?: string
}
const allRecItems = ref<RecItem[]>([])
const recLoading = ref(false)
const activeChannel = ref('recommend')
const recPalette = ['#D8F0E8', '#E8E0F8', '#FDE8D8', '#D8E8FD', '#FDE8F0', '#E8F0D8']

const courseItems = ref<RecItem[]>([])

const filteredItems = computed<RecItem[]>(() => {
  if (activeChannel.value === 'course') return courseItems.value.slice(0, 6)
  let list = allRecItems.value
  if (activeChannel.value === 'live') list = list.filter(r => r.type === 'live')
  return list.slice(0, 9)
})

const placeholderItems: RecItem[] = [
  { id: 'p1', type: 'course', title: 'Vue 3 + TypeScript 实战教程', coverColor: '#D8F0E8', author: '张老师', price: 199, originalPrice: 599, tag: '新课', tagColor: '#FF4D4F', rating: 4.9, students: 2341, route: '/learn' },
  { id: 'p2', type: 'course', title: 'Python 数据分析从入门到精通', coverColor: '#E8E0F8', author: '李老师', price: 0, tag: '免费', tagColor: '#52C41A', rating: 4.8, students: 5621, route: '/learn' },
  { id: 'p3', type: 'product', title: '《设计师的配色指南》实体书', coverColor: '#FDE8D8', author: '盛桦书店', price: 68, originalPrice: 128, tag: '热卖', tagColor: '#FA8C16', route: '/product/some-id' },
  { id: 'p4', type: 'course', title: 'React Native 跨平台移动开发', coverColor: '#D8E8FD', author: '王老师', price: 299, originalPrice: 799, tag: '更新中', tagColor: '#2F54EB', rating: 4.7, students: 1892, route: '/learn' },
  { id: 'p5', type: 'live', title: 'UI/UX 设计思维直播课', coverColor: '#FDE8F0', author: '陈老师', price: 0, tag: '直播', tagColor: '#EB2F96', rating: 4.9, students: 892, route: '/learn' },
  { id: 'p6', type: 'course', title: '算法与数据结构精讲', coverColor: '#E8F0D8', author: '刘老师', price: 149, originalPrice: 399, tag: '爆款', tagColor: '#FF4D4F', rating: 4.6, students: 4503, route: '/learn' },
]

async function loadRecommendations() {
  recLoading.value = true
  if (activeChannel.value === 'mall') {
    try {
      const res = await getFrontProductList({ pageNo: 1, pageSize: 6, isTop: 1 })
      const records: any[] = res?.records || []
      allRecItems.value = records.map((p: any, i: number) => ({
        id: p.id, type: 'product' as const, title: p.spuName || '',
        coverColor: recPalette[i % recPalette.length],
        author: '盛桦商城', price: p.minPrice || 0,
        originalPrice: p.originalPrice,
        students: p.sales || 0, studentsLabel: '人购买',
        image: imgUrl(p.mainImage),
        route: `/product/${p.id}`,
      }))
    } catch { allRecItems.value = [] }
  } else if (activeChannel.value === 'course') {
    try {
      const res = await http.get('/course/list', { params: { pageNo: 1, pageSize: 6, isTop: 1 } })
      const records: any[] = res?.records || res || []
      courseItems.value = records.map((c: any, i: number) => ({
        id: c.id, type: 'course' as const, title: c.title || '',
        coverColor: recPalette[i % recPalette.length],
        author: lecturerMap[c.lecturerId] || '', price: c.price || 0,
        students: c.studentCount || 0, studentsLabel: '次播放',
        image: imgUrl(c.cover),
        route: `/course/${c.id}`,
      }))
    } catch { courseItems.value = [] }
  } else if (activeChannel.value === 'recommend') {
    try {
      const [courseRes, productRes] = await Promise.all([
        http.get('/course/list', { params: { pageNo: 1, pageSize: 50, isRecommend: 1 } }),
        getFrontProductList({ pageNo: 1, pageSize: 50, isRecommend: 1 }),
      ])
      const courses = ((courseRes as any)?.records || []).map((c: any) => ({
        id: c.id, type: 'course' as const, title: c.title || '',
        time: c.updateTime || '',
        author: lecturerMap[c.lecturerId] || '', price: c.price || 0,
        students: c.studentCount || 0, studentsLabel: '次播放',
        image: imgUrl(c.cover),
        route: `/course/${c.id}`,
      }))
      const products = ((productRes as any)?.records || []).map((p: any) => ({
        id: p.id, type: 'product' as const, title: p.spuName || '',
        time: p.updateTime || '',
        author: '盛桦商城', price: p.minPrice || 0,
        students: p.sales || 0, studentsLabel: '人购买',
        image: imgUrl(p.mainImage),
        route: `/product/${p.id}`,
      }))
      const merged = [...courses, ...products].sort((a, b) => (b.time || '').localeCompare(a.time || '')).slice(0, 6)
      allRecItems.value = merged.map((item, i) => ({ ...item, coverColor: recPalette[i % recPalette.length] }))
    } catch { allRecItems.value = placeholderItems }
  } else {
    allRecItems.value = placeholderItems
  }
  recLoading.value = false
}

const lecturerMap: Record<string, string> = {}

async function loadLecturers() {
  try {
    const res = await http.get('/course/lecturer/list', { params: { pageSize: 500 } })
    const list = res?.records || res || []
    list.forEach((l: any) => { lecturerMap[l.id] = l.name })
  } catch (e) { /* */ }
}

// ==================== 免费课程 ====================
const freeCourses = ref<any[]>([])

async function loadFreeCourses() {
  try {
    const res = await http.get('/course/list', { params: { pageSize: 50, price: '0' } })
    const records: any[] = res?.records || res || []
    freeCourses.value = records
      .sort((a: any, b: any) => (b.studentCount || 0) - (a.studentCount || 0))
      .slice(0, 6)
      .map((c: any, i: number) => ({
        id: c.id, title: c.title || '',
        coverColor: recPalette[i % recPalette.length],
        duration: (c.totalLessons || 0) + '课时',
        level: lecturerMap[c.lecturerId] || '',
        students: c.studentCount || 0,
        route: '/course/' + c.id,
      }))
  } catch { freeCourses.value = [] }
}

// ==================== 消息 ====================
const msgBadge = ref(0)

async function loadMsgBadge() {
  try {
    const res: any = await http.get('/mall/userMessage/unreadCount', { params: { userId: 'user2' } })
    msgBadge.value = res || 0
  } catch { msgBadge.value = 0 }
}

// ==================== 事件 ====================
function onFocusSearch() { /* TODO: 跳转搜索页 */ }
function onChannelChange(key: string) {
  activeChannel.value = key
  loadRecommendations()
}

onMounted(() => { loadLecturers(); loadRecommendations(); loadMsgBadge(); loadFreeCourses() })
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px);
  background: var(--color-bg-page, #F7F7F8);
}

/* ---- 顶部搜索栏 ---- */
.home-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-primary, #FF4D4F);
  padding: 8px 16px;
}
.header-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 999px;
  padding: 9px 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.search-bar:active { background: rgba(255,255,255,0.3); }
.search-icon { font-size: 15px; color: rgba(255,255,255,0.8); }
.search-placeholder { font-size: 14px; color: rgba(255,255,255,0.7); }
.header-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  position: relative;
  background: transparent;
}
.header-badge {
  position: absolute;
  top: 2px;
  right: 0;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #FAAD14;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* ---- Banner ---- */
.banner-section { padding: 12px 16px 0; }
.banner-section :deep(.ant-carousel) { border-radius: 12px; overflow: hidden; }
.banner-slide {
  height: 140px;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.banner-content { position: relative; z-index: 1; }
.banner-tag {
  display: inline-block;
  background: rgba(255,255,255,0.25);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  margin-bottom: 8px;
  backdrop-filter: blur(4px);
}
.banner-title { font-size: 24px; font-weight: 700; color: white; line-height: 1.2; }
.banner-sub { font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 4px; }
.banner-deco {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
}
.banner-section :deep(.slick-dots) { bottom: 8px; }
.banner-section :deep(.slick-dots li button) { background: rgba(255,255,255,0.5); }
.banner-section :deep(.slick-dots li.slick-active button) { background: white; }

/* ---- 快捷入口 ---- */
.quick-actions {
  background: var(--color-card, #fff);
  margin: 12px 16px 0;
  border-radius: 12px;
  padding: 16px 8px;
}
.action-grid {
  display: flex;
  justify-content: space-around;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.action-item:active { opacity: 0.7; }
.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.action-label { font-size: 12px; color: var(--color-text, #1a1a1a); font-weight: 500; }

/* ---- 分类 ---- */
.category-section {
  background: var(--color-card, #fff);
  margin: 12px 16px 0;
  border-radius: 12px;
  padding: 16px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-title { font-size: 16px; font-weight: 600; color: var(--color-text, #1a1a1a); }
.section-more { font-size: 12px; color: var(--color-text-hint, #999); display: flex; align-items: center; gap: 2px; cursor: pointer; }
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 0;
}
.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.category-item:active { opacity: 0.7; }
.category-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.category-name { font-size: 12px; color: var(--color-text, #1a1a1a); font-weight: 500; }

/* ---- 频道 + 推荐 ---- */
.recommend-section {
  background: var(--color-card, #fff);
  margin: 12px 16px 0;
  border-radius: 12px;
  padding: 16px;
}
.channel-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-divider, #f0f0f0);
  padding-bottom: 12px;
}
.channel-tab {
  font-size: 15px;
  color: var(--color-text-secondary, #666);
  background: transparent;
  border: none;
  padding: 0;
  position: relative;
  font-weight: 500;
  transition: color 0.2s;
}
.channel-tab.active {
  color: var(--color-text, #1a1a1a);
  font-weight: 600;
}
.channel-tab.active::after {
  content: '';
  position: absolute;
  bottom: -13px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-primary, #FF4D4F);
}

/* ---- 商品网格 ---- */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.product-card {
  background: var(--color-card, #fff);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
}
.product-card:active { transform: scale(0.98); }
.product-img {
  width: 100%;
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 10px;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.product-info { padding: 10px 12px; }
.product-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text, #1a1a1a);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}
.product-meta {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.product-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary, #FF4D4F);
}
.price-symbol { font-size: 11px; }
.price-original {
  font-size: 11px;
  color: var(--color-text-disabled, #ccc);
  text-decoration: line-through;
}
.product-stats {
  font-size: 11px;
  color: var(--color-text-hint, #999);
  margin-top: 4px;
  display: flex;
  gap: 8px;
}
.product-rating { color: #FAAD14; }

.empty-state { padding: 40px 0; text-align: center; }

/* ---- 免费课程 ---- */
.free-course-section {
  background: var(--color-card, #fff);
  margin: 12px 16px 0;
  border-radius: 12px;
  padding: 16px;
}
.course-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.course-scroll::-webkit-scrollbar { display: none; }
.course-card {
  min-width: 150px;
  flex-shrink: 0;
  cursor: pointer;
}
.course-card:active { opacity: 0.8; }
.course-img {
  width: 150px;
  height: 90px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;
}
.course-duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  font-size: 10px;
  color: white;
  background: rgba(0,0,0,0.5);
  padding: 1px 6px;
  border-radius: 4px;
}
.course-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text, #1a1a1a);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}
.course-meta { font-size: 11px; color: var(--color-text-hint, #999); }

.bottom-spacer { height: 20px; }
</style>
