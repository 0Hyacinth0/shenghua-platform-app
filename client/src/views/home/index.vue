<template>
  <div class="home-page">
    <!-- 顶部搜索 -->
    <TopSearchHeader
      :msg-badge="3"
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

    <!-- 内容区域：根据频道切换 -->
    <section class="home-section">
      <!-- 推荐 / 课程 / 直播 → 三列推荐卡片 -->
      <RecommendationSection
        v-if="activeChannel !== 'mall'"
        :items="displayRecommendations"
        @view-all="onViewAll"
      />

      <!-- 商城频道 → 复用现有商品列表 -->
      <template v-else>
        <a-spin :spinning="productLoading">
          <div v-if="products.length === 0 && !productLoading" class="empty-state">
            <a-empty description="暂无商品" />
          </div>
          <div v-else class="product-grid">
            <div
              v-for="p in products"
              :key="p.id"
              class="product-card"
              @click="goProductDetail(p.id)"
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
                <h4 class="product-name">{{ p.spuName }}</h4>
                <span class="product-price">&yen;{{ p.minPrice }}</span>
              </div>
            </div>
          </div>
        </a-spin>
      </template>
    </section>

    <!-- 免费公开课（使用优惠券/签到数据兜底） -->
    <section class="home-section">
      <FreeCourseSection :courses="freeCourses" @view-all="$router.push('/coupon')" />
    </section>

    <!-- 底部留白给悬浮导航 -->
    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import TopSearchHeader from '@/components/TopSearchHeader.vue'
import CategoryGrid from '@/components/CategoryGrid.vue'
import PromoBannerSection from '@/components/PromoBannerSection.vue'
import ChannelTabs from '@/components/ChannelTabs.vue'
import RecommendationSection from '@/components/RecommendationSection.vue'
import FreeCourseSection from '@/components/FreeCourseSection.vue'
import {
  mockCategories,
  mockPromoBanners,
  mockChannels,
  mockRecommendations,
  mockFreeCourses,
} from '@/mock/home'
import { getCategoryTree, getFrontProductList, imgUrl } from '@/api'
import http from '@/utils/http'

const router = useRouter()

// ===== 分类数据 =====
const categories = ref(mockCategories)

// ===== Banner 数据 =====
const banners = ref(mockPromoBanners)

// ===== 频道 =====
const channels = ref(mockChannels)
const activeChannel = ref('recommend')

// ===== 推荐内容 =====
const displayRecommendations = computed(() => {
  if (activeChannel.value === 'course') {
    return mockRecommendations.filter(r => r.type === 'course')
  }
  if (activeChannel.value === 'live') {
    return mockRecommendations.filter(r => r.type === 'live')
  }
  return mockRecommendations
})

// ===== 商城商品（复用现有 API） =====
const products = ref<any[]>([])
const productLoading = ref(false)

async function loadProducts() {
  productLoading.value = true
  try {
    const res = await getFrontProductList({ pageNo: 1, pageSize: 12 })
    if (res) {
      products.value = res.records || []
    }
  } catch {
    products.value = []
  } finally {
    productLoading.value = false
  }
}

// ===== 免费课程 =====
const freeCourses = ref(mockFreeCourses)

// ===== 加载后端分类树，合并到宫格 =====
async function loadCategories() {
  try {
    const tree = await getCategoryTree()
    if (Array.isArray(tree) && tree.length > 0) {
      // 保留前几个 mock 分类 + 动态添加后端分类作为子项
      // 暂时保持 mock 数据为主，后端数据为辅
    }
  } catch { /* 使用 mock 数据兜底 */ }
}

// ===== 事件处理 =====
function onFocusSearch() {
  // 滚动到搜索框并聚焦（目前是装饰性搜索栏）
}

function onViewAll() {
  if (activeChannel.value === 'course') router.push('/learn')
  else if (activeChannel.value === 'mall') router.push('/learn?tab=mall')
  else router.push('/learn')
}

function goProductDetail(id: string) {
  router.push({ name: 'productDetail', params: { id } })
}

// ===== 频道切换时按需加载 =====
watch(activeChannel, (ch) => {
  if (ch === 'mall' && products.value.length === 0) {
    loadProducts()
  }
})

onMounted(() => {
  loadCategories()
  // 预加载商品数据
  loadProducts()
})
</script>

<style scoped>
.home-page {
  padding: 0 16px;
  max-width: 480px;
  margin: 0 auto;
}

.home-section {
  margin-bottom: 24px;
}

.channel-section {
  margin-bottom: 16px;
}

/* ===== 商品网格（复用原有商品列表逻辑） ===== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s;
}
.product-card:active {
  transform: scale(0.97);
}
.product-cover {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #fafafa;
}
.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-info {
  padding: 8px 10px 10px;
}
.product-name {
  font-size: 13px;
  font-weight: 480;
  color: #1a1a1a;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-price {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

/* 底部留白给悬浮导航栏 */
.bottom-spacer {
  height: 100px;
}
</style>
