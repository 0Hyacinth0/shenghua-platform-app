<template>
  <div class="product-detail" v-if="product.id">
    <div class="detail-top">
      <!-- 左侧图片区域 -->
      <div class="gallery">
        <div class="main-image-wrap">
          <a-image
            :src="imgUrl(mainImage)"
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0iI2JiYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiI+5Zu+54mH5Yqg6L295aSx6LSlPC90ZXh0Pjwvc3ZnPg=="
            class="main-image"
          />
        </div>
        <div v-if="imageList.length > 0" class="thumb-list">
          <div
            v-for="(img, idx) in imageList"
            :key="idx"
            class="thumb-item"
            :class="{ active: mainImage === img }"
            @click="mainImage = img"
          >
            <img :src="imgUrl(img)" :alt="'缩略图 ' + (idx + 1)" />
          </div>
        </div>
      </div>

      <!-- 右侧商品信息 -->
      <div class="info">
        <h1 class="product-title">{{ product.spuName }}</h1>
        <div class="subtitle" v-if="product.subtitle">{{ product.subtitle }}</div>

        <div class="product-shop" v-if="shopName">
          <a-tag v-if="storeType===0" color="orange">系统店铺</a-tag>
          <a-tag v-else color="blue">入驻商家</a-tag>
          {{ shopName }}
        </div>
        <div class="price-block">
          <span class="current-price">&yen;{{ currentPrice }}</span>
          <span v-if="originalPrice && originalPrice > currentPrice" class="original-price">
            &yen;{{ originalPrice }}
          </span>
        </div>

        <div class="sales-row">
          已售 {{ product.sales || 0 }} 件
        </div>

        <!-- 秒杀横幅 -->
        <div v-if="seckillInfo" class="seckill-banner">
          秒杀价 <span class="seckill-price">¥{{ seckillInfo.seckillPrice }}</span>
          <span class="seckill-stock">仅剩 {{ seckillInfo.stock }} 件</span>
          <span class="seckill-stock" v-if="seckillLimit > 0"> | 限购{{ seckillLimit }}件</span>
          <template v-if="seckillLimitReached">
            <a-button type="default" disabled>已达上限（已购{{ seckillUserBought }}件）</a-button>
          </template>
          <template v-else>
            <a-button type="primary" danger @click="handleSeckillBuy">立即秒杀</a-button>
          </template>
        </div>

        <!-- SKU 规格选择 -->
        <div v-for="group in skuSpecGroups" :key="group.name" class="spec-row">
          <span class="spec-label">{{ group.name }}：</span>
          <div class="spec-values">
            <span
              v-for="val in group.values"
              :key="val"
              class="spec-tag"
              :class="{ active: selectedSpecs[group.name] === val, disabled: !specValueAvailable(group.name, val) }"
              @click="selectSpec(group.name, val)"
            >{{ val }}</span>
          </div>
        </div>

        <!-- 数量 -->
        <div class="qty-row">
          <span class="spec-label">数量：</span>
          <a-input-number
            v-model:value="quantity"
            :min="1"
            :max="currentStock"
            :disabled="currentStock <= 0"
          />
          <span class="stock-text" v-if="currentStock > 0">库存 {{ currentStock }} 件</span>
          <span class="stock-text out" v-else>暂时缺货</span>
        </div>

        <!-- 操作按钮 -->
        <div class="action-row">
          <template v-if="!seckillInfo">
            <a-button size="large" class="btn-cart" @click="handleAddCart" :disabled="currentStock <= 0">
              加入购物车
            </a-button>
            <a-button type="primary" size="large" class="btn-buy" @click="handleBuyNow" :disabled="currentStock <= 0">
              立即购买
            </a-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 商品详情 -->
    <div class="detail-bottom">
      <a-tabs default-active-key="detail">
        <a-tab-pane key="detail" tab="商品详情">
          <div class="detail-content" v-html="product.details || product.description || '<p>暂无详情</p>'"></div>
        </a-tab-pane>
        <a-tab-pane key="params" tab="规格参数" v-if="product.specTemplate">
          <div class="spec-params">
            <pre>{{ product.specTemplate }}</pre>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>

  <div v-else-if="loading" class="loading-wrap">
    <a-spin tip="加载中..." />
  </div>
  <div v-else class="not-found">
    <a-result status="404" title="商品不存在">
      <template #extra>
        <a-button type="primary" @click="$router.push('/')">返回首页</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { getProductDetail, addToCart, imgUrl } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const route = useRoute()
const router = useRouter()

// 当前用户ID（从登录状态获取）
const currentUserId = getCurrentUserId()

const product = ref<any>({})
const skuList = ref<any[]>([])
const selectedSpecs = ref<Record<string, string>>({})
const quantity = ref(1)
const mainImage = ref('')
const loading = ref(true)
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

    // 初始化默认选择：每个规格组默认选中第一个
    for (const g of skuSpecGroups.value) {
      if (g.values.length > 0) {
        // 跳过已有默认或跳过会导致无匹配SKU的情况，先选第一个
        if (!selectedSpecs.value[g.name]) {
          selectedSpecs.value[g.name] = g.values[0]
        }
      }
    }
  } catch {
    product.value = {}
  } finally {
    loading.value = false
  }

  // 加载秒杀信息
  try {
    const skRes = await http.get('/mall/seckillProduct/list', { params: { spuId: route.params.id, pageSize: 1 } })
    const skItems = skRes?.records || []
    if (skItems.length > 0) {
      const actRes = await http.get('/mall/seckill/list', { params: { pageSize: 99 } })
      const acts = (actRes?.records||[]).filter((a:any)=>a.status===1)
      const skItem = skItems.find((s:any) => acts.some((a:any)=>a.id===s.activityId))
      if (skItem) { seckillInfo.value = skItem; seckillLimit.value = skItem.limitPerUser || 1; try { const ub = await http.get('/mall/seckill/userBought', { params: { spuId: route.params.id, userId: currentUserId } }); seckillUserBought.value = ub || 0 } catch { seckillUserBought.value = 0 } }
    }
  } catch {}

  // 加载店铺信息
  if (product.value?.merchantId) {
    try {
      const mRes = await http.get('/mall/merchant/list', { params: { pageSize: 999 } })
      const m = (mRes?.records||[]).find((m:any) => m.id === product.value.merchantId)
      if (m) { shopName.value = m.shopName; storeType.value = m.storeType }
    } catch {}
  }
})

// 图片列表（从 images JSON 或 mainImage 构造）
const imageList = computed(() => {
  if (product.value.images) {
    try {
      const arr = typeof product.value.images === 'string' ? JSON.parse(product.value.images) : product.value.images
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }
  return product.value.mainImage ? [product.value.mainImage] : []
})

// 根据 specTemplate 解析规格维度组
const skuSpecGroups = computed(() => {
  const map = new Map<string, Set<string>>()
  const template = product.value.specTemplate
  if (template) {
    try {
      const tpl = typeof template === 'string' ? JSON.parse(template) : template
      const dims = Array.isArray(tpl) ? tpl : []
      for (const dim of dims) {
        if (dim.name && Array.isArray(dim.values)) {
          map.set(dim.name, new Set(dim.values))
        }
      }
    } catch { /* ignore */ }
  }
  // 如果没有 specTemplate，从 SKU specText 推断（按"/"分隔）
  if (map.size === 0 && skuList.value.length > 0) {
    // 先尝试从 specs JSON
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
    // 如果还没有，从 specText 推断
    if (map.size === 0) {
      const allTexts = skuList.value.map((s: any) => s.specText || '').filter(Boolean)
      if (allTexts.length > 0) {
        // 检测分隔符: "/" 或 "-" 或 " "
        const sep = allTexts[0].includes('/') ? '/' : (allTexts[0].includes('-') ? '-' : null)
        if (sep && allTexts.every((t: string) => t.split(sep).length === allTexts[0].split(sep).length)) {
          const partsCount = allTexts[0].split(sep).length
          for (const text of allTexts) {
            const parts = text.split(sep)
            for (let i = 0; i < parts.length; i++) {
              const key = '规格' + (i + 1)
              if (!map.has(key)) map.set(key, new Set())
              map.get(key)!.add(parts[i].trim())
            }
          }
        } else {
          // 无分隔符，整个 specText 作为一个选项
          const key = '规格'
          map.set(key, new Set(allTexts.map((t: string) => t.trim())))
        }
      }
    }
  }
  return [...map.entries()].map(([name, values]) => ({ name, values: [...values] }))
})

// 判断某个规格值在当前已选条件下是否可选
function specValueAvailable(specName: string, specValue: string): boolean {
  const otherGroups = skuSpecGroups.value.filter(g => g.name !== specName)
  const currentSelected: Record<string, string> = {}
  for (const g of otherGroups) {
    if (selectedSpecs.value[g.name]) {
      currentSelected[g.name] = selectedSpecs.value[g.name]
    }
  }
  // 如果没有其他维度选择约束或全部未选，则都可用
  if (Object.keys(currentSelected).length === 0) return true

  return skuList.value.some(sku => {
    let specs: any
    try {
      specs = typeof sku.specs === 'string' ? JSON.parse(sku.specs) : sku.specs
    } catch { return false }
    if (!specs) return false
    if (specs[specName] !== specValue) return false
    let match = true
    for (const [k, v] of Object.entries<string>(currentSelected)) {
      if (specs[k] !== v) { match = false; break }
    }
    return match
  })
}

// 选择规格值
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

// 匹配当前选中规格对应的 SKU
const matchedSku = computed(() => {
  if (skuList.value.length === 0) return null
  const groups = skuSpecGroups.value
  if (groups.length === 0) return skuList.value[0]

  const selKeys = Object.keys(selectedSpecs.value).filter(k => selectedSpecs.value[k])
  if (selKeys.length === 0) return skuList.value[0]

  return skuList.value.find(sku => {
    // 优先用 specs JSON 匹配
    let specs: any
    try { specs = typeof sku.specs === 'string' ? JSON.parse(sku.specs) : sku.specs } catch { /* ignore */ }
    if (specs && typeof specs === 'object') {
      for (const groupName of selKeys) {
        if (specs[groupName] !== selectedSpecs.value[groupName]) return false
      }
      return true
    }
    // 用 specText 按分隔符匹配
    const text = sku.specText || ''
    const sep = text.includes('/') ? '/' : (text.includes('-') ? '-' : null)
    if (sep) {
      const parts = text.split(sep).map((p: string) => p.trim())
      const groupNames = groups.map((g: any) => g.name)
      for (let i = 0; i < selKeys.length; i++) {
        const key = selKeys[i]
        const idx = groupNames.indexOf(key)
        if (idx >= 0 && parts[idx] !== selectedSpecs.value[key]) return false
      }
      return true
    }
    // 无分隔符：specText 直接和选中的"规格"值比较
    if (selKeys.length === 1 && groups.length === 1) {
      return text.trim() === selectedSpecs.value[selKeys[0]]
    }
    return true
  }) || skuList.value[0]
})

const currentPrice = computed(() => matchedSku.value?.price ?? product.value.minPrice ?? 0)
const originalPrice = computed(() => matchedSku.value?.originalPrice ?? product.value.originalPrice ?? 0)
const currentStock = computed(() => matchedSku.value?.stock ?? 0)

// 加入购物车
async function handleAddCart() {
  const sku = matchedSku.value
  if (!sku) {
    message.warning('请选择规格')
    return
  }
  try {
    await addToCart({
      userId: currentUserId,
      spuId: product.value.id,
      skuId: sku.id,
      quantity: quantity.value,
    })
    message.success('已加入购物车')
  } catch {
    message.error('加入购物车失败')
  }
}

// 立即购买
async function handleBuyNow() {
  const sku = matchedSku.value
  if (!sku) {
    message.warning('请选择规格')
    return
  }
  try {
    await addToCart({
      userId: currentUserId,
      spuId: product.value.id,
      skuId: sku.id,
      quantity: quantity.value,
    })
    // 加入购物车后跳转结算页，传递选中商品ID
    router.push({ name: 'checkout', query: { itemId: sku.id } })
  } catch (e: any) {
    console.error('加入购物车失败:', e)
    message.error(e.message || '操作失败，请重试')
  }
}

// 秒杀购买 - 跳转到确认订单页面
async function handleSeckillBuy() {
  if (!seckillInfo.value) {
    message.warning('秒杀信息不存在')
    return
  }
  // 跳转到确认订单页，传递秒杀商品信息
  router.push({
    name: 'checkout',
    query: {
      seckillId: seckillInfo.value.id,
      seckillPrice: seckillInfo.value.seckillPrice,
      spuId: product.value.id,
    }
  })
}
</script>

<style scoped>
.product-detail {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.detail-top {
  display: flex;
  gap: 32px;
}

.gallery {
  width: 400px;
  flex-shrink: 0;
}

.main-image-wrap {
  width: 400px;
  height: 400px;
  background: #fafafa;
  border-radius: 4px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumb-list {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.thumb-item {
  width: 56px;
  height: 56px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.thumb-item.active {
  border-color: #e4393c;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  flex: 1;
}

.product-title {
  font-size: 22px;
  font-weight: 600;
  color: #222;
  margin: 0 0 4px;
}

.subtitle {
  color: #e4393c;
  font-size: 14px;
  margin-bottom: 16px;
}

.seckill-banner {
  background: linear-gradient(135deg, #e4393c, #f56c6c);
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 15px;
}
.seckill-price {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}
.seckill-stock {
  font-size: 13px;
  opacity: 0.9;
}

.product-shop {
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.price-block {
  background: #fff5f5;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.current-price {
  font-size: 28px;
  font-weight: 700;
  color: #e4393c;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
  margin-left: 12px;
}

.sales-row {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.spec-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.spec-label {
  width: 60px;
  flex-shrink: 0;
  color: #666;
  font-size: 14px;
  line-height: 28px;
}

.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-tag {
  display: inline-block;
  padding: 2px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: all 0.2s;
}

.spec-tag:hover {
  border-color: #e4393c;
  color: #e4393c;
}

.spec-tag.active {
  border-color: #e4393c;
  background: #e4393c;
  color: #fff;
}

.spec-tag.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.qty-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.stock-text {
  color: #999;
  font-size: 13px;
}

.stock-text.out {
  color: #e4393c;
}

.action-row {
  display: flex;
  gap: 12px;
}

.btn-cart {
  width: 160px;
  height: 46px;
  font-size: 16px;
  border-color: #e4393c;
  color: #e4393c;
}

.btn-buy {
  width: 160px;
  height: 46px;
  font-size: 16px;
  background: #e4393c;
  border-color: #e4393c;
}

.detail-bottom {
  margin-top: 32px;
}

.detail-content {
  padding: 16px;
  max-width: 900px;
}

.detail-content :deep(img) {
  max-width: 100%;
}

.spec-params pre {
  font-size: 14px;
  white-space: pre-wrap;
  color: #666;
}

.loading-wrap {
  text-align: center;
  padding: 120px 0;
}

.not-found {
  padding: 80px 0;
}
</style>