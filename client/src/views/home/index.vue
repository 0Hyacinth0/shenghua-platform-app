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
        <!-- 有推荐内容 -->
        <RecommendationSection
          v-if="filteredRecommendations.length > 0"
          :items="filteredRecommendations"
          @view-all="onViewAll"
        />
        <!-- 加载完但无内容 -->
        <div v-else-if="!recLoading" class="empty-state">
          <a-empty :description="activeChannel === 'mall' ? '暂无商品' : '暂无内容'" />
        </div>
      </a-spin>
    </section>

    <!-- 免费公开课（真实免费商品） -->
    <section class="home-section" v-if="freeCourses.length > 0">
      <FreeCourseSection :courses="freeCourses" @view-all="$router.push('/learn')" />
    </section>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Component } from 'vue'
import TopSearchHeader from '@/components/TopSearchHeader.vue'
import CategoryGrid from '@/components/CategoryGrid.vue'
import PromoBannerSection from '@/components/PromoBannerSection.vue'
import ChannelTabs from '@/components/ChannelTabs.vue'
import RecommendationSection from '@/components/RecommendationSection.vue'
import FreeCourseSection from '@/components/FreeCourseSection.vue'
import { channels, getCategoryIcon } from '@/mock/home'
import {
  getCategoryTree, getFrontProductList, getSeckillList,
  getSeckillProductList, getOrderList, imgUrl,
} from '@/api'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
const userId = getCurrentUserId()

// ===== 分类（真实 API） =====
interface CategoryData {
  id: string
  name: string
  iconComponent: Component
  color: string
  route: string
}
const categories = ref<CategoryData[]>([])

async function loadCategories() {
  try {
    const tree = await getCategoryTree()
    if (!Array.isArray(tree)) return
    const flat: CategoryData[] = []
    function walk(nodes: any[], level: number) {
      for (const n of nodes) {
        if (!n) continue
        const iconCfg = getCategoryIcon(n.categoryName || n.name || '')
        flat.push({
          id: n.id,
          name: n.categoryName || n.name,
          iconComponent: iconCfg.icon,
          color: iconCfg.color,
          route: `/learn?cat=${n.id}`,
        })
        if (n.children?.length) walk(n.children, level + 1)
      }
    }
    walk(tree, 0)
    categories.value = flat.slice(0, 8) // 最多显示 8 个
  } catch { /* 加载失败不影响页面 */ }
}

// ===== Banner（秒杀活动） =====
interface BannerData {
  id: string
  title: string
  subtitle: string
  bgColor: string
  textColor: string
  route: string
  tag: string
}
const banners = ref<BannerData[]>([])

async function loadBanners() {
  try {
    const res: any = await getSeckillList({ pageSize: 10 })
    const acts = (res?.records || []).filter((a: any) => a.status === 1)
    const bannerColors = ['#D8F0E8', '#FDE2E2']
    const result: BannerData[] = []
    for (let i = 0; i < Math.min(acts.length, 2); i++) {
      const a = acts[i]
      result.push({
        id: a.id,
        title: a.activityName || '限时秒杀',
        subtitle: a.description || '好课低至1折',
        bgColor: bannerColors[i] || '#D8F0E8',
        textColor: '#1a1a1a',
        route: `/seckill`,
        tag: i === 0 ? '热门' : '限时',
      })
    }
    // 如果秒杀活动不够2个，用拼团补
    if (result.length < 2) {
      result.push({
        id: 'groupbuy',
        title: '拼团优惠',
        subtitle: '一起学更划算',
        bgColor: '#E8E0F8',
        textColor: '#1a1a1a',
        route: '/groupBuy',
        tag: '拼团',
      })
    }
    banners.value = result.slice(0, 2)
  } catch { /* fallback */ }
}

// ===== 推荐内容（真实商品列表） =====
interface RecItem {
  id: string
  type: 'course' | 'product'
  title: string
  coverColor: string
  author: string
  price: number
  originalPrice?: number
  tag?: string
  tagColor?: string
  rating?: number
  students?: number
  route: string
}
const allProducts = ref<any[]>([])
const recLoading = ref(false)
const activeChannel = ref('recommend')

const coverPalette = ['#D8F0E8', '#E8E0F8', '#FDE8D8', '#D8E8FD', '#FDE8F0', '#E8F0D8']

function mapProductToRec(p: any, index: number): RecItem {
  const color = coverPalette[index % coverPalette.length]
  return {
    id: p.id,
    type: 'product',
    title: p.spuName || '',
    coverColor: color,
    author: p._shopName || '盛桦商城',
    price: p.minPrice || 0,
    originalPrice: p.originalPrice || undefined,
    tag: p.minPrice === 0 ? '免费' : undefined,
    tagColor: p.minPrice === 0 ? '#4CAF50' : undefined,
    rating: p.rating,
    students: p.sales || 0,
    route: `/product/${p.id}`,
  }
}

const allRecItems = computed<RecItem[]>(() =>
  allProducts.value.map((p, i) => mapProductToRec(p, i))
)

const filteredRecommendations = computed<RecItem[]>(() => {
  if (activeChannel.value === 'mall') return [] // 商城 tab 另有展示
  return allRecItems.value.slice(0, 9)
})

async function loadProducts() {
  recLoading.value = true
  try {
    const res = await getFrontProductList({ pageNo: 1, pageSize: 20 })
    if (res?.records) {
      // 加载商家名
      const merchantIds = [...new Set(res.records.map((p: any) => p.merchantId).filter(Boolean))]
      if (merchantIds.length > 0) {
        try {
          const { getMerchantList } = await import('@/api')
          const mRes: any = await getMerchantList({ pageSize: 999 })
          const mList = mRes?.records || []
          res.records.forEach((p: any) => {
            const m = mList.find((m: any) => m.id === p.merchantId)
            if (m) { p._shopName = m.shopName }
          })
        } catch { /* ignore */ }
      }
      allProducts.value = res.records
    }
  } catch { allProducts.value = [] }
  finally { recLoading.value = false }
}

// ===== 免费课程（价格=0的商品） =====
const freeCourses = computed(() => {
  return allProducts.value
    .filter((p: any) => p.minPrice === 0 || p.price === 0)
    .slice(0, 5)
    .map((p: any, i: number) => {
      const colors = ['#D8F0E8', '#E8E0F8', '#FDE8D8', '#D8E8FD', '#FDE8F0']
      return {
        id: p.id,
        title: p.spuName || '',
        coverColor: colors[i % colors.length],
        duration: (p.sales || 0) + '人已学',
        level: p.minPrice === 0 ? '免费' : '入门',
        students: p.sales || 0,
        route: `/product/${p.id}`,
      }
    })
})

// ===== 消息未读 =====
const msgBadge = ref(0)
async function loadMsgBadge() {
  try {
    const res: any = await getOrderList({ userId, pageSize: 5 })
    const orders = res?.records || []
    // 待付款/待发货订单视为未读消息
    const pending = orders.filter((o: any) =>
      o.orderStatus === 0 || o.orderStatus === 1 || o.payStatus === 0
    )
    msgBadge.value = pending.length
  } catch { msgBadge.value = 0 }
}

// ===== 事件 =====
function onFocusSearch() {}
function onViewAll() { router.push('/learn') }

// ===== 生命周期 =====
onMounted(() => {
  loadCategories()
  loadBanners()
  loadProducts()
  loadMsgBadge()
})
</script>

<style scoped>
.home-page {
  padding: 0 16px;
  max-width: 480px;
  margin: 0 auto;
}
.home-section { margin-bottom: 24px; }
.channel-section { margin-bottom: 16px; }
.empty-state { padding: 40px 0; text-align: center; }
.bottom-spacer { height: 100px; }
</style>
