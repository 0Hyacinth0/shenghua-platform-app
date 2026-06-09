<template>
  <view class="page-container">
    <view class="nav-bar">
      <text class="nav-back" @tap="goBack">‹</text>
      <text class="nav-title">拼团结算</text>
      <view style="width:36px" />
    </view>

    <view v-if="loading" class="loading-wrap">
      <view class="loading-spinner" />
    </view>

    <template v-else>
      <!-- 拼团信息 -->
      <view class="group-info-card">
        <view class="group-banner">
          <Icon icon="solar:confetti-bold" width="18" color="#fff" />
          <text class="banner-text">{{ groupInfo.groupSize || 2 }}人成团，还差{{ groupInfo.remaining || groupInfo.groupSize || 2 }}人</text>
        </view>
        <view class="group-product">
          <view class="product-img-wrap">
            <image v-if="groupInfo.mainImage" :src="imgUrl(groupInfo.mainImage)" class="product-img" mode="aspectFill" />
            <view v-else class="img-placeholder">
              <Icon icon="solar:bag-bold" width="28" color="var(--text-hint)" />
            </view>
          </view>
          <view class="product-info">
            <text class="product-name">{{ groupInfo.spuName }}</text>
            <view class="price-row">
              <text class="group-price">
                <text class="price-symbol">¥</text>{{ groupInfo.groupPrice }}
              </text>
              <text class="original-price">¥{{ groupInfo.originalPrice }}</text>
            </view>
            <text class="product-spec">{{ groupInfo.specText }}</text>
          </view>
        </view>
      </view>

      <!-- 收货地址 -->
      <view class="address-card" @tap="goAddress">
        <Icon icon="solar:map-point-bold" width="20" color="var(--text-hint)" />
        <view v-if="address" class="address-info">
          <view class="address-top">
            <text class="address-name">{{ address.name }}</text>
            <text class="address-phone">{{ address.phone }}</text>
          </view>
          <text class="address-detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</text>
        </view>
        <view v-else class="address-empty">
          <text class="address-empty-text">请选择收货地址</text>
        </view>
        <text class="address-arrow">›</text>
      </view>

      <!-- 数量 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">购买数量</text>
          <text class="info-value">{{ quantity }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">运费</text>
          <text class="info-value">{{ freight > 0 ? '¥' + freight : '免运费' }}</text>
        </view>
      </view>

      <!-- 底部结算栏 -->
      <view class="checkout-bar">
        <view class="checkout-total">
          <text class="total-label">合计：</text>
          <text class="total-price">
            <text class="price-symbol">¥</text>{{ totalAmount }}
          </text>
        </view>
        <button class="checkout-btn" @tap="onSubmit">提交订单</button>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getGroupBuyList, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'
import http from '@/utils/http'

const loading = ref(true)
const groupInfo = ref<any>({})
const address = ref<any>(null)
const quantity = ref(1)
const freight = ref(0)
let groupBuyId = ''
let spuId = ''

const totalAmount = computed(() => {
  const price = groupInfo.value.groupPrice || 0
  return (price * quantity.value + freight.value).toFixed(2)
})

function goBack() {
  uni.navigateBack()
}

function goAddress() {
  uni.navigateTo({ url: '/pages/address/index' })
}

async function loadGroupInfo() {
  try {
    const res = await getGroupBuyList({ id: groupBuyId })
    const list: any[] = res?.records || (Array.isArray(res) ? res : [])
    if (list.length > 0) {
      groupInfo.value = list[0]
    }
  } catch {
    groupInfo.value = {}
  }
}

async function loadDefaultAddress() {
  try {
    const res = await http.get('/mall/userAddress/list', { params: { userId: getCurrentUserId() } })
    const list: any[] = Array.isArray(res) ? res : (res?.records || [])
    address.value = list.find((a: any) => a.defaultFlag) || list[0] || null
  } catch {
    address.value = null
  }
}

async function onSubmit() {
  if (!address.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }
  try {
    await http.post('/mall/groupBuy/join', {
      groupBuyId,
      spuId,
      userId: getCurrentUserId(),
      addressId: address.value.id,
      quantity: quantity.value,
    })
    uni.showToast({ title: '拼团成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/order/list' })
    }, 500)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '提交失败', icon: 'none' })
  }
}

// 监听地址选择事件
uni.$on('addressSelected', (addr: any) => {
  address.value = addr
})

onLoad((options: any) => {
  groupBuyId = options?.groupBuyId || ''
  spuId = options?.spuId || ''
  loading.value = true
  Promise.all([loadGroupInfo(), loadDefaultAddress()]).finally(() => {
    loading.value = false
  })
})
</script>

<style scoped>
@import url('@/styles/tokens.css');
.page-container {
  min-height: 100vh;
  background: #F5F6FA;
  padding-bottom: 80px;
}

.nav-bar {
  display: none;
}

.nav-back {
  font-size: 28px;
  font-weight: 300;
  color: #1a1a1a;
  padding: 4px 8px;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.group-info-card {
  background: #fff;
  margin-bottom: 8px;
  border-radius: var(--radius-lg);
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.group-banner {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent));
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-icon {
  font-size: 18px;
}

.banner-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.group-product {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.product-img-wrap {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  background: #F5F6FA;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 28px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.group-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-accent);
}

.price-symbol {
  font-size: 12px;
}

.original-price {
  font-size: 12px;
  color: #ccc;
  text-decoration: line-through;
}

.product-spec {
  font-size: 12px;
  color: #999;
}

.address-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 16px;
  margin: 0 16px 8px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.address-card:active {
  background: #F5F6FA;
}

.address-icon {
  font-size: 20px;
}

.address-info {
  flex: 1;
}

.address-top {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.address-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.address-phone {
  font-size: 14px;
  color: #666;
}

.address-detail {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.address-empty {
  flex: 1;
}

.address-empty-text {
  font-size: 14px;
  color: #999;
}

.address-arrow {
  font-size: 18px;
  color: #ccc;
}

.info-card {
  background: #fff;
  padding: 16px;
  margin: 0 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #1a1a1a;
}

.checkout-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px calc(10px + var(--safe-area-bottom));
  background: #fff;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
}

.checkout-total {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-accent);
}

.checkout-btn {
  width: 140px;
  height: 44px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkout-btn:active {
  opacity: 0.9;
}

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
  to {
    transform: rotate(360deg);
  }
}
</style>
