<template>
  <div class="mall-page">
    <div class="mall-layout">
      <!-- 左侧分类导航 -->
      <div class="left-nav">
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
            class="nav-item nav-parent"
            :class="{ active: activeCatId === cat.id }"
            @click="onCatClick(cat)"
          >
            <span class="nav-text">{{ cat.categoryName || cat.name }}</span>
            <span class="nav-arrow" v-if="cat.children?.length">{{ expandedIds[cat.id] ? '▾' : '▸' }}</span>
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
      <div class="right-content">
        <!-- 快捷入口 -->
        <div class="mall-actions">
          <div class="action-item" @click="$router.push('/seckill')">
            <span class="action-icon" style="background:#FDE2E2">⚡</span>
            <span>秒杀</span>
          </div>
          <div class="action-item" @click="$router.push('/groupBuy')">
            <span class="action-icon" style="background:#E8E0F8">👥</span>
            <span>拼团</span>
          </div>
          <div class="action-item" @click="$router.push('/coupon')">
            <span class="action-icon" style="background:#FDE8F0">🎫</span>
            <span>领券</span>
          </div>
          <div class="action-item" @click="$router.push('/signIn')">
            <span class="action-icon" style="background:#D8F0E8">✅</span>
            <span>签到</span>
          </div>
        </div>

        <!-- 商品网格 -->
        <a-spin :spinning="loading">
          <div v-if="products.length === 0 && !loading" class="empty-state">
            <a-empty description="暂无商品" />
          </div>
          <div v-else class="product-grid">
            <div
              v-for="p in products" :key="p.id" class="product-card"
              @click="$router.push({ name: 'productDetail', params: { id: p.id } })"
            >
              <div class="product-cover">
                <a-image
                  :src="imgUrl(p.mainImage)" :preview="false"
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0iI2JiYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiI+5Zu+54mHPC90ZXh0Pjwvc3ZnPg=="
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
      </div>
    </div>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
.mall-page { max-width: 480px; margin: 0 auto; }

.mall-layout {
  display: flex;
  min-height: 100vh;
}

.left-nav {
  width: 85px;
  flex-shrink: 0;
  background: #fafafa;
  overflow-y: auto;
  padding: 4px 0;
  border-right: 1px solid #f0f0f0;
}
.nav-item {
  padding: 13px 6px;
  font-size: 12px;
  color: #888;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  display: flex;
  align-items: center;
  gap: 2px;
}
.nav-item:active { background: rgba(0,0,0,0.02); }
.nav-item.active {
  background: #fff;
  color: #1a1a1a;
  font-weight: 600;
  box-shadow: inset 3px 0 0 #1a1a1a;
}
.nav-parent {
  font-weight: 520;
  color: #444;
  background: #f5f5f5;
  border-bottom: 1px solid #f0f0f0;
  justify-content: space-between;
}
.nav-child {
  background: #fafafa;
  color: #999;
  padding-left: 18px !important;
  border-bottom: 1px solid #f5f5f5;
}
.nav-child.active {
  color: #1a1a1a;
  font-weight: 540;
  background: #fff;
}
.nav-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav-arrow {
  font-size: 8px;
  flex-shrink: 0;
  color: #bbb;
  margin-left: 2px;
}

.right-content {
  flex: 1;
  min-width: 0;
  background: #fff;
}

.mall-actions {
  display: flex; gap: 6px; padding: 10px 8px;
}
.action-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: #fafafa; border-radius: 8px; padding: 8px 2px;
  font-size: 11px; color: #666; cursor: pointer;
}
.action-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
}

.product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 0 8px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; transition: transform 0.15s; border: 1px solid #f5f5f5; }
.product-card:active { transform: scale(0.97); }
.product-cover { aspect-ratio: 1/1; overflow: hidden; background: #fafafa; }
.product-img { width: 100%; height: 100%; object-fit: cover; }
.product-info { padding: 6px 8px 8px; }
.product-name { font-size: 12px; font-weight: 480; color: #333; margin: 0 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-price { font-size: 14px; font-weight: 600; color: #e4393c; }

.empty-state { padding: 60px 0; text-align: center; }
.bottom-spacer { height: 100px; }
</style>
