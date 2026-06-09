<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="24" color="var(--text-primary)" />
      </view>
      <text class="nav-title">我的订单</text>
      <view style="width: 36px;" />
    </view>

    <!-- 状态标签 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @tap="onTabChange(tab.key)"
      >
        <text class="tab-text" :class="{ active: activeTab === tab.key }">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view scroll-y class="order-list" @scrolltolower="loadMore">
      <view v-if="loading && orders.length === 0" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="orders.length > 0" class="order-items">
        <view v-for="order in orders" :key="order.id" class="order-card" @tap="goDetail(order.id)">
          <view class="order-header">
            <text class="order-no">订单号：{{ order.orderNo }}</text>
            <text class="order-status" :class="'status-' + order.orderStatus">{{ getStatusText(order.orderStatus) }}</text>
          </view>

          <view v-for="item in order.items" :key="item.id" class="order-item">
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

          <view class="order-footer">
            <text class="order-total">共{{ order.totalQuantity || 1 }}件 合计：<text class="total-price">¥{{ order.totalAmount }}</text></text>
            <view class="order-actions">
              <view v-if="order.orderStatus === 0" class="action-btn primary" @tap.stop="onPay(order)">
                <text class="action-btn-text primary">去付款</text>
              </view>
              <view v-if="order.orderStatus === 0" class="action-btn" @tap.stop="onCancel(order)">
                <text class="action-btn-text">取消</text>
              </view>
              <view v-if="order.orderStatus === 2" class="action-btn primary" @tap.stop="onConfirm(order)">
                <text class="action-btn-text primary">确认收货</text>
              </view>
              <view v-if="order.orderStatus === 3" class="action-btn" @tap.stop="goDetail(order.id)">
                <text class="action-btn-text">查看详情</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:box-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">暂无订单</text>
        <view class="empty-btn" @tap="goHome">
          <text class="empty-btn-text">去逛逛</text>
        </view>
      </view>

      <view v-if="noMore && orders.length > 0" class="no-more">
        <text class="no-more-text">— 没有更多了 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getOrderList, cancelOrder, dummyPay, confirmReceipt, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const tabs = [
  { key: '', label: '全部' },
  { key: '0', label: '待付款' },
  { key: '1', label: '待发货' },
  { key: '2', label: '待收货' },
  { key: '3', label: '已完成' },
]

const loading = ref(false)
const activeTab = ref('')
const orders = ref<any[]>([])
const pageNo = ref(1)
const noMore = ref(false)

function goBack() {
  uni.navigateBack()
}

function goHome() {
  uni.switchTab({ url: '/pages/home/index' })
}

function goDetail(id: string) {
  uni.navigateTo({ url: '/pages/order/detail?id=' + id })
}

function getStatusText(status: number) {
  const map: Record<number, string> = { 0: '待付款', 1: '待发货', 2: '待收货', 3: '已完成', 4: '已取消', 5: '已退款' }
  return map[status] || '未知'
}

function onTabChange(key: string) {
  activeTab.value = key
  pageNo.value = 1
  noMore.value = false
  orders.value = []
  loadOrders()
}

function loadMore() {
  if (noMore.value || loading.value) return
  pageNo.value++
  loadOrders(true)
}

async function loadOrders(append = false) {
  if (!append) loading.value = true
  try {
    const params: any = { pageNo: pageNo.value, pageSize: 10, userId: getCurrentUserId() }
    if (activeTab.value !== '') params.orderStatus = Number(activeTab.value)
    const res = await getOrderList(params)
    const records: any[] = res?.records || []
    if (append) {
      orders.value = [...orders.value, ...records]
    } else {
      orders.value = records
    }
    noMore.value = records.length < 10
  } catch {
    if (!append) orders.value = []
  } finally {
    loading.value = false
  }
}

async function onPay(order: any) {
  try {
    await dummyPay(order.id)
    uni.showToast({ title: '付款成功', icon: 'success' })
    onTabChange(activeTab.value)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '付款失败', icon: 'none' })
  }
}

async function onCancel(order: any) {
  uni.showModal({
    title: '提示',
    content: '确定取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(order.id)
          uni.showToast({ title: '已取消', icon: 'success' })
          onTabChange(activeTab.value)
        } catch (e: any) {
          uni.showToast({ title: e?.message || '取消失败', icon: 'none' })
        }
      }
    },
  })
}

async function onConfirm(order: any) {
  uni.showModal({
    title: '提示',
    content: '确认已收到商品？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await confirmReceipt(order.id)
          uni.showToast({ title: '已确认收货', icon: 'success' })
          onTabChange(activeTab.value)
        } catch (e: any) {
          uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
        }
      }
    },
  })
}

onLoad((options: any) => {
  if (options?.tab) {
    const tabMap: Record<string, string> = { unpaid: '0', unshipped: '1', shipped: '2', received: '3' }
    activeTab.value = tabMap[options.tab] || ''
  }
  loadOrders()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
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

/* 标签栏 */
.tab-bar {
  display: flex;
  background: var(--bg-card);
  border-bottom: 1px solid #f0f0f0;
  padding: 0 var(--space-sm);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: var(--space-md) 0;
  position: relative;
}

.tab-text {
  font-size: var(--font-base);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.tab-text.active {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-primary);
}

/* 订单列表 */
.order-list {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.order-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.order-card:active {
  transform: scale(0.99);
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid #f5f5f5;
}

.order-no {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.order-status {
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
}

.status-0 { color: var(--color-primary); }
.status-1 { color: var(--color-warning); }
.status-2 { color: var(--color-info); }
.status-3 { color: var(--color-success); }
.status-4 { color: var(--text-hint); }

.order-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
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
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid #f5f5f5;
}

.order-total {
  font-size: var(--font-base);
  color: var(--text-primary);
}

.total-price {
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}

.order-actions {
  display: flex;
  gap: var(--space-sm);
}

.action-btn {
  padding: 6px 14px;
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
  font-size: var(--font-sm);
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
  padding: 60px 40px;
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

.no-more {
  padding: var(--space-lg) 0;
  text-align: center;
}

.no-more-text {
  font-size: var(--font-sm);
  color: #ccc;
}

.bottom-spacer {
  height: var(--space-lg);
}
</style>
