<template>
  <div class="home-layout">
    <aside class="sidebar">
      <h3>商品分类</h3>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :style="{ borderInlineEnd: 'none' }"
        @click="onCategoryClick"
      >
        <template v-for="cat in flatCategories" :key="cat.id">
          <a-menu-item :style="{ paddingLeft: 12 + (cat.level || 0) * 16 + 'px' }">
            {{ cat.categoryName }}
          </a-menu-item>
        </template>
      </a-menu>
    </aside>

    <main class="main">
      <!-- 秒杀专区 -->
      <div v-if="seckillProducts.length > 0" class="seckill-section">
        <div class="seckill-header">
          <span class="seckill-title">限时秒杀</span>
          <router-link to="/seckill" class="seckill-more">更多 &gt;</router-link>
        </div>
        <div class="seckill-scroll">
          <div v-for="sp in seckillProducts" :key="sp.id" class="seckill-item" @click="goDetail(sp.id)">
            <div class="si-img"><img :src="imgUrl(sp.mainImage)" /></div>
            <div class="si-price">¥{{ sp.seckillPrice }}</div>
            <div class="si-stock">仅剩 {{ sp.stock }} 件</div>
          </div>
        </div>
      </div>

      <a-spin :spinning="loading" tip="加载中...">
        <div v-if="products.length === 0 && !loading" class="empty">
          <a-empty description="暂无商品" />
        </div>
        <a-row v-else :gutter="[16, 16]">
          <a-col v-for="p in products" :key="p.id" :xs="12" :sm="12" :md="8">
            <div class="product-card" @click="goDetail(p.id)">
              <div class="product-img-wrap">
                <a-image
                  :src="imgUrl(p.mainImage)"
                  :preview="false"
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0iI2JiYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiI+5Zu+54mH5Yqg6L295aSx6LSlPC90ZXh0Pjwvc3ZnPg=="
                  class="product-img"
                />
              </div>
              <div class="product-info">
                <div class="product-name">{{ p.spuName }}</div>
                <div class="product-shop" v-if="p._shopName">
                  <a-tag color="default" size="small">{{ p._shopName }}</a-tag>
                </div>
                <div class="product-bottom">
                  <span class="product-price">&yen;{{ p.minPrice }}</span>
                  <span class="product-sales">{{ p.sales || 0 }}件已售</span>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
        <div v-if="total > pageSize" class="pagination-wrap">
          <a-pagination
            v-model:current="page"
            :total="total"
            :page-size="pageSize"
            :show-size-changer="false"
            @change="loadProducts"
          />
        </div>
      </a-spin>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCategoryTree, getProductList, getFrontProductList, imgUrl } from '@/api'
import http from '@/utils/http'

const router = useRouter()
const route = useRoute()

const categories = ref<any[]>([])
const seckillProducts = ref<any[]>([])
const flatCategories = ref<any[]>([])
const selectedKeys = ref<string[]>([])
const products = ref<any[]>([])
const page = ref(1)
const pageSize = 12
const total = ref(0)
const loading = ref(false)

function flattenTree(nodes: any[]): any[] {
  const result: any[] = []
  function walk(list: any[], level: number) {
    for (const n of list) {
      result.push({ ...n, level })
      if (n.children && n.children.length > 0) {
        walk(n.children, level + 1)
      }
    }
  }
  walk(nodes, 0)
  return result
}

async function loadProducts() {
  loading.value = true
  try {
    const keyword = (route.query.keyword as string) || undefined
    const categoryId = allCategoryIds.value || undefined
    const res = await getFrontProductList({ categoryId, keyword, pageNo: page.value, pageSize })
    if (res) {
      products.value = res.records || []
      total.value = res.total || 0
      // 加载商家名称和类型
      const merchantIds = [...new Set(products.value.map(p => p.merchantId).filter(Boolean))]
      if (merchantIds.length > 0) {
        try {
          const mRes = await http.get('/mall/merchant/list', { params: { pageSize: 999 } })
          const mList = mRes?.records || []
          products.value.forEach(p => {
            const m = mList.find((m: any) => m.id === p.merchantId)
            if (m) { p._shopName = m.shopName; p._storeType = m.storeType }
          })
        } catch {}
      }
    }
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

function collectChildIds(node: any, ids: string[]) {
  ids.push(node.id)
  if (node.children) node.children.forEach((c: any) => collectChildIds(c, ids))
}

const allCategoryIds = ref<string>('')

function onCategoryClick({ key }: { key: string }) {
  if (selectedKeys.value[0] === key) {
    selectedKeys.value = []
    allCategoryIds.value = ''
  } else {
    selectedKeys.value = [key]
    // 收集当前分类及其所有子分类ID
    const ids: string[] = []
    const node = findCategoryById(categories.value, key)
    if (node) collectChildIds(node, ids)
    allCategoryIds.value = ids.join(',')
  }
  page.value = 1
  loadProducts()
}

function findCategoryById(nodes: any[], id: string): any {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) { const found = findCategoryById(n.children, id); if (found) return found }
  }
  return null
}

function goDetail(id: string) {
  router.push({ name: 'productDetail', params: { id } })
}

async function loadSeckill() {
  try {
    const res: any = await http.get('/mall/seckill/list', { params: { pageSize: 99 } })
    const acts = (res?.records || []).filter((a: any) => a.status === 1)
    const items: any[] = []
    for (const act of acts) {
      try {
        const pr: any = await http.get('/mall/seckillProduct/list', { params: { activityId: act.id, pageSize: 99 } })
        for (const p of (pr?.records || [])) {
          try {
            const d: any = await http.get('/mall/spu/queryById', { params: { id: p.spuId } })
            if (d) items.push({ ...d, seckillPrice: p.seckillPrice, stock: p.stock })
          } catch {}
        }
      } catch {}
    }
    seckillProducts.value = items
  } catch {}
}

onMounted(async () => {
  try {
    const tree = await getCategoryTree()
    categories.value = Array.isArray(tree) ? tree : []
    flatCategories.value = flattenTree(categories.value)
  } catch {
    categories.value = []
    flatCategories.value = []
  }
  loadProducts()
  loadSeckill()
})

watch(() => route.query.keyword, () => {
  page.value = 1
  loadProducts()
})
</script>

<style scoped>
.home-layout {
  display: flex;
  gap: 16px;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding: 12px 0;
}

.sidebar h3 {
  padding: 0 16px 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.main {
  flex: 1;
  min-width: 0;
}

.empty {
  padding: 80px 0;
  text-align: center;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.product-img-wrap {
  width: 100%;
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
  padding: 10px 12px;
}

.product-name {
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.product-shop {
  margin-bottom: 6px;
}

.seckill-section { background: #fff; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
.seckill-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.seckill-title { font-size: 18px; font-weight: 700; color: #e4393c; }
.seckill-more { font-size: 13px; color: #999; }
.seckill-scroll { display: flex; gap: 12px; overflow-x: auto; }
.seckill-item { flex-shrink: 0; width: 120px; text-align: center; cursor: pointer; }
.si-img { width: 120px; height: 120px; overflow: hidden; border-radius: 6px; }
.si-img img { width: 100%; height: 100%; object-fit: cover; }
.si-price { font-size: 16px; font-weight: 700; color: #e4393c; margin-top: 4px; }
.si-stock { font-size: 11px; color: #999; }

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 22px;
  font-weight: 700;
  color: #e4393c;
}

.product-sales {
  font-size: 13px;
  color: #999;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>