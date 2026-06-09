# ShengHua Full-Site Redesign and API Recovery Design

Date: 2026-06-09
Workspace: `client/`

## Goal

Rebuild the ShengHua UniApp frontend into a coherent "mall + learning + community" product while restoring the original backend-backed mall functionality. The current app builds successfully, but it mixes mall, course, community, and demo content in a way that hides core commerce flows and creates poor visual consistency.

This redesign must improve both:

- Visual quality: consistent mobile UI, spacing, color, image rendering, cards, buttons, empty states, and page structure.
- Functional completeness: existing backend APIs should be wired into user-facing flows instead of being replaced by hardcoded demo content or "开发中" toasts.

## Confirmed Direction

The product will use the "aggregated homepage" structure selected during design review:

- TabBar: `首页 / 商城 / 学习 / 社区 / 我的`
- `首页`: a cross-domain feed that highlights selected products, courses, promotions, sign-in, group buy, and community content.
- `商城`: the full commerce entry for category browsing, product listing, search, cart access, seckill, group buy, coupons, and orders.
- `学习`: course and learning progress entry.
- `社区`: posts, topics, favorites, creation, and social discovery.
- `我的`: profile, orders, coupons, address, merchant, lecturer, distributor, messages, and account actions.

Cart remains an important commerce action but will not be a TabBar item in this structure. It must be visible from the mall header, product detail page, checkout-adjacent flows, and profile shortcuts.

## Current Problems To Fix

### Product Shape Drift

`pages/home/index.vue` has become a course-first page with hardcoded course banners, categories, and lists. That conflicts with the mall frontend's purpose and hides product/category/cart/order functionality.

### Incorrect Navigation

Some pages call `uni.switchTab()` for routes that are not currently registered as TabBar pages, especially `/pages/cart/index` and `/pages/mall/index`. Under the selected structure, `/pages/mall/index` becomes a TabBar page and should use `switchTab()`, while `/pages/cart/index` remains a normal page and must use `navigateTo()`.

### Demo Data Leaking Into Production Flows

Several user-facing pages fall back to hardcoded Vue/Python/course demo records even when the page is a commerce page:

- Home recommendations
- Seckill list
- Group-buy list
- Course lists
- Learning center
- Message list

Fallbacks should be honest empty states or retry states. Demo data must not masquerade as real backend data in production-facing flows.

### Broken Or Weak Image Rendering

Product detail currently parses image data but renders placeholder blocks instead of real `<image>` nodes. Order list/detail and promotion lists also use placeholder gradients or icons where backend image fields should be rendered through `imgUrl()`.

### Fragmented Styling

The app has competing visual systems:

- `tokens.css` uses a dark navy/purple learning-oriented theme.
- `design-system.css` defines a red mall-oriented theme but is not globally imported.
- `uni.scss` mirrors the dark theme.
- Individual pages define many one-off colors, gradients, and card styles.

The result is visually inconsistent and often detached from the mall brand and commerce task.

## Information Architecture

### TabBar

Use five tabs:

1. `pages/home/index` - 首页
2. `pages/mall/index` - 商城
3. `pages/learn/index` - 学习
4. `pages/community/index` - 社区
5. `pages/profile/index` - 我的

The existing category page at `pages/mall/index` becomes a TabBar page. Shopping cart stays a normal page at `pages/cart/index`.

### Route Ownership

Commerce-owned routes:

- `pages/mall/index`
- `pages/product/detail`
- `pages/cart/index`
- `pages/checkout/index`
- `pages/order/list`
- `pages/order/detail`
- `pages/address/index`
- `pages/coupon/index`
- `pages/seckill/index`
- `pages/groupBuy/index`
- `pages/groupBuy/checkout`
- `pages/merchant/apply`
- `pages/merchant/products`
- `pages/admin/product-audit`
- `pages/distributor/index`

Learning-owned routes:

- `pages/learn/index`
- `pages/course/index`
- `pages/course/detail`
- `pages/course/watch`
- `pages/course/checkout`
- `pages/course/my`
- `pages/course/lecturer/*`

Community-owned routes:

- `pages/community/index`
- `pages/community/detail`
- `pages/community/create`
- `pages/community/my`
- `pages/community/user`
- `pages/community/favorites`

Shared/account routes:

- `pages/profile/index`
- `pages/login/index`
- `pages/login/register`
- `pages/message/index`
- `pages/message/chat`
- `pages/page/index`

## Visual System

### Design Tone

Use a clean, trustworthy mobile commerce style that can also host learning and community content:

- Black and white as the structural base.
- Commerce accents for price and promotion, centered on `#e4393c`.
- Learning accents in purple/blue, used only inside learning surfaces.
- Community accents in green/teal, used only inside community surfaces.
- Minimal shadows; rely on spacing, typography, hairlines, and light background contrast.
- Avoid page-wide dark purple/navy gradients, heavy decorative blobs, and unrelated placeholder gradients.

### Token Consolidation

Consolidate `tokens.css`, `design-system.css`, and `uni.scss` into one coherent token vocabulary. Keep compatibility aliases where existing pages still reference old variable names.

Required token groups:

- Brand and semantic colors
- Text colors
- Page/card surfaces
- Spacing scale
- Radius scale
- Typography scale
- Shadows and hairlines
- Component constants such as bottom bar height and page padding

### Shared Page Patterns

Create or standardize reusable patterns before sweeping through many pages:

- Page shell with safe top padding and consistent background.
- Header variants: plain title, search header, commerce header with cart shortcut.
- Product card for grids and horizontal lists.
- Course card for learning surfaces.
- Post card for community surfaces.
- Bottom action bar for product detail, cart, and checkout.
- Empty state and loading state.
- Price display.
- Status tags and order action buttons.

Do not nest decorative cards inside cards. Cards should represent repeated items or real grouped tools; page sections should be full-width layouts with constrained content.

### Image Rules

Use `imgUrl()` for backend image paths everywhere:

- Product main image
- Product detail carousel
- Cart item image
- Checkout goods image
- Order item image
- Seckill and group-buy product image
- Course cover image when backend provides it
- Community post images

If image data is absent, show a consistent lightweight placeholder. Do not use random gradients as product/course media.

## API Recovery Strategy

### API Layer

Keep the existing `src/api/index.ts` named-export style. Consolidate repeated direct calls when the same endpoint is used by multiple pages.

Add API groups as needed for:

- Search/front product queries
- Course list/detail/lessons/orders
- Messages
- Page configuration
- Distributor data
- Merchant status and products

The HTTP wrapper already unwraps JeecgBoot `{ success, result, message }`. New code must treat API results as unwrapped data.

### Backend Reference

Use `jeecgclient/src/views/mall/` as the field and enum reference for mall entities:

- SPU/SKU fields and product status
- Orders and status values
- Coupon types and status
- Seckill and group-buy activity fields
- Merchant and audit fields
- Distributor/commission fields

When a frontend field cannot be confirmed from the backend reference, display only confirmed fields and write defensive mapping logic.

### Demo And Fallback Policy

Allowed:

- Local demo user fallback already present in `getCurrentUserId()`.
- Graceful empty state when an API fails or returns empty records.
- Small skeleton/loading states.

Not allowed:

- Hardcoded fake courses in commerce pages.
- Hardcoded fake seckill or group-buy products.
- "功能开发中" for a backend capability that already exists.
- Placeholder gradients replacing backend product images.

## Implementation Phases

### Phase 1: Structural Foundation

Scope:

- Update TabBar to `首页 / 商城 / 学习 / 社区 / 我的`.
- Make `pages/mall/index` a TabBar page.
- Keep `pages/cart/index` as a normal page and fix navigation into it.
- Convert the homepage from a course-only page into a cross-domain aggregation page.
- Fix obvious `switchTab`/`navigateTo` misuse.
- Establish the consolidated token system and compatibility aliases.

Acceptance:

- H5 build passes.
- All TabBar entries open.
- Cart navigation no longer uses invalid `switchTab` calls, and mall navigation uses `switchTab()` only after `pages/mall/index` is registered as a TabBar page.
- Homepage no longer presents itself as only a learning page.

### Phase 2: Commerce Main Flow

Scope:

- Product list/category UI and data mapping.
- Product detail carousel, SKU selection, merchant info, cart count, add-to-cart, buy-now.
- Cart list, quantity, selection, remove, checkout navigation.
- Checkout address, coupon, goods list, summary, create-order.
- Order list/detail image rendering and order actions.
- Coupon, seckill, group buy, and address pages.

Acceptance:

- Main flow works: `首页/商城 -> 商品详情 -> 加入购物车/立即购买 -> 结算 -> 订单`.
- Product/detail/order images render real backend images when available.
- Empty backend responses show empty states, not unrelated mock records.
- Error states show actionable toasts.

### Phase 3: Learning And Community

Scope:

- Keep learning as a first-class tab and remove its accidental takeover of the mall homepage.
- Standardize course list/detail/my/watch/checkout visual language.
- Replace hardcoded course records with API-backed loading where endpoints exist.
- Standardize community feed/detail/create/my/favorites/user visual language.
- Keep community image rendering through `imgUrl()`.

Acceptance:

- Learning pages visually match the global system but keep a recognizable learning accent.
- Community pages visually match the global system but keep a recognizable community accent.
- Existing API-backed community interactions still work: topic list, post list, likes, favorites, comments.

### Phase 4: Account, Merchant, Distributor, And Polish

Scope:

- Profile dashboard and shortcuts.
- Merchant apply/products status and actions.
- Distributor stats and commission records.
- Messages and chat.
- Admin product audit.
- Cross-page polish for long text, button overflow, safe area padding, and empty/loading states.

Acceptance:

- Profile no longer mixes unrelated course-first hierarchy with commerce account needs.
- Merchant and distributor pages reflect backend state clearly.
- No obvious "开发中" remains for implemented backend capabilities.
- H5 build passes and key pages are manually inspected in browser.

## Verification Plan

Each implementation phase should run:

```bash
pnpm build:h5
```

For substantial frontend changes, also start the H5 dev server and inspect the relevant pages in the in-app browser. Where backend is unavailable, verify routing, layout, empty states, and error handling locally.

Manual smoke paths:

- TabBar: home, mall, learn, community, profile.
- Commerce: mall category -> product detail -> cart -> checkout -> order list.
- Product detail: SKU sheet, image carousel, add cart, buy now.
- Promotions: seckill and group buy list empty/data states.
- Account: profile shortcuts, order tabs, coupons, address, messages.
- Learning: learn tab, course list, detail, my courses.
- Community: feed, detail, create, my posts, favorites.

## Out Of Scope For The First Implementation Plan

- Backend changes.
- Adding a new state management library.
- Replacing UniApp routing with a custom router.
- Full checkout payment provider integration beyond existing dummy/pay endpoints.
- Pixel-perfect implementation of the aspirational desktop-focused `DESIGN.md`; the mobile UniApp product should adapt its principles rather than copy it literally.

## Open Risks

- Some `/course/*` endpoints may not exist or may differ from the current page assumptions. The implementation plan should inspect available backend/admin references before promising full course data coverage.
- The selected TabBar removes cart from the bottom navigation. Commerce pages must compensate with clear cart access in headers and account shortcuts.
- If the backend is unavailable during implementation, verification will cover routing, layout, build, and graceful API failure states, but not full live data behavior.
