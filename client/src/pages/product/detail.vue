<template>
  <view class="page">
    <!-- 骨架屏 -->
    <SkeletonPage v-if="loading && !product.spuName" type="product" />

    <!-- 顶部导航 -->
    <template v-else>
    <view class="page-enter">
    <view class="nav-bar" :class="{ scrolled: isScrolled }">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="nav-tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="nav-tab"
          :class="{ active: activeTab === tab.key }"
          @tap="activeTab = tab.key"
        >
          <text class="tab-text" :class="{ active: activeTab === tab.key }">{{ tab.label }}</text>
        </view>
      </view>
      <view class="nav-actions">
        <view class="nav-btn" @tap="goCart">
          <Icon icon="solar:cart-large-2-bold" width="18" color="var(--text-primary)" />
          <view v-if="cartCount > 0" class="cart-badge">
            <text class="badge-text">{{ cartCount > 99 ? '99+' : cartCount }}</text>
          </view>
        </view>
        <view class="nav-btn" @tap="onShare">
          <text class="share-icon">↗</text>
        </view>
      </view>
    </view>

    <!-- 商品图片轮播 -->
    <view class="gallery-section">
      <swiper
        v-if="imageList.length > 0"
        class="gallery-swiper"
        :autoplay="true"
        :circular="true"
        indicator-dots
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#fff"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(img, idx) in imageList" :key="idx">
          <image :src="imgUrl(img)" class="gallery-img" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view v-else class="gallery-placeholder">
        <Icon icon="solar:box-bold" width="48" color="var(--text-hint)" />
      </view>
      <view v-if="imageList.length > 1" class="gallery-counter">
        <text class="counter-text">{{ currentImageIndex + 1 }}/{{ imageList.length }}</text>
      </view>
    </view>

    <!-- 秒杀横幅 -->
    <view v-if="seckillInfo" class="seckill-banner">
      <view class="seckill-left">
        <view class="seckill-tag">
          <text class="tag-text">限时秒杀</text>
        </view>
        <view class="seckill-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ seckillInfo.seckillPrice }}</text>
        </view>
        <text v-if="currentPrice > seckillInfo.seckillPrice" class="seckill-original">¥{{ currentPrice }}</text>
      </view>
      <view class="seckill-right">
        <text class="seckill-stock">仅剩 {{ seckillInfo.stock }} 件</text>
        <view class="countdown">
          <text class="countdown-text">距结束</text>
          <view class="countdown-box">
            <text class="countdown-num">02</text>
            <text class="countdown-colon">:</text>
            <text class="countdown-num">30</text>
            <text class="countdown-colon">:</text>
            <text class="countdown-num">15</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 价格区域 -->
    <view class="price-section">
      <view class="price-main">
        <view class="price-current">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ currentPrice }}</text>
        </view>
        <text v-if="originalPrice && originalPrice > currentPrice" class="price-original">¥{{ originalPrice }}</text>
        <view v-if="product.price === 0" class="price-free-tag">
          <text class="free-tag-text">免费</text>
        </view>
      </view>
      <view class="price-info">
        <text class="sales-text">已售 {{ product.sales || 0 }} 件</text>
        <view class="delivery-tag">
          <text class="delivery-text">包邮</text>
        </view>
      </view>
    </view>

    <!-- 商品标题 -->
    <view class="title-section">
      <text class="product-title">{{ product.spuName || '加载中...' }}</text>
      <text v-if="product.subtitle" class="product-subtitle">{{ product.subtitle }}</text>
      <view v-if="shopName" class="shop-info">
        <view class="shop-tag" :class="{ system: storeType === 0 }">
          <text class="shop-tag-text">{{ storeType === 0 ? '自营' : '入驻' }}</text>
        </view>
        <text class="shop-name">{{ shopName }}</text>
      </view>
    </view>

    <!-- 规格选择 -->
    <view v-if="skuSpecGroups.length > 0" class="spec-section" @tap="showSpecSheet = true">
      <text class="spec-label">规格</text>
      <text class="spec-value">{{ selectedSpecText || '请选择规格' }}</text>
      <text class="spec-arrow">›</text>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <view class="section-header">
        <text class="section-title">商品详情</text>
      </view>
      <view class="detail-body">
        <rich-text :nodes="product.details || product.description || '<p style=\'text-align:center;color:#999\'>暂无详情</p>'" />
      </view>
    </view>

    <!-- 推荐商品 -->
    <view class="recommend-section">
      <view class="section-header">
        <text class="section-title">相关推荐</text>
        <text class="section-more" @tap="goProductList">更多 ›</text>
      </view>
      <scroll-view scroll-x class="recommend-scroll">
        <view class="recommend-card" v-for="p in recommendProducts" :key="p.id" @tap="goProduct(p.id)">
          <view class="recommend-img">
            <image v-if="p.mainImage" :src="imgUrl(p.mainImage)" class="recommend-image" mode="aspectFill" />
            <Icon v-else icon="solar:box-bold" width="24" color="var(--text-hint)" />
          </view>
          <view class="recommend-info">
            <text class="recommend-title">{{ p.spuName || p.title }}</text>
            <text class="recommend-price">¥{{ p.minPrice || p.price }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="bottom-spacer" />

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-icons">
        <view class="action-icon-btn" @tap="goHome">
          <Icon icon="solar:home-bold" width="20" color="var(--text-secondary)" />
          <text class="icon-label">首页</text>
        </view>
        <view class="action-icon-btn" @tap="goCart">
          <Icon icon="solar:cart-large-2-bold" width="20" color="var(--text-secondary)" />
          <text class="icon-label">购物车</text>
        </view>
        <view class="action-icon-btn" @tap="onFavorite">
          <Icon :icon="favorited ? 'solar:heart-bold' : 'solar:heart-linear'" width="20" :color="favorited ? 'var(--color-danger)' : 'var(--text-secondary)'" />
          <text class="icon-label">收藏</text>
        </view>
      </view>
      <view class="action-buttons">
        <template v-if="seckillInfo">
          <button
            class="btn-seckill"
            :disabled="seckillLimitReached || seckillInfo.stock <= 0"
            @tap="handleSeckillBuy"
          >
            <text class="btn-text">{{ seckillLimitReached ? '已达上限' : '立即秒杀' }}</text>
          </button>
        </template>
        <template v-else>
          <button class="btn-add-cart" :disabled="currentStock <= 0" @tap="handleAddCart">
            <text class="btn-text">加入购物车</text>
          </button>
          <button class="btn-buy-now" :disabled="currentStock <= 0" @tap="handleBuyNow">
            <text class="btn-text">立即购买</text>
          </button>
        </template>
      </view>
    </view>

    </view><!-- /page-enter -->
    </template><!-- /v-else -->

    <!-- 规格选择弹窗 -->
    <view v-if="showSpecSheet" class="spec-overlay overlay-enter" @tap="showSpecSheet = false">
      <view class="spec-sheet sheet-enter" @tap.stop>
        <view class="spec-sheet-header">
          <view class="spec-sheet-info">
            <view class="spec-sheet-img" :style="{ background: '#f5f5f5' }">
              <Icon icon="solar:box-bold" width="24" color="var(--text-hint)" />
            </view>
            <view class="spec-sheet-price-info">
              <view class="spec-sheet-price">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ currentPrice }}</text>
              </view>
              <text class="spec-sheet-stock">库存 {{ currentStock }} 件</text>
            </view>
          </view>
          <view class="spec-sheet-close" @tap="showSpecSheet = false">
            <text class="close-icon">✕</text>
          </view>
        </view>

        <scroll-view scroll-y class="spec-sheet-body">
          <view v-for="group in skuSpecGroups" :key="group.name" class="spec-group">
            <text class="spec-group-name">{{ group.name }}</text>
            <view class="spec-group-values">
              <view
                v-for="val in group.values"
                :key="val"
                class="spec-chip"
                :class="{ active: selectedSpecs[group.name] === val, disabled: !specValueAvailable(group.name, val) }"
                @tap="selectSpec(group.name, val)"
              >
                <text class="chip-text">{{ val }}</text>
              </view>
            </view>
          </view>

          <view class="spec-qty">
            <text class="spec-qty-label">数量</text>
            <view class="qty-control">
              <view class="qty-btn" :class="{ disabled: quantity <= 1 }" @tap="quantity > 1 && quantity--">
                <text class="qty-btn-text">-</text>
              </view>
              <text class="qty-num">{{ quantity }}</text>
              <view class="qty-btn" :class="{ disabled: quantity >= currentStock }" @tap="quantity < currentStock && quantity++">
                <text class="qty-btn-text">+</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="spec-sheet-actions">
          <button v-if="!seckillInfo" class="btn-add-cart" @tap="handleAddCart(); showSpecSheet = false" :disabled="currentStock <= 0">
            <text class="btn-text">加入购物车</text>
          </button>
          <button class="btn-buy-now" @tap="handleBuyNow(); showSpecSheet = false" :disabled="currentStock <= 0">
            <text class="btn-text">立即购买</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getProductDetail, addToCart, getFrontProductList, imgUrl } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'
import { goCart as openCart, goHome as openHome, goMall } from '@/utils/navigation'
import SkeletonPage from '@/components/SkeletonPage.vue'

const currentUserId = getCurrentUserId()
const productId = ref('')
const isScrolled = ref(false)
const activeTab = ref('product')
const currentImageIndex = ref(0)

const product = ref<any>({})
const skuList = ref<any[]>([])
const selectedSpecs = ref<Record<string, string>>({})
const quantity = ref(1)
const loading = ref(true)
const showSpecSheet = ref(false)
const favorited = ref(false)
const cartCount = ref(0)
const seckillInfo = ref<any>(null)
const seckillLimit = ref(0)
const seckillUserBought = ref(0)
const seckillLimitReached = computed(() => seckillLimit.value > 0 && seckillUserBought.value >= seckillLimit.value)
const shopName = ref('')
const storeType = ref(0)

const tabs = [
  { key: 'product', label: '商品' },
  { key: 'detail', label: '详情' },
]

const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

const imageList = computed(() => {
  if (product.value.images) {
    try {
      const arr = typeof product.value.images === 'string' ? JSON.parse(product.value.images) : product.value.images
      return Array.isArray(arr) ? arr : []
    } catch { return [] }
  }
  return product.value.mainImage ? [product.value.mainImage] : []
})

const skuSpecGroups = computed(() => {
  const map = new Map<string, Set<string>>()
  const template = product.value.specTemplate
  if (template) {
    try {
      const tpl = typeof template === 'string' ? JSON.parse(template) : template
      const dims = Array.isArray(tpl) ? tpl : []
      for (const dim of dims) {
        if (dim.name && Array.isArray(dim.values)) map.set(dim.name, new Set(dim.values))
      }
    } catch {}
  }
  if (map.size === 0 && skuList.value.length > 0) {
    for (const sku of skuList.value) {
      if (sku.specs) {
        let specs: any
        try { specs = typeof sku.specs === 'string' ? JSON.parse(sku.specs) : sku.specs } catch { continue }
        if (specs && typeof specs === 'object') {
          for (const [k, v] of Object.entries<string>(specs)) {
            if (!map.has(k)) map.set(k, new Set())
            map.get(k)!.add(v)
          }
        }
      }
    }
  }
  return [...map.entries()].map(([name, values]) => ({ name, values: [...values] }))
})

const selectedSpecText = computed(() => {
  const specs = selectedSpecs.value
  const keys = Object.keys(specs)
  if (keys.length === 0) return ''
  return keys.map(k => specs[k]).join(' / ')
})

const matchedSku = computed(() => {
  if (skuList.value.length === 0) return null
  const specKeys = skuSpecGroups.value.map(g => g.name)
  if (specKeys.length === 0) return skuList.value[0] || null
  return skuList.value.find(sku => {
    if (!sku.specs) return false
    let specs: any
    try { specs = typeof sku.specs === 'string' ? JSON.parse(sku.specs) : sku.specs } catch { return false }
    return specKeys.every(k => specs[k] === selectedSpecs.value[k])
  }) || null
})

const currentPrice = computed(() => {
  if (matchedSku.value) return matchedSku.value.price ?? product.value.minPrice ?? 0
  return product.value.minPrice ?? 0
})

const originalPrice = computed(() => {
  if (matchedSku.value?.originalPrice) return matchedSku.value.originalPrice
  return product.value.originalPrice || product.value.maxPrice || 0
})

const currentStock = computed(() => {
  if (matchedSku.value) return matchedSku.value.stock ?? 999
  return product.value.stock ?? 999
})

const recommendProducts = ref<any[]>([])

function onSwiperChange(e: any) {
  currentImageIndex.value = e.detail.current
}

function specValueAvailable(groupName: string, val: string) {
  const testSpecs = { ...selectedSpecs.value, [groupName]: val }
  const specKeys = skuSpecGroups.value.map(g => g.name)
  return skuList.value.some(sku => {
    if (!sku.specs) return false
    let specs: any
    try { specs = typeof sku.specs === 'string' ? JSON.parse(sku.specs) : sku.specs } catch { return false }
    return specKeys.every(k => specs[k] === testSpecs[k])
  })
}

function selectSpec(groupName: string, val: string) {
  if (!specValueAvailable(groupName, val)) return
  selectedSpecs.value[groupName] = val
}

function goBack() {
  uni.navigateBack()
}

function goHome() {
  openHome()
}

function goCart() {
  openCart()
}

function goProductList() {
  goMall()
}

function goProduct(id: string) {
  uni.redirectTo({ url: '/pages/product/detail?id=' + id })
}

function onShare() {
  uni.setClipboardData({
    data: '盛桦商城商品: ' + (product.value?.spuName || '') + ' https://shenghua.com/product/' + productId,
    success: () => uni.showToast({ title: '链接已复制', icon: 'success' }),
  })
}

function onFavorite() {
  favorited.value = !favorited.value
  uni.showToast({ title: favorited.value ? '已收藏' : '已取消收藏', icon: 'success' })
}

async function handleAddCart() {
  if (currentStock.value <= 0) return
  const skuId = matchedSku.value?.id
  if (!skuId) {
    uni.showToast({ title: '请选择规格', icon: 'none' })
    showSpecSheet.value = true
    return
  }
  try {
    await addToCart({ userId: currentUserId, skuId, quantity: quantity.value })
    uni.showToast({ title: '已加入购物车', icon: 'success' })
    cartCount.value++
  } catch (e: any) {
    uni.showToast({ title: e?.message || '加入失败', icon: 'none' })
  }
}

async function handleBuyNow() {
  if (currentStock.value <= 0) return
  const skuId = matchedSku.value?.id
  if (!skuId) {
    uni.showToast({ title: '请选择规格', icon: 'none' })
    showSpecSheet.value = true
    return
  }
  try {
    const res = await addToCart({ userId: currentUserId, skuId, quantity: quantity.value })
    const cartItemId = res?.id || res
    uni.navigateTo({ url: `/pages/checkout/index?itemId=${cartItemId}` })
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

async function handleSeckillBuy() {
  if (!seckillInfo.value) return
  const price = seckillInfo.value.seckillPrice
  uni.navigateTo({
    url: `/pages/checkout/index?seckillId=${seckillInfo.value.id}&seckillPrice=${price}&spuId=${productId.value}`
  })
}

onLoad(async (options) => {
  productId.value = options?.id || ''
  if (!productId.value) { loading.value = false; return }

  try {
    const data = await getProductDetail(productId.value)
    product.value = data || {}
    skuList.value = Array.isArray(data?.skuList) ? data.skuList : []
    for (const g of skuSpecGroups.value) {
      if (g.values.length > 0 && !selectedSpecs.value[g.name]) {
        selectedSpecs.value[g.name] = g.values[0]
      }
    }
  } catch {
    product.value = {}
  } finally {
    loading.value = false
  }

  // 加载推荐商品
  try {
    const recRes: any = await getFrontProductList({ pageNo: 1, pageSize: 4 })
    const records = recRes?.records || []
    recommendProducts.value = records.filter((r: any) => r.id !== productId.value).slice(0, 3)
  } catch {
    recommendProducts.value = []
  }

  // 秒杀信息
  try {
    const skRes = await http.get('/mall/seckillProduct/list', { params: { spuId: productId.value, pageSize: 1 } })
    const skItems = skRes?.records || []
    if (skItems.length > 0) {
      const actRes = await http.get('/mall/seckill/list', { params: { pageSize: 99 } })
      const acts = (actRes?.records || []).filter((a: any) => a.status === 1)
      const skItem = skItems.find((s: any) => acts.some((a: any) => a.id === s.activityId))
      if (skItem) {
        seckillInfo.value = skItem
        seckillLimit.value = skItem.limitPerUser || 1
        try {
          const ub = await http.get('/mall/seckill/userBought', { params: { spuId: productId.value, userId: currentUserId } })
          seckillUserBought.value = ub || 0
        } catch { seckillUserBought.value = 0 }
      }
    }
  } catch {}

  // 店铺信息
  if (product.value?.merchantId) {
    try {
      const mRes = await http.get('/mall/merchant/list', { params: { pageSize: 999 } })
      const m = (mRes?.records || []).find((m: any) => m.id === product.value.merchantId)
      if (m) { shopName.value = m.shopName; storeType.value = m.storeType }
    } catch {}
  }
})
</script>

<style scoped>
@import url('@/styles/tokens.css');
.page {
  min-height: 100vh;
  background: var(--bg-page, #F8F9FA);
  padding-bottom: 70px;
}

/* 顶部导航 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 10px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
}

.nav-bar.scrolled {
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.nav-back {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-circle);
  background: rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 24px;
  color: #1a1a1a;
  font-weight: 300;
}

.nav-tabs {
  display: flex;
  gap: 16px;
}

.nav-tab {
  padding: 6px 0;
  position: relative;
}

.tab-text {
  font-size: 15px;
  color: #666;
  font-weight: 500;
}

.tab-text.active {
  color: #1a1a1a;
  font-weight: 600;
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  border-radius: 1px;
  background: var(--color-accent);
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-circle);
  background: rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cart-icon {
  font-size: 18px;
}

.cart-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  background: var(--color-accent);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.badge-text {
  font-size: 10px;
  color: #fff;
  font-weight: 600;
}

.share-icon {
  font-size: 18px;
  color: #666;
}

/* 商品图片轮播 */
.gallery-section {
  position: relative;
}

.gallery-swiper {
  height: 375px;
}

.gallery-img {
  width: 100%;
  height: 375px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-placeholder-text {
  font-size: 16px;
  color: #999;
}

.gallery-placeholder {
  height: 375px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.placeholder-icon {
  font-size: 48px;
}

.gallery-counter {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0,0,0,0.5);
  padding: 3px 10px;
  border-radius: 12px;
}

.counter-text {
  font-size: 12px;
  color: #fff;
}

/* 秒杀横幅 */
.seckill-banner {
  background: linear-gradient(135deg, var(--color-accent), #FF7875);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.seckill-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.seckill-tag {
  background: #fff;
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-text {
  font-size: 11px;
  color: var(--color-accent);
  font-weight: 600;
}

.seckill-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.seckill-original {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  text-decoration: line-through;
}

.seckill-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.seckill-stock {
  font-size: 12px;
  color: rgba(255,255,255,0.9);
}

.countdown {
  display: flex;
  align-items: center;
  gap: 4px;
}

.countdown-text {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
}

.countdown-box {
  display: flex;
  align-items: center;
  gap: 2px;
}

.countdown-num {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: rgba(0,0,0,0.3);
  padding: 1px 4px;
  border-radius: 3px;
}

.countdown-colon {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
}

/* 价格区域 */
.price-section {
  background: #fff;
  padding: 16px;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.price-current {
  display: flex;
  align-items: baseline;
}

.price-current .price-symbol {
  font-size: 16px;
  color: var(--color-accent);
  font-weight: 600;
}

.price-current .price-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-accent);
}

.price-original {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.price-free-tag {
  background: #52C41A;
  padding: 2px 8px;
  border-radius: 4px;
}

.free-tag-text {
  font-size: 11px;
  color: #fff;
  font-weight: 600;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sales-text {
  font-size: 12px;
  color: #999;
}

.delivery-tag {
  background: #FFF4EE;
  padding: 1px 6px;
  border-radius: 3px;
}

.delivery-text {
  font-size: 11px;
  color: var(--color-accent);
}

/* 商品标题 */
.title-section {
  background: #fff;
  padding: 0 16px 16px;
}

.product-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-subtitle {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
  display: block;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
}

.shop-tag {
  padding: 1px 6px;
  border-radius: 3px;
  background: #FFF4EE;
}

.shop-tag.system {
  background: var(--color-accent);
}

.shop-tag-text {
  font-size: 10px;
  color: var(--color-accent);
  font-weight: 600;
}

.shop-tag.system .shop-tag-text {
  color: #fff;
}

.shop-name {
  font-size: 13px;
  color: #666;
}

/* 规格选择 */
.spec-section {
  background: #fff;
  margin-top: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
}

.spec-section:active {
  background: #fafafa;
}

.spec-label {
  font-size: 14px;
  color: #999;
  margin-right: 12px;
}

.spec-value {
  flex: 1;
  font-size: 14px;
  color: #1a1a1a;
}

.spec-arrow {
  font-size: 18px;
  color: #ccc;
}

/* 商品详情 */
.detail-section {
  background: #fff;
  margin-top: 8px;
  padding: 16px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.detail-body {
  font-size: 14px;
  line-height: 1.8;
  color: #1a1a1a;
}

/* 推荐商品 */
.recommend-section {
  background: #fff;
  margin-top: 8px;
  padding: 16px;
}

.section-more {
  font-size: 13px;
  color: #999;
}

.recommend-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.recommend-card {
  flex-shrink: 0;
  width: 120px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.recommend-card:active {
  transform: scale(0.97);
  opacity: 0.85;
}

.recommend-img {
  width: 120px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-gray, #f5f5f5);
  border-radius: var(--radius-sm, 6px);
  overflow: hidden;
}

.recommend-image {
  width: 100%;
  height: 100%;
}

.recommend-placeholder {
  font-size: 24px;
}

.recommend-info {
  padding: 8px;
}

.recommend-title {
  font-size: 12px;
  color: #1a1a1a;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommend-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-accent);
  margin-top: 4px;
  display: block;
}

.bottom-spacer {
  height: 16px;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  padding-bottom: calc(24px + var(--safe-area-bottom));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  z-index: 100;
}

.action-icons {
  display: flex;
  gap: 16px;
  margin-right: 12px;
}

.action-icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.icon-text {
  font-size: 20px;
}

.icon-label {
  font-size: 10px;
  color: #666;
}

.action-buttons {
  flex: 1;
  display: flex;
  gap: 10px;
}

.btn-add-cart {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  border: 1px solid var(--color-accent);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-cart:active {
  background: #FFF4EE;
}

.btn-add-cart .btn-text {
  font-size: 14px;
  color: var(--color-accent);
  font-weight: 600;
}

.btn-buy-now {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  border: none;
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-buy-now:active {
  opacity: 0.9;
}

.btn-buy-now .btn-text {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}

.btn-seckill {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  border: none;
  background: linear-gradient(135deg, var(--color-accent), #FF7875);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-seckill .btn-text {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}

button[disabled] {
  opacity: 0.5;
}

/* 规格弹窗 */
.spec-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.spec-sheet {
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
}

.spec-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.spec-sheet-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spec-sheet-img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spec-img-placeholder {
  font-size: 24px;
}

.spec-sheet-price-info {
  display: flex;
  flex-direction: column;
}

.spec-sheet-price {
  display: flex;
  align-items: baseline;
}

.spec-sheet-price .price-symbol {
  font-size: 14px;
  color: var(--color-accent);
  font-weight: 600;
}

.spec-sheet-price .price-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-accent);
}

.spec-sheet-stock {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.spec-sheet-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 18px;
  color: #999;
}

.spec-sheet-body {
  flex: 1;
  padding: 16px;
  max-height: 40vh;
}

.spec-group {
  margin-bottom: 16px;
}

.spec-group-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
  display: block;
}

.spec-group-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-chip {
  padding: 8px 16px;
  border-radius: 20px;
  background: #F5F6FA;
  border: 1px solid transparent;
}

.spec-chip.active {
  background: #FFF4EE;
  border-color: var(--color-accent);
}

.spec-chip.disabled {
  opacity: 0.4;
}

.chip-text {
  font-size: 13px;
  color: #1a1a1a;
}

.spec-chip.active .chip-text {
  color: var(--color-accent);
  font-weight: 500;
}

.spec-qty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
}

.spec-qty-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.qty-control {
  display: flex;
  align-items: center;
  background: #F5F6FA;
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn.disabled {
  opacity: 0.3;
}

.qty-btn-text {
  font-size: 18px;
  color: #1a1a1a;
}

.qty-num {
  width: 44px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.spec-sheet-actions {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  padding-bottom: 24px;
  border-top: 1px solid #f0f0f0;
}

/* 隐藏滚动条 */
.recommend-scroll::-webkit-scrollbar {
  display: none;
}
</style>
