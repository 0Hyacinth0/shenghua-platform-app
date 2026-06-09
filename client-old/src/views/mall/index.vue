<template>
  <div class="category-page">
    <!-- 顶部搜索 -->
    <header class="cat-header">
      <div class="search-bar" @click="$router.push('/')">
        <SearchOutlined class="search-icon" />
        <span class="search-placeholder">搜索商品</span>
      </div>
    </header>

    <div class="cat-layout">
      <!-- 左侧分类导航 -->
      <div class="cat-nav">
        <div
          class="nav-item" :class="{ active: activeCatId === '' }"
          @click="onCatChange('')"
        >全部</div>
        <div
          class="nav-item" :class="{ active: activeCatId === 'top' }"
          @click="onCatChange('top')"
        >今日推荐</div>
        <template v-for="cat in categories" :key="cat.id">
          <div
            class="nav-item"
            :class="{ active: activeCatId === cat.id, expanded: expandedIds[cat.id] }"
            @click="onCatClick(cat)"
          >
            <span class="nav-text">{{ cat.categoryName || cat.name }}</span>
            <RightOutlined v-if="cat.children?.length" class="nav-arrow" :class="{ rotated: expandedIds[cat.id] }" />
          </div>
          <template v-if="cat.children?.length && expandedIds[cat.id]">
            <div
              v-for="child in cat.children" :key="child.id"
              class="nav-item nav-child"
              :class="{ active: activeCatId === child.id }"
              @click="onCatChange(child.id)"
            >{{ child.categoryName || child.name }}</div>
          </template>
        </template>
      </div>

      <!-- 右侧商品区 -->
      <div class="cat-content">
        <!-- 快捷入口 -->
        <div class="quick-row">
          <div class="quick-item" @click="$router.push('/seckill')">
            <ThunderboltOutlined style="color:#FF4D4F;font-size:18px" />
            <span>秒杀</span>
          </div>
          <div class="quick-item" @click="$router.push('/groupBuy')">
            <TeamOutlined style="color:#722ED1;font-size:18px" />
            <span>拼团</span>
          </div>
          <div class="quick-item" @click="$router.push('/coupon')">
            <GiftOutlined style="color:#FA8C16;font-size:18px" />
            <span>领券</span>
          </div>
          <div class="quick-item" @click="$router.push('/signIn')">
            <CheckCircleOutlined style="color:#52C41A;font-size:18px" />
            <span>签到</span>
          </div>
        </div>

        <!-- 商品网格 -->
        <a-spin :spinning="loading">
          <div v-if="products.length === 0 && !loading" class="empty-wrap">
            <AppstoreOutlined class="empty-icon" />
            <div class="empty-text">暂无商品</div>
          </div>
          <div v-else class="product-grid">
            <div
              v-for="p in products" :key="p.id" class="product-card"
              @click="$router.push({ name: 'productDetail', params: { id: p.id } })"
            >
              <div class="product-cover">
                <img v-if="p.mainImage" :src="imgUrl(p.mainImage)" :alt="p.spuName" />
                <div v-else class="cover-placeholder">
                  <ShoppingOutlined style="font-size:28px;color:#ddd" />
                </div>
              </div>
              <div class="product-info">
                <div class="product-name">{{ p.spuName }}</div>
                <div class="product-price"><span class="price-symbol">¥</span>{{ p.minPrice }}</div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  SearchOutlined, RightOutlined,
  ThunderboltOutlined, TeamOutlined, GiftOutlined,
  CheckCircleOutlined, AppstoreOutlined, ShoppingOutlined,
} from '@ant-design/icons-vue'
import { getCategoryTree, getFrontProductList, imgUrl } from '@/api'

const categories = ref<any[]>([])
const products = ref<any[]>([])
const activeCatId = ref('')
const expandedIds = ref<Record<string, boolean>>({})
const loading = ref(false)

async function loadCategories() {
  try {
    const tree = await getCategoryTree()
    categories.value = Array.isArray(tree) ? tree : []
  } catch { categories.value = [] }
}

function onCatClick(cat: any) {
  onCatChange(cat.id)
  if (cat.children?.length) {
    expandedIds.value = { ...expandedIds.value, [cat.id]: !expandedIds.value[cat.id] }
  }
}

async function loadProducts() {
  loading.value = true
  try {
    const params: any = { pageNo: 1, pageSize: 30 }
    if (activeCatId.value === 'top') {
      params.isTop = 1
    } else if (activeCatId.value) {
      params.categoryId = activeCatId.value
    }
    const res = await getFrontProductList(params)
    products.value = res?.records || []
  } catch { products.value = [] }
  finally { loading.value = false }
}

function onCatChange(id: string) {
  activeCatId.value = id
  loadProducts()
}

onMounted(async () => {
  await loadCategories()
  loadProducts()
})
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-page, #F7F7F8);
}

/* ---- 顶部搜索 ---- */
.cat-header {
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
  border-radius: 999px;
  padding: 9px 16px;
  cursor: pointer;
}

.search-icon { font-size: 15px; color: var(--color-text-hint, #999); }
.search-placeholder { font-size: 14px; color: var(--color-text-hint, #999); }

/* ---- 左右布局 ---- */
.cat-layout {
  flex: 1;
  display: flex;
  min-height: 0;
}

.cat-nav {
  width: 88px;
  flex-shrink: 0;
  background: var(--color-bg, #f5f5f5);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px));
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 10px;
  font-size: 13px;
  color: var(--color-text-secondary, #666);
  cursor: pointer;
  transition: all 0.18s;
  position: relative;
}

.nav-item:active { background: rgba(0,0,0,0.02); }

.nav-item.active {
  background: var(--color-card, #fff);
  color: var(--color-text, #1a1a1a);
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  border-radius: 0 3px 3px 0;
  background: var(--color-primary, #FF4D4F);
}

.nav-child {
  padding-left: 16px !important;
  font-size: 12px;
  color: var(--color-text-hint, #999);
  background: var(--color-bg-page, #F7F7F8);
}

.nav-child.active {
  color: var(--color-text, #1a1a1a);
  font-weight: 500;
  background: var(--color-card, #fff);
}

.nav-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-arrow {
  font-size: 10px;
  color: var(--color-text-disabled, #ccc);
  transition: transform 0.2s;
  flex-shrink: 0;
  margin-left: 4px;
}

.nav-arrow.rotated {
  transform: rotate(90deg);
}

/* ---- 右侧内容 ---- */
.cat-content {
  flex: 1;
  min-width: 0;
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px));
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.quick-row {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: var(--color-card, #fff);
  margin-bottom: 8px;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  background: var(--color-bg, #f5f5f5);
  border-radius: 10px;
  font-size: 11px;
  color: var(--color-text-secondary, #666);
  cursor: pointer;
}

.quick-item:active { opacity: 0.7; }

/* ---- 商品网格 ---- */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px 12px;
}

.product-card {
  background: var(--color-card, #fff);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
}

.product-card:active { transform: scale(0.97); }

.product-cover {
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-bg, #f5f5f5);
}

.product-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-info {
  padding: 8px 10px 10px;
}

.product-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text, #1a1a1a);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary, #FF4D4F);
}

.product-price .price-symbol {
  font-size: 11px;
}
</style>
