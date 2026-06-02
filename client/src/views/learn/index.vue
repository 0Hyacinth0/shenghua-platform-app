<template>
  <div class="learn-page">
    <TopSearchHeader
      placeholder="搜索课程、商品"
      @focus-search="showSearch = true"
      @open-messages="$router.push('/messages')"
    />

    <!-- 学习进度卡片 -->
    <section class="learn-section">
      <div class="progress-card">
        <div class="progress-header">
          <h2 class="progress-title">我的学习</h2>
          <span class="progress-days">连续学习 7 天</span>
        </div>
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-value">12</span>
            <span class="stat-label">在学课程</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">3</span>
            <span class="stat-label">已完成</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">128h</span>
            <span class="stat-label">学习时长</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">850</span>
            <span class="stat-label">积分</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 子频道切换（课程/商城） -->
    <section class="learn-section">
      <div class="learn-tabs">
        <button
          v-for="t in subTabs"
          :key="t.key"
          class="learn-tab"
          :class="{ active: activeSubTab === t.key }"
          @click="activeSubTab = t.key"
        >{{ t.label }}</button>
      </div>
    </section>

    <!-- 课程列表 -->
    <template v-if="activeSubTab === 'course'">
      <section class="learn-section">
        <div class="course-list">
          <div
            v-for="course in courses"
            :key="course.id"
            class="course-card"
          >
            <div class="course-cover" :style="{ background: course.coverColor }">
              <span class="course-emoji">📖</span>
            </div>
            <div class="course-body">
              <h4 class="course-title">{{ course.title }}</h4>
              <div class="course-meta">
                <span>{{ course.author }}</span>
                <span>·</span>
                <span>{{ course.duration }}</span>
              </div>
              <div class="course-footer">
                <span class="course-price" :class="{ free: course.price === 0 }">
                  {{ course.price === 0 ? '免费' : '¥' + course.price }}
                </span>
                <span v-if="course.progress" class="course-progress">
                  已学 {{ course.progress }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- 商城商品（复用现有 API） -->
    <template v-else>
      <section class="learn-section">
        <a-spin :spinning="productLoading">
          <div class="product-grid">
            <div
              v-for="p in products"
              :key="p.id"
              class="product-card"
              @click="$router.push({ name: 'productDetail', params: { id: p.id } })"
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
          <div v-if="!productLoading && products.length === 0" class="empty-state">
            <a-empty description="暂无商品" />
          </div>
        </a-spin>
      </section>
    </template>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TopSearchHeader from '@/components/TopSearchHeader.vue'
import { getFrontProductList, imgUrl } from '@/api'

const route = useRoute()

const showSearch = ref(false)
const activeSubTab = ref('course')

const subTabs = [
  { key: 'course', label: '课程' },
  { key: 'mall', label: '商城' },
]

// Mock 课程数据
const courses = ref([
  { id: 'c1', title: 'Vue 3 + TypeScript 实战教程', coverColor: '#D8F0E8', author: '张老师', duration: '32课时', price: 199, progress: 45 },
  { id: 'c2', title: 'Python 数据分析从入门到精通', coverColor: '#E8E0F8', author: '李老师', duration: '48课时', price: 0, progress: 78 },
  { id: 'c3', title: 'React Native 跨平台开发', coverColor: '#D8E8FD', author: '王老师', duration: '24课时', price: 299, progress: 12 },
  { id: 'c4', title: 'UI/UX 设计思维', coverColor: '#FDE8F0', author: '陈老师', duration: '16课时', price: 149, progress: 0 },
])

// 商品数据
const products = ref<any[]>([])
const productLoading = ref(false)

async function loadProducts() {
  productLoading.value = true
  try {
    const res = await getFrontProductList({ pageNo: 1, pageSize: 12 })
    if (res) products.value = res.records || []
  } catch {
    products.value = []
  } finally {
    productLoading.value = false
  }
}

// 从 query param 读取默认 tab
onMounted(() => {
  if (route.query.tab === 'mall') {
    activeSubTab.value = 'mall'
    loadProducts()
  }
  // 预加载商品
  loadProducts()
})
</script>

<style scoped>
.learn-page {
  padding: 0 16px;
  max-width: 480px;
  margin: 0 auto;
}
.learn-section {
  margin-bottom: 20px;
}

/* ===== 学习进度卡 ===== */
.progress-card {
  background: #E8E0F8;
  border-radius: 20px;
  padding: 20px;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}
.progress-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.02em;
}
.progress-days {
  font-size: 12px;
  color: #666;
  font-weight: 340;
}
.progress-stats {
  display: flex;
  gap: 8px;
}
.stat-item {
  flex: 1;
  text-align: center;
  background: rgba(255,255,255,0.6);
  border-radius: 14px;
  padding: 12px 4px;
}
.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;
}
.stat-label {
  display: block;
  font-size: 11px;
  color: #888;
  margin-top: 2px;
  font-weight: 340;
}

/* ===== 子频道 Tab ===== */
.learn-tabs {
  display: flex;
  gap: 4px;
}
.learn-tab {
  flex: 1;
  padding: 10px 0;
  border-radius: 50px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  font-weight: 480;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s;
  text-align: center;
}
.learn-tab.active {
  background: #1a1a1a;
  color: #fff;
}

/* ===== 课程列表 ===== */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.course-card {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s;
}
.course-card:active {
  transform: scale(0.98);
}
.course-cover {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.course-emoji {
  font-size: 32px;
}
.course-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.course-title {
  font-size: 15px;
  font-weight: 540;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.course-meta {
  font-size: 12px;
  color: #999;
  font-weight: 340;
  margin: 4px 0;
}
.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.course-price {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}
.course-price.free {
  color: #4CAF50;
  font-size: 14px;
}
.course-progress {
  font-size: 11px;
  color: #666;
  font-weight: 340;
}

/* ===== 商城商品（同首页样式） ===== */
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
.product-card:active { transform: scale(0.97); }
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

/* 底部留白 */
.bottom-spacer {
  height: 100px;
}
</style>
