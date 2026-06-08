<template>
  <div class="home-page">
    <TopSearchHeader
      :msg-badge="msgBadge"
      @focus-search="onFocusSearch"
      @open-sign-in="$router.push('/signIn')"
      @open-messages="$router.push('/messages')"
    />

    <!-- 分类宫格 -->
    <section class="home-section">
      <CategoryGrid :categories="categories" />
    </section>

    <!-- 双 Banner -->
    <section class="home-section">
      <PromoBannerSection :banners="banners" />
    </section>

    <!-- 频道切换 -->
    <section class="home-section channel-section">
      <ChannelTabs :model-value="activeChannel" :channels="channels" @update:model-value="onChannelChange" />
    </section>

    <!-- 内容区域 -->
    <section class="home-section">
      <a-spin :spinning="recLoading">
        <RecommendationSection
          v-if="filteredItems.length > 0"
          :items="filteredItems"
          @view-all="onViewAll"
        />
        <div v-else-if="!recLoading" class="empty-state">
          <a-empty :description="activeChannel === 'mall' ? '暂无商品' : '暂无内容'" />
        </div>
      </a-spin>
    </section>

    <!-- 免费公开课（后面改真实功能） -->
    <section class="home-section" v-if="freeCourses.length > 0">
      <FreeCourseSection :courses="freeCourses" @view-all="$router.push('/course')" />
    </section>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  CodeOutlined, BgColorsOutlined, GlobalOutlined, TrophyOutlined,
  ShoppingOutlined, PlayCircleOutlined, RobotOutlined, AppstoreOutlined,
} from '@ant-design/icons-vue'
import TopSearchHeader from '@/components/TopSearchHeader.vue'
import CategoryGrid from '@/components/CategoryGrid.vue'
import PromoBannerSection from '@/components/PromoBannerSection.vue'
import ChannelTabs from '@/components/ChannelTabs.vue'
import RecommendationSection from '@/components/RecommendationSection.vue'
import FreeCourseSection from '@/components/FreeCourseSection.vue'
import { getFrontProductList, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'
import http from '@/utils/http'

const currentUserId = getCurrentUserId()

const router = useRouter()

// ==================== 分类宫格（固定，后续逐个实现） ====================
const categories = [
  { id: '1', name: '课程',     iconComponent: CodeOutlined,     color: '#E8F4FD', route: '/course' },
  { id: '2', name: '设计创意', iconComponent: BgColorsOutlined, color: '#FDE8F4', route: '/learn?tab=course' },
  { id: '3', name: '语言学习', iconComponent: GlobalOutlined,   color: '#E8FDEC', route: '/learn?tab=course' },
  { id: '4', name: '考证考级', iconComponent: TrophyOutlined,   color: '#FDF3E8', route: '/learn?tab=course' },
  { id: '5', name: '精品商城', iconComponent: ShoppingOutlined, color: '#EEE8FD', route: '/mall' },
  { id: '6', name: '直播课堂', iconComponent: PlayCircleOutlined, color: '#FDE8E8', route: '/learn?tab=live' },
  { id: '7', name: 'AI 技能', iconComponent: RobotOutlined,    color: '#E8FDF5', route: '/learn?tab=course' },
  { id: '8', name: '全部课程', iconComponent: AppstoreOutlined, color: '#F5F5F5', route: '/learn' },
]

// ==================== Banner ====================
const banners = [
  { id: 'groupbuy', title: '拼团优惠', subtitle: '一起买更划算', bgColor: '#D8F0E8', textColor: '#1a1a1a', route: '/groupBuy', tag: '拼团' },
  { id: 'seckill', title: '限时秒杀', subtitle: '超值好物低至1折', bgColor: '#FDE2E2', textColor: '#1a1a1a', route: '/seckill', tag: '秒杀' },
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
  image?: string
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

// Mock 占位数据（推荐/课程/直播 Tab）
const placeholderItems: RecItem[] = [
  { id: 'p1', type: 'course', title: 'Vue 3 + TypeScript 实战教程', coverColor: '#D8F0E8', author: '张老师', price: 199, originalPrice: 599, tag: '新课', tagColor: '#1a1a1a', rating: 4.9, students: 2341, route: '/learn' },
  { id: 'p2', type: 'course', title: 'Python 数据分析从入门到精通', coverColor: '#E8E0F8', author: '李老师', price: 0, tag: '免费', tagColor: '#4CAF50', rating: 4.8, students: 5621, route: '/learn' },
  { id: 'p3', type: 'product', title: '《设计师的配色指南》实体书', coverColor: '#FDE8D8', author: '盛桦书店', price: 68, originalPrice: 128, tag: '热卖', tagColor: '#FF5722', route: '/product/some-id' },
  { id: 'p4', type: 'course', title: 'React Native 跨平台移动开发', coverColor: '#D8E8FD', author: '王老师', price: 299, originalPrice: 799, tag: '更新中', tagColor: '#2196F3', rating: 4.7, students: 1892, route: '/learn' },
  { id: 'p5', type: 'live', title: 'UI/UX 设计思维直播课', coverColor: '#FDE8F0', author: '陈老师', price: 0, tag: '直播', tagColor: '#E91E63', rating: 4.9, students: 892, route: '/learn' },
  { id: 'p6', type: 'course', title: '算法与数据结构精讲', coverColor: '#E8F0D8', author: '刘老师', price: 149, originalPrice: 399, tag: '爆款', tagColor: '#FF9800', rating: 4.6, students: 4503, route: '/learn' },
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
        students: p.sales || 0,
        studentsLabel: '人购买',
        image: imgUrl(p.mainImage),
        route: `/product/${p.id}`,
      }))
    } catch { allRecItems.value = [] }
  } else if (activeChannel.value === 'course') {
    // 课程 Tab：置顶课程优先
    try {
      const res = await http.get('/course/list', { params: { pageNo: 1, pageSize: 6, isTop: 1 } })
      const records: any[] = res?.records || res || []
      courseItems.value = records.map((c: any, i: number) => ({
        id: c.id, type: 'course' as const, title: c.title || '',
        coverColor: recPalette[i % recPalette.length],
        author: lecturerMap[c.lecturerId] || '', price: c.price || 0,
        students: c.studentCount || 0,
        studentsLabel: '次播放',
        image: imgUrl(c.cover),
        route: `/course/${c.id}`,
      }))
    } catch { courseItems.value = [] }
  } else if (activeChannel.value === 'recommend') {
    // 推荐 Tab：全部推荐课程+推荐商品，按时间排序取前6
    try {
      const [courseRes, productRes] = await Promise.all([
        http.get('/course/list', { params: { pageNo: 1, pageSize: 50, isRecommend: 1 } }),
        getFrontProductList({ pageNo: 1, pageSize: 50, isRecommend: 1 }),
      ])
      const courses = ((courseRes as any)?.records || []).map((c: any) => ({
        id: c.id, type: 'course' as const, title: c.title || '',
        time: c.updateTime || '',
        author: lecturerMap[c.lecturerId] || '', price: c.price || 0,
        students: c.studentCount || 0,
        studentsLabel: '次播放',
        image: imgUrl(c.cover),
        route: `/course/${c.id}`,
      }))
      const products = ((productRes as any)?.records || []).map((p: any) => ({
        id: p.id, type: 'product' as const, title: p.spuName || '',
        time: p.updateTime || '',
        author: '盛桦商城', price: p.minPrice || 0,
        students: p.sales || 0,
        studentsLabel: '人购买',
        image: imgUrl(p.mainImage),
        route: `/product/${p.id}`,
      }))
      const merged = [...courses, ...products].sort((a, b) => (b.time || '').localeCompare(a.time || '')).slice(0, 6)
      allRecItems.value = merged.map((item, i) => ({
        ...item, coverColor: recPalette[i % recPalette.length]
      }))
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

// ==================== 免费课程（真实API） ====================
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
function onFocusSearch() {}
function onViewAll() {
  if (activeChannel.value === 'mall') { router.push('/mall') }
  else if (activeChannel.value === 'course') { router.push('/course') }
}

function onChannelChange(key: string) {
  activeChannel.value = key
  loadRecommendations()
}

onMounted(() => { loadLecturers(); loadRecommendations(); loadMsgBadge(); loadFreeCourses() })
</script>

<style scoped>
.home-page { padding: 0 16px; max-width: 480px; margin: 0 auto; }
.home-section { margin-bottom: 24px; }
.channel-section { margin-bottom: 16px; }
.empty-state { padding: 40px 0; text-align: center; }
.bottom-spacer { height: 100px; }
</style>
