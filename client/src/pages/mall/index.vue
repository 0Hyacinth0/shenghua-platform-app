<template>
  <view class="page-container">
    <!-- 搜索栏 + 购物车 -->
    <view class="page-header">
      <view class="search-bar">
        <Icon icon="solar:magnifer-bold" width="16" color="var(--color-text-hint)" />
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索商品"
          confirm-type="search"
          @confirm="onSearchConfirm"
        />
      </view>
      <view class="cart-shortcut" @tap="goCart">
        <Icon icon="solar:cart-large-2-bold" width="20" color="#111" />
      </view>
    </view>

    <view class="mall-body">
      <!-- 左侧分类列表 -->
      <scroll-view scroll-y class="category-sidebar">
        <view class="sidebar-wrapper">
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="sidebar-item"
            :class="{ active: activeCategoryId === cat.id }"
            @tap="onSelectCategory(cat.id)"
          >
            <view class="sidebar-pill" :class="{ active: activeCategoryId === cat.id }">
              <text class="sidebar-text" :class="{ active: activeCategoryId === cat.id }">{{ cat.name }}</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 右侧商品区域 -->
      <scroll-view scroll-y class="product-area" @scrolltolower="loadMore">
        <!-- 子分类 -->
        <view v-if="subCategories.length > 0" class="sub-category-wrap">
          <view
            v-for="(sub, idx) in subCategories"
            :key="sub.id"
            class="sub-category-item"
            :class="{ active: activeSubId === sub.id }"
            @tap="onSelectSub(sub.id)"
          >
            <!-- 轮流使用粉彩底色 -->
            <view class="sub-icon" :style="{ background: activeSubId === sub.id ? '#111111' : getPastelBg(idx) }">
              <text class="sub-icon-text" :style="{ color: activeSubId === sub.id ? '#ffffff' : '#111111' }">{{ sub.icon || '⊞' }}</text>
            </view>
            <text class="sub-name" :class="{ active: activeSubId === sub.id }">{{ sub.name }}</text>
          </view>
        </view>

        <!-- 加载中 -->
        <view v-if="loading" class="loading-wrap">
          <view class="loading-spinner" />
        </view>

        <!-- 商品列表 -->
        <view v-else-if="products.length > 0" class="product-list">
          <view
            v-for="item in products"
            :key="item.id"
            class="product-card"
            @tap="goDetail(item.id)"
          >
            <view class="product-img-wrap">
              <image v-if="item.mainImage" :src="imgUrl(item.mainImage)" class="product-img" mode="aspectFill" />
              <view v-else class="img-placeholder">
                <Icon icon="solar:bag-bold" width="32" color="var(--color-text-hint)" />
              </view>
            </view>
            <view class="product-info">
              <text class="product-name">{{ item.spuName }}</text>
              <view class="product-info-bottom">
                <view class="product-bottom">
                  <text class="product-price price-commerce">
                    <text class="price-symbol">¥</text>{{ item.minPrice }}
                  </text>
                  <text v-if="item.originalPrice" class="price-original">¥{{ item.originalPrice }}</text>
                </view>
                <text class="product-sales">已售{{ item.sales || 0 }}件</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else-if="!loading" class="empty-wrap">
          <Icon icon="solar:bag-bold" width="48" color="var(--color-text-hint)" />
          <text class="empty-text">暂无商品</text>
        </view>

        <!-- 加载更多 -->
        <view v-if="noMore && products.length > 0" class="no-more">
          <text class="no-more-text">— 没有更多了 —</text>
        </view>
      </scroll-view>
    </view>
    <CustomTabBar :active="1" />
  </view>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getCategoryTree, getFrontProductList, imgUrl } from '@/api'
import { goCart } from '@/utils/navigation'
import CustomTabBar from '@/components/CustomTabBar.vue'

const loading = ref(false)
const categories = ref<any[]>([])
const activeCategoryId = ref('')
const activeSubId = ref('')
const products = ref<any[]>([])
const pageNo = ref(1)
const noMore = ref(false)
const keyword = ref('')

const subCategories = computed(() => {
  const cat = categories.value.find((c: any) => c.id === activeCategoryId.value)
  return cat?.children || []
})

function goDetail(id: string) {
  uni.navigateTo({ url: '/pages/product/detail?id=' + id })
}

function onSearchConfirm() {
  pageNo.value = 1
  noMore.value = false
  products.value = []
  loadProducts()
}

function onSelectCategory(id: string) {
  activeCategoryId.value = id
  activeSubId.value = ''
  pageNo.value = 1
  noMore.value = false
  products.value = []
  loadProducts()
}

function onSelectSub(id: string) {
  activeSubId.value = id
  pageNo.value = 1
  noMore.value = false
  products.value = []
  loadProducts()
}

function loadMore() {
  if (noMore.value || loading.value) return
  pageNo.value++
  loadProducts(true)
}

function applyStoredCategory(list: any[]) {
  const targetId = uni.getStorageSync('mall_target_category_id')
  if (targetId) {
    for (const cat of list) {
      if (cat.id === targetId) {
        activeCategoryId.value = cat.id
        activeSubId.value = ''
        uni.removeStorageSync('mall_target_category_id')
        return true
      }
      const child = (cat.children || []).find((sub: any) => sub.id === targetId)
      if (child) {
        activeCategoryId.value = cat.id
        activeSubId.value = child.id
        uni.removeStorageSync('mall_target_category_id')
        return true
      }
    }
    uni.removeStorageSync('mall_target_category_id')
  }
  return false
}

async function loadCategories() {
  try {
    const res = await getCategoryTree()
    const list: any[] = Array.isArray(res) ? res : (res?.records || [])
    categories.value = list
    if (list.length > 0) {
      const applied = applyStoredCategory(list)
      if (!applied) activeCategoryId.value = list[0].id
      loadProducts()
    }
  } catch {
    categories.value = []
  }
}

async function loadProducts(append = false) {
  loading.value = !append
  try {
    const params: any = { pageNo: pageNo.value, pageSize: 10 }
    if (activeSubId.value) {
      params.categoryId = activeSubId.value
    } else if (activeCategoryId.value) {
      params.categoryId = activeCategoryId.value
    }
    const kw = keyword.value.trim()
    if (kw) {
      params.keyword = kw
      params.spuName = kw
    }
    const res = await getFrontProductList(params)
    const records: any[] = res?.records || []
    if (append) {
      products.value = [...products.value, ...records]
    } else {
      products.value = records
    }
    noMore.value = records.length < 10
  } catch {
    if (!append) products.value = []
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadCategories()
})

onShow(() => {
  uni.hideTabBar({ animation: false })
  const targetId = uni.getStorageSync('mall_target_category_id')
  if (targetId && categories.value.length > 0) {
    const applied = applyStoredCategory(categories.value)
    if (applied) {
      pageNo.value = 1
      noMore.value = false
      products.value = []
      loadProducts()
    }
  }
})

const pastelColors = [
  'var(--color-block-cream)',
  'var(--color-block-lime)',
  'var(--color-block-lilac)',
  'var(--color-block-mint)',
  'var(--color-block-coral)',
  'var(--color-block-pink)'
]
function getPastelBg(idx: number) {
  return pastelColors[idx % pastelColors.length]
}
</script>

<style scoped>
@import url('@/styles/tokens.css');
.page-container {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  display: flex;
  flex-direction: column;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-card, #fff);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--color-border, #eee);
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg-page, #f7f7f8);
  border-radius: var(--radius-full, 999px);
  border: 1px solid var(--color-border, #eee);
  padding: 9px 16px;
}

.search-input {
  flex: 1;
  min-width: 0;
  font-size: var(--font-base, 14px);
  color: var(--color-text, #111);
}

.cart-shortcut {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full, 999px);
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- 主体布局 ---- */
.mall-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ---- 左侧分类 ---- */
.category-sidebar {
  width: 96px;
  height: calc(100vh - 56px);
  background: var(--color-card, #fff);
  border-right: 1px solid var(--color-border, #eee);
}

.sidebar-wrapper {
  padding: 10px 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
}

.sidebar-pill {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full, 999px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sidebar-pill.active {
  background: #111111;
}

.sidebar-text {
  font-size: var(--font-sm, 12px);
  color: var(--color-text-secondary, #666);
  text-align: center;
  font-weight: var(--weight-medium, 500);
}

.sidebar-text.active {
  color: #ffffff;
  font-weight: var(--weight-bold, 700);
}

/* ---- 右侧商品区 ---- */
.product-area {
  flex: 1;
  height: calc(100vh - 56px);
  padding: 12px 12px 80px;
  box-sizing: border-box;
}

/* ---- 子分类 ---- */
.sub-category-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-lg, 16px);
  padding: 16px 12px;
}

.sub-category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 60px;
}

.sub-category-item:active {
  opacity: 0.7;
}

.sub-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.sub-icon-text {
  font-size: 18px;
}

.sub-name {
  font-size: 11px;
  color: var(--color-text-secondary, #666);
  text-align: center;
  line-height: 1.3;
}

.sub-name.active {
  color: var(--color-text, #111);
  font-weight: var(--weight-bold, 700);
}

/* ---- 商品列表 ---- */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-card {
  display: flex;
  gap: 12px;
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-lg, 16px);
  padding: 12px;
  overflow: hidden;
}

.product-card:active {
  background: var(--color-bg-page, #f7f7f8);
}

.product-img-wrap {
  width: 90px;
  height: 90px;
  border-radius: var(--radius-md, 12px);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg, #f5f5f5);
}

.product-img {
  width: 100%;
  height: 100%;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.product-name {
  font-size: var(--font-sm, 12px);
  font-weight: var(--weight-semibold, 600);
  color: var(--color-text, #111);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-info-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.product-bottom {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.product-price {
  font-size: var(--font-lg, 16px);
  font-weight: var(--weight-bold, 700);
}

.price-symbol {
  font-size: var(--font-sm, 12px);
}

.price-original {
  font-size: var(--font-xs, 10px);
  color: var(--color-text-disabled, #ccc);
  text-decoration: line-through;
}

.product-sales {
  font-size: var(--font-xs, 10px);
  color: var(--color-text-hint, #999);
}

/* ---- 加载更多 ---- */
.no-more {
  padding: 16px 0;
  text-align: center;
}

.no-more-text {
  font-size: var(--font-sm, 12px);
  color: var(--color-text-disabled, #ccc);
}

/* ---- 加载/空状态 ---- */
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border, #eee);
  border-top-color: #111111;
  border-radius: var(--radius-full, 999px);
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
}

.empty-text {
  font-size: var(--font-sm, 12px);
  color: var(--color-text-hint, #999);
  margin-top: 8px;
}
</style>
