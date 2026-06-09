<template>
  <view class="page">
    <!-- 骨架屏 -->
    <SkeletonPage v-if="loading && products.length === 0" type="home" />

    <!-- 主内容 -->
    <view v-else class="page-enter">
      <!-- 顶部深色标题栏与搜索区 -->
      <view class="home-header-wrap">
        <view class="home-header slide-up">
          <view>
            <text class="home-title">盛桦</text>
            <text class="home-subtitle">MALL · ACADEMY · COMMUNITY</text>
          </view>
          <view class="header-actions">
            <view class="header-icon pressable" @tap="goCart">
              <Icon icon="solar:cart-large-2-bold" :size="20" color="#fff" />
            </view>
            <view class="header-icon pressable" @tap="goMessages">
              <Icon icon="solar:bell-bold" :size="20" color="#fff" />
              <view v-if="msgBadge > 0" class="header-badge">
                <text class="badge-text">{{ msgBadge > 99 ? '99+' : msgBadge }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 搜索入口 -->
        <view class="search-card slide-up delay-1 pressable" @tap="goSearch">
          <Icon icon="solar:magnifer-bold" :size="18" color="rgba(255, 255, 255, 0.4)" />
          <text class="search-text">搜索商品、课程、帖子</text>
        </view>
      </view>

      <!-- Hero 今日推荐卡片 -->
      <view class="color-block-section color-block-section-navy hero-section slide-up delay-2 pressable" @tap="heroProduct && goProduct(heroProduct.id)">
        <view class="hero-copy">
          <text class="block-eyebrow">TODAY'S SPECIAL</text>
          <text class="hero-title">{{ heroProduct?.spuName || '发现盛桦精选' }}</text>
          <text class="hero-sub">{{ heroProduct ? '今日商城推荐商品，速来抢购' : '好物、好课和社区动态，为您精选推荐' }}</text>
          <view class="hero-btn">
            <text class="hero-btn-text">立即查看</text>
          </view>
        </view>
        <image v-if="heroProduct?.mainImage" :src="imgUrl(heroProduct.mainImage)" class="hero-img" mode="aspectFill" />
      </view>

      <!-- 快捷入口 -->
      <view class="quick-grid">
        <view class="quick-item pressable slide-up delay-3" @tap="goMall">
          <view class="quick-icon-wrap bg-cream">
            <Icon icon="solar:shop-2-bold" :size="22" color="#FF6B35" />
          </view>
          <text class="quick-title">商城</text>
          <text class="quick-sub">精选好物</text>
        </view>
        <view class="quick-item pressable slide-up delay-4" @tap="navigateToPage('/pages/learn/index')">
          <view class="quick-icon-wrap bg-lilac">
            <Icon icon="solar:notebook-bold" :size="22" color="#8B5CF6" />
          </view>
          <text class="quick-title">学堂</text>
          <text class="quick-sub">学习中心</text>
        </view>
        <view class="quick-item pressable slide-up delay-5" @tap="navigateToPage('/pages/seckill/index')">
          <view class="quick-icon-wrap bg-coral">
            <Icon icon="solar:bomb-bold" :size="22" color="#EF4444" />
          </view>
          <text class="quick-title">秒杀</text>
          <text class="quick-sub">限时抢购</text>
        </view>
        <view class="quick-item pressable slide-up delay-6" @tap="navigateToPage('/pages/community/index')">
          <view class="quick-icon-wrap bg-mint">
            <Icon icon="solar:users-group-rounded-bold" :size="22" color="#22C55E" />
          </view>
          <text class="quick-title">社区</text>
          <text class="quick-sub">逛逛动态</text>
        </view>
      </view>

      <!-- 商品分类 -->
      <view class="section slide-up delay-4" v-if="categories.length">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-eyebrow">CATEGORIES</text>
            <text class="section-title">商品分类</text>
          </view>
          <view class="section-more" @tap="goCategory()">
            <text class="more-text">全部</text>
            <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
          </view>
        </view>
        <scroll-view scroll-x class="category-scroll">
          <view v-for="cat in categories" :key="cat.id" class="category-pill pressable" @tap="goCategory(cat.id)">
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 商城精选 -->
      <view class="section slide-up delay-5">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-eyebrow">MALL SELECTIONS</text>
            <text class="section-title">商城精选</text>
          </view>
          <view class="section-more" @tap="goMall">
            <text class="more-text">更多</text>
            <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
          </view>
        </view>
        <view v-if="productGrid.length" class="product-grid">
          <view v-for="(item, idx) in productGrid" :key="item.id" class="product-card pressable fade-in" :class="'delay-' + (idx + 1)" @tap="goProduct(item.id)">
            <view class="product-img-wrap">
              <image v-if="item.mainImage" :src="imgUrl(item.mainImage)" class="product-img" mode="aspectFill" />
              <view v-else class="product-img empty-img" />
            </view>
            <view class="product-info-wrap">
              <text class="product-name">{{ item.spuName }}</text>
              <text class="product-price">¥{{ item.minPrice || 0 }}</text>
            </view>
          </view>
        </view>
        <view v-else class="inline-empty">
          <text class="inline-empty-text">暂无精选商品</text>
        </view>
      </view>

      <!-- 限时活动 -->
      <view class="section slide-up delay-6" v-if="promoList.length">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-eyebrow">FLASH PROMOTIONS</text>
            <text class="section-title">限时活动</text>
          </view>
        </view>
        <view class="color-block-section color-block-section-lime">
          <text class="block-eyebrow">LIMITED TIME PROMO</text>
          <view class="promo-list-container">
            <view v-for="item in promoList" :key="item.id" class="promo-item-card pressable" @tap="goProduct(item.spuId || item.id)">
              <view class="promo-top-row">
                <text class="promo-item-badge">{{ item.promoType }}</text>
                <text class="promo-item-title">{{ item.spuName || item.productName || '活动商品' }}</text>
              </view>
              <view class="promo-bottom-row">
                <text class="promo-item-price">¥{{ item.seckillPrice || item.groupPrice || item.price || 0 }}</text>
                <view class="promo-action-btn">
                  <text class="btn-text-small">马上抢</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 继续学习 -->
      <view class="section slide-up delay-7" v-if="courseList.length">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-eyebrow">ACADEMY PROGRESS</text>
            <text class="section-title">继续学习</text>
          </view>
          <view class="section-more" @tap="navigateToPage('/pages/learn/index')">
            <text class="more-text">学习中心</text>
            <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
          </view>
        </view>
        <view class="color-block-section color-block-section-lilac">
          <text class="block-eyebrow">RECENT LESSONS</text>
          <view class="course-list-container">
            <view v-for="course in courseList" :key="course.id" class="course-item-row pressable" @tap="goCourse(course.id)">
              <text class="course-item-title">{{ course.title || course.courseName }}</text>
              <view class="course-item-footer">
                <text class="course-item-lecturer">{{ course.lecturerName || '盛桦讲师' }}</text>
                <view class="course-action-btn">
                  <text class="btn-text-small">继续学习</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 社区热帖 -->
      <view class="section slide-up delay-8" v-if="postList.length">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-eyebrow">COMMUNITY BUZZ</text>
            <text class="section-title">社区热帖</text>
          </view>
          <view class="section-more" @tap="navigateToPage('/pages/community/index')">
            <text class="more-text">逛逛</text>
            <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
          </view>
        </view>
        <view class="color-block-section color-block-section-mint">
          <text class="block-eyebrow">COMMUNITY HOT</text>
          <view class="post-list-container">
            <view v-for="post in postList" :key="post.id" class="post-item-row pressable" @tap="goPost(post.id)">
              <text class="post-item-title">{{ post.title || post.content }}</text>
              <view class="post-item-footer">
                <view class="post-likes-row">
                  <Icon icon="solar:heart-bold" :size="12" color="var(--text-secondary)" />
                  <text class="post-item-likes">{{ post.likeCount || 0 }} 赞</text>
                </view>
                <view class="post-action-btn">
                  <text class="btn-text-small">阅读全文</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </view>

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
import SkeletonPage from '@/components/SkeletonPage.vue'

const loading = ref(false)
const products = ref<any[]>([])
const categories = ref<any[]>([])
const courses = ref<any[]>([])
const posts = ref<any[]>([])
const seckillProducts = ref<any[]>([])
const groupBuys = ref<any[]>([])
const msgBadge = ref(0)

const heroProduct = computed(() => products.value[0] || null)
const productGrid = computed(() => products.value.slice(1, 7))
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
  background: var(--bg-page);
  padding: 0 0 16px;
  box-sizing: border-box;
}

/* ---- 顶部深色标题栏与搜索区 ---- */
.home-header-wrap {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 44px 16px 16px;
  border-bottom-left-radius: var(--radius-2xl);
  border-bottom-right-radius: var(--radius-2xl);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.home-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
}

.home-title {
  display: block;
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  background: linear-gradient(135deg, #ffffff 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: var(--letter-spacing-display, -0.5px);
  line-height: 1.1;
}

.home-subtitle {
  display: block;
  margin-top: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  letter-spacing: var(--letter-spacing-mono, 1.5px);
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  font-weight: var(--weight-bold);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background 0.15s;
}

.header-icon:active {
  background: rgba(255, 255, 255, 0.2);
}

.header-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  background: var(--color-danger);
  border-radius: var(--radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 1.5px solid var(--color-primary);
}

.badge-text {
  font-size: 9px;
  color: #fff;
  font-weight: var(--weight-bold);
}

/* 搜索框 (深色背景半透明) */
.search-card {
  height: 40px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
}

.search-text {
  font-size: var(--font-md);
  color: rgba(255, 255, 255, 0.4);
}

/* ---- Hero section (Navy 柔和底) ---- */
.hero-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  min-height: 130px;
  margin: 0 16px 16px;
  background: linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.hero-title {
  display: block;
  margin-top: 6px;
  font-size: var(--font-xl);
  line-height: 1.3;
  color: #ffffff;
  font-weight: var(--weight-bold);
  letter-spacing: var(--letter-spacing-display, -0.5px);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-sub {
  display: block;
  margin-top: 6px;
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-btn {
  align-self: flex-start;
  margin-top: 12px;
  background: linear-gradient(135deg, var(--color-accent), #7C3AED);
  padding: 6px 16px;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
}

.hero-btn-text {
  font-size: var(--font-xs);
  color: #fff;
  font-weight: var(--weight-semibold);
}

.hero-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

/* ---- 快捷网格 ---- */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 20px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.quick-icon-wrap {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.quick-item:active .quick-icon-wrap {
  transform: scale(0.92);
}

.bg-cream { background: #FFF8E7; }
.bg-lilac { background: #F5F3FF; }
.bg-coral { background: #FFECE5; }
.bg-mint { background: #E0F8F1; }

.quick-title {
  display: block;
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.quick-sub {
  display: block;
  font-size: 9px;
  color: var(--text-hint);
}

/* ---- 通用 Section (留白与圆角体系) ---- */
.section {
  margin-bottom: 20px;
  padding: 0 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-eyebrow {
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  letter-spacing: var(--letter-spacing-mono, 1.5px);
  text-transform: uppercase;
  color: var(--text-hint);
  font-weight: var(--weight-semibold);
}

.section-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  letter-spacing: var(--letter-spacing-display, -0.5px);
}

.section-more {
  display: flex;
  align-items: center;
  gap: 2px;
}

.more-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* ---- 分类横滑 (药丸形药片) ---- */
.category-scroll {
  white-space: nowrap;
  padding-bottom: 4px;
}

.category-pill {
  display: inline-flex;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  margin-right: 8px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.category-pill:active {
  background: linear-gradient(135deg, var(--color-accent), #7C3AED);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.category-pill:active .category-name {
  color: #fff;
}

.category-name {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

/* ---- 商品网格 (纯白精致圆角卡片) ---- */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.product-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
}

.product-card:active {
  transform: translateY(-2px) scale(0.98);
  box-shadow: var(--shadow-md);
}

.product-img-wrap {
  width: 100%;
  aspect-ratio: 1.25;
  background: var(--bg-gray);
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
}

.empty-img {
  background: linear-gradient(135deg, var(--bg-page), #fff);
}

.product-info-wrap {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: var(--font-sm);
  line-height: 1.4;
  color: var(--text-primary);
  min-height: 34px;
  font-weight: var(--weight-medium);
}

.product-price {
  font-size: var(--font-lg);
  font-weight: var(--weight-bold);
  color: var(--color-accent);
}

/* ---- 促销、课程与热帖 (柔和色块卡片体系) ---- */
.color-block-section {
  border-radius: var(--radius-lg);
  padding: 16px;
}

.color-block-section-navy {
  background: var(--color-primary);
  color: #fff;
}

.color-block-section-lime {
  background: linear-gradient(135deg, #fbfdf0 0%, #f4fcd3 100%);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(226, 248, 118, 0.3);
}

.color-block-section-lilac {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(139, 92, 246, 0.15);
}

.color-block-section-mint {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(34, 197, 94, 0.15);
}

.block-eyebrow {
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  letter-spacing: var(--letter-spacing-mono, 1.5px);
  text-transform: uppercase;
  font-weight: var(--weight-bold);
  margin-bottom: 10px;
  display: block;
}

.promo-list-container,
.course-list-container,
.post-list-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.promo-item-card,
.course-item-row,
.post-item-row {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease;
}

.promo-item-card:active,
.course-item-row:active,
.post-item-row:active {
  transform: translateY(-1px);
}

.promo-top-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.promo-item-badge {
  background: var(--color-primary);
  color: #ffffff;
  font-size: 9px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
}

.promo-item-title,
.course-item-title,
.post-item-title {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
  line-height: 1.4;
}

.promo-item-title,
.post-item-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.course-item-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.promo-bottom-row,
.course-item-footer,
.post-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.promo-item-price {
  font-size: var(--font-lg);
  font-weight: var(--weight-bold);
  color: var(--color-danger);
}

.course-item-lecturer,
.post-item-likes {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.post-likes-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.promo-action-btn,
.course-action-btn,
.post-action-btn {
  background: linear-gradient(135deg, var(--color-accent), #7C3AED);
  padding: 5px 14px;
  border-radius: var(--radius-full);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
  transition: opacity 0.2s;
}

.btn-text-small {
  font-size: var(--font-xs);
  color: #ffffff;
  font-weight: var(--weight-semibold);
}

/* ---- 空状态 ---- */
.inline-empty {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.inline-empty-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.bottom-spacer {
  height: 80px;
}
</style>
