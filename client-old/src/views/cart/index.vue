<template>
  <div class="page-container">
    <!-- 顶部 -->
    <header class="page-header">
      <span class="page-title">购物车</span>
    </header>

    <!-- 空状态 -->
    <div v-if="cartItems.length === 0 && !loading" class="empty-wrap">
      <ShoppingCartOutlined class="empty-icon" />
      <div class="empty-text">购物车是空的</div>
      <button class="btn btn-primary" style="margin-top:16px" @click="$router.push('/')">去逛逛</button>
    </div>

    <!-- 购物车列表 -->
    <a-spin :spinning="loading" v-else>
      <div class="cart-list">
        <div v-for="item in cartItems" :key="item.id" class="cart-card">
          <div class="cart-card-check">
            <a-checkbox v-model:checked="item.selected" @change="onSelectChange(item)" />
          </div>
          <div class="cart-card-img" @click="goDetail(item.spuId)">
            <img v-if="item.mainImage" :src="imgUrl(item.mainImage)" :alt="item.productName" />
            <div v-else class="img-placeholder">
              <ShoppingOutlined style="font-size:24px;color:#ddd" />
            </div>
            <span v-if="item.shelfStatus === 0" class="shelf-badge">已下架</span>
          </div>
          <div class="cart-card-body">
            <div class="cart-card-name" @click="goDetail(item.spuId)">{{ item.productName }}</div>
            <div class="cart-card-spec" v-if="item.specDesc">{{ item.specDesc }}</div>
            <div class="cart-card-bottom">
              <div class="cart-card-price">
                <span class="price-symbol">¥</span>{{ item.price }}
              </div>
              <div class="cart-card-qty">
                <button class="qty-btn" :disabled="item.quantity <= 1" @click="changeQty(item, -1)">-</button>
                <span class="qty-num">{{ item.quantity }}</span>
                <button class="qty-btn" :disabled="item.stock && item.quantity >= item.stock" @click="changeQty(item, 1)">+</button>
              </div>
            </div>
          </div>
          <button class="cart-card-del" @click="handleRemove(item)">
            <DeleteOutlined />
          </button>
        </div>
      </div>

      <!-- 全选 + 推荐凑单 -->
      <div class="cart-actions" v-if="cartItems.length > 0">
        <div class="select-all" @click="toggleAll(!allChecked)">
          <a-checkbox :checked="allChecked" :indeterminate="indeterminate" @change="(e: any) => toggleAll(e.target?.checked ?? e)" />
          <span class="select-all-text">全选</span>
        </div>
        <button class="btn btn-ghost btn-sm" @click="$router.push('/')">继续逛逛</button>
      </div>
    </a-spin>

    <!-- 底部结算栏 -->
    <div class="cart-footer" v-if="cartItems.length > 0">
      <div class="footer-info">
        <div class="footer-total">
          <span class="footer-total-label">合计：</span>
          <span class="footer-total-price"><span class="price-symbol">¥</span>{{ totalAmount.toFixed(2) }}</span>
        </div>
        <div class="footer-count">已选 {{ selectedCount }} 件</div>
      </div>
      <button
        class="btn btn-primary btn-lg checkout-btn"
        :class="{ disabled: selectedCount === 0 }"
        :disabled="selectedCount === 0"
        @click="goCheckout"
      >去结算</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ShoppingCartOutlined, ShoppingOutlined, DeleteOutlined,
} from '@ant-design/icons-vue'
import {
  getCartList, updateCartQty, toggleCartSelect, removeCartItem, imgUrl,
} from '@/api'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
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
    message.error('修改数量失败')
    item.quantity -= delta
  }
}

async function handleQtyChange(item: any) {
  if (item.quantity < 1) item.quantity = 1
  if (item.stock && item.quantity > item.stock) item.quantity = item.stock
  try {
    await updateCartQty(item.id, item.quantity)
  } catch {
    message.error('修改数量失败')
  }
}

async function handleRemove(item: any) {
  try {
    await removeCartItem(item.id)
    cartItems.value = cartItems.value.filter(i => i.id !== item.id)
    message.success('已删除')
  } catch {
    message.error('删除失败')
  }
}

function goDetail(spuId: string) {
  if (spuId) router.push({ name: 'productDetail', params: { id: spuId } })
}

function goCheckout() {
  const selected = cartItems.value.filter(item => item.selected)
  if (selected.length === 0) {
    message.warning('请选择商品')
    return
  }
  const itemIds = selected.map(item => item.id).join(',')
  router.push({ name: 'checkout', query: { items: itemIds } })
}

onMounted(fetchCart)
</script>

<style scoped>
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

.cart-card-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg, #f5f5f5);
  position: relative;
  cursor: pointer;
}

.cart-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shelf-badge {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  cursor: pointer;
}

.cart-card-spec {
  font-size: 12px;
  color: var(--color-text-hint, #999);
  background: var(--color-bg, #f5f5f5);
  padding: 2px 8px;
  border-radius: 4px;
  align-self: flex-start;
}

.cart-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.cart-card-price {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-primary, #FF4D4F);
}

.cart-card-price .price-symbol {
  font-size: 12px;
}

.cart-card-qty {
  display: flex;
  align-items: center;
  gap: 0;
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
  font-size: 14px;
  color: var(--color-text, #1a1a1a);
  background: transparent;
  border: none;
  cursor: pointer;
}

.qty-btn:disabled {
  color: var(--color-text-disabled, #ccc);
  cursor: not-allowed;
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
  font-size: 14px;
  color: var(--color-text-hint, #999);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.cart-card-del:active {
  background: var(--color-bg, #f5f5f5);
  color: var(--color-primary, #FF4D4F);
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
  cursor: pointer;
}

.select-all-text {
  font-size: 14px;
  color: var(--color-text-secondary, #666);
}

/* ---- 底部结算栏 ---- */
.cart-footer {
  position: fixed;
  bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px));
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
  color: var(--color-primary, #FF4D4F);
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
}

.checkout-btn.disabled {
  opacity: 0.5;
}
</style>
