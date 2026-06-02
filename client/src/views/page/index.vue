<template>
  <div class="page-render" :style="{ backgroundColor: pageStyle.backgroundColor || '#f5f5f5' }">
    <a-spin :spinning="loading">
      <div v-if="page">
        <div v-if="page.pageName" class="page-header">
          <h1>{{ page.pageName }}</h1>
        </div>
        <div class="page-content">
          <template v-for="comp in sortedComponents" :key="comp.id">
            <!-- 轮播图 -->
            <div v-if="comp.type === 'carousel'" class="comp-carousel" :style="{ borderRadius: (comp.props?.borderRadius || 0) + 'px', overflow: 'hidden' }">
              <a-carousel :autoplay="comp.props?.autoplay !== false">
                <div v-for="(img, i) in (comp.props?.images || [])" :key="i">
                  <img :src="img" :style="{ height: (comp.props?.height || 200) + 'px', width: '100%', objectFit: 'cover' }" />
                </div>
              </a-carousel>
            </div>

            <!-- 公告栏 -->
            <div v-else-if="comp.type === 'notice'" class="comp-notice" :style="{ backgroundColor: comp.props?.backgroundColor || '#fff7e6', color: comp.props?.textColor || '#333' }">
              <a-alert :message="comp.props?.text || '公告'" :banner="true" show-icon style="border:none;background:transparent;" />
            </div>

            <!-- 搜索框 -->
            <div v-else-if="comp.type === 'searchBar'" class="comp-search" :style="{ backgroundColor: comp.props?.backgroundColor || '#fff' }">
              <div :class="['search-box', comp.props?.shape === 'square' ? 'square' : 'round']" @click="$router.push('/search')">
                <SearchOutlined class="search-icon" />
                <span class="search-txt">{{ comp.props?.placeholder || '搜索商品' }}</span>
              </div>
            </div>

            <!-- 导航栏 -->
            <div v-else-if="comp.type === 'navBar'" class="comp-navbar" :style="{ backgroundColor: comp.props?.backgroundColor || '#fff' }">
              <div class="nav-grid" :style="{ gridTemplateColumns: 'repeat(' + (comp.props?.columns || 4) + ', 1fr)' }">
                <div v-for="(item, i) in (comp.props?.items || [])" :key="i" class="nav-item" @click="item.link && $router.push(item.link)">
                  <div class="nav-icon-circle">
                    <img v-if="item.icon && item.icon.startsWith('http')" :src="item.icon" class="nav-img" />
                    <span v-else class="nav-icon-text">{{ item.text?.charAt(0) }}</span>
                  </div>
                  <span class="nav-label">{{ item.text }}</span>
                </div>
              </div>
            </div>

            <!-- 图片广告 -->
            <div v-else-if="comp.type === 'imageAd'" class="comp-image-ad" v-show="comp.props?.imageUrl">
              <img
                v-if="comp.props?.imageUrl"
                :src="comp.props.imageUrl"
                :style="{ height: (comp.props?.height || 150) + 'px', width: '100%', objectFit: 'cover', borderRadius: (comp.props?.borderRadius || 0) + 'px' }"
                @click="comp.props?.link && $router.push(comp.props.link)"
              />
            </div>

            <!-- 标题栏 -->
            <div v-else-if="comp.type === 'titleBar'" class="comp-title-bar" :style="{ textAlign: comp.props?.align || 'left' }">
              <h3 class="title-main">{{ comp.props?.title || '标题' }}</h3>
              <p v-if="comp.props?.subtitle" class="title-sub">{{ comp.props.subtitle }}</p>
            </div>

            <!-- 空白占位 -->
            <div v-else-if="comp.type === 'spacer'" :style="{ height: (comp.props?.height || 20) + 'px', backgroundColor: comp.props?.backgroundColor || '#f5f5f5' }"></div>

            <!-- 富文本 -->
            <div v-else-if="comp.type === 'richText'" class="comp-rich-text" :style="{ padding: (comp.props?.padding || 12) + 'px' }" v-html="comp.props?.content || ''"></div>

            <!-- 商品列表 -->
            <div v-else-if="comp.type === 'productList'" class="comp-product-list">
              <h3 class="section-title">{{ comp.props?.title || '商品推荐' }}</h3>
              <div :class="['product-grid', comp.props?.layout || 'grid2']">
                <div
                  v-for="p in comp.products"
                  :key="p.id"
                  class="product-card"
                  @click="$router.push('/product/' + p.id)"
                >
                  <img :src="imgUrl(p.mainImage)" class="p-img" />
                  <div class="p-info">
                    <div class="p-name">{{ p.spuName }}</div>
                    <div v-if="comp.props?.showPrice" class="p-price">¥{{ p.minPrice }}</div>
                  </div>
                </div>
              </div>
              <a-empty v-if="!comp.products || comp.products.length === 0" description="暂无商品" />
            </div>

            <!-- 分类导航 -->
            <div v-else-if="comp.type === 'categoryNav'" class="comp-category-nav" v-if="comp.categories?.length">
              <h3 class="section-title">{{ comp.props?.title || '商品分类' }}</h3>
              <div class="cat-grid" :style="{ gridTemplateColumns: 'repeat(' + (comp.props?.columns || 4) + ', 1fr)' }">
                <div v-for="cat in comp.categories" :key="cat.id" class="cat-item" @click="$router.push('/?categoryId=' + cat.id)">
                  <img v-if="cat.icon" :src="imgUrl(cat.icon)" class="cat-img" />
                  <div v-else class="cat-icon-placeholder"></div>
                  <span class="cat-label">{{ cat.categoryName }}</span>
                </div>
              </div>
            </div>

            <!-- 优惠券区 -->
            <div v-else-if="comp.type === 'couponSection'" class="comp-coupon-section">
              <h3 class="section-title">{{ comp.props?.title || '领券中心' }}</h3>
              <div class="coupon-scroll">
                <div v-for="c in comp.coupons" :key="c.id" class="coupon-card">
                  <div class="coupon-left">
                    <div class="c-amount">¥{{ c.discountValue || c.faceValue }}</div>
                    <div class="c-cond">满{{ c.minAmount || 0 }}可用</div>
                  </div>
                  <div class="coupon-right" @click="receiveCoupon(c)">立即领取</div>
                </div>
              </div>
              <a-empty v-if="!comp.coupons || comp.coupons.length === 0" description="暂无优惠券" />
            </div>

            <!-- 秒杀区 -->
            <div v-else-if="comp.type === 'seckillSection'" class="comp-seckill-section" v-if="comp.seckillProducts?.length">
              <h3 class="section-title sec-title">{{ comp.props?.title || '限时秒杀' }}</h3>
              <div class="seckill-scroll">
                <div v-for="sp in comp.seckillProducts" :key="sp.id" class="seckill-card" @click="$router.push('/product/' + sp.spuId)">
                  <img :src="imgUrl(sp.mainImage)" class="sec-img" />
                  <div class="sec-info">
                    <div class="sec-price">¥{{ sp.seckillPrice }}</div>
                    <div class="sec-original">¥{{ sp.originalPrice }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="comp-unknown">
              <pre>{{ JSON.stringify(comp, null, 2) }}</pre>
            </div>
          </template>
          <a-empty v-if="sortedComponents.length === 0" description="暂无组件配置" />
        </div>
      </div>
      <a-empty v-else-if="!loading" description="页面不存在或未发布" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SearchOutlined } from '@ant-design/icons-vue'
import { imgUrl } from '@/api'
import http from '@/utils/http'
import { message } from 'ant-design-vue'

const route = useRoute()
const page = ref<any>(null)
const components = ref<any[]>([])
const pageStyle = ref({ backgroundColor: '#f5f5f5' })
const loading = ref(true)

const sortedComponents = computed(() => {
  return [...components.value].sort((a, b) => (a.sort || 0) - (b.sort || 0))
})

onMounted(async () => {
  try {
    const pageId = route.query.id || route.params.id
    if (!pageId) { loading.value = false; return }
    const res = await http.get('/mall/pageConfig/queryById', { params: { id: pageId } })
    page.value = res || null
    if (page.value) {
      try {
        const data = typeof page.value.pageData === 'string' ? JSON.parse(page.value.pageData) : page.value.pageData
        if (data?.pageStyle) pageStyle.value = data.pageStyle
        components.value = Array.isArray(data) ? data : (data?.components || [])
      } catch { components.value = [] }
      // 并行加载各类数据
      await loadDataForComponents()
    }
  } catch {}
  loading.value = false
})

async function loadDataForComponents() {
  const promises = components.value.map(async (comp) => {
    try {
      if (comp.type === 'productList') {
        const pr = await http.get('/mall/spu/list', {
          params: {
            pageSize: comp.props?.displayCount || 6,
            categoryId: comp.props?.categoryId || undefined,
          },
        })
        comp.products = pr?.records || []
      } else if (comp.type === 'categoryNav') {
        const cr = await http.get('/mall/category/tree')
        const cats = cr || []
        const flatCats = flattenTree(cats, comp.props?.displayCount || 8)
        comp.categories = flatCats.slice(0, comp.props?.displayCount || 8)
      } else if (comp.type === 'couponSection') {
        const cr = await http.get('/mall/coupon/list', {
          params: { pageSize: comp.props?.displayCount || 4, status: 1 },
        })
        comp.coupons = cr?.records || []
      } else if (comp.type === 'seckillSection') {
        const sr = await http.get('/mall/seckillProduct/list', {
          params: { pageSize: comp.props?.displayCount || 4 },
        })
        comp.seckillProducts = sr?.records || []
      }
    } catch {}
  })
  await Promise.all(promises)
}

function flattenTree(nodes: any[], limit: number): any[] {
  const result: any[] = []
  function walk(list: any[]) {
    if (!list || result.length >= limit) return
    for (const node of list) {
      if (result.length >= limit) break
      if (node.children?.length) {
        walk(node.children)
      } else {
        result.push(node)
      }
    }
  }
  walk(nodes)
  return result
}

async function receiveCoupon(coupon: any) {
  try {
    const userId = localStorage.getItem('userId') || ''
    await http.post('/mall/userCoupon/receive', { userId, couponId: coupon.id })
    message.success('领取成功')
  } catch (e: any) {
    message.error(e?.message || '领取失败')
  }
}
</script>

<style scoped>
.page-render {
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-header {
  padding: 16px 12px 0;
}

.page-header h1 {
  font-size: 20px;
  margin-bottom: 8px;
}

.page-content {
  /* 各组件自维护间距 */
}

/* ============ 轮播图 ============ */
.comp-carousel {
  margin-bottom: 12px;
}

/* ============ 公告 ============ */
.comp-notice {
  margin-bottom: 12px;
}

/* ============ 搜索框 ============ */
.comp-search {
  padding: 10px 12px;
  margin-bottom: 8px;
}

.search-box {
  display: flex;
  align-items: center;
  height: 34px;
  background: #f5f5f5;
  padding: 0 12px;
  gap: 6px;
  cursor: pointer;
}

.search-box.round {
  border-radius: 17px;
}

.search-box.square {
  border-radius: 4px;
}

.search-icon {
  color: #999;
  font-size: 14px;
}

.search-txt {
  color: #bbb;
  font-size: 13px;
}

/* ============ 导航栏 ============ */
.comp-navbar {
  padding: 12px;
  margin-bottom: 8px;
}

.nav-grid {
  display: grid;
  gap: 8px 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.nav-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.nav-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav-icon-text {
  font-size: 18px;
  color: #666;
  font-weight: 600;
}

.nav-label {
  font-size: 11px;
  color: #666;
}

/* ============ 图片广告 ============ */
.comp-image-ad {
  margin-bottom: 8px;
  padding: 0 12px;
}

.comp-image-ad img {
  cursor: pointer;
}

/* ============ 标题栏 ============ */
.comp-title-bar {
  padding: 12px;
  background: #fff;
  margin-bottom: 8px;
}

.title-main {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.title-sub {
  font-size: 12px;
  color: #999;
  margin: 2px 0 0 0;
}

/* ============ 富文本 ============ */
.comp-rich-text {
  background: #fff;
  margin-bottom: 8px;
}

.comp-rich-text :deep(img) {
  max-width: 100%;
}

/* ============ 分区标题 ============ */
.section-title {
  font-size: 16px;
  font-weight: 600;
  padding: 12px;
  margin: 0;
  background: #fff;
}

.sec-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ============ 商品列表 ============ */
.comp-product-list {
  background: #fff;
  margin-bottom: 8px;
}

.product-grid {
  padding: 0 8px 12px;
  display: grid;
  gap: 8px;
}

.product-grid.grid2 {
  grid-template-columns: 1fr 1fr;
}

.product-grid.grid3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.product-grid.list .product-card {
  display: flex;
  gap: 8px;
}

.product-card {
  cursor: pointer;
  background: #f9f9f9;
  border-radius: 6px;
  overflow: hidden;
}

.p-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.product-grid.list .p-img {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.p-info {
  padding: 6px 8px;
}

.p-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}

.p-price {
  font-size: 16px;
  font-weight: 700;
  color: #e4393c;
  margin-top: 2px;
}

/* ============ 分类导航 ============ */
.comp-category-nav {
  background: #fff;
  margin-bottom: 8px;
}

.cat-grid {
  display: grid;
  gap: 8px;
  padding: 0 12px 12px;
}

.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.cat-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.cat-icon-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e6f4ff, #bae0ff);
}

.cat-label {
  font-size: 11px;
  color: #666;
  text-align: center;
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============ 优惠券 ============ */
.comp-coupon-section {
  background: #fff;
  margin-bottom: 8px;
}

.coupon-scroll {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
  overflow-x: auto;
}

.coupon-card {
  flex-shrink: 0;
  width: 150px;
  display: flex;
  border-radius: 8px;
  overflow: hidden;
}

.coupon-left {
  flex: 1;
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.c-amount {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.c-cond {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 2px;
}

.coupon-right {
  width: 30px;
  background: #fff0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #ff4757;
  cursor: pointer;
  writing-mode: vertical-rl;
  padding: 6px 0;
  font-weight: 500;
}

/* ============ 秒杀区 ============ */
.comp-seckill-section {
  background: #fff;
  margin-bottom: 8px;
}

.seckill-scroll {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
  overflow-x: auto;
}

.seckill-card {
  flex-shrink: 0;
  width: 110px;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.sec-img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}

.sec-info {
  padding: 4px 6px 6px;
}

.sec-price {
  font-size: 15px;
  font-weight: 700;
  color: #e4393c;
}

.sec-original {
  font-size: 10px;
  color: #999;
  text-decoration: line-through;
}

/* ============ 未知组件 ============ */
.comp-unknown {
  padding: 12px;
  font-size: 11px;
  color: #999;
  background: #fff;
  margin-bottom: 8px;
}

.comp-unknown pre {
  margin: 0;
  font-size: 10px;
  max-height: 100px;
  overflow: auto;
}
</style>
