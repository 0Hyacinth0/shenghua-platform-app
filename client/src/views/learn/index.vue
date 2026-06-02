<template>
  <div class="learn-page">
    <TopSearchHeader
      placeholder="搜索课程、商品"
      @focus-search="showSearch = true"
      @open-messages="$router.push('/messages')"
    />

    <!-- 学习进度卡片（真实统计） -->
    <section class="learn-section">
      <div class="progress-card">
        <div class="progress-header">
          <h2 class="progress-title">我的学习</h2>
          <span class="progress-days" v-if="signDays > 0">连续签到 {{ signDays }} 天</span>
        </div>
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-value">{{ orderCount }}</span>
            <span class="stat-label">订单数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ cartCount }}</span>
            <span class="stat-label">购物车</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ couponCount }}</span>
            <span class="stat-label">优惠券</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userPoints }}</span>
            <span class="stat-label">积分</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 子频道切换 -->
    <section class="learn-section">
      <div class="learn-tabs">
        <button
          v-for="t in subTabs"
          :key="t.key"
          class="learn-tab"
          :class="{ active: activeSubTab === t.key }"
          @click="activeSubTab = t.key"
        >
          <component :is="t.icon" class="tab-btn-icon" />
          {{ t.label }}
        </button>
      </div>
    </section>

    <!-- 课程 / 商品列表 -->
    <section class="learn-section">
      <a-spin :spinning="loading">
        <div v-if="items.length === 0 && !loading" class="empty-state">
          <a-empty :description="activeSubTab === 'mall' ? '暂无商品' : '暂无内容'" />
        </div>
        <!-- 课程模式：列表 -->
        <div v-else-if="activeSubTab === 'course'" class="course-list">
          <div
            v-for="item in items"
            :key="item.id"
            class="course-card"
            @click="$router.push(item.route || `/product/${item.id}`)"
          >
            <div class="course-cover" :style="{ background: item.coverColor }">
              <PlayCircleOutlined class="course-cover-icon" />
            </div>
            <div class="course-body">
              <h4 class="course-title">{{ item.title }}</h4>
              <div class="course-meta">
                <span>{{ item.author }}</span>
                <span>·</span>
                <span>{{ item.students }}人已学</span>
              </div>
              <div class="course-footer">
                <span class="course-price" :class="{ free: item.price === 0 }">
                  {{ item.price === 0 ? '免费' : '¥' + item.price }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- 商城模式：三列网格 -->
        <div v-else class="product-grid">
          <div
            v-for="p in items"
            :key="p.id"
            class="product-card"
            @click="$router.push({ name: 'productDetail', params: { id: p.id } })"
          >
            <div class="product-cover">
              <a-image
                :src="imgUrl(p.mainImage)"
                :preview="false"
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0iI2JiYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiI+5Zu+54mH5Yqg6L295aSx6LSlPC90ZXh0Pjwvc3ZnPg=="
                class="product-img"
              />
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ p.spuName || p.title }}</h4>
              <span class="product-price">&yen;{{ p.minPrice || p.price }}</span>
            </div>
          </div>
        </div>
      </a-spin>
    </section>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  PlayCircleOutlined, ReadOutlined, ShoppingOutlined,
} from '@ant-design/icons-vue'
import TopSearchHeader from '@/components/TopSearchHeader.vue'
import {
  getFrontProductList, getCartList, getOrderList,
  getUserCoupons, getSignStatus, getUserProfile,
  imgUrl,
} from '@/api'
import { getCurrentUserId } from '@/utils/user'

const route = useRoute()
const userId = getCurrentUserId()
const showSearch = ref(false)
const activeSubTab = ref('course')
const loading = ref(false)

const subTabs = [
  { key: 'course', label: '课程', icon: ReadOutlined },
  { key: 'mall', label: '商城', icon: ShoppingOutlined },
]

// ===== 统计数据（真实 API） =====
const orderCount = ref(0)
const cartCount = ref(0)
const couponCount = ref(0)
const userPoints = ref(0)
const signDays = ref(0)

async function loadStats() {
  try {
    const [orders, cart, coupons, sign, profile] = await Promise.allSettled([
      getOrderList({ userId, pageSize: 999 }),
      getCartList(userId),
      getUserCoupons(userId),
      getSignStatus(userId),
      getUserProfile(userId),
    ])
    if (orders.status === 'fulfilled') {
      const r = orders.value as any
      orderCount.value = r?.total || r?.records?.length || 0
    }
    if (cart.status === 'fulfilled') {
      const c = cart.value as any
      cartCount.value = Array.isArray(c) ? c.length : c?.records?.length || 0
    }
    if (coupons.status === 'fulfilled') {
      const cp = coupons.value as any
      couponCount.value = cp?.records?.length || 0
    }
    if (sign.status === 'fulfilled') {
      const s = sign.value as any
      signDays.value = s?.continuousDays || s?.signDays || 0
    }
    if (profile.status === 'fulfilled') {
      const p = profile.value as any
      userPoints.value = p?.availablePoints || p?.totalPoints || 0
    }
  } catch { /* ignore */ }
}

// ===== 内容列表（真实商品数据） =====
interface LearnItem {
  id: string
  title: string
  coverColor: string
  author: string
  price: number
  students: number
  route: string
  mainImage?: string
  spuName?: string
  minPrice?: number
}
const items = ref<any[]>([])
const coverPalette = ['#D8F0E8', '#E8E0F8', '#FDE8D8', '#D8E8FD', '#FDE8F0', '#E8F0D8']

async function loadContent() {
  loading.value = true
  try {
    const res = await getFrontProductList({ pageNo: 1, pageSize: 20 })
    const records = res?.records || []
    // 加载商家名
    try {
      const { getMerchantList } = await import('@/api')
      const mRes: any = await getMerchantList({ pageSize: 999 })
      const mList = mRes?.records || []
      records.forEach((p: any) => {
        const m = mList.find((m: any) => m.id === p.merchantId)
        if (m) p._shopName = m.shopName
      })
    } catch { /* ignore */ }

    items.value = records.map((p: any, i: number) => ({
      ...p,
      title: p.spuName || '',
      coverColor: coverPalette[i % coverPalette.length],
      author: p._shopName || '盛桦商城',
      price: p.minPrice || 0,
      students: p.sales || 0,
      route: `/product/${p.id}`,
    }))
  } catch { items.value = [] }
  finally { loading.value = false }
}

watch(activeSubTab, () => {
  // 频道切换不需要重新加载（同一数据源不同展示）
})

onMounted(() => {
  if (route.query.tab === 'mall') activeSubTab.value = 'mall'
  loadStats()
  loadContent()
})
</script>

<style scoped>
.learn-page {
  padding: 0 16px;
  max-width: 480px;
  margin: 0 auto;
}
.learn-section { margin-bottom: 20px; }

/* 学习进度卡 */
.progress-card { background: #E8E0F8; border-radius: 20px; padding: 20px; }
.progress-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
.progress-title { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0; letter-spacing: -0.02em; }
.progress-days { font-size: 12px; color: #666; font-weight: 340; }
.progress-stats { display: flex; gap: 8px; }
.stat-item { flex: 1; text-align: center; background: rgba(255,255,255,0.6); border-radius: 14px; padding: 12px 4px; }
.stat-value { display: block; font-size: 20px; font-weight: 600; color: #1a1a1a; line-height: 1.2; }
.stat-label { display: block; font-size: 11px; color: #888; margin-top: 2px; font-weight: 340; }

/* 子频道 Tab */
.learn-tabs { display: flex; gap: 4px; }
.learn-tab { flex: 1; padding: 10px 0; border-radius: 50px; border: none; background: transparent; color: #666; font-size: 14px; font-weight: 480; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: all 0.2s; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.learn-tab.active { background: #1a1a1a; color: #fff; }
.tab-btn-icon { font-size: 16px; }

/* 课程列表 */
.course-list { display: flex; flex-direction: column; gap: 12px; }
.course-card { display: flex; gap: 12px; background: #fff; border-radius: 14px; padding: 12px; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform 0.15s; }
.course-card:active { transform: scale(0.98); }
.course-cover { width: 80px; height: 80px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.course-cover-icon { font-size: 32px; color: rgba(0,0,0,0.12); }
.course-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
.course-title { font-size: 15px; font-weight: 540; color: #1a1a1a; margin: 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.course-meta { font-size: 12px; color: #999; font-weight: 340; margin: 4px 0; }
.course-footer { display: flex; justify-content: space-between; align-items: center; }
.course-price { font-size: 16px; font-weight: 600; color: #1a1a1a; }
.course-price.free { color: #4CAF50; font-size: 14px; }

/* 商品网格 */
.product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.product-card { background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform 0.15s; }
.product-card:active { transform: scale(0.97); }
.product-cover { aspect-ratio: 1/1; overflow: hidden; background: #fafafa; }
.product-img { width: 100%; height: 100%; object-fit: cover; }
.product-info { padding: 8px 10px 10px; }
.product-name { font-size: 13px; font-weight: 480; color: #1a1a1a; margin: 0 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-price { font-size: 16px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.02em; }

.empty-state { padding: 40px 0; text-align: center; }
.bottom-spacer { height: 100px; }
</style>
