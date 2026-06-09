<template>
  <view class="page-container">
    <!-- 顶部 -->
    <view class="page-header">
      <text class="page-title">购物车</text>
    </view>

    <!-- 空状态 -->
    <view v-if="cartItems.length === 0 && !loading" class="empty-wrap">
      <Icon icon="solar:cart-large-2-bold" width="64" color="var(--text-hint)" />
      <text class="empty-text">购物车是空的</text>
      <button class="btn btn-primary" style="margin-top:16px" @tap="goHome">去逛逛</button>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-wrap">
      <view class="loading-spinner" />
    </view>

    <!-- 购物车列表 -->
    <view v-if="!loading && cartItems.length > 0" class="cart-list">
      <view v-for="item in cartItems" :key="item.id" class="cart-card">
        <view class="cart-card-check" @tap="onSelectChange(item)">
          <view class="checkbox" :class="{ checked: item.selected }">
            <text v-if="item.selected" class="checkbox-icon">✓</text>
          </view>
        </view>
        <view class="cart-card-img" @tap="goDetail(item.spuId)">
          <image v-if="item.mainImage" :src="imgUrl(item.mainImage)" class="cart-img" mode="aspectFill" />
          <view v-else class="img-placeholder">
            <Icon icon="solar:bag-bold" width="24" color="var(--text-hint)" />
          </view>
          <view v-if="item.shelfStatus === 0" class="shelf-badge">
            <text class="shelf-text">已下架</text>
          </view>
        </view>
        <view class="cart-card-body">
          <text class="cart-card-name" @tap="goDetail(item.spuId)">{{ item.productName }}</text>
          <view v-if="item.specDesc" class="cart-card-spec">
            <text class="spec-text">{{ item.specDesc }}</text>
          </view>
          <view class="cart-card-bottom">
            <view class="cart-card-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ item.price }}</text>
            </view>
            <view class="cart-card-qty">
              <view class="qty-btn" :class="{ disabled: item.quantity <= 1 }" @tap="changeQty(item, -1)">
                <text class="qty-btn-text">-</text>
              </view>
              <text class="qty-num">{{ item.quantity }}</text>
              <view class="qty-btn" :class="{ disabled: item.stock && item.quantity >= item.stock }" @tap="changeQty(item, 1)">
                <text class="qty-btn-text">+</text>
              </view>
            </view>
          </view>
        </view>
        <view class="cart-card-del" @tap="handleRemove(item)">
          <text class="del-icon">✕</text>
        </view>
      </view>
    </view>

    <!-- 全选 -->
    <view v-if="!loading && cartItems.length > 0" class="cart-actions">
      <view class="select-all" @tap="toggleAll(!allChecked)">
        <view class="checkbox" :class="{ checked: allChecked, indeterminate: indeterminate }">
          <text v-if="allChecked" class="checkbox-icon">✓</text>
          <text v-else-if="indeterminate" class="checkbox-icon">-</text>
        </view>
        <text class="select-all-text">全选</text>
      </view>
      <button class="btn btn-ghost btn-sm" @tap="goHome">继续逛逛</button>
    </view>

    <!-- 底部结算栏 -->
    <view v-if="!loading && cartItems.length > 0" class="cart-footer">
      <view class="footer-info">
        <view class="footer-total">
          <text class="footer-total-label">合计：</text>
          <text class="footer-total-price"><text class="price-symbol">¥</text>{{ totalAmount.toFixed(2) }}</text>
        </view>
        <text class="footer-count">已选 {{ selectedCount }} 件</text>
      </view>
      <button
        class="checkout-btn"
        :class="{ disabled: selectedCount === 0 }"
        :disabled="selectedCount === 0"
        @tap="goCheckout"
      >去结算</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import {
  getCartList, updateCartQty, toggleCartSelect, removeCartItem, imgUrl,
} from '@/api'
import { getCurrentUserId } from '@/utils/user'
import { goHome as navGoHome } from '@/utils/navigation'

const currentUserId = getCurrentUserId()
const cartItems = ref<any[]>([])
const loading = ref(false)

const allChecked = computed(() => {
  if (cartItems.value.length === 0) return false
  return cartItems.value.every(item => item.selected)
})

const indeterminate = computed(() => {
  const selected = cartItems.value.filter(item => item.selected)
  return selected.length > 0 && selected.length < cartItems.value.length
})

const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).reduce((sum, item) => sum + item.quantity, 0)
})

const totalAmount = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

async function fetchCart() {
  loading.value = true
  try {
    const res = await getCartList(currentUserId)
    cartItems.value = Array.isArray(res) ? res : (res as any)?.records || []
  } catch {
    cartItems.value = []
  } finally {
    loading.value = false
  }
}

async function onSelectChange(item: any) {
  item.selected = !item.selected
  try {
    await toggleCartSelect(item.id)
  } catch {
    item.selected = !item.selected
  }
}

async function toggleAll(checked: boolean) {
  for (const item of cartItems.value) {
    if (item.selected !== checked) {
      item.selected = checked
      try { await toggleCartSelect(item.id) } catch { item.selected = !checked }
    }
  }
}

async function changeQty(item: any, delta: number) {
  const newQty = item.quantity + delta
  if (newQty < 1) return
  if (item.stock && newQty > item.stock) return
  item.quantity = newQty
  try {
    await updateCartQty(item.id, newQty)
  } catch {
    uni.showToast({ title: '修改数量失败', icon: 'none' })
    item.quantity -= delta
  }
}

async function handleRemove(item: any) {
  uni.showModal({
    title: '提示',
    content: '确定删除该商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await removeCartItem(item.id)
          cartItems.value = cartItems.value.filter(i => i.id !== item.id)
          uni.showToast({ title: '已删除', icon: 'success' })
        } catch {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

function goDetail(spuId: string) {
  if (spuId) uni.navigateTo({ url: `/pages/product/detail?id=${spuId}` })
}

function goHome() {
  navGoHome()
}

function goCheckout() {
  const selected = cartItems.value.filter(item => item.selected)
  if (selected.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  const itemIds = selected.map(item => item.id).join(',')
  uni.navigateTo({ url: `/pages/checkout/index?items=${itemIds}` })
}

onLoad(() => fetchCart())
onShow(() => fetchCart())
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: 70px;
}

.page-header {
  background: #fff;
  padding: 12px 16px;
  text-align: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
}

/* ---- 购物车列表 ---- */
.cart-list {
  padding: 12px 16px;
}

.cart-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-card, #fff);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  position: relative;
}

.cart-card-check {
  flex-shrink: 0;
}

.checkbox {
  width: 22px;
  height: 22px;
  border-radius: var(--radius-circle);
  border: 2px solid var(--color-border, #ddd);
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.checkbox-icon {
  font-size: 14px;
  color: #fff;
  font-weight: 700;
}

.cart-card-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg, #f5f5f5);
  position: relative;
}

.cart-img {
  width: 100%;
  height: 100%;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 24px;
  color: #ddd;
}

.shelf-badge {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.shelf-text {
  font-size: 11px;
  color: white;
}

.cart-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cart-card-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text, #1a1a1a);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cart-card-spec {
  background: var(--color-bg, #f5f5f5);
  padding: 2px 8px;
  border-radius: 4px;
  align-self: flex-start;
}

.spec-text {
  font-size: 12px;
  color: var(--color-text-hint, #999);
}

.cart-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.cart-card-price {
  display: flex;
  align-items: baseline;
}

.cart-card-price .price-symbol {
  font-size: 12px;
  color: var(--color-accent);
  font-weight: 700;
}

.price-value {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-accent);
}

.cart-card-qty {
  display: flex;
  align-items: center;
  background: var(--color-bg, #f5f5f5);
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn.disabled {
  opacity: 0.3;
}

.qty-btn-text {
  font-size: 14px;
  color: var(--color-text, #1a1a1a);
}

.qty-num {
  width: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
}

.cart-card-del {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.del-icon {
  font-size: 14px;
  color: var(--color-text-hint, #999);
}

/* ---- 全选栏 ---- */
.cart-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 12px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-all-text {
  font-size: 14px;
  color: var(--color-text-secondary, #666);
}

/* ---- 底部结算栏 ---- */
.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-card, #fff);
  border-top: 0.5px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  z-index: 50;
}

.footer-info {
  flex: 1;
}

.footer-total {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.footer-total-label {
  font-size: 13px;
  color: var(--color-text-secondary, #666);
}

.footer-total-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-accent);
}

.footer-total-price .price-symbol {
  font-size: 13px;
}

.footer-count {
  font-size: 11px;
  color: var(--color-text-hint, #999);
  margin-top: 2px;
}

.checkout-btn {
  min-width: 120px;
  height: 44px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-accent);
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkout-btn.disabled {
  opacity: 0.5;
}

/* ---- 通用 ---- */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-disabled, #ccc);
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-hint, #999);
}

.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border, #eee);
  border-top-color: var(--color-accent);
  border-radius: var(--radius-circle);
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  border: none;
}

.btn-primary {
  background: var(--color-accent);
  color: white;
}

.btn-ghost {
  color: var(--color-text-secondary, #666);
  background: var(--color-bg, #f5f5f5);
}

.btn-sm {
  padding: 6px 16px;
  font-size: 12px;
}
</style>
