<template>
  <view class="page">
    <!-- 顶部标题栏 -->
    <view class="home-header">
      <view>
        <text class="home-title">盛桦</text>
        <text class="home-subtitle">商城 · 学堂 · 社区</text>
      </view>
      <view class="header-actions">
        <view class="header-icon" @tap="goCart">
          <Icon icon="solar:cart-large-2-bold" :size="20" color="#111" />
        </view>
        <view class="header-icon" @tap="goMessages">
          <Icon icon="solar:bell-bold" :size="20" color="#111" />
          <view v-if="msgBadge > 0" class="header-badge">
            <text class="badge-text">{{ msgBadge > 99 ? '99+' : msgBadge }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 搜索入口 -->
    <view class="search-card" @tap="goSearch">
      <Icon icon="solar:magnifer-bold" :size="18" color="var(--color-text-hint)" />
      <text class="search-text">搜索商品、课程、帖子</text>
    </view>

    <!-- Hero 推荐卡片 -->
    <view class="color-block-section color-block-section-navy hero-section" @tap="heroProduct && goProduct(heroProduct.id)">
      <view class="hero-copy">
        <text class="block-eyebrow" style="color: rgba(255,255,255,0.6);">TODAY</text>
        <text class="hero-title">{{ heroProduct?.spuName || '发现盛桦精选' }}</text>
        <text class="hero-sub">{{ heroProduct ? '今日商城推荐' : '商品、好课和社区内容都会在这里聚合' }}</text>
      </view>
      <image v-if="heroProduct?.mainImage" :src="imgUrl(heroProduct.mainImage)" class="hero-img" mode="aspectFill" />
    </view>

    <!-- 快捷入口 -->
    <view class="quick-grid">
      <view class="quick-item" @tap="goMall">
        <text class="quick-title">商城</text>
        <text class="quick-sub">分类好物</text>
      </view>
      <view class="quick-item" @tap="navigateToPage('/pages/learn/index')">
        <text class="quick-title">学习</text>
        <text class="quick-sub">课程进度</text>
      </view>
      <view class="quick-item" @tap="navigateToPage('/pages/seckill/index')">
        <text class="quick-title">秒杀</text>
        <text class="quick-sub">限时抢购</text>
      </view>
      <view class="quick-item" @tap="navigateToPage('/pages/community/index')">
        <text class="quick-title">社区</text>
        <text class="quick-sub">逛逛动态</text>
      </view>
    </view>

    <!-- 商品分类 -->
    <view class="section" v-if="categories.length">
      <view class="section-header">
        <text class="section-title">商品分类</text>
        <text class="section-more" @tap="goCategory()">全部</text>
      </view>
      <scroll-view scroll-x class="category-scroll">
        <view v-for="cat in categories" :key="cat.id" class="category-pill" @tap="goCategory(cat.id)">
          <text class="category-name">{{ cat.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 商城精选 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">商城精选</text>
        <text class="section-more" @tap="goMall">更多</text>
      </view>
      <view v-if="productGrid.length" class="product-grid">
        <view v-for="item in productGrid" :key="item.id" class="product-card" @tap="goProduct(item.id)">
          <view class="product-img-wrap">
            <image v-if="item.mainImage" :src="imgUrl(item.mainImage)" class="product-img" mode="aspectFill" />
            <view v-else class="product-img empty-img" />
          </view>
          <view class="product-info-wrap">
            <text class="product-name">{{ item.spuName }}</text>
            <text class="product-price price-commerce">¥{{ item.minPrice || 0 }}</text>
          </view>
        </view>
      </view>
      <view v-else class="inline-empty">
        <text class="inline-empty-text">暂无精选商品</text>
      </view>
    </view>

    <!-- 限时活动 -->
    <view class="section" v-if="promoList.length">
      <view class="section-header">
        <text class="section-title">限时活动</text>
      </view>
      <view class="color-block-section color-block-section-lime">
        <text class="block-eyebrow">LIMITED TIME PROMO</text>
        <view class="promo-list-container">
          <view v-for="item in promoList" :key="item.id" class="promo-item-card" @tap="goProduct(item.spuId || item.id)">
            <view class="promo-top-row">
              <text class="promo-item-badge">{{ item.promoType }}</text>
              <text class="promo-item-title">{{ item.spuName || item.productName || '活动商品' }}</text>
            </view>
            <view class="promo-bottom-row">
              <text class="promo-item-price price-commerce">¥{{ item.seckillPrice || item.groupPrice || item.price || 0 }}</text>
              <view class="promo-action-btn">抢购</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 继续学习 -->
    <view class="section" v-if="courseList.length">
      <view class="section-header">
        <text class="section-title">继续学习</text>
        <text class="section-more" @tap="navigateToPage('/pages/learn/index')">学习中心</text>
      </view>
      <view class="color-block-section color-block-section-lilac">
        <text class="block-eyebrow">ACADEMY PROGRESS</text>
        <view class="course-list-container">
          <view v-for="course in courseList" :key="course.id" class="course-item-row" @tap="goCourse(course.id)">
            <text class="course-item-title">{{ course.title || course.courseName }}</text>
            <view class="course-item-footer">
              <text class="course-item-lecturer">{{ course.lecturerName || '盛桦讲师' }}</text>
              <view class="course-action-btn">学习</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 社区热帖 -->
    <view class="section" v-if="postList.length">
      <view class="section-header">
        <text class="section-title">社区热帖</text>
        <text class="section-more" @tap="navigateToPage('/pages/community/index')">逛逛</text>
      </view>
      <view class="color-block-section color-block-section-mint">
        <text class="block-eyebrow">COMMUNITY BUZZ</text>
        <view class="post-list-container">
          <view v-for="post in postList" :key="post.id" class="post-item-row" @tap="goPost(post.id)">
            <text class="post-item-title">{{ post.title || post.content }}</text>
            <view class="post-item-footer">
              <text class="post-item-likes">{{ post.likeCount || 0 }} 赞</text>
              <view class="post-action-btn">阅读</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-spacer" />
    <CustomTabBar :active="0" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import {
  getCategoryTree,
  getFrontProductList,
  getSeckillProductList,
  getGroupBuyList,
  getPostFrontList,
  imgUrl,
} from '@/api'
import http from '@/utils/http'
import { goCart, goMall, navigateToPage } from '@/utils/navigation'
import CustomTabBar from '@/components/CustomTabBar.vue'

const loading = ref(false)
const products = ref<any[]>([])
const categories = ref<any[]>([])
const courses = ref<any[]>([])
const posts = ref<any[]>([])
const seckillProducts = ref<any[]>([])
const groupBuys = ref<any[]>([])
const msgBadge = ref(0)

const heroProduct = computed(() => products.value[0] || null)
const productGrid = computed(() => products.value.slice(0, 6))
const courseList = computed(() => courses.value.slice(0, 3))
const postList = computed(() => posts.value.slice(0, 3))
const promoList = computed(() => [
  ...seckillProducts.value.slice(0, 1).map(item => ({ ...item, promoType: '秒杀' })),
  ...groupBuys.value.slice(0, 1).map(item => ({ ...item, promoType: '拼团' })),
])

/* ---- 数据加载 ---- */

async function loadCategories() {
  try {
    const res = await getCategoryTree()
    categories.value = Array.isArray(res) ? res.slice(0, 8) : []
  } catch {
    categories.value = []
  }
}

async function loadProducts() {
  try {
    const res: any = await getFrontProductList({ pageNo: 1, pageSize: 8 })
    products.value = res?.records || []
  } catch {
    products.value = []
  }
}

async function loadCourses() {
  try {
    const res: any = await http.get('/course/list', { params: { pageNo: 1, pageSize: 4 } })
    courses.value = res?.records || []
  } catch {
    courses.value = []
  }
}

async function loadPosts() {
  try {
    const res: any = await getPostFrontList({ pageNo: 1, pageSize: 4 })
    posts.value = res?.records || []
  } catch {
    posts.value = []
  }
}

async function loadPromotions() {
  try {
    const [seckillRes, groupRes] = await Promise.all([
      getSeckillProductList({ pageNo: 1, pageSize: 2 }).catch(() => ({ records: [] })),
      getGroupBuyList({ pageNo: 1, pageSize: 2 }).catch(() => ({ records: [] })),
    ])
    seckillProducts.value = (seckillRes as any)?.records || []
    groupBuys.value = (groupRes as any)?.records || []
  } catch {
    seckillProducts.value = []
    groupBuys.value = []
  }
}

async function refreshHome() {
  loading.value = true
  try {
    await Promise.all([
      loadCategories(),
      loadProducts(),
      loadCourses(),
      loadPosts(),
      loadPromotions(),
    ])
  } finally {
    loading.value = false
  }
}

/* ---- 导航操作 ---- */

function goSearch() {
  goMall()
}

function goMessages() {
  uni.navigateTo({ url: '/pages/message/index' })
}

function goProduct(id: string) {
  uni.navigateTo({ url: '/pages/product/detail?id=' + id })
}

function goCourse(id: string) {
  uni.navigateTo({ url: '/pages/course/detail?id=' + id })
}

function goPost(id: string) {
  uni.navigateTo({ url: '/pages/community/detail?id=' + id })
}

function goCategory(id?: string) {
  if (id) uni.setStorageSync('mall_target_category_id', id)
  goMall()
}

onLoad(refreshHome)
onShow(() => {
  uni.hideTabBar({ animation: false })
  if (products.value.length === 0 && !loading.value) refreshHome()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding: 44px 16px 16px;
  box-sizing: border-box;
}

/* ---- 顶部标题栏 ---- */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.home-title {
  display: block;
  font-size: 28px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-text, #111);
  letter-spacing: var(--letter-spacing-display, -0.5px);
}

.home-subtitle {
  display: block;
  margin-top: 2px;
  font-size: var(--font-sm, 12px);
  color: var(--color-text-secondary, #666);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.header-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full, 999px);
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.header-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  background: var(--color-commerce, #e4393c);
  border-radius: var(--radius-full, 999px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.badge-text {
  font-size: 10px;
  color: #fff;
  font-weight: var(--weight-bold, 700);
}

/* ---- 搜索 ---- */
.search-card {
  height: 42px;
  border-radius: var(--radius-full, 999px);
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 14px;
}

.search-text {
  font-size: var(--font-base, 14px);
  color: var(--color-text-hint, #999);
}

/* ---- Hero section ---- */
.hero-section {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  min-height: 140px;
}

.hero-copy {
  flex: 1;
  min-width: 0;
}

.hero-title {
  display: block;
  margin-top: 6px;
  font-size: 20px;
  line-height: 1.25;
  color: #ffffff;
  font-weight: var(--weight-bold, 700);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-sub {
  display: block;
  margin-top: 8px;
  font-size: var(--font-sm, 12px);
  color: rgba(255, 255, 255, 0.7);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-img {
  width: 96px;
  height: 96px;
  border-radius: var(--radius-md, 12px);
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

/* ---- 快捷入口 ---- */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 18px;
}

.quick-item {
  border-radius: var(--radius-md, 12px);
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  padding: 12px 6px;
  min-height: 72px;
  box-sizing: border-box;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.quick-item:active {
  background: var(--color-bg-page, #f7f7f8);
}

.quick-title {
  display: block;
  font-size: var(--font-base, 14px);
  font-weight: var(--weight-bold, 700);
  color: var(--color-text, #111);
}

.quick-sub {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  color: var(--color-text-secondary, #666);
}

/* ---- 通用 Section ---- */
.section {
  margin-bottom: 18px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-title {
  font-size: var(--font-lg, 16px);
  font-weight: var(--weight-bold, 700);
  color: var(--color-text, #111);
  letter-spacing: var(--letter-spacing-display, -0.5px);
}

.section-more {
  font-size: var(--font-sm, 12px);
  color: var(--color-text-secondary, #666);
}

/* ---- 分类横滑 ---- */
.category-scroll {
  white-space: nowrap;
}

.category-pill {
  display: inline-flex;
  padding: 6px 14px;
  border-radius: var(--radius-full, 999px);
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  margin-right: 8px;
}

.category-pill:active {
  background: var(--color-bg, #f5f5f5);
}

.category-name {
  font-size: var(--font-sm, 12px);
  color: var(--color-text, #111);
  font-weight: var(--weight-medium, 500);
}

/* ---- 商品网格 ---- */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.product-card {
  background: var(--color-card, #fff);
  border-radius: var(--radius-lg, 16px);
  border: 1px solid var(--color-border, #eee);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.product-card:active {
  background: var(--color-bg-page, #f7f7f8);
}

.product-img-wrap {
  width: 100%;
  aspect-ratio: 1;
  background: var(--color-bg, #f5f5f5);
}

.product-img {
  width: 100%;
  height: 100%;
}

.empty-img {
  background: linear-gradient(135deg, #f5f5f5, #fafafa);
}

.product-info-wrap {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: var(--font-sm, 12px);
  line-height: 1.4;
  color: var(--color-text, #1a1a1a);
  min-height: 34px;
}

.product-price {
  font-size: var(--font-md, 15px);
  font-weight: var(--weight-bold, 700);
}

/* ---- 限时促销/秒杀色块 ---- */
.promo-list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.promo-item-card {
  background: #ffffff;
  border-radius: var(--radius-md, 12px);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.promo-top-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.promo-item-badge {
  background: var(--color-commerce, #e4393c);
  color: #ffffff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-full, 999px);
  font-weight: var(--weight-bold, 700);
  flex-shrink: 0;
}

.promo-item-title {
  font-size: var(--font-sm, 12px);
  color: #111111;
  font-weight: var(--weight-semibold, 600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.promo-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.promo-item-price {
  font-size: var(--font-lg, 16px);
  font-weight: var(--weight-bold, 700);
}

.promo-action-btn {
  background: #111111;
  color: #ffffff;
  font-size: var(--font-sm, 12px);
  font-weight: var(--weight-bold, 700);
  padding: 4px 14px;
  border-radius: var(--radius-full, 999px);
}

/* ---- 课程色块 ---- */
.course-list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-item-row {
  background: #ffffff;
  border-radius: var(--radius-md, 12px);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-item-title {
  font-size: var(--font-sm, 12px);
  color: #111111;
  font-weight: var(--weight-semibold, 600);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.course-item-lecturer {
  font-size: var(--font-xs, 10px);
  color: var(--color-text-secondary, #666);
}

.course-action-btn, .post-action-btn {
  background: #111111;
  color: #ffffff;
  font-size: var(--font-sm, 12px);
  font-weight: var(--weight-bold, 700);
  padding: 4px 14px;
  border-radius: var(--radius-full, 999px);
}

/* ---- 帖子色块 ---- */
.post-list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-item-row {
  background: #ffffff;
  border-radius: var(--radius-md, 12px);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-item-title {
  font-size: var(--font-sm, 12px);
  color: #111111;
  font-weight: var(--weight-semibold, 600);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-item-likes {
  font-size: var(--font-xs, 10px);
  color: var(--color-text-secondary, #666);
}

/* ---- 空状态 ---- */
.inline-empty {
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-lg, 16px);
  padding: 24px;
  text-align: center;
}

.inline-empty-text {
  font-size: var(--font-sm, 12px);
  color: var(--color-text-hint, #999);
}

.bottom-spacer {
  height: 76px;
}
</style>
