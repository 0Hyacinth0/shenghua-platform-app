<template>
  <div class="home-page">
    <TopSearchHeader
      :msg-badge="msgBadge"
      @focus-search="onFocusSearch"
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
      <ChannelTabs v-model="activeChannel" :channels="channels" />
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

    <!-- 免费公开课 -->
    <section class="home-section" v-if="freeCourses.length > 0">
      <FreeCourseSection :courses="freeCourses" @view-all="$router.push('/learn')" />
    </section>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Component } from 'vue'
import TopSearchHeader from '@/components/TopSearchHeader.vue'
import CategoryGrid from '@/components/CategoryGrid.vue'
import PromoBannerSection from '@/components/PromoBannerSection.vue'
import ChannelTabs from '@/components/ChannelTabs.vue'
import RecommendationSection from '@/components/RecommendationSection.vue'
import FreeCourseSection from '@/components/FreeCourseSection.vue'
import { USE_MOCK } from '@/mock/config'
import {
  channels, getCategoryIcon, mockCategories, mockBanners,
  mockRecommendations, mockFreeCourses,
} from '@/mock/home'
import {
  getCategoryTree, getFrontProductList, getSeckillList, getOrderList,
} from '@/api'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
const userId = getCurrentUserId()

// ==================== 分类 ====================
interface CatItem { id: string; name: string; iconComponent: Component; color: string; route: string }
const categories = ref<CatItem[]>([])

async function loadCategories() {
  if (USE_MOCK) {
    categories.value = mockCategories.map(c => ({
      id: c.id, name: c.name, iconComponent: c.icon, color: c.color, route: c.route || '/learn',
    }))
    return
  }
  try {
    const tree = await getCategoryTree()
    if (!Array.isArray(tree)) return
    const flat: CatItem[] = []
    function walk(nodes: any[], _level: number) {
      for (const n of nodes) {
        if (!n) continue
        const cfg = getCategoryIcon(n.categoryName || n.name || '')
        flat.push({ id: n.id, name: n.categoryName || n.name, iconComponent: cfg.icon, color: cfg.color, route: `/learn?cat=${n.id}` })
        if (n.children?.length) walk(n.children, _level + 1)
      }
    }
    walk(tree, 0)
    categories.value = flat.slice(0, 8)
  } catch { categories.value = [] }
}

// ==================== Banner ====================
interface BanItem { id: string; title: string; subtitle: string; bgColor: string; textColor: string; route: string; tag: string }
const banners = ref<BanItem[]>([])

async function loadBanners() {
  if (USE_MOCK) {
    banners.value = mockBanners
    return
  }
  try {
    const res: any = await getSeckillList({ pageSize: 10 })
    const acts = (res?.records || []).filter((a: any) => a.status === 1)
    const colors = ['#D8F0E8', '#FDE2E2']
    const result: BanItem[] = acts.slice(0, 2).map((a: any, i: number) => ({
      id: a.id, title: a.activityName || '限时秒杀', subtitle: '好课低至1折',
      bgColor: colors[i] || '#D8F0E8', textColor: '#1a1a1a',
      route: '/seckill', tag: i === 0 ? '热门' : '限时',
    }))
    if (result.length < 2) {
      result.push({ id: 'groupbuy', title: '拼团优惠', subtitle: '一起学更划算', bgColor: '#E8E0F8', textColor: '#1a1a1a', route: '/groupBuy', tag: '拼团' })
    }
    banners.value = result.slice(0, 2)
  } catch { banners.value = [] }
}

// ==================== 推荐内容 ====================
interface RecItem {
  id: string; type: 'course' | 'product' | 'live'; title: string
  coverColor: string; author: string; price: number; originalPrice?: number
  tag?: string; tagColor?: string; rating?: number; students?: number; route: string
}
const allRecItems = ref<RecItem[]>([])
const recLoading = ref(false)
const activeChannel = ref('recommend')

const filteredItems = computed<RecItem[]>(() => {
  let list = allRecItems.value
  if (activeChannel.value === 'course') list = list.filter(r => r.type === 'course')
  else if (activeChannel.value === 'live') list = list.filter(r => r.type === 'live')
  return list.slice(0, 9)
})

const recPalette = ['#D8F0E8', '#E8E0F8', '#FDE8D8', '#D8E8FD', '#FDE8F0', '#E8F0D8']

async function loadRecommendations() {
  recLoading.value = true
  if (USE_MOCK) {
    // 模拟延迟
    await new Promise(r => setTimeout(r, 200))
    allRecItems.value = mockRecommendations as RecItem[]
    recLoading.value = false
    return
  }
  try {
    const res = await getFrontProductList({ pageNo: 1, pageSize: 20 })
    const records: any[] = res?.records || []
    // 加载商家名
    if (records.length > 0) {
      try {
        const { getMerchantList } = await import('@/api')
        const mRes: any = await getMerchantList({ pageSize: 999 })
        const mList = mRes?.records || []
        records.forEach((p: any) => {
          const m = mList.find((m: any) => m.id === p.merchantId)
          if (m) p._shopName = m.shopName
        })
      } catch { /* ignore */ }
    }
    allRecItems.value = records.map((p: any, i: number) => ({
      id: p.id, type: 'product' as const, title: p.spuName || '',
      coverColor: recPalette[i % recPalette.length],
      author: p._shopName || '盛桦商城', price: p.minPrice || 0,
      originalPrice: p.originalPrice, tag: p.minPrice === 0 ? '免费' : undefined,
      tagColor: '#4CAF50', rating: p.rating, students: p.sales || 0,
      route: `/product/${p.id}`,
    }))
  } catch { allRecItems.value = [] }
  finally { recLoading.value = false }
}

// ==================== 免费课程 ====================
const freeCourses = ref<any[]>([])

function buildFreeCourses() {
  if (USE_MOCK) {
    freeCourses.value = mockFreeCourses
    return
  }
  freeCourses.value = allRecItems.value
    .filter((p: any) => p.price === 0)
    .slice(0, 5)
    .map((p: any) => ({
      id: p.id, title: p.title, coverColor: p.coverColor,
      duration: (p.students || 0) + '人已学', level: '免费', students: p.students || 0,
      route: `/product/${p.id}`,
    }))
}

// ==================== 消息 ====================
const msgBadge = ref(0)

async function loadMsgBadge() {
  if (USE_MOCK) { msgBadge.value = 3; return }
  try {
    const res: any = await getOrderList({ userId, pageSize: 20 })
    const orders = res?.records || []
    msgBadge.value = orders.filter((o: any) => o.orderStatus === 0 || o.payStatus === 0).length
  } catch { msgBadge.value = 0 }
}

// ==================== 事件 ====================
function onFocusSearch() {}
function onViewAll() { router.push('/learn') }

// ==================== 生命周期 ====================
onMounted(async () => {
  await Promise.all([loadCategories(), loadBanners(), loadRecommendations()])
  buildFreeCourses()
  loadMsgBadge()
})
</script>

<style scoped>
.home-page { padding: 0 16px; max-width: 480px; margin: 0 auto; }
.home-section { margin-bottom: 24px; }
.channel-section { margin-bottom: 16px; }
.empty-state { padding: 40px 0; text-align: center; }
.bottom-spacer { height: 100px; }
</style>
