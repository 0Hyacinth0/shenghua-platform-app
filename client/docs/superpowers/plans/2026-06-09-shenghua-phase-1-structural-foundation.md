# ShengHua Phase 1 Structural Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current course-dominant frontend into a coherent mall + learning + community shell with the selected TabBar, shared navigation helpers, unified tokens, and an API-backed aggregated homepage.

**Architecture:** This phase establishes app structure without completing every page. `pages.json` owns route registration and TabBar membership, `src/utils/navigation.ts` centralizes tab/non-tab navigation decisions, `src/styles/tokens.css` becomes the global token source, and `pages/home/index.vue` becomes a cross-domain aggregation page that never falls back to misleading fake commerce data.

**Tech Stack:** UniApp, Vue 3 `<script setup>`, TypeScript, `uni.request` through the existing `http` wrapper, Iconify, existing `src/api/index.ts` exports.

---

## Scope Boundary

This plan implements Phase 1 from the approved spec:

- TabBar: `首页 / 商城 / 学习 / 社区 / 我的`
- `pages/mall/index` becomes a TabBar page.
- `pages/cart/index` remains a normal page.
- Invalid cart navigation is fixed.
- Tokens are consolidated enough for Phase 1 pages to share one visual language.
- Homepage becomes an aggregated page using real API calls and honest empty states.

This plan does not complete the full commerce main flow. Product detail image carousel, order image rendering, seckill/group-buy demo removal, course endpoint hardening, and profile/merchant/distributor polish are handled by later phase plans.

## Files

- Modify: `src/pages.json`
  - Register `pages/mall/index` near the other TabBar pages.
  - Replace current TabBar with home, mall, learn, community, profile.
  - Set global title back to `盛桦商城`.
- Create: `src/utils/navigation.ts`
  - Centralize `switchTab` vs `navigateTo` decisions.
  - Provide helpers for home, mall, cart, learn, community, profile.
- Modify: `src/styles/tokens.css`
  - Make it the single CSS variable source with compatibility aliases.
- Modify: `src/uni.scss`
  - Align SCSS variables with the CSS token values.
- Modify: `src/pages/home/index.vue`
  - Replace course-only content with a cross-domain aggregate.
  - Remove hardcoded course recommendation arrays.
  - Use mall/product, course, and community APIs with empty-state fallback.
- Modify: `src/pages/mall/index.vue`
  - Add cart shortcut, lightweight product search, and stored category handoff from home.
- Modify: `src/pages/product/detail.vue`
  - Fix cart navigation to `navigateTo`.
  - Route "more products" to the mall tab instead of a missing product list page.
- Modify: `src/pages/coupon/index.vue`
  - Fix "go shop" behavior now that mall is a TabBar page.
- Modify: `src/pages/learn/index.vue`
  - Update local tab-page detection to include mall.

## Verification Policy

This repository has no automated test runner configured. Do not add a test framework in Phase 1. Use these checks instead:

- Build check: `pnpm build:h5`
- Static route check: `rg "switchTab\\(\\{ url: '/pages/cart/index'|/pages/product/list" src/pages`
- Browser smoke check after implementation: open the H5 app and verify each TabBar item, home aggregate page, mall page, product detail cart button, and coupon shop button.

## Task 1: Add Shared Navigation Helpers

**Files:**
- Create: `src/utils/navigation.ts`

- [ ] **Step 1: Create the navigation helper file**

Create `src/utils/navigation.ts` with this content:

```ts
const TAB_PAGE_URLS = new Set([
  '/pages/home/index',
  '/pages/mall/index',
  '/pages/learn/index',
  '/pages/community/index',
  '/pages/profile/index',
])

export function isTabPage(url: string): boolean {
  const path = url.split('?')[0]
  return TAB_PAGE_URLS.has(path)
}

export function navigateToPage(url: string) {
  if (isTabPage(url)) {
    uni.switchTab({ url: url.split('?')[0] })
    return
  }
  uni.navigateTo({ url })
}

export function goHome() {
  uni.switchTab({ url: '/pages/home/index' })
}

export function goMall() {
  uni.switchTab({ url: '/pages/mall/index' })
}

export function goLearn() {
  uni.switchTab({ url: '/pages/learn/index' })
}

export function goCommunity() {
  uni.switchTab({ url: '/pages/community/index' })
}

export function goProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}

export function goCart() {
  uni.navigateTo({ url: '/pages/cart/index' })
}
```

- [ ] **Step 2: Run build to verify the new file does not break path aliasing**

Run:

```bash
pnpm build:h5
```

Expected: build completes with `DONE  Build complete.`

- [ ] **Step 3: Commit**

Run:

```bash
git add src/utils/navigation.ts
git commit -m "feat: add shared navigation helpers"
```

## Task 2: Consolidate Global Tokens

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/uni.scss`

- [ ] **Step 1: Replace `src/styles/tokens.css` with the Phase 1 token set**

Use this content:

```css
:root {
  --color-primary: #111111;
  --color-primary-dark: #000000;
  --color-primary-light: #f2f2f2;
  --color-primary-gradient: linear-gradient(135deg, #111111 0%, #333333 100%);

  --color-commerce: #e4393c;
  --color-commerce-dark: #c9282c;
  --color-commerce-light: #fff1f0;
  --color-learning: #6d5dfc;
  --color-learning-light: #f1efff;
  --color-community: #12a37f;
  --color-community-light: #e8f8f3;
  --color-accent: #e4393c;
  --color-accent-light: #fff1f0;

  --color-success: #22c55e;
  --color-success-light: #f0fdf4;
  --color-warning: #f59e0b;
  --color-warning-light: #fffbeb;
  --color-danger: #ef4444;
  --color-danger-light: #fef2f2;
  --color-info: #0ea5e9;
  --color-info-light: #e0f2fe;

  --text-primary: #1f1f1f;
  --text-secondary: #666666;
  --text-hint: #999999;
  --text-disabled: #cccccc;
  --text-white: #ffffff;

  --color-text: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-hint: var(--text-hint);
  --color-text-disabled: var(--text-disabled);

  --bg-page: #f6f6f6;
  --bg-card: #ffffff;
  --bg-gray: #f1f1f1;
  --bg-soft: #fafafa;
  --color-bg: var(--bg-gray);
  --color-bg-page: var(--bg-page);
  --color-card: var(--bg-card);
  --color-border: #eeeeee;
  --color-divider: #f0f0f0;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;

  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 999px;
  --radius-circle: 50%;

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.06);

  --font-xs: 11px;
  --font-sm: 12px;
  --font-base: 13px;
  --font-md: 14px;
  --font-lg: 15px;
  --font-xl: 17px;
  --font-2xl: 20px;
  --font-3xl: 24px;
  --font-4xl: 28px;

  --weight-normal: 400;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  --page-padding: 16px;
  --tab-bar-height: 56px;
}
```

- [ ] **Step 2: Replace the top section of `src/uni.scss` variables**

Use these SCSS values so UniApp global variables match the CSS tokens:

```scss
$color-primary: #111111;
$color-primary-dark: #000000;
$color-primary-light: #f2f2f2;
$color-primary-bg: #f6f6f6;

$color-commerce: #e4393c;
$color-learning: #6d5dfc;
$color-community: #12a37f;

$color-bg: #f1f1f1;
$color-bg-page: #f6f6f6;
$color-card: #ffffff;
$color-text: #1f1f1f;
$color-text-secondary: #666666;
$color-text-hint: #999999;
$color-text-disabled: #cccccc;
$color-border: #eeeeee;
$color-divider: #f0f0f0;

$color-success: #22c55e;
$color-warning: #f59e0b;
$color-error: #ef4444;
$color-info: #0ea5e9;
```

Keep the existing spacing, radius, font, weight, shadow, and layout variables after this replacement unless they duplicate the removed values.

- [ ] **Step 3: Run build**

Run:

```bash
pnpm build:h5
```

Expected: build completes with `DONE  Build complete.`

- [ ] **Step 4: Commit**

Run:

```bash
git add src/styles/tokens.css src/uni.scss
git commit -m "style: consolidate phase one design tokens"
```

## Task 3: Update TabBar And Route Registration

**Files:**
- Modify: `src/pages.json`

- [ ] **Step 1: Move `pages/mall/index` into the top TabBar group**

At the start of the `pages` array, make the first five routes:

```json
{ "path": "pages/home/index", "style": { "navigationStyle": "custom" } },
{ "path": "pages/mall/index", "style": { "navigationStyle": "custom" } },
{ "path": "pages/learn/index", "style": { "navigationStyle": "custom" } },
{ "path": "pages/community/index", "style": { "navigationStyle": "custom" } },
{ "path": "pages/profile/index", "style": { "navigationStyle": "custom" } },
```

Remove the later duplicate `pages/mall/index` entry from the `pages` array.

- [ ] **Step 2: Replace the `globalStyle.navigationBarTitleText`**

Set:

```json
"navigationBarTitleText": "盛桦商城"
```

- [ ] **Step 3: Replace the `tabBar` block**

Use:

```json
"tabBar": {
  "color": "#999999",
  "selectedColor": "#111111",
  "borderStyle": "black",
  "backgroundColor": "#FFFFFF",
  "list": [
    {
      "pagePath": "pages/home/index",
      "text": "首页",
      "iconPath": "static/images/tab-home.png",
      "selectedIconPath": "static/images/tab-home-active.png"
    },
    {
      "pagePath": "pages/mall/index",
      "text": "商城",
      "iconPath": "static/images/tab-category.png",
      "selectedIconPath": "static/images/tab-category-active.png"
    },
    {
      "pagePath": "pages/learn/index",
      "text": "学习",
      "iconPath": "static/images/tab-learn.png",
      "selectedIconPath": "static/images/tab-learn-active.png"
    },
    {
      "pagePath": "pages/community/index",
      "text": "社区",
      "iconPath": "static/images/tab-community.png",
      "selectedIconPath": "static/images/tab-community-active.png"
    },
    {
      "pagePath": "pages/profile/index",
      "text": "我的",
      "iconPath": "static/images/tab-user.png",
      "selectedIconPath": "static/images/tab-user-active.png"
    }
  ]
}
```

- [ ] **Step 4: Run build**

Run:

```bash
pnpm build:h5
```

Expected: build completes with `DONE  Build complete.`

- [ ] **Step 5: Commit**

Run:

```bash
git add src/pages.json
git commit -m "feat: add mall to main tab bar"
```

## Task 4: Replace The Homepage Data Model

**Files:**
- Modify: `src/pages/home/index.vue`

- [ ] **Step 1: Replace imports and hardcoded arrays**

Remove the current hardcoded `banners`, `categories`, `channels`, `recommendCourses`, `freeCourses`, and `featuredCourses` arrays.

Use these imports and state variables:

```ts
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
```

- [ ] **Step 2: Add API loading functions**

Add:

```ts
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
```

- [ ] **Step 3: Add navigation actions**

Add:

```ts
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
  if (products.value.length === 0 && !loading.value) refreshHome()
})
```

- [ ] **Step 4: Update the template sections**

Structure the template in this order:

```vue
<template>
  <view class="page">
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

    <view class="search-card" @tap="goSearch">
      <Icon icon="solar:magnifer-bold" :size="18" color="var(--text-hint)" />
      <text class="search-text">搜索商品、课程、帖子</text>
    </view>

    <view class="hero-card" @tap="heroProduct && goProduct(heroProduct.id)">
      <view class="hero-copy">
        <text class="hero-eyebrow">TODAY</text>
        <text class="hero-title">{{ heroProduct?.spuName || '发现盛桦精选' }}</text>
        <text class="hero-sub">{{ heroProduct ? '今日商城推荐' : '商品、好课和社区内容都会在这里聚合' }}</text>
      </view>
      <image v-if="heroProduct?.mainImage" :src="imgUrl(heroProduct.mainImage)" class="hero-img" mode="aspectFill" />
    </view>

    <view class="quick-grid">
      <view class="quick-item commerce" @tap="goMall">
        <text class="quick-title">商城</text>
        <text class="quick-sub">分类好物</text>
      </view>
      <view class="quick-item learning" @tap="navigateToPage('/pages/learn/index')">
        <text class="quick-title">学习</text>
        <text class="quick-sub">课程进度</text>
      </view>
      <view class="quick-item promo" @tap="navigateToPage('/pages/seckill/index')">
        <text class="quick-title">秒杀</text>
        <text class="quick-sub">限时抢购</text>
      </view>
      <view class="quick-item community" @tap="navigateToPage('/pages/community/index')">
        <text class="quick-title">社区</text>
        <text class="quick-sub">逛逛动态</text>
      </view>
    </view>

    <view class="section" v-if="categories.length">
      <view class="section-header">
        <text class="section-title">商品分类</text>
        <text class="section-more" @tap="goMall">全部</text>
      </view>
      <scroll-view scroll-x class="category-scroll">
        <view v-for="cat in categories" :key="cat.id" class="category-pill" @tap="goCategory(cat.id)">
          <text class="category-name">{{ cat.name }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">商城精选</text>
        <text class="section-more" @tap="goMall">更多</text>
      </view>
      <view v-if="productGrid.length" class="product-grid">
        <view v-for="item in productGrid" :key="item.id" class="product-card" @tap="goProduct(item.id)">
          <image v-if="item.mainImage" :src="imgUrl(item.mainImage)" class="product-img" mode="aspectFill" />
          <view v-else class="product-img empty-img" />
          <text class="product-name">{{ item.spuName }}</text>
          <text class="product-price">¥{{ item.minPrice || 0 }}</text>
        </view>
      </view>
      <view v-else class="inline-empty">
        <text class="inline-empty-text">暂无精选商品</text>
      </view>
    </view>

    <view class="section" v-if="promoList.length">
      <view class="section-header">
        <text class="section-title">限时活动</text>
      </view>
      <view class="promo-list">
        <view v-for="item in promoList" :key="item.id" class="promo-card" @tap="goProduct(item.spuId || item.id)">
          <text class="promo-type">{{ item.promoType }}</text>
          <text class="promo-title">{{ item.spuName || item.productName || '活动商品' }}</text>
          <text class="promo-price">¥{{ item.seckillPrice || item.groupPrice || item.price || 0 }}</text>
        </view>
      </view>
    </view>

    <view class="section" v-if="courseList.length">
      <view class="section-header">
        <text class="section-title">继续学习</text>
        <text class="section-more" @tap="navigateToPage('/pages/learn/index')">学习中心</text>
      </view>
      <view v-for="course in courseList" :key="course.id" class="course-row" @tap="goCourse(course.id)">
        <text class="course-title">{{ course.title || course.courseName }}</text>
        <text class="course-meta">{{ course.lecturerName || '盛桦讲师' }}</text>
      </view>
    </view>

    <view class="section" v-if="postList.length">
      <view class="section-header">
        <text class="section-title">社区热帖</text>
        <text class="section-more" @tap="navigateToPage('/pages/community/index')">逛逛</text>
      </view>
      <view v-for="post in postList" :key="post.id" class="post-row" @tap="goPost(post.id)">
        <text class="post-title">{{ post.title || post.content }}</text>
        <text class="post-meta">{{ post.likeCount || 0 }} 赞</text>
      </view>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>
```

- [ ] **Step 5: Replace the page-level style with token-based Phase 1 styles**

Use the current file's scoped style block, but remove the large course-only classes. Keep these class names from the new template and style them with `var(...)` tokens:

```css
.page { min-height: 100vh; background: var(--bg-page); padding: 44px 16px 16px; box-sizing: border-box; }
.home-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.home-title { display: block; font-size: 28px; font-weight: var(--weight-bold); color: var(--text-primary); }
.home-subtitle { display: block; margin-top: 2px; font-size: var(--font-md); color: var(--text-secondary); }
.header-actions { display: flex; gap: 10px; }
.header-icon { width: 38px; height: 38px; border-radius: var(--radius-circle); background: var(--bg-card); display: flex; align-items: center; justify-content: center; position: relative; }
.search-card { height: 42px; border-radius: var(--radius-full); background: var(--bg-card); display: flex; align-items: center; gap: 8px; padding: 0 14px; margin-bottom: 14px; }
.search-text { font-size: var(--font-md); color: var(--text-hint); }
.hero-card { min-height: 142px; border-radius: var(--radius-2xl); background: var(--color-primary); padding: 20px; display: flex; gap: 14px; overflow: hidden; margin-bottom: 14px; }
.hero-copy { flex: 1; min-width: 0; }
.hero-eyebrow { display: block; font-size: var(--font-xs); color: rgba(255,255,255,0.68); font-weight: var(--weight-bold); }
.hero-title { display: block; margin-top: 8px; font-size: 24px; line-height: 1.18; color: #fff; font-weight: var(--weight-bold); }
.hero-sub { display: block; margin-top: 8px; font-size: var(--font-md); color: rgba(255,255,255,0.72); }
.hero-img { width: 104px; height: 104px; border-radius: var(--radius-xl); background: rgba(255,255,255,0.12); flex-shrink: 0; }
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
.quick-item { border-radius: var(--radius-xl); padding: 12px 10px; min-height: 72px; box-sizing: border-box; }
.quick-item.commerce { background: var(--color-commerce-light); }
.quick-item.learning { background: var(--color-learning-light); }
.quick-item.promo { background: var(--color-warning-light); }
.quick-item.community { background: var(--color-community-light); }
.quick-title { display: block; font-size: var(--font-lg); font-weight: var(--weight-bold); color: var(--text-primary); }
.quick-sub { display: block; margin-top: 4px; font-size: var(--font-xs); color: var(--text-secondary); }
.section { margin-bottom: 18px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.section-title { font-size: var(--font-xl); font-weight: var(--weight-bold); color: var(--text-primary); }
.section-more { font-size: var(--font-sm); color: var(--text-secondary); }
.category-scroll { white-space: nowrap; }
.category-pill { display: inline-flex; padding: 8px 14px; border-radius: var(--radius-full); background: var(--bg-card); margin-right: 8px; }
.category-name { font-size: var(--font-md); color: var(--text-primary); }
.product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.product-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 10px; overflow: hidden; }
.product-img { width: 100%; height: 142px; border-radius: var(--radius-md); background: var(--bg-gray); }
.empty-img { background: linear-gradient(135deg, #f0f0f0, #fafafa); }
.product-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 8px; min-height: 36px; font-size: var(--font-md); line-height: 1.35; color: var(--text-primary); }
.product-price { display: block; margin-top: 6px; font-size: var(--font-xl); color: var(--color-commerce); font-weight: var(--weight-bold); }
.promo-list { display: grid; gap: 10px; }
.promo-card, .course-row, .post-row { background: var(--bg-card); border-radius: var(--radius-lg); padding: 14px; }
.promo-type { display: inline-flex; padding: 3px 8px; border-radius: var(--radius-full); background: var(--color-commerce); color: #fff; font-size: var(--font-xs); font-weight: var(--weight-bold); }
.promo-title, .course-title, .post-title { display: block; margin-top: 8px; font-size: var(--font-lg); color: var(--text-primary); font-weight: var(--weight-semibold); line-height: 1.35; }
.promo-price { display: block; margin-top: 8px; color: var(--color-commerce); font-size: var(--font-xl); font-weight: var(--weight-bold); }
.course-meta, .post-meta { display: block; margin-top: 6px; font-size: var(--font-sm); color: var(--text-secondary); }
.inline-empty { background: var(--bg-card); border-radius: var(--radius-lg); padding: 24px; text-align: center; }
.inline-empty-text { font-size: var(--font-md); color: var(--text-hint); }
.bottom-spacer { height: 12px; }
```

- [ ] **Step 6: Run build**

Run:

```bash
pnpm build:h5
```

Expected: build completes with `DONE  Build complete.`

- [ ] **Step 7: Commit**

Run:

```bash
git add src/pages/home/index.vue
git commit -m "feat: make home a cross-domain aggregate"
```

## Task 5: Update Mall Page Header, Search, And Navigation

**Files:**
- Modify: `src/pages/mall/index.vue`

- [ ] **Step 1: Update imports**

Change the UniApp lifecycle import and add the cart helper:

```ts
import { onLoad, onShow } from '@dcloudio/uni-app'
import { goCart } from '@/utils/navigation'
```

- [ ] **Step 2: Add search state**

Add near the other refs:

```ts
const keyword = ref('')
```

- [ ] **Step 3: Replace the page header template**

Change the header to include the cart shortcut:

```vue
<view class="page-header">
  <view class="search-bar">
    <Icon icon="solar:magnifer-bold" width="16" color="var(--text-hint)" />
    <input
      v-model="keyword"
      class="search-input"
      placeholder="搜索商品"
      confirm-type="search"
      @confirm="onSearchConfirm"
    />
  </view>
  <view class="cart-shortcut" @tap="goCart">
    <Icon icon="solar:cart-large-2-bold" width="20" color="var(--text-primary)" />
  </view>
</view>
```

- [ ] **Step 4: Replace the unused search handler**

Remove `onFocusSearch()`.

Add:

```ts
function onSearchConfirm() {
  pageNo.value = 1
  noMore.value = false
  products.value = []
  loadProducts()
}
```

- [ ] **Step 5: Include keyword in product loading**

Inside `loadProducts()`, after category params are set, add:

```ts
const kw = keyword.value.trim()
if (kw) {
  params.keyword = kw
  params.spuName = kw
}
```

- [ ] **Step 6: Add stored category handoff**

Add this function:

```ts
function applyStoredCategory(list: any[]) {
  const targetId = uni.getStorageSync('mall_target_category_id')
  if (targetId) {
    for (const cat of list) {
      if (cat.id === targetId) {
        activeCategoryId.value = cat.id
        activeSubId.value = ''
        uni.removeStorageSync('mall_target_category_id')
        return true
      }
      const child = (cat.children || []).find((sub: any) => sub.id === targetId)
      if (child) {
        activeCategoryId.value = cat.id
        activeSubId.value = child.id
        uni.removeStorageSync('mall_target_category_id')
        return true
      }
    }
    uni.removeStorageSync('mall_target_category_id')
  }
  return false
}
```

Update `loadCategories()` to use it:

```ts
if (list.length > 0) {
  const applied = applyStoredCategory(list)
  if (!applied) activeCategoryId.value = list[0].id
  loadProducts()
}
```

Add an `onShow()` refresh for category selections made from the home tab after the mall page has already loaded:

```ts
onShow(() => {
  const targetId = uni.getStorageSync('mall_target_category_id')
  if (targetId && categories.value.length > 0) {
    const applied = applyStoredCategory(categories.value)
    if (applied) {
      pageNo.value = 1
      noMore.value = false
      products.value = []
      loadProducts()
    }
  }
})
```

- [ ] **Step 7: Add header styles**

Add:

```css
.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-card);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-gray);
  border-radius: var(--radius-full);
  padding: 9px 16px;
}

.search-input {
  flex: 1;
  min-width: 0;
  font-size: var(--font-base, 14px);
  color: var(--text-primary);
}

.cart-shortcut {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-circle);
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Remove the old `.search-icon` and `.search-placeholder` rules if they are no longer used.

- [ ] **Step 8: Run build**

Run:

```bash
pnpm build:h5
```

Expected: build completes with `DONE  Build complete.`

- [ ] **Step 9: Commit**

Run:

```bash
git add src/pages/mall/index.vue
git commit -m "feat: add mall cart shortcut"
```

## Task 6: Fix Invalid Commerce Navigation

**Files:**
- Modify: `src/pages/product/detail.vue`
- Modify: `src/pages/coupon/index.vue`
- Modify: `src/pages/learn/index.vue`

- [ ] **Step 1: Update product detail navigation imports**

In `src/pages/product/detail.vue`, add:

```ts
import { goCart as openCart, goHome as openHome, goMall } from '@/utils/navigation'
```

- [ ] **Step 2: Replace product detail navigation functions**

Replace the local functions:

```ts
function goHome() {
  openHome()
}

function goCart() {
  openCart()
}

function goProductList() {
  goMall()
}
```

This removes the missing `/pages/product/list` route and prevents `switchTab()` from being used for cart.

- [ ] **Step 3: Update coupon page shop navigation**

In `src/pages/coupon/index.vue`, import:

```ts
import { goMall } from '@/utils/navigation'
```

Replace the function that currently runs `uni.switchTab({ url: '/pages/mall/index' })` with:

```ts
function goShop() {
  goMall()
}
```

- [ ] **Step 4: Update learning page tab detection**

In `src/pages/learn/index.vue`, replace the `tabPages` array inside `navigateTo()` with:

```ts
const tabPages = [
  '/pages/home/index',
  '/pages/mall/index',
  '/pages/learn/index',
  '/pages/community/index',
  '/pages/profile/index',
]
```

- [ ] **Step 5: Static route check**

Run:

```bash
rg "switchTab\\(\\{ url: '/pages/cart/index'|/pages/product/list" src/pages
```

Expected: no output.

- [ ] **Step 6: Run build**

Run:

```bash
pnpm build:h5
```

Expected: build completes with `DONE  Build complete.`

- [ ] **Step 7: Commit**

Run:

```bash
git add src/pages/product/detail.vue src/pages/coupon/index.vue src/pages/learn/index.vue
git commit -m "fix: correct phase one commerce navigation"
```

## Task 7: Browser Smoke Check

**Files:**
- No file changes unless a smoke check reveals a Phase 1 regression.

- [ ] **Step 1: Start the H5 dev server**

Run:

```bash
pnpm dev:h5
```

Expected: dev server starts on port `3101`, or another Vite-selected port if `3101` is busy.

- [ ] **Step 2: Open the H5 app in the in-app browser**

Open:

```text
http://localhost:3101
```

Expected: homepage loads without a blank screen.

- [ ] **Step 3: Smoke the TabBar**

Click each TabBar item:

- 首页
- 商城
- 学习
- 社区
- 我的

Expected: each page opens and the selected TabBar item updates.

- [ ] **Step 4: Smoke the homepage**

On 首页:

- Tap the cart icon.
- Tap 商城 quick entry.
- Tap 学习 quick entry.
- Tap 社区 quick entry.

Expected:

- Cart opens as a normal page.
- 商城, 学习, and 社区 switch to their TabBar pages.
- Empty API results show empty sections or hidden optional sections, not hardcoded fake product lists.

- [ ] **Step 5: Smoke commerce navigation**

On 商品详情 when reachable from a product:

- Tap 购物车 in the product action bar.
- Tap 相关推荐更多 if visible.

Expected:

- 购物车 opens `/pages/cart/index`.
- 更多 switches to `/pages/mall/index`.

- [ ] **Step 6: Stop the dev server**

Stop the running dev server with `Ctrl+C`.

- [ ] **Step 7: Commit smoke fixes if any were needed**

If smoke fixes were required, commit only those files:

```bash
git add <changed-files>
git commit -m "fix: address phase one smoke issues"
```

If no fixes were needed, do not create an empty commit.

## Task 8: Final Phase 1 Verification

**Files:**
- No planned file changes.

- [ ] **Step 1: Run final build**

Run:

```bash
pnpm build:h5
```

Expected: build completes with `DONE  Build complete.`

- [ ] **Step 2: Run final static route check**

Run:

```bash
rg "switchTab\\(\\{ url: '/pages/cart/index'|/pages/product/list" src/pages
```

Expected: no output.

- [ ] **Step 3: Review changed files**

Run:

```bash
git status --short
git log --oneline -8
```

Expected:

- No unstaged Phase 1 source changes remain.
- Recent commits correspond to Tasks 1 through 7, excluding Task 7 if no smoke fixes were needed.

- [ ] **Step 4: Report Phase 1 completion**

Report:

- Build result.
- Browser smoke result.
- Any backend-dependent behavior that could not be verified because the backend was unavailable.
- The next recommended phase plan: Phase 2 Commerce Main Flow.
