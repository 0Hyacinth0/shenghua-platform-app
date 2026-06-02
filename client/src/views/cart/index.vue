<template>
  <div class="cart-page">
    <h2 class="page-title">购物车</h2>

    <div v-if="cartItems.length === 0 && !loading" class="empty-cart">
      <a-empty description="购物车是空的">
        <template #children>
          <a-button type="primary" @click="$router.push('/')">去逛逛</a-button>
        </template>
      </a-empty>
    </div>

    <template v-else>
      <a-spin :spinning="loading">
        <!-- 商品列表 -->
        <div class="cart-table">
          <div class="cart-header">
            <a-checkbox
              :checked="allChecked"
              :indeterminate="indeterminate"
              @change="toggleAll"
            >
              全选
            </a-checkbox>
            <span class="header-label">商品</span>
          </div>

          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-check">
              <a-checkbox v-model:checked="item.selected" @change="onSelectChange(item)" />
            </div>
            <div class="item-img" @click="goDetail(item.spuId)">
              <a-image
                :src="imgUrl(item.mainImage)"
                :preview="false"
                :width="80"
                :height="80"
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGR5PSIuM2VtIiBmaWxsPSIjYmJiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIj7lm77niYfliqDovb0gPC90ZXh0Pjwvc3ZnPg=="
                style="border-radius:4px;cursor:pointer"
              />
            </div>
            <div class="item-info">
              <div class="item-name" @click="goDetail(item.spuId)">
                {{ item.productName }}
                <a-tag v-if="item.productType === 1" color="blue" size="small" style="margin-left:4px">实物</a-tag>
                <a-tag v-if="item.productType === 2" color="purple" size="small" style="margin-left:4px">虚拟</a-tag>
                <a-tag v-if="item.shelfStatus === 0" color="red" size="small" style="margin-left:4px">已下架</a-tag>
              </div>
              <div class="item-spec" v-if="item.specDesc">{{ item.specDesc }}</div>
            </div>
            <div class="item-price">&yen;{{ item.price }}</div>
            <div class="item-qty">
              <a-input-number
                v-model:value="item.quantity"
                :min="1"
                :max="item.stock || 9999"
                @change="handleQtyChange(item)"
              />
            </div>
            <div class="item-subtotal">&yen;{{ (item.price * item.quantity).toFixed(2) }}</div>
            <div class="item-action">
              <a-button type="link" danger @click="handleRemove(item)">删除</a-button>
            </div>
          </div>
        </div>
      </a-spin>

      <!-- 底部固定栏 -->
      <div class="cart-footer" v-if="cartItems.length > 0">
        <div class="footer-left">
          <a-checkbox
            :checked="allChecked"
            :indeterminate="indeterminate"
            @change="toggleAll"
          >
            全选
          </a-checkbox>
        </div>
        <div class="footer-right">
          <span class="selected-count">
            已选 <strong>{{ selectedCount }}</strong> 件
          </span>
          <span class="total-label">合计：</span>
          <span class="total-price">&yen;{{ totalAmount.toFixed(2) }}</span>
          <a-button
            type="primary"
            size="large"
            class="checkout-btn"
            :disabled="selectedCount === 0"
            @click="goCheckout"
          >
            去结算
          </a-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  getCartList,
  updateCartQty,
  toggleCartSelect,
  removeCartItem,
  imgUrl,
} from '@/api'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()

// 当前用户ID（从登录状态获取）
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
    cartItems.value = Array.isArray(res) ? res : []
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
    // 如果后端调用失败，回滚
    item.selected = !item.selected
  }
}

async function toggleAll(e: any) {
  const checked = e.target ? (e.target as HTMLInputElement).checked : e
  for (const item of cartItems.value) {
    if (item.selected !== checked) {
      item.selected = checked
      try {
        await toggleCartSelect(item.id)
      } catch {
        item.selected = !checked
      }
    }
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
.cart-page {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px;
}

.empty-cart {
  padding: 80px 0;
}

.cart-table {
  margin-bottom: 80px;
}

.cart-header {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.header-label {
  margin-left: 60px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-check {
  width: 40px;
  display: flex;
  justify-content: center;
}

.item-img {
  width: 80px;
  height: 80px;
  margin-right: 12px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  color: #333;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-name:hover {
  color: #e4393c;
}

.item-spec {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.item-price,
.item-subtotal {
  width: 120px;
  text-align: center;
  font-size: 14px;
  color: #333;
}

.item-qty {
  width: 120px;
  display: flex;
  justify-content: center;
}

.item-action {
  width: 80px;
  text-align: center;
}

/* 底部固定栏 */
.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  z-index: 50;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  font-size: 14px;
  color: #666;
}

.total-label {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 22px;
  font-weight: 700;
  color: #e4393c;
}

.checkout-btn {
  height: 44px;
  min-width: 120px;
  font-size: 16px;
  background: #e4393c;
  border-color: #e4393c;
  margin-left: 8px;
}
</style>