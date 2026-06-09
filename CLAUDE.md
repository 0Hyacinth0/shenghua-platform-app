# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**盛桦商城 (ShengHua Mall)** — a full-stack e-commerce platform built on the JeecgBoot low-code framework. The repository contains two frontend applications sharing a single JeecgBoot Spring Boot backend.

| Directory | Role | Description |
|-----------|------|-------------|
| `client/` | 🛒 **Mall Frontend** | UniApp 多端电商平台（小程序/H5/App） |
| `jeecgclient/` | ⚙️ **Admin Panel** | Backend management dashboard |
| `DESIGN.md` | 🎨 **Design System** | Figma-inspired design token specification |

**My primary workspace is `client/`** — modifying the mall frontend to match the backend APIs. The backend is already developed and provides both REST APIs and an admin panel (jeecgclient) as a reference implementation.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     client/ (UniApp)                     │
│           Vue 3 + uni-ui + uni-app (多端)               │
│         微信小程序 / H5 / App (iOS & Android)            │
└──────────────────────┬──────────────────────────────────┘
                       │  /jeecg-boot/* (proxy or direct)
                       ▼
┌─────────────────────────────────────────────────────────┐
│             JeecgBoot Backend (port 8080)               │
│                 Spring Boot + MySQL + Redis              │
│    Auth / Mall (SPU/SKU/Cart/Order/Coupon/Seckill...)   │
└──────────────────────┬──────────────────────────────────┘
                       │  Direct API calls
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  jeecgclient/ (port 3100)               │
│           Vue 3 + Vite 6 + Ant Design Vue 4             │
│       Admin dashboard (system + mall management)        │
└─────────────────────────────────────────────────────────┘
```

The backend itself is NOT in this repo — only the two frontend SPAs that consume it.

## Common Commands

### client/ (mall frontend — my workspace)

```bash
cd client
pnpm dev:h5              # Start H5 dev server on port 3101
pnpm dev:mp-weixin        # Start WeChat mini program dev server
pnpm dev:app              # Start App dev server
pnpm build:h5             # Build H5 production
pnpm build:mp-weixin      # Build WeChat mini program
pnpm build:app            # Build App
```

### jeecgclient/ (admin panel — reference only)

```bash
cd jeecgclient
pnpm dev                 # Start dev server on port 3100 (mock enabled)
pnpm build               # Production build
pnpm build:docker        # Docker production build
pnpm batch:prettier      # Format all source files
pnpm clean:cache         # Clear Vite cache
pnpm gen:icon            # Regenerate icon data
pnpm reinstall           # Clean reinstall dependencies
```

## Tech Stack (client/)

| Layer | Technology |
|-------|-----------|
| Framework | UniApp (Vue 3 + Composition API, `<script setup>`) |
| Build | @dcloudio/vite-plugin-uni |
| UI Library | uni-ui + 原生组件 |
| Language | TypeScript |
| HTTP | uni.request (custom wrapper) |
| Routing | pages.json + uni 路由 API |
| Storage | uni.setStorageSync / uni.getStorageSync |
| Package Manager | pnpm |
| Target Platforms | 微信小程序、H5、App (iOS & Android) |

**No Pinia / state management library** — auth state is stored in uni storage. No i18n, no theme system, no tests yet.

## Path Aliases (client/)

Only one alias is configured in `vite.config.ts`:

```ts
'@' → 'src/'
```

Note: UniApp 的 `@dcloudio/vite-plugin-uni` 会自动处理路径别名，无需额外配置。

## API Layer

### HTTP Client (`src/utils/http.ts`)

A uni.request wrapper with:

- **Base URL**: `/jeecg-boot` (H5 proxied, 小程序/App 用完整 URL)
- **Timeout**: 15 seconds
- **Auth header**: Sends `X-Access-Token` header from `uni.getStorageSync('token')`
- **Response unwrapping**: Expects `{ success, result, message }` — if `success === true`, it returns `data.result` (or `data` if `result` is undefined); if `false`, it rejects with the error message

### API Response Format

Backend responses follow the JeecgBoot convention:

```json
{
  "success": true,
  "code": 200,
  "result": { ... },
  "message": "操作成功"
}
```

The HTTP interceptor automatically extracts `result` on success. Never access `response.data.result` directly — `http.get()` already returns the unwrapped result.

### API Definitions (`src/api/index.ts`)

All API functions are defined as named exports. Pattern:

```ts
import http from '@/utils/http'

// GET with params
export const getProductList = (params: any) => http.get('/mall/spu/list', { params })

// GET with path-style params in query string
export const getProductDetail = (id: string) => http.get('/mall/spu/queryById', { params: { id } })

// POST with body
export const createOrder = (data: any) => http.post('/mall/order/create', data)

// POST/PUT with params (no body)
export const updateCartQty = (id: string, quantity: number) => http.put('/mall/cart/updateQuantity', null, { params: { id, quantity } })
```

**When a page needs an API that isn't in `src/api/index.ts` yet**, two approaches are used throughout the codebase:

1. **Preferred**: Add a new named export to `src/api/index.ts`
2. **Direct call** (used for ad-hoc/one-off queries): `import http from '@/utils/http` and call `http.get('/mall/...')` directly in the component

The codebase currently uses both patterns. When adding a new feature, consolidate related APIs in `src/api/index.ts`.

### API Domain Map

| Prefix | Domain |
|--------|--------|
| `/sys/*` | System auth (login, user info) |
| `/mall/spu/*` | Products (SPU) |
| `/mall/cart/*` | Shopping cart |
| `/mall/order/*` | Orders |
| `/mall/userAddress/*` | Shipping addresses |
| `/mall/userCoupon/*` | User coupons |
| `/mall/coupon/*` | Coupon templates |
| `/mall/merchant/*` | Merchant/shop management |
| `/mall/signIn/*` | Daily check-in |
| `/mall/seckill/*`, `/mall/seckillProduct/*` | Flash sale |
| `/mall/groupBuy/*` | Group buying |
| `/mall/category/*` | Product categories |
| `/mall/user/*` | User profile |
| `/sys/common/static/*` | Static file serving (images) |

### Image URLs (`imgUrl()` helper)

Images stored on the backend use relative paths. The `imgUrl()` helper in `src/api/index.ts` resolves them:

```ts
import { imgUrl } from '@/api'

imgUrl('temp/abc.jpg')        → '/jeecg-boot/sys/common/static/temp/abc.jpg'
imgUrl('https://cdn.../x.png') → 'https://cdn.../x.png'  (absolute URLs pass through)
imgUrl(null)                   → ''                        (falsy values return empty string)
```

Always use `imgUrl()` when rendering product/category images.

## Auth & User

### Token Management (`src/utils/auth.ts`)

```ts
getToken()          // reads 'token' from uni storage
setToken(token)     // writes 'token' to uni storage
removeToken()       // clears 'token' and 'mall_user'
setUser(user)       // JSON-serializes user to 'mall_user'
getUser()           // parses user from 'mall_user' (returns null if not found)
isLoggedIn()        // returns !!getToken()
```

### Current User (`src/utils/user.ts`)

```ts
getCurrentUserId()  // returns user.id || user.userId from localStorage, falls back to 'demo_user_001'
getCurrentUser()    // alias for getUser()
```

**Important**: `getCurrentUserId()` has a hardcoded fallback `'demo_user_001'` for demo/development purposes. Production should only use the logged-in user's ID.

### Login Flow

1. User submits credentials to `/sys/login`
2. Response contains `{ token, userInfo }`
3. Token stored in uni storage as `X-Access-Token` header for subsequent requests
4. User info stored in uni storage as `mall_user`
5. 登录成功后跳转到首页: `uni.switchTab({ url: '/pages/home/index' })`

## Routing (`src/pages.json`)

UniApp 使用 pages.json 配置路由。使用 `uni.navigateTo()` / `uni.switchTab()` / `uni.navigateBack()` 进行页面跳转。

**TabBar 页面** (5个):
- `pages/home/index` — 首页
- `pages/mall/index` — 分类
- `pages/community/index` — 逛逛
- `pages/cart/index` — 购物车
- `pages/profile/index` — 我的

**非 TabBar 页面**:
- `pages/login/index` — 登录
- `pages/login/register` — 注册
- `pages/product/detail` — 商品详情 (query: `?id=xxx`)
- `pages/checkout/index` — 确认订单 (query: `?items=` / `?itemId=` / `?seckillId=`)
- `pages/order/list` — 订单列表
- `pages/order/detail` — 订单详情
- `pages/address/index` — 收货地址
- `pages/merchant/apply` — 商家入驻
- `pages/merchant/products` — 商品管理
- `pages/coupon/index` — 优惠券
- `pages/seckill/index` — 限时抢购
- `pages/signIn/index` — 签到
- `pages/groupBuy/index` — 拼团
- `pages/groupBuy/checkout` — 拼团结算
- `pages/message/index` — 消息
- `pages/message/chat` — 聊天
- `pages/learn/index` — 学习中心
- `pages/distributor/index` — 分销中心
- `pages/course/*` — 课程模块 (6个页面)
- `pages/community/*` — 社区模块 (5个页面)
- `pages/admin/product-audit` — 商品审核

**页面跳转方式**:
- TabBar 页面: `uni.switchTab({ url: '/pages/home/index' })`
- 普通页面: `uni.navigateTo({ url: '/pages/product/detail?id=123' })`
- 返回: `uni.navigateBack()`
- 重定向: `uni.redirectTo({ url: '/pages/order/detail?id=xxx' })`

**页面生命周期**: 使用 `onLoad(options)` 获取页面参数（替代 route.params / route.query）

## Component Patterns

### Layout

UniApp 不需要布局组件。TabBar 通过 pages.json 的 tabBar 配置自动处理。非 TabBar 页面使用自定义导航栏（navigationBarTitleText）。

### Page Template

Every view file follows this structure:

```vue
<template>
  <!-- Page content using UniApp components (view, text, image, button, etc.) -->
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { someApi, imgUrl } from '@/api'
import http from '@/utils/http'        // for ad-hoc API calls
import { getCurrentUserId } from '@/utils/user'

// Reactive state
const loading = ref(false)
const data = ref<any[]>([])

// Async data fetching
async function fetchData() {
  loading.value = true
  try {
    const res = await someApi(params)
    data.value = res?.records || []
  } catch {
    data.value = []
  } finally {
    loading.value = false
  }
}

// 页面加载时获取参数和数据
onLoad((options) => {
  const id = options?.id
  fetchData()
})

// 页面显示时刷新数据
onShow(() => {
  // 可选：刷新数据
})
</script>

<style scoped>
/* Scoped component styles */
/* 使用 CSS 变量: var(--color-primary, #FF4D4F) */
</style>
```

### Error Handling Convention

Every async operation uses try/catch with user-facing `uni.showToast()`:

```ts
try {
  await someApi(params)
  uni.showToast({ title: '操作成功', icon: 'success' })
} catch (e: any) {
  uni.showToast({ title: e.message || '操作失败', icon: 'none' })
}
```

对于确认操作，使用 `uni.showModal()`:

```ts
uni.showModal({
  title: '确认',
  content: '确定要删除吗？',
  success: (res) => {
    if (res.confirm) {
      // 执行删除
    }
  }
})
```

Failed API calls silently degrade — catch blocks set data to empty arrays/objects rather than crashing.

### State Convention

- **No Pinia stores** — all component-local state
- Cross-component data sharing via route query params (e.g., checkout items)
- Auth state in uni storage (not reactive — components read it on load)
- Cart count fetched from API on page show via `onShow()`

## Design Conventions

### Brand Identity

| Token | Value |
|-------|-------|
| Brand name | 盛桦商城 |
| Primary color | `#e4393c` (red, JD-style e-commerce red) |
| Content max-width | `1200px` |
| Card border-radius | `8px` |
| Card background | `#fff` |
| Page background | `#f5f5f5` |
| Component gaps | `16px` – `24px` |

### DESIGN.md

The repository includes `DESIGN.md` — a comprehensive Figma-inspired design system specification. It defines a complete token system (colors, typography, spacing, elevation, components, responsive behavior). **This design system is aspirational — it has NOT been implemented in `client/` yet.** The current styles are simple inline CSS with the red primary color scheme.

When implementing new pages or redesigning existing ones, reference DESIGN.md for:
- Proper color token usage (the `{colors.*}` tokens)
- Typography hierarchy (`{typography.*}` tokens)
- Spacing scale (`{spacing.*}` tokens)
- Component patterns like pill-shaped buttons

### Current vs. Design System Gap

| Aspect | Current (client/) | DESIGN.md target |
|--------|------------------|------------------|
| Theme color | `#FF4D4F` (red) | `{colors.primary}` (black) |
| Button shape | Pill shaped (已实现) | Pill (`{rounded.pill}`) |
| Type scale | CSS variables | Structured token system |
| CSS approach | CSS variables + scoped | CSS variable / token system |
| Color blocks | None | Signature pattern |
| Responsive | Mobile-first (已实现) | Documented breakpoint system |

## Mall Domain Knowledge

### Product Data Model

- **SPU** (Standard Product Unit): The product listing — has name, images, category, merchant
- **SKU** (Stock Keeping Unit): Specific variant with price, stock, specs (e.g., "Red / XL")
- **Spec Template** (`specTemplate`): JSON defining the dimension groups (e.g., `[{name: "颜色", values: ["红","蓝"]}, {name: "尺寸", values: ["S","M","XL"]}]`)
- **Spec Text** (`specText`): Human-readable variant description (e.g., "红色/XL")
- **Specs** (`specs`): JSON object mapping spec names to values (e.g., `{"颜色": "红", "尺寸": "XL"}`)

### Order Flow

```
Product Detail → Add to Cart → Cart → Checkout → Create Order → Pay → Confirm Receipt
                            ↘ Buy Now → Checkout (with ?itemId=)
```

### Special Purchase Flows

- **Seckill (Flash Sale)**: Time-limited discounted purchase. Has dedicated SeckillActivity → SeckillProduct (SPU + seckill price + stock + limit per user). Checkout routes through `/mall/seckill/buy` instead of `/mall/order/create`.
- **Group Buy**: Group purchasing flow with separate checkout path.

### Merchant Types

- `storeType === 0`: System-operated store
- `storeType !== 0`: Third-party merchant

## Working with jeecgclient/ (Admin Reference)

When unsure about an API's behavior, data model, or page structure, look at the admin panel implementation in `jeecgclient/src/views/mall/`. It has full CRUD management pages for:

- **spu/** — Product creation/listing with rich form (brand, category, freight template, spec template, SKU grid, images)
- **order/** — Order management with status, shipping, payment details
- **category/** — Category tree management
- **coupon/** — Coupon template creation
- **seckill/**, **seckillProduct/** — Flash sale configuration
- **groupBuy/**, **groupBuyRecord/** — Group buying management
- **merchant/** — Merchant/shop approval and management
- **signIn/** — Check-in rule configuration
- **brand/**, **freightTemplate/**, **memberLevel/** — Supporting entities
- **stats/**, **commission/**, **withdraw/** — Operational tools

The admin panel's data forms reveal:
- Which fields exist on each entity
- Validation rules
- Relationship between entities
- Enum values (status codes, types)

The admin panel runs on port 3100 with mock data enabled in dev mode — it can be used standalone for UI reference.

## Development Workflow

### Adding a New Page

1. Create the page file in `client/src/pages/<feature>/index.vue`
2. Add the page path in `client/src/pages.json` (pages 数组中)
3. Add API functions to `client/src/api/index.ts`
4. 使用 `uni.navigateTo()` 或 `uni.switchTab()` 进行跳转

### Adding a New API

```ts
// In client/src/api/index.ts
export const newApiFunction = (id: string) => http.get('/mall/resource/queryById', { params: { id } })
export const createResource = (data: any) => http.post('/mall/resource/add', data)
export const updateResource = (data: any) => http.put('/mall/resource/edit', data)
```

Note: http 对象是 uni.request 的封装，与原 Axios 接口兼容。

Naming convention matches the backend controller:
- `/mall/<entity>/list` — paginated query
- `/mall/<entity>/queryById` — single record
- `/mall/<entity>/add` — create
- `/mall/<entity>/edit` — update
- `/mall/<entity>/delete` — delete (by id param)

### Cross-Platform Development

```bash
# H5 开发（浏览器调试）
pnpm dev:h5

# 微信小程序开发（需要微信开发者工具）
pnpm dev:mp-weixin

# App 开发（需要 HBuilderX 或 Android Studio / Xcode）
pnpm dev:app
```

### Platform-Specific Code

使用条件编译处理平台差异：

```ts
// #ifdef H5
// H5 专用代码
// #endif

// #ifdef MP-WEIXIN
// 微信小程序专用代码
// #endif

// #ifdef APP-PLUS
// App 专用代码
// #endif
```

### Mock / Demo Mode

The codebase has demo-user support baked in:
- `getCurrentUserId()` falls back to `'demo_user_001'` when not logged in
- The profile page shows demo data when API calls fail
- Some views are partially functional without auth

When adding features, maintain this pattern — pages should degrade gracefully without a logged-in user.

## File Summary (client/)

```
client/
├── index.html                  # Vite entry HTML
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config (uni plugin)
└── src/
    ├── App.vue                  # Root component
    ├── main.ts                  # App bootstrap
    ├── pages.json               # 路由 + tabBar 配置
    ├── manifest.json            # 应用配置
    ├── uni.scss                 # 全局样式变量
    ├── api/
    │   └── index.ts             # All API function definitions + imgUrl helper
    ├── components/
    │   ├── Icon.vue             # 通用图标组件
    │   ├── EmptyState.vue       # 空状态组件
    │   └── LoadingSpinner.vue   # 加载组件
    ├── utils/
    │   ├── auth.ts              # Token & user storage management
    │   ├── http.ts              # uni.request wrapper
    │   └── user.ts              # Current user helpers (with demo fallback)
    ├── styles/
    │   └── design-system.css    # CSS variables & utility classes
    ├── static/images/           # TabBar icons
    └── pages/
        ├── home/index.vue       # 首页 (轮播、快捷入口、分类、推荐)
        ├── mall/index.vue       # 分类页 (分类列表 + 商品网格)
        ├── community/           # 社区模块 (5个页面)
        ├── cart/index.vue       # 购物车
        ├── profile/index.vue    # 个人中心
        ├── login/               # 登录/注册
        ├── product/detail.vue   # 商品详情
        ├── checkout/index.vue   # 确认订单
        ├── order/               # 订单列表/详情
        ├── address/index.vue    # 收货地址
        ├── coupon/index.vue     # 优惠券
        ├── seckill/index.vue    # 限时抢购
        ├── signIn/index.vue     # 签到
        ├── groupBuy/            # 拼团
        ├── message/             # 消息
        ├── learn/index.vue      # 学习中心
        ├── distributor/index.vue # 分销中心
        ├── course/              # 课程模块 (6个页面)
        ├── merchant/            # 商家管理
        ├── admin/               # 管理后台
        └── page/index.vue       # 通用页面
```

## Important Notes

1. **The backend MUST be running** at `localhost:8080` for H5 dev mode to work — the Vite proxy forwards all `/jeecg-boot/*` requests. For 小程序/App，需要在 manifest.json 和 api/index.ts 中配置完整后端 URL。
2. **UniApp 组件不需要手动导入** — `<view>`, `<text>`, `<image>`, `<button>`, `<scroll-view>`, `<swiper>` 等是 UniApp 内置组件，直接使用。uni-ui 组件需要导入。
3. **TypeScript is loose** — `any` is used extensively. When adding types, focus on new code rather than retrofitting.
4. **No test infrastructure** — The `client/` project has no test runner configured. Manual testing via `pnpm dev:h5` or微信开发者工具 is the verification path.
5. **The admin panel (jeecgclient/) has its own CLAUDE.md** at `jeecgclient/CLAUDE.md` with detailed architecture documentation — reference it when working on the admin side.
6. **DESIGN.md is the target design** — when the user asks for UI improvements or redesigns, use DESIGN.md as the specification. It represents where the design *should* go, even though the current code doesn't match it yet.
7. **TabBar 图标** — 当前使用占位 PNG，需要替换为实际设计的图标（81x81px PNG）。
8. **跨端兼容** — CSS 中 `backdrop-filter`、`aspect-ratio` 等属性在部分小程序平台不支持，需要条件编译或降级处理。
9. **图片上传** — 使用 `uni.chooseImage()` + `uni.uploadFile()` 替代 `<a-upload>` 组件。
10. **视频播放** — 使用 `<video>` UniApp 组件，支持小程序和 App 原生播放。
