<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="24" color="var(--text-primary)" />
      </view>
      <text class="nav-title">订单详情</text>
      <view style="width: 36px;" />
    </view>

    <view v-if="loading" class="loading-wrap">
      <view class="loading-spinner" />
    </view>

    <template v-else-if="order">
      <!-- 状态栏 -->
      <view class="status-section" :class="'status-bg-' + order.orderStatus">
        <Icon :icon="getStatusIcon(order.orderStatus)" width="36" color="#fff" />
        <text class="status-text">{{ getStatusText(order.orderStatus) }}</text>
        <text class="status-desc">{{ getStatusDesc(order.orderStatus) }}</text>
      </view>

      <!-- 收货地址 -->
      <view v-if="order.addressSnapshot" class="address-card">
        <Icon icon="solar:map-point-bold" width="20" color="var(--text-hint)" />
        <view class="address-info">
          <view class="address-top">
            <text class="address-name">{{ order.addressSnapshot.name }}</text>
            <text class="address-phone">{{ order.addressSnapshot.phone }}</text>
          </view>
          <text class="address-detail">{{ order.addressSnapshot.province }}{{ order.addressSnapshot.city }}{{ order.addressSnapshot.district }}{{ order.addressSnapshot.detail }}</text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="section-card">
        <text class="section-title">商品信息</text>
        <view v-for="item in order.items" :key="item.id" class="item-row" @tap="goProduct(item.spuId)">
          <view class="item-img" :style="{ background: item.coverColor || '#f5f5f5' }">
            <Icon icon="solar:box-bold" width="24" color="var(--text-hint)" />
          </view>
          <view class="item-info">
            <text class="item-name">{{ item.productName }}</text>
            <text v-if="item.specDesc" class="item-spec">{{ item.specDesc }}</text>
            <view class="item-bottom">
              <text class="item-price">¥{{ item.price }}</text>
              <text class="item-qty">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 价格明细 -->
      <view class="section-card">
        <text class="section-title">价格明细</text>
        <view class="price-row">
          <text class="price-label">商品金额</text>
          <text class="price-value">¥{{ order.totalAmount }}</text>
        </view>
        <view v-if="order.freightAmount" class="price-row">
          <text class="price-label">运费</text>
          <text class="price-value">¥{{ order.freightAmount }}</text>
        </view>
        <view v-if="order.couponAmount" class="price-row">
          <text class="price-label">优惠券</text>
          <text class="price-discount">-¥{{ order.couponAmount }}</text>
        </view>
        <view class="price-divider" />
        <view class="price-row total">
          <text class="price-label">实付金额</text>
          <view class="total-price">
            <text class="price-symbol">¥</text>
            <text class="price-amount">{{ order.payAmount || order.totalAmount }}</text>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="section-card">
        <text class="section-title">订单信息</text>
        <view class="info-row">
          <text class="info-label">订单编号</text>
          <view class="info-value-wrap">
            <text class="info-value">{{ order.orderNo }}</text>
            <view class="copy-btn" @tap="copyOrderNo">
              <text class="copy-text">复制</text>
            </view>
          </view>
        </view>
        <view class="info-row">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ order.createTime }}</text>
        </view>
        <view v-if="order.payTime" class="info-row">
          <text class="info-label">付款时间</text>
          <text class="info-value">{{ order.payTime }}</text>
        </view>
        <view v-if="order.payType" class="info-row">
          <text class="info-label">支付方式</text>
          <text class="info-value">{{ order.payType === 1 ? '微信支付' : order.payType === 2 ? '支付宝' : '余额支付' }}</text>
        </view>
      </view>

      <view class="bottom-spacer" />

      <!-- 操作栏 -->
      <view class="action-bar">
        <view v-if="order.orderStatus === 0" class="action-btn" @tap="onCancel">
          <text class="action-btn-text">取消订单</text>
        </view>
        <view v-if="order.orderStatus === 0" class="action-btn primary" @tap="onPay">
          <text class="action-btn-text primary">去付款</text>
        </view>
        <view v-if="order.orderStatus === 2" class="action-btn primary" @tap="onConfirm">
          <text class="action-btn-text primary">确认收货</text>
        </view>
      </view>
    </template>

    <view v-else class="empty-wrap">
      <Icon icon="solar:sad-circle-bold" width="48" color="var(--text-hint)" />
      <text class="empty-text">订单不存在</text>
      <view class="empty-btn" @tap="goBack">
        <text class="empty-btn-text">返回</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getOrderDetail, cancelOrder, dummyPay, confirmReceipt, imgUrl } from '@/api'

const loading = ref(true)
const order = ref<any>(null)
let orderId = ''

function goBack() {
  uni.navigateBack()
}

function goProduct(spuId: string) {
  if (spuId) uni.navigateTo({ url: '/pages/product/detail?id=' + spuId })
}

function getStatusText(status: number) {
  const map: Record<number, string> = { 0: '待付款', 1: '待发货', 2: '待收货', 3: '已完成', 4: '已取消', 5: '已退款' }
  return map[status] || '未知'
}

function getStatusIcon(status: number) {
  const map: Record<number, string> = { 0: 'solar:wallet-bold', 1: 'solar:box-bold', 2: 'solar:delivery-bold', 3: 'solar:check-circle-bold', 4: 'solar:close-circle-bold', 5: 'solar:refresh-bold' }
  return map[status] || 'solar:question-circle-bold'
}

function getStatusDesc(status: number) {
  const map: Record<number, string> = { 0: '请尽快完成支付', 1: '商家正在准备发货', 2: '商品正在配送中', 3: '感谢您的购买', 4: '订单已取消', 5: '退款已处理' }
  return map[status] || ''
}

function copyOrderNo() {
  if (order.value?.orderNo) {
    uni.setClipboardData({
      data: order.value.orderNo,
      success: () => uni.showToast({ title: '已复制', icon: 'success' }),
    })
  }
}

async function loadOrder() {
  loading.value = true
  try {
    const res = await getOrderDetail(orderId)
    order.value = res || null
  } catch {
    order.value = null
  } finally {
    loading.value = false
  }
}

async function onPay() {
  try {
    await dummyPay(orderId)
    uni.showToast({ title: '付款成功', icon: 'success' })
    loadOrder()
  } catch (e: any) {
    uni.showToast({ title: e?.message || '付款失败', icon: 'none' })
  }
}

async function onCancel() {
  uni.showModal({
    title: '提示',
    content: '确定取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(orderId)
          uni.showToast({ title: '已取消', icon: 'success' })
          loadOrder()
        } catch (e: any) {
          uni.showToast({ title: e?.message || '取消失败', icon: 'none' })
        }
      }
    },
  })
}

async function onConfirm() {
  uni.showModal({
    title: '提示',
    content: '确认已收到商品？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await confirmReceipt(orderId)
          uni.showToast({ title: '已确认收货', icon: 'success' })
          loadOrder()
        } catch (e: any) {
          uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
        }
      }
    },
  })
}

onLoad((options: any) => {
  orderId = options?.id || ''
  if (orderId) loadOrder()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 80px;
}

/* 顶部导航 */
.nav-bar {
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
}

.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

/* 状态栏 */
.status-section {
  padding: var(--space-2xl) var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.status-bg-0 { background: var(--color-primary-gradient); }
.status-bg-1 { background: linear-gradient(135deg, #FA8C16, #FFA940); }
.status-bg-2 { background: linear-gradient(135deg, #1890FF, #69C0FF); }
.status-bg-3 { background: linear-gradient(135deg, #52C41A, #95DE64); }
.status-bg-4 { background: linear-gradient(135deg, #999, #bbb); }

.status-text {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--text-white);
}

.status-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.8);
}

/* 地址卡 */
.address-card {
  display: flex;
  gap: var(--space-md);
  background: var(--bg-card);
  padding: var(--space-lg);
  margin-top: var(--space-sm);
}

.address-info {
  flex: 1;
}

.address-top {
  display: flex;
  gap: var(--space-md);
  margin-bottom: 6px;
}

.address-name {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.address-phone {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.address-detail {
  font-size: var(--font-base);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 区块 */
.section-card {
  background: var(--bg-card);
  margin-top: var(--space-sm);
  padding: var(--space-lg);
}

.section-title {
  font-size: 17px;
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: 14px;
}

.item-row {
  display: flex;
  gap: var(--space-md);
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-row:last-child {
  border-bottom: none;
}

.item-row:active {
  background: #fafafa;
}

.item-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.item-name {
  font-size: var(--font-base);
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.item-spec {
  font-size: var(--font-sm);
  color: var(--text-hint);
  margin-top: var(--space-xs);
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.item-price {
  font-size: var(--font-md);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}

.item-qty {
  font-size: 13px;
  color: var(--text-hint);
}

/* 价格明细 */
.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) 0;
}

.price-row.total {
  margin-top: var(--space-xs);
}

.price-label {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.price-value {
  font-size: var(--font-base);
  color: var(--text-primary);
}

.price-discount {
  font-size: var(--font-base);
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

.price-divider {
  height: 1px;
  background: #f0f0f0;
  margin: var(--space-sm) 0;
}

.total-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: var(--font-base);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}

.price-amount {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}

/* 订单信息 */
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) 0;
}

.info-label {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.info-value-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.info-value {
  font-size: var(--font-base);
  color: var(--text-primary);
}

.copy-btn {
  padding: 3px 10px;
  border: 1px solid var(--color-primary);
  border-radius: 12px;
}

.copy-btn:active {
  background: var(--color-primary-light);
}

.copy-text {
  font-size: var(--font-sm);
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

.bottom-spacer {
  height: var(--space-lg);
}

/* 操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  padding-bottom: var(--space-2xl);
  background: var(--bg-card);
  border-top: 1px solid #f0f0f0;
  z-index: 100;
}

.action-btn {
  padding: 10px var(--space-2xl);
  border-radius: var(--radius-full);
  border: 1px solid #eee;
}

.action-btn:active {
  background: #f5f5f5;
}

.action-btn.primary {
  border-color: var(--color-primary);
}

.action-btn-text {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.action-btn-text.primary {
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

/* 加载状态 */
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
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 40px;
}

.empty-text {
  font-size: var(--font-base);
  color: var(--text-hint);
  margin-bottom: var(--space-lg);
  margin-top: var(--space-md);
}

.empty-btn {
  padding: 10px var(--space-2xl);
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.empty-btn:active {
  opacity: 0.9;
}

.empty-btn-text {
  font-size: var(--font-base);
  color: var(--text-white);
  font-weight: var(--weight-medium);
}
</style>
