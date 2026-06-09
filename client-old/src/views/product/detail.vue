<template>
  <div class="product-page" v-if="product.id">
    <!-- 顶部导航 -->
    <header class="detail-header">
      <button class="back-btn" @click="$router.back()">
        <LeftOutlined />
      </button>
      <div class="header-tabs">
        <span :class="{ active: activeTab === 'detail' }" @click="activeTab = 'detail'">商品</span>
        <span :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">详情</span>
      </div>
      <button class="share-btn" @click="$router.push('/cart')">
        <ShoppingCartOutlined />
      </button>
    </header>

    <!-- 商品图片轮播 -->
    <section class="gallery-section">
      <a-carousel v-if="imageList.length > 0" dots-class="gallery-dots">
        <div v-for="(img, idx) in imageList" :key="idx" class="gallery-slide">
          <img :src="imgUrl(img)" :alt="product.spuName" />
        </div>
      </a-carousel>
      <div v-else class="gallery-placeholder">
        <ShoppingOutlined style="font-size:48px;color:#ddd" />
      </div>
      <div class="gallery-counter" v-if="imageList.length > 1">1/{{ imageList.length }}</div>
    </section>

    <!-- 秒杀横幅 -->
    <section v-if="seckillInfo" class="seckill-strip">
      <div class="seckill-left">
        <span class="seckill-label">限时秒杀</span>
        <span class="seckill-price"><span class="price-symbol">¥</span>{{ seckillInfo.seckillPrice }}</span>
        <span class="seckill-orig" v-if="currentPrice > seckillInfo.seckillPrice">¥{{ currentPrice }}</span>
      </div>
      <div class="seckill-right">
        <span class="seckill-stock">仅剩 {{ seckillInfo.stock }} 件</span>
      </div>
    </section>

    <!-- 价格区域 -->
    <section class="price-section">
      <div class="price-main">
        <span class="price-current"><span class="price-symbol">¥</span>{{ currentPrice }}</span>
        <span v-if="originalPrice && originalPrice > currentPrice" class="price-orig">¥{{ originalPrice }}</span>
      </div>
      <div class="price-sales">已售 {{ product.sales || 0 }} 件</div>
      <h1 class="product-title">{{ product.spuName }}</h1>
      <div class="product-subtitle" v-if="product.subtitle">{{ product.subtitle }}</div>
      <div class="product-shop" v-if="shopName">
        <span class="shop-tag" :class="{ system: storeType === 0 }">{{ storeType === 0 ? '自营' : '入驻' }}</span>
        <span class="shop-name">{{ shopName }}</span>
      </div>
    </section>

    <!-- 规格选择 -->
    <section class="spec-section" v-if="skuSpecGroups.length > 0">
      <div class="spec-item" v-for="group in skuSpecGroups" :key="group.name" @click="showSpecSheet = true">
        <span class="spec-label">{{ group.name }}</span>
        <span class="spec-value">{{ selectedSpecs[group.name] || '请选择' }}</span>
        <RightOutlined class="spec-arrow" />
      </div>
    </section>

    <!-- 商品详情 -->
    <section class="detail-section" id="detail-content">
      <div class="section-header">
        <span class="section-title">商品详情</span>
      </div>
      <div class="detail-body" v-html="product.details || product.description || '<p style=\'text-align:center;color:#999\'>暂无详情</p>'"></div>
    </section>

    <!-- 底部操作栏 -->
    <footer class="action-bar">
      <div class="action-icons">
        <button class="action-icon-btn" @click="$router.push('/')">
          <HomeOutlined />
          <span>首页</span>
        </button>
        <button class="action-icon-btn" @click="$router.push('/cart')">
          <ShoppingCartOutlined />
          <span>购物车</span>
        </button>
      </div>
      <div class="action-buttons">
        <template v-if="seckillInfo">
          <button
            class="btn-seckill"
            :disabled="seckillLimitReached || seckillInfo.stock <= 0"
            @click="handleSeckillBuy"
          >{{ seckillLimitReached ? '已达上限' : '立即秒杀' }}</button>
        </template>
        <template v-else>
          <button class="btn-add-cart" :disabled="currentStock <= 0" @click="handleAddCart">加入购物车</button>
          <button class="btn-buy-now" :disabled="currentStock <= 0" @click="handleBuyNow">立即购买</button>
        </template>
      </div>
    </footer>

    <!-- 规格选择弹窗 -->
    <a-drawer
      v-model:open="showSpecSheet"
      placement="bottom"
      :height="'auto'"
      :closable="false"
      class="spec-drawer"
    >
      <div class="spec-sheet">
        <div class="spec-sheet-header">
          <div class="spec-sheet-info">
            <img v-if="mainImage" :src="imgUrl(mainImage)" class="spec-sheet-img" />
            <div>
              <div class="spec-sheet-price"><span class="price-symbol">¥</span>{{ currentPrice }}</div>
              <div class="spec-sheet-stock">库存 {{ currentStock }} 件</div>
            </div>
          </div>
          <button class="spec-sheet-close" @click="showSpecSheet = false">
            <CloseOutlined />
          </button>
        </div>

        <div v-for="group in skuSpecGroups" :key="group.name" class="spec-group">
          <div class="spec-group-name">{{ group.name }}</div>
          <div class="spec-group-values">
            <span
              v-for="val in group.values"
              :key="val"
              class="spec-chip"
              :class="{ active: selectedSpecs[group.name] === val, disabled: !specValueAvailable(group.name, val) }"
              @click="selectSpec(group.name, val)"
            >{{ val }}</span>
          </div>
        </div>

        <div class="spec-qty">
          <span class="spec-qty-label">数量</span>
          <div class="qty-control">
            <button class="qty-btn" :disabled="quantity <= 1" @click="quantity--">-</button>
            <span class="qty-num">{{ quantity }}</span>
            <button class="qty-btn" :disabled="quantity >= currentStock" @click="quantity++">+</button>
          </div>
        </div>

        <div class="spec-sheet-actions">
          <button v-if="!seckillInfo" class="btn-add-cart" @click="handleAddCart(); showSpecSheet = false" :disabled="currentStock <= 0">加入购物车</button>
          <button class="btn-buy-now" @click="handleBuyNow(); showSpecSheet = false" :disabled="currentStock <= 0">立即购买</button>
        </div>
      </div>
    </a-drawer>
  </div>

  <!-- 加载态 -->
  <div v-else-if="loading" class="loading-wrap">
    <a-spin tip="加载中..." />
  </div>

  <!-- 404 -->
  <div v-else class="empty-wrap">
    <ShoppingOutlined class="empty-icon" />
    <div class="empty-text">商品不存在</div>
    <button class="btn btn-primary" style="margin-top:16px" @click="$router.push('/')">返回首页</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  LeftOutlined, ShoppingCartOutlined, ShoppingOutlined,
  RightOutlined, HomeOutlined, CloseOutlined,
} from '@ant-design/icons-vue'
import { getProductDetail, addToCart, imgUrl } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const route = useRoute()
const router = useRouter()
const currentUserId = getCurrentUserId()

const product = ref<any>({})
const skuList = ref<any[]>([])
const selectedSpecs = ref<Record<string, string>>({})
const quantity = ref(1)
const mainImage = ref('')
const loading = ref(true)
const activeTab = ref('detail')
const showSpecSheet = ref(false)
const seckillInfo = ref<any>(null)
const seckillLimit = ref(0)
const seckillUserBought = ref(0)
const seckillLimitReached = computed(() => seckillLimit.value > 0 && seckillUserBought.value >= seckillLimit.value)
const shopName = ref('')
const storeType = ref(0)

onMounted(async () => {
  try {
    const data = await getProductDetail(route.params.id as string)
    product.value = data || {}
    skuList.value = Array.isArray(data?.skuList) ? data.skuList : []
    mainImage.value = data?.mainImage || ''
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

  // 秒杀信息
  try {
    const skRes = await http.get('/mall/seckillProduct/list', { params: { spuId: route.params.id, pageSize: 1 } })
    const skItems = skRes?.records || []
    if (skItems.length > 0) {
      const actRes = await http.get('/mall/seckill/list', { params: { pageSize: 99 } })
      const acts = (actRes?.records || []).filter((a: any) => a.status === 1)
      const skItem = skItems.find((s: any) => acts.some((a: any) => a.id === s.activityId))
      if (skItem) {
        seckillInfo.value = skItem
        seckillLimit.value = skItem.limitPerUser || 1
        try {
          const ub = await http.get('/mall/seckill/userBought', { params: { spuId: route.params.id, userId: currentUserId } })
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
    if (map.size === 0) {
      const allTexts = skuList.value.map((s: any) => s.specText || '').filter(Boolean)
      if (allTexts.length > 0) {
        const sep = allTexts[0].includes('/') ? '/' : (allTexts[0].includes('-') ? '-' : null)
        if (sep && allTexts.every((t: string) => t.split(sep).length === allTexts[0].split(sep).length)) {
          for (const text of allTexts) {
            const parts = text.split(sep)
            for (let i = 0; i < parts.length; i++) {
              const key = '规格' + (i + 1)
              if (!map.has(key)) map.set(key, new Set())
              map.get(key)!.add(parts[i].trim())
            }
          }
        } else {
          map.set('规格', new Set(allTexts.map((t: string) => t.trim())))
        }
      }
    }
  }
  return [...map.entries()].map(([name, values]) => ({ name, values: [...values] }))
})

function specValueAvailable(specName: string, specValue: string): boolean {
  const otherGroups = skuSpecGroups.value.filter(g => g.name !== specName)
  const currentSelected: Record<string, string> = {}
  for (const g of otherGroups) {
    if (selectedSpecs.value[g.name]) currentSelected[g.name] = selectedSpecs.value[g.name]
  }
  if (Object.keys(currentSelected).length === 0) return true
  return skuList.value.some(sku => {
    let specs: any
    try { specs = typeof sku.specs === 'string' ? JSON.parse(sku.specs) : sku.specs } catch { return false }
    if (!specs) return false
    if (specs[specName] !== specValue) return false
    for (const [k, v] of Object.entries<string>(currentSelected)) {
      if (specs[k] !== v) return false
    }
    return true
  })
}

function selectSpec(specName: string, specValue: string) {
  if (!specValueAvailable(specName, specValue)) return
  if (selectedSpecs.value[specName] === specValue) {
    const newSpecs = { ...selectedSpecs.value }
    delete newSpecs[specName]
    selectedSpecs.value = newSpecs
  } else {
    selectedSpecs.value = { ...selectedSpecs.value, [specName]: specValue }
  }
  quantity.value = 1
}

const matchedSku = computed(() => {
  if (skuList.value.length === 0) return null
  const groups = skuSpecGroups.value
  if (groups.length === 0) return skuList.value[0]
  const selKeys = Object.keys(selectedSpecs.value).filter(k => selectedSpecs.value[k])
  if (selKeys.length === 0) return skuList.value[0]
  return skuList.value.find(sku => {
    let specs: any
    try { specs = typeof sku.specs === 'string' ? JSON.parse(sku.specs) : sku.specs } catch {}
    if (specs && typeof specs === 'object') {
      for (const groupName of selKeys) {
        if (specs[groupName] !== selectedSpecs.value[groupName]) return false
      }
      return true
    }
    return true
  }) || skuList.value[0]
})

const currentPrice = computed(() => matchedSku.value?.price ?? product.value.minPrice ?? 0)
const originalPrice = computed(() => matchedSku.value?.originalPrice ?? product.value.originalPrice ?? 0)
const currentStock = computed(() => matchedSku.value?.stock ?? 0)

async function handleAddCart() {
  const sku = matchedSku.value
  if (!sku) { message.warning('请选择规格'); return }
  try {
    await addToCart({ userId: currentUserId, spuId: product.value.id, skuId: sku.id, quantity: quantity.value })
    message.success('已加入购物车')
  } catch { message.error('加入购物车失败') }
}

async function handleBuyNow() {
  const sku = matchedSku.value
  if (!sku) { message.warning('请选择规格'); return }
  try {
    await addToCart({ userId: currentUserId, spuId: product.value.id, skuId: sku.id, quantity: quantity.value })
    router.push({ name: 'checkout', query: { itemId: sku.id } })
  } catch (e: any) { message.error(e.message || '操作失败') }
}

async function handleSeckillBuy() {
  if (!seckillInfo.value) return
  router.push({ name: 'checkout', query: { seckillId: seckillInfo.value.id, seckillPrice: seckillInfo.value.seckillPrice, spuId: product.value.id } })
}
</script>

<style scoped>
.product-page {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: 64px;
}

/* ---- 顶部导航 ---- */
.detail-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-card, #fff);
  display: flex;
  align-items: center;
  padding: 8px 12px;
  min-height: 44px;
}

.back-btn, .share-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-bg, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--color-text, #1a1a1a);
}

.header-tabs {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 24px;
}

.header-tabs span {
  font-size: 15px;
  color: var(--color-text-secondary, #666);
  font-weight: 500;
  cursor: pointer;
  position: relative;
  padding-bottom: 4px;
}

.header-tabs span.active {
  color: var(--color-text, #1a1a1a);
  font-weight: 600;
}

.header-tabs span.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-primary, #FF4D4F);
}

/* ---- 图片轮播 ---- */
.gallery-section {
  position: relative;
  background: var(--color-card, #fff);
}

.gallery-section :deep(.ant-carousel) {
  aspect-ratio: 1;
}

.gallery-slide {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f5f5f5);
}

.gallery-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-placeholder {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f5f5f5);
}

.gallery-counter {
  position: absolute;
  bottom: 12px;
  right: 16px;
  background: rgba(0,0,0,0.5);
  color: white;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 999px;
}

.gallery-section :deep(.slick-dots) { bottom: 12px; }
.gallery-section :deep(.slick-dots li button) { background: rgba(255,255,255,0.5); }
.gallery-section :deep(.slick-dots li.slick-active button) { background: white; }

/* ---- 秒杀横幅 ---- */
.seckill-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%);
  padding: 12px 16px;
  color: white;
}

.seckill-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.seckill-label {
  font-size: 12px;
  font-weight: 600;
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.seckill-price {
  font-size: 24px;
  font-weight: 700;
}

.seckill-price .price-symbol { font-size: 14px; }

.seckill-orig {
  font-size: 13px;
  text-decoration: line-through;
  opacity: 0.7;
}

.seckill-stock {
  font-size: 12px;
  opacity: 0.9;
}

/* ---- 价格区域 ---- */
.price-section {
  background: var(--color-card, #fff);
  padding: 16px;
  margin-bottom: 8px;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.price-current {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary, #FF4D4F);
}

.price-current .price-symbol { font-size: 16px; }

.price-orig {
  font-size: 14px;
  color: var(--color-text-disabled, #ccc);
  text-decoration: line-through;
}

.price-sales {
  font-size: 12px;
  color: var(--color-text-hint, #999);
  margin-bottom: 12px;
}

.product-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
  line-height: 1.4;
  margin-bottom: 6px;
}

.product-subtitle {
  font-size: 13px;
  color: var(--color-primary, #FF4D4F);
  margin-bottom: 8px;
}

.product-shop {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary, #666);
}

.shop-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--color-primary-light, #FFF1F0);
  color: var(--color-primary, #FF4D4F);
}

.shop-tag.system {
  background: #FFF7E6;
  color: #FA8C16;
}

.shop-name {
  font-size: 13px;
}

/* ---- 规格选择 ---- */
.spec-section {
  background: var(--color-card, #fff);
  padding: 0 16px;
  margin-bottom: 8px;
}

.spec-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 0.5px solid var(--color-divider, #f0f0f0);
  cursor: pointer;
}

.spec-item:last-child { border-bottom: none; }

.spec-label {
  font-size: 13px;
  color: var(--color-text-hint, #999);
  width: 60px;
  flex-shrink: 0;
}

.spec-value {
  flex: 1;
  font-size: 14px;
  color: var(--color-text, #1a1a1a);
}

.spec-arrow {
  font-size: 12px;
  color: var(--color-text-disabled, #ccc);
}

/* ---- 商品详情 ---- */
.detail-section {
  background: var(--color-card, #fff);
  padding: 16px;
}

.detail-section .section-header {
  margin-bottom: 12px;
}

.detail-section .section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
}

.detail-body {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary, #666);
}

.detail-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

/* ---- 底部操作栏 ---- */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-card, #fff);
  border-top: 0.5px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  padding: 8px 12px;
  padding-bottom: calc(8px + var(--safe-bottom, 0px));
  z-index: 100;
}

.action-icons {
  display: flex;
  gap: 4px;
  margin-right: 12px;
}

.action-icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  font-size: 18px;
  color: var(--color-text-secondary, #666);
  background: transparent;
}

.action-icon-btn span {
  font-size: 10px;
}

.action-buttons {
  flex: 1;
  display: flex;
  gap: 8px;
}

.btn-add-cart {
  flex: 1;
  height: 40px;
  border-radius: 999px;
  border: 1.5px solid var(--color-primary, #FF4D4F);
  color: var(--color-primary, #FF4D4F);
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-buy-now {
  flex: 1;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: var(--color-primary, #FF4D4F);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-seckill {
  flex: 1;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #FF4D4F, #FF7875);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-add-cart:disabled, .btn-buy-now:disabled, .btn-seckill:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add-cart:active { opacity: 0.8; }
.btn-buy-now:active, .btn-seckill:active { opacity: 0.85; }

/* ---- 规格弹窗 ---- */
.spec-sheet {
  padding: 20px 16px;
  padding-bottom: calc(20px + var(--safe-bottom, 0px));
}

.spec-sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.spec-sheet-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.spec-sheet-img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
}

.spec-sheet-price {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary, #FF4D4F);
}

.spec-sheet-price .price-symbol { font-size: 14px; }

.spec-sheet-stock {
  font-size: 12px;
  color: var(--color-text-hint, #999);
  margin-top: 2px;
}

.spec-sheet-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-bg, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--color-text-hint, #999);
}

.spec-group {
  margin-bottom: 16px;
}

.spec-group-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
  margin-bottom: 10px;
}

.spec-group-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-chip {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid var(--color-border, #eee);
  font-size: 13px;
  color: var(--color-text, #1a1a1a);
  cursor: pointer;
  transition: all 0.15s;
}

.spec-chip.active {
  border-color: var(--color-primary, #FF4D4F);
  background: var(--color-primary-light, #FFF1F0);
  color: var(--color-primary, #FF4D4F);
  font-weight: 500;
}

.spec-chip.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.spec-qty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 16px;
}

.spec-qty-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
}

.qty-control {
  display: flex;
  align-items: center;
  background: var(--color-bg, #f5f5f5);
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: transparent;
  color: var(--color-text, #1a1a1a);
}

.qty-btn:disabled { color: var(--color-text-disabled, #ccc); }

.qty-num {
  width: 40px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
}

.spec-sheet-actions {
  display: flex;
  gap: 10px;
}

.spec-sheet-actions .btn-add-cart,
.spec-sheet-actions .btn-buy-now {
  height: 44px;
  font-size: 15px;
}

.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
