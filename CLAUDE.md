# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**盛桦商城 (ShengHua Mall)** — a full-stack e-commerce platform built on the JeecgBoot low-code framework. The repository contains two frontend applications sharing a single JeecgBoot Spring Boot backend.

| Directory | Role | Description |
|-----------|------|-------------|
| `client/` | 🛒 **Mall Frontend** | End-user e-commerce store |
| `jeecgclient/` | ⚙️ **Admin Panel** | Backend management dashboard |
| `DESIGN.md` | 🎨 **Design System** | Figma-inspired design token specification |

**My primary workspace is `client/`** — modifying the mall frontend to match the backend APIs. The backend is already developed and provides both REST APIs and an admin panel (jeecgclient) as a reference implementation.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     client/ (port 3101)                  │
│              Vue 3 + Vite 6 + Ant Design Vue 4          │
│                  E-commerce mall storefront              │
└──────────────────────┬──────────────────────────────────┘
                       │  /jeecg-boot/* (proxy)
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
pnpm dev                 # Start dev server on port 3101
pnpm build               # Type-check + production build
pnpm preview             # Build + preview
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
| Framework | Vue 3.5 (Composition API, `<script setup>`) |
| Build | Vite 6 |
| UI Library | Ant Design Vue 4 (auto-imported) |
| Language | TypeScript |
| HTTP | Axios (custom wrapper) |
| Routing | Vue Router 4 (history mode) |
| Package Manager | pnpm |
| Icon Library | @ant-design/icons-vue |

**No Pinia / state management library** — auth state is stored in localStorage. No i18n, no theme system, no tests yet.

## Path Aliases (client/)

Only one alias is configured in `vite.config.ts`:

```ts
'@' → 'src/'
```

## API Layer

### HTTP Client (`src/utils/http.ts`)

A pre-configured Axios instance with:

- **Base URL**: `/jeecg-boot` (proxied to `localhost:8080` in dev)
- **Timeout**: 15 seconds
- **Auth header**: Sends `X-Access-Token` header from `localStorage.getItem('token')`
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
getToken()          // reads 'token' from localStorage
setToken(token)     // writes 'token' to localStorage
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
3. Token stored in localStorage as `X-Access-Token` header for subsequent requests
4. User info stored in localStorage as `mall_user`

## Routing (`src/router/index.ts`)

Vue Router with HTML5 history mode. Two top-level route groups:

**Auth routes** (no layout):
- `/login` — Login page
- `/register` — Register page

**App routes** (wrapped in `default.vue` layout):
- `/` — Home page with category sidebar + product grid
- `/product/:id` — Product detail (SPU + SKU specs + seckill info)
- `/cart` — Shopping cart
- `/checkout` — Order confirmation (supports `?items=`, `?itemId=`, `?seckillId=` query params)
- `/orders` — Order list
- `/order/:id` — Order detail
- `/address` — Shipping address management
- `/merchant/apply` — Merchant registration
- `/merchant/products` — Merchant product management
- `/coupon` — Coupon center
- `/seckill` — Flash sale
- `/signIn` — Daily check-in
- `/groupBuy` — Group buying
- `/groupBuy/checkout` — Group buy checkout
- `/profile` — User profile / account center

**Cross-page data flow via query params**: The checkout page receives selected items via query string:
- From cart: `?items=cartItemId1,cartItemId2`
- From product "buy now": `?itemId=skuId`
- From seckill: `?seckillId=xxx&seckillPrice=99.99&spuId=xxx`

## Component Patterns

### Layout (`src/layouts/default.vue`)

A standard Ant Design Layout shell:
- **Sticky header** (56px): Logo (盛桦商城), search input, nav links (cart badge, personalized links when logged in)
- **Content area**: `<router-view />` inside `<a-layout-content>`, max-width 1200px centered
- **Footer**: Simple copyright line

The layout is a wrapper route — auth pages (login/register) render outside it via the `App.vue` root `<router-view />`.

### Page Template

Every view file follows this structure:

```vue
<template>
  <!-- Page content using Ant Design Vue components (auto-imported, no manual imports needed) -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
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

onMounted(() => fetchData())
</script>

<style scoped>
/* Scoped component styles */
/* No CSS variables — static values only */
</style>
```

### Error Handling Convention

Every async operation uses try/catch with user-facing `message.error()`:

```ts
try {
  await someApi(params)
  message.success('操作成功')
} catch (e: any) {
  message.error(e.message || '操作失败')
}
```

Failed API calls silently degrade — catch blocks set data to empty arrays/objects rather than crashing.

### State Convention

- **No Pinia stores** — all component-local state
- Cross-component data sharing via route query params (e.g., checkout items)
- Auth state in localStorage (not reactive — components read it on mount)
- Cart count fetched from API on route change via `watch(() => route.path, ...)`

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
| Theme color | `#e4393c` (red) | `{colors.primary}` (black) |
| Button shape | Default rounded | Pill (`{rounded.pill}`) |
| Type scale | Ad-hoc font-sizes | Structured token system |
| CSS approach | Scoped inline values | CSS variable / token system |
| Color blocks | None | Signature pattern |
| Responsive | Basic | Documented breakpoint system |

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

1. Create the view file in `client/src/views/<feature>/index.vue`
2. Add the route in `client/src/router/index.ts`
3. Add API functions to `client/src/api/index.ts`
4. If it needs navigation access, add a link in `client/src/layouts/default.vue` or other relevant page

### Adding a New API

```ts
// In client/src/api/index.ts
export const newApiFunction = (id: string) => http.get('/mall/resource/queryById', { params: { id } })
export const createResource = (data: any) => http.post('/mall/resource/add', data)
export const updateResource = (data: any) => http.put('/mall/resource/edit', data)
```

Naming convention matches the backend controller:
- `/mall/<entity>/list` — paginated query
- `/mall/<entity>/queryById` — single record
- `/mall/<entity>/add` — create
- `/mall/<entity>/edit` — update
- `/mall/<entity>/delete` — delete (by id param)

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
├── vite.config.ts              # Vite config (alias, proxy, auto-import)
├── components.d.ts             # Auto-generated component type declarations
└── src/
    ├── App.vue                  # Root component (<router-view />)
    ├── main.ts                  # App bootstrap
    ├── api/
    │   └── index.ts             # All API function definitions + imgUrl helper
    ├── router/
    │   └── index.ts             # Route definitions
    ├── layouts/
    │   └── default.vue          # Main app layout (header + content + footer)
    ├── utils/
    │   ├── auth.ts              # Token & user localStorage management
    │   ├── http.ts              # Axios instance with interceptors
    │   └── user.ts              # Current user helpers (with demo fallback)
    └── views/
        ├── home/index.vue       # Homepage (category sidebar + product grid + seckill strip)
        ├── login/index.vue      # Login form
        ├── login/register.vue   # Registration form
        ├── product/detail.vue   # Product detail (gallery, specs, SKU selector, seckill banner)
        ├── cart/index.vue       # Shopping cart (select, qty, total, checkout)
        ├── checkout/index.vue   # Order confirmation (address, coupon, items, submit)
        ├── order/list.vue       # Order list
        ├── order/detail.vue     # Order detail (items, status, payment, receipt)
        ├── address/index.vue    # Shipping address CRUD
        ├── coupon/index.vue     # Coupon center
        ├── seckill/index.vue    # Flash sale listing
        ├── signIn/index.vue     # Daily check-in
        ├── groupBuy/index.vue   # Group buying
        ├── groupBuy/checkout.vue # Group buy checkout
        ├── merchant/apply.vue   # Merchant registration form
        ├── merchant/products.vue # Merchant product management
        ├── profile/index.vue    # User profile / account center
        ├── admin/product-audit.vue # Admin: product approval
        └── page/index.vue       # Generic page placeholder
```

## Important Notes

1. **The backend MUST be running** at `localhost:8080` for the `client/` dev server to work — the Vite proxy forwards all `/jeecg-boot/*` requests.
2. **Component auto-import is configured** — Ant Design Vue components are resolved automatically by `unplugin-vue-components`. Do NOT manually import them in `<script>`. However, icon components from `@ant-design/icons-vue` MUST be imported explicitly.
3. **TypeScript is loose** — `any` is used extensively. When adding types, focus on new code rather than retrofitting.
4. **No test infrastructure** — The `client/` project has no test runner configured. Manual testing via `pnpm dev` is the verification path.
5. **The admin panel (jeecgclient/) has its own CLAUDE.md** at `jeecgclient/CLAUDE.md` with detailed architecture documentation — reference it when working on the admin side.
6. **DESIGN.md is the target design** — when the user asks for UI improvements or redesigns, use DESIGN.md as the specification. It represents where the design *should* go, even though the current code doesn't match it yet.
