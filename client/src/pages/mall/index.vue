<template>
  <view class="page-container">
    <!-- 搜索栏 -->
    <view class="page-header">
      <view class="search-bar" @tap="onFocusSearch">
        <text class="search-icon">⌕</text>
        <text class="search-placeholder">搜索商品</text>
      </view>
    </view>

    <view class="mall-body">
      <!-- 左侧分类列表 -->
      <scroll-view scroll-y class="category-sidebar">
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="sidebar-item"
          :class="{ active: activeCategoryId === cat.id }"
          @tap="onSelectCategory(cat.id)"
        >
          <view v-if="activeCategoryId === cat.id" class="sidebar-indicator" />
          <text class="sidebar-text" :class="{ active: activeCategoryId === cat.id }">{{ cat.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧商品区域 -->
      <scroll-view scroll-y class="product-area" @scrolltolower="loadMore">
        <!-- 子分类 -->
        <view v-if="subCategories.length > 0" class="sub-category-wrap">
          <view
            v-for="sub in subCategories"
            :key="sub.id"
            class="sub-category-item"
            :class="{ active: activeSubId === sub.id }"
            @tap="onSelectSub(sub.id)"
          >
            <view class="sub-icon" :style="{ background: sub.bg || '#F5F5F5' }">
              <text class="sub-icon-text">{{ sub.icon || '⊞' }}</text>
            </view>
            <text class="sub-name">{{ sub.name }}</text>
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
                <text class="placeholder-icon">⌂</text>
              </view>
            </view>
            <view class="product-info">
              <text class="product-name">{{ item.spuName }}</text>
              <view class="product-bottom">
                <text class="product-price">
                  <text class="price-symbol">¥</text>{{ item.minPrice }}
                </text>
                <text v-if="item.originalPrice" class="price-original">¥{{ item.originalPrice }}</text>
              </view>
              <text class="product-sales">已售{{ item.sales || 0 }}件</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else-if="!loading" class="empty-wrap">
          <text class="empty-icon">⊘</text>
          <text class="empty-text">暂无商品</text>
        </view>

        <!-- 加载更多 -->
        <view v-if="noMore && products.length > 0" class="no-more">
          <text class="no-more-text">— 没有更多了 —</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCategoryTree, getFrontProductList, imgUrl } from '@/api'

const loading = ref(false)
const categories = ref<any[]>([])
const activeCategoryId = ref('')
const activeSubId = ref('')
const products = ref<any[]>([])
const pageNo = ref(1)
const noMore = ref(false)

const subCategories = computed(() => {
  const cat = categories.value.find((c: any) => c.id === activeCategoryId.value)
  return cat?.children || []
})

function goDetail(id: string) {
  uni.navigateTo({ url: '/pages/product/detail?id=' + id })
}

function onFocusSearch() {
  // TODO: 跳转搜索页
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

async function loadCategories() {
  try {
    const res = await getCategoryTree()
    const list: any[] = Array.isArray(res) ? res : (res?.records || [])
    categories.value = list
    if (list.length > 0) {
      activeCategoryId.value = list[0].id
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
</script>

<style scoped>
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
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg, #f5f5f5);
  border-radius: var(--radius-full, 999px);
  padding: 9px 16px;
}

.search-icon {
  font-size: 15px;
  color: var(--color-text-hint, #999);
}

.search-placeholder {
  font-size: var(--font-base, 14px);
  color: var(--color-text-hint, #999);
}

/* ---- 主体布局 ---- */
.mall-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ---- 左侧分类 ---- */
.category-sidebar {
  width: 88px;
  height: calc(100vh - 56px);
  background: var(--color-card, #fff);
}

.sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  padding: 0 8px;
}

.sidebar-item:active {
  background: var(--color-bg, #f5f5f5);
}

.sidebar-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 3px 3px 0;
  background: var(--color-primary, #FF4D4F);
}

.sidebar-text {
  font-size: var(--font-base, 14px);
  color: var(--color-text-secondary, #666);
  text-align: center;
  line-height: 1.3;
}

.sidebar-text.active {
  color: var(--color-text, #1a1a1a);
  font-weight: var(--weight-semibold, 600);
}

/* ---- 右侧商品区 ---- */
.product-area {
  flex: 1;
  height: calc(100vh - 56px);
  padding: 12px;
}

/* ---- 子分类 ---- */
.sub-category-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  background: var(--color-card, #fff);
  border-radius: var(--radius-md, 12px);
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
  border-radius: var(--radius-sm, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub-icon-text {
  font-size: 20px;
}

.sub-name {
  font-size: var(--font-sm, 12px);
  color: var(--color-text, #1a1a1a);
  text-align: center;
  line-height: 1.3;
}

/* ---- 商品列表 ---- */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-card {
  display: flex;
  gap: 12px;
  background: var(--color-card, #fff);
  border-radius: var(--radius-md, 12px);
  padding: 12px;
  overflow: hidden;
}

.product-card:active {
  background: var(--color-bg, #f5f5f5);
}

.product-img-wrap {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-sm, 8px);
  overflow: hidden;
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-bg, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 32px;
  color: var(--color-text-disabled, #ccc);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.product-name {
  font-size: var(--font-base, 14px);
  font-weight: var(--weight-medium, 500);
  color: var(--color-text, #1a1a1a);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-bottom {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.product-price {
  font-size: var(--font-lg, 16px);
  font-weight: var(--weight-bold, 700);
  color: var(--color-primary, #FF4D4F);
}

.price-symbol {
  font-size: var(--font-sm, 12px);
}

.price-original {
  font-size: var(--font-sm, 12px);
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
  border-top-color: var(--color-primary, #FF4D4F);
  border-radius: 50%;
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

.empty-icon {
  font-size: 48px;
  color: var(--color-text-disabled, #ccc);
  margin-bottom: 12px;
}

.empty-text {
  font-size: var(--font-base, 14px);
  color: var(--color-text-hint, #999);
}
</style>
