<template>
  <view class="checkout-page">
    <!-- 顶部导航 -->
    <view class="page-header">
      <view class="page-back" @tap="goBack"><text class="back-icon">‹</text></view>
      <text class="page-title">确认订单</text>
      <view style="width:32px" />
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-wrap">
      <view class="loading-spinner" />
    </view>

    <view v-else class="page-body">
      <!-- 收货地址 -->
      <view class="card addr-card" @tap="goAddress">
        <template v-if="selectedAddress">
          <view class="addr-content">
            <view class="addr-top">
              <Icon icon="solar:map-point-bold" width="18" color="var(--text-hint)" />
              <text class="addr-name">{{ selectedAddress.consignee }}</text>
              <text class="addr-phone">{{ selectedAddress.phone }}</text>
              <text v-if="selectedAddress.isDefault" class="addr-default">默认</text>
            </view>
            <text class="addr-detail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }} {{ selectedAddress.detailAddress }}</text>
          </view>
          <text class="addr-arrow">›</text>
        </template>
        <template v-else>
          <view class="addr-empty">
            <Icon icon="solar:map-point-bold" width="20" color="var(--text-hint)" />
            <text class="addr-empty-text">请添加收货地址</text>
          </view>
          <text class="addr-arrow">›</text>
        </template>
      </view>

      <!-- 商品列表 -->
      <view class="card goods-card">
        <view class="card-title-row">
          <Icon icon="solar:bag-bold" width="16" color="var(--color-accent)" />
          <text class="card-title">商品清单</text>
        </view>
        <view v-for="item in selectedItems" :key="item.id" class="goods-item">
          <view class="goods-img">
            <image v-if="item.mainImage" :src="imgUrl(item.mainImage)" class="goods-image" mode="aspectFill" />
            <view v-else class="img-placeholder"><Icon icon="solar:camera-bold" width="24" color="var(--text-hint)" /></view>
          </view>
          <view class="goods-body">
            <text class="goods-name">{{ item.productName }}</text>
            <text v-if="item.specDesc" class="goods-spec">{{ item.specDesc }}</text>
            <view class="goods-bottom">
              <text class="goods-price"><text class="price-symbol">¥</text>{{ item.price }}</text>
              <text class="goods-qty">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 优惠券 -->
      <view v-if="myCoupons.length > 0 && !isSeckillOrder" class="card coupon-card">
        <view class="coupon-row" @tap="showCouponPicker = true">
          <Icon icon="solar:ticket-bold" width="16" color="var(--color-accent)" />
          <text class="coupon-label">优惠券</text>
          <text class="coupon-value" :class="{ active: selectedCouponId }">
            {{ selectedCouponId ? '已选1张' : myCoupons.length + '张可用' }}
          </text>
          <text class="coupon-arrow">›</text>
        </view>
      </view>

      <!-- 订单汇总 -->
      <view class="card summary-card">
        <view class="card-title-row">
          <Icon icon="solar:document-text-bold" width="16" color="var(--color-accent)" />
          <text class="card-title">订单汇总</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">商品金额</text>
          <text class="summary-value">¥{{ goodsTotal.toFixed(2) }}</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">运费</text>
          <text class="summary-value">{{ freight > 0 ? '¥' + freight.toFixed(2) : '免运费' }}</text>
        </view>
        <view v-if="couponDiscount > 0" class="summary-row discount">
          <text class="summary-label">优惠券抵扣</text>
          <text class="summary-value discount-value">-¥{{ couponDiscount.toFixed(2) }}</text>
        </view>
        <view class="summary-divider" />
        <view class="summary-row total">
          <text class="summary-label">合计</text>
          <text class="total-price"><text class="price-symbol">¥</text>{{ orderTotal.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 备注 -->
      <view class="card remark-card">
        <view class="remark-row">
          <Icon icon="solar:pen-new-square-bold" width="16" color="var(--color-accent)" />
          <text class="remark-label">备注</text>
          <input v-model="remark" class="remark-input" placeholder="选填：给卖家留言" maxlength="200" />
        </view>
      </view>
    </view>

    <!-- 底部提交栏 -->
    <view v-if="!loading" class="submit-bar">
      <view class="submit-info">
        <text class="submit-count">{{ selectedItems.length }}件</text>
        <text class="submit-total"><text class="price-symbol">¥</text>{{ orderTotal.toFixed(2) }}</text>
      </view>
      <button class="submit-btn" :disabled="!canSubmit || submitting" :class="{ loading: submitting }" @tap="handleSubmit">
        {{ submitting ? '提交中...' : '提交订单' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getCartList, getAddressList, createOrder, imgUrl, getUserCoupons } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const currentUserId = getCurrentUserId()

const loading = ref(false)
const submitting = ref(false)
const addressList = ref<any[]>([])
const selectedAddressId = ref('')
const selectedItems = ref<any[]>([])
const remark = ref('')
const isSeckillOrder = ref(false)
const seckillProductId = ref('')
const seckillPrice = ref(0)
const freight = ref(0)
const myCoupons = ref<any[]>([])
const selectedCouponId = ref('')
const couponTemplates = ref<any[]>([])
const showCouponPicker = ref(false)

const goodsTotal = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const selectedCoupon = computed(() => {
  if (!selectedCouponId.value) return null
  const uc = myCoupons.value.find((c: any) => c.id === selectedCouponId.value)
  if (!uc) return null
  return couponTemplates.value.find((t: any) => t.id === uc.templateId) || uc
})
const couponDiscount = computed(() => {
  const c = selectedCoupon.value
  if (!c) return 0
  const total = goodsTotal.value
  if (c.couponType === 1) { return total >= (c.minPurchaseAmount || 0) ? c.discountValue || 0 : 0 }
  if (c.couponType === 2) {
    const d = total * (1 - (c.discountValue || 1))
    return c.maxDiscountAmount && d > c.maxDiscountAmount ? c.maxDiscountAmount : Math.round(d * 100) / 100
  }
  if (c.couponType === 3) return freight.value
  return 0
})
const orderTotal = computed(() => goodsTotal.value + freight.value - couponDiscount.value)
const selectedAddress = computed(() => addressList.value.find(addr => addr.id === selectedAddressId.value))
const canSubmit = computed(() => selectedAddressId.value !== '' && selectedItems.value.length > 0)

function goBack() { uni.navigateBack() }
function goAddress() { uni.navigateTo({ url: '/pages/address/index' }) }

onLoad(async (options) => {
  loading.value = true
  try {
    const seckillId = options?.seckillId
    if (seckillId) {
      isSeckillOrder.value = true
      seckillProductId.value = seckillId
      seckillPrice.value = Number(options?.seckillPrice) || 0
    }

    const addrs: any = await getAddressList(currentUserId)
    addressList.value = addrs?.records || []
    const defaultAddr = addressList.value.find((a: any) => a.isDefault)
    if (defaultAddr) selectedAddressId.value = defaultAddr.id
    else if (addressList.value.length > 0) selectedAddressId.value = addressList.value[0].id

    if (isSeckillOrder.value) {
      const spuId = options?.spuId
      if (spuId) {
        try {
          const spuData: any = await http.get('/mall/spu/queryById', { params: { id: spuId } })
          if (spuData) {
            selectedItems.value = [{ id: 'seckill_' + seckillProductId.value, spuId, skuId: spuData.skuList?.[0]?.id || '', price: seckillPrice.value, quantity: 1, productName: spuData.spuName || '秒杀商品', mainImage: spuData.mainImage || '' }]
          }
        } catch {}
      }
      if (selectedItems.value.length === 0) {
        selectedItems.value = [{ id: 'seckill_' + seckillProductId.value, spuId: options?.spuId, price: seckillPrice.value, quantity: 1, productName: '秒杀商品', mainImage: '' }]
      }
      loading.value = false
      return
    }

    const cart: any = await getCartList(currentUserId)
    const cartArr = Array.isArray(cart) ? cart : []
    const itemIdsParam = options?.items || ''
    const singleItemId = options?.itemId || ''
    if (singleItemId) {
      const found = cartArr.filter((item: any) => item.skuId === singleItemId)
      selectedItems.value = found.length > 0 ? [found[found.length - 1]] : cartArr.filter((item: any) => item.id === singleItemId)
    } else if (itemIdsParam) {
      const ids = itemIdsParam.split(',').filter(Boolean)
      selectedItems.value = cartArr.filter((item: any) => ids.includes(item.id))
    } else {
      selectedItems.value = cartArr.filter((item: any) => item.selected)
    }

    const coupons: any = await getUserCoupons(currentUserId)
    myCoupons.value = (coupons?.records || []).filter((c: any) => c.couponStatus === 0)
    if (myCoupons.value.length > 0) {
      try {
        const tplRes = await http.get('/mall/coupon/list', { params: { pageSize: 999 } })
        couponTemplates.value = tplRes?.records || []
      } catch {}
    }
  } catch {
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  const addr = selectedAddress.value
  if (!addr) { uni.showToast({ title: '请选择收货地址', icon: 'none' }); return }
  if (selectedItems.value.length === 0) { uni.showToast({ title: '请选择商品', icon: 'none' }); return }

  submitting.value = true
  try {
    if (isSeckillOrder.value) {
      const result: any = await http.post('/mall/seckill/buy', {
        productId: seckillProductId.value, userId: currentUserId, quantity: 1,
        receiverName: addr.consignee, receiverPhone: addr.phone,
        receiverProvince: addr.province, receiverCity: addr.city,
        receiverDistrict: addr.district, receiverAddress: addr.detailAddress,
        remark: remark.value,
      })
      uni.showToast({ title: '秒杀下单成功', icon: 'success' })
      const orderId = result?.id || result
      setTimeout(() => {
        uni.redirectTo({ url: orderId ? `/pages/order/detail?id=${orderId}` : '/pages/order/list' })
      }, 500)
      return
    }

    const result = await createOrder({
      userId: currentUserId,
      receiverName: addr.consignee, receiverPhone: addr.phone,
      receiverProvince: addr.province, receiverCity: addr.city,
      receiverDistrict: addr.district, receiverAddress: addr.detailAddress,
      remark: remark.value, couponId: selectedCouponId.value || undefined,
      items: selectedItems.value.map(item => ({ cartItemId: item.id, spuId: item.spuId, skuId: item.skuId, quantity: item.quantity })),
    })
    uni.showToast({ title: '下单成功', icon: 'success' })
    const orderId = (result as any)?.id || result
    setTimeout(() => {
      uni.redirectTo({ url: orderId ? `/pages/order/detail?id=${orderId}` : '/pages/order/list' })
    }, 500)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '下单失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import url('@/styles/tokens.css');
.checkout-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

/* ---- 导航栏 ---- */
.page-header {
  display: none;
}

.page-back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 28px;
  font-weight: 300;
  color: #333;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* ---- 内容区域 ---- */
.page-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- 通用卡片 ---- */
.card {
  background: var(--color-card, #fff);
  border-radius: var(--radius-lg, 14px);
  box-shadow: var(--shadow-sm);
  padding: 16px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.card-emoji {
  font-size: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

/* ---- 地址 ---- */
.addr-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-card, #fff));
}

.addr-content {
  flex: 1;
}

.addr-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.addr-icon {
  font-size: 18px;
}

.addr-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.addr-phone {
  font-size: 14px;
  color: #666;
}

.addr-default {
  font-size: 10px;
  color: var(--color-accent);
  background: var(--color-primary-light);
  padding: 1px 6px;
  border-radius: 4px;
}

.addr-detail {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  padding-left: 26px;
}

.addr-arrow {
  font-size: 20px;
  color: #ccc;
  margin-left: 8px;
  font-weight: 300;
}

.addr-empty {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.addr-empty-icon {
  font-size: 20px;
}

.addr-empty-text {
  font-size: 14px;
  color: #999;
}

/* ---- 商品 ---- */
.goods-item {
  display: flex;
  gap: 12px;
  padding: 10px 0;
}

.goods-item + .goods-item {
  border-top: 1px solid var(--color-divider);
}

.goods-img {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
}

.goods-image {
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
}

.goods-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.goods-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-spec {
  font-size: 12px;
  color: #999;
}

.goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.goods-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-accent);
}

.goods-price .price-symbol {
  font-size: 11px;
}

.goods-qty {
  font-size: 13px;
  color: #999;
}

/* ---- 优惠券 ---- */
.coupon-card {
  padding: 0;
}

.coupon-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 6px;
}

.coupon-icon {
  font-size: 16px;
}

.coupon-label {
  font-size: 14px;
  color: #333;
  margin-right: 8px;
}

.coupon-value {
  flex: 1;
  font-size: 14px;
  color: #999;
}

.coupon-value.active {
  color: var(--color-accent);
  font-weight: 500;
}

.coupon-arrow {
  font-size: 18px;
  color: #ccc;
  font-weight: 300;
}

/* ---- 汇总 ---- */
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-label {
  font-size: 14px;
  color: #666;
}

.summary-value {
  font-size: 14px;
  color: #333;
}

.discount-value {
  color: var(--color-accent);
}

.summary-divider {
  height: 1px;
  background: var(--color-divider);
  margin: 10px 0;
}

.summary-row.total {
  margin-bottom: 0;
}

.summary-row.total .summary-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.total-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-accent);
}

.total-price .price-symbol {
  font-size: 13px;
}

/* ---- 备注 ---- */
.remark-card {
  padding: 0;
}

.remark-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 6px;
}

.remark-icon {
  font-size: 16px;
}

.remark-label {
  font-size: 14px;
  color: #333;
  margin-right: 12px;
}

.remark-input {
  flex: 1;
  font-size: 14px;
  color: #333;
}

/* ---- 提交栏 ---- */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-card, #fff);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  padding: 10px 16px calc(10px + var(--safe-area-bottom));
  z-index: 50;
}

.submit-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.submit-count {
  font-size: 13px;
  color: #666;
}

.submit-total {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-accent);
}

.submit-total .price-symbol {
  font-size: 13px;
}

.submit-btn {
  min-width: 140px;
  height: 44px;
  border-radius: var(--radius-full);
  border: none;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent));
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn.loading {
  opacity: 0.7;
}

.submit-btn[disabled] {
  opacity: 0.5;
}

/* ---- 通用 ---- */
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top-color: var(--color-accent);
  border-radius: var(--radius-circle);
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
