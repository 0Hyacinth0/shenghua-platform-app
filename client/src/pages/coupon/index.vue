<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="20" />
      </view>
      <text class="nav-title">我的优惠券</text>
      <view class="nav-right">
        <view class="nav-btn" @tap="goCouponCenter">
          <text class="center-text">领券中心</text>
        </view>
      </view>
    </view>

    <!-- 领券中心 Banner -->
    <view class="coupon-header-banner" @tap="goCouponCenter">
      <text class="banner-title">领券中心</text>
      <view class="banner-right">
        <text class="banner-desc">查看可领取的优惠券</text>
        <Icon icon="solar:alt-arrow-right-bold" width="14" color="var(--color-accent)" />
      </view>
    </view>

    <!-- 标签切换 -->
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

    <!-- 优惠券列表 -->
    <scroll-view scroll-y class="coupon-list">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="coupons.length > 0" class="coupon-items">
        <view v-for="coupon in coupons" :key="coupon.id" class="coupon-card" :class="{ disabled: activeTab !== 'available' }">
          <view class="coupon-left">
            <text class="coupon-type">{{ coupon.couponType === 1 ? '满减' : coupon.couponType === 2 ? '折扣' : '立减' }}</text>
            <view class="coupon-amount">
              <text v-if="coupon.couponType === 2" class="amount-value">{{ coupon.discount }}</text>
              <text v-else class="amount-symbol">¥</text>
              <text v-if="coupon.couponType !== 2" class="amount-value">{{ coupon.amount || coupon.faceValue }}</text>
              <text v-if="coupon.couponType === 2" class="amount-unit">折</text>
            </view>
            <text class="coupon-condition">{{ coupon.minAmount ? '满' + coupon.minAmount + '可用' : '无门槛' }}</text>
          </view>
          <view class="coupon-divider">
            <view class="divider-circle top" />
            <view class="divider-line" />
            <view class="divider-circle bottom" />
          </view>
          <view class="coupon-right">
            <text class="coupon-name">{{ coupon.name || coupon.couponName }}</text>
            <text class="coupon-scope">{{ coupon.scope === 1 ? '全场通用' : coupon.scope === 2 ? '指定分类' : '指定商品' }}</text>
            <text class="coupon-time">{{ formatDate(coupon.startTime) }} - {{ formatDate(coupon.endTime) }}</text>
            <view v-if="activeTab === 'available'" class="coupon-action" @tap="onUse(coupon)">
              <text class="action-text">立即使用</text>
            </view>
            <view v-else-if="activeTab === 'used'" class="coupon-status">
              <text class="status-text">已使用</text>
            </view>
            <view v-else class="coupon-status">
              <text class="status-text">已过期</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:ticket-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">{{ activeTab === 'available' ? '暂无可用优惠券' : activeTab === 'used' ? '暂无已使用优惠券' : '暂无过期优惠券' }}</text>
        <view v-if="activeTab === 'available'" class="empty-btn" @tap="goCouponCenter">
          <text class="empty-btn-text">去领券</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getUserCoupons, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'
import { goMall } from '@/utils/navigation'

const tabs = [
  { key: 'available', label: '可使用' },
  { key: 'used', label: '已使用' },
  { key: 'expired', label: '已过期' },
]

const loading = ref(false)
const activeTab = ref('available')
const coupons = ref<any[]>([])

function goBack() {
  uni.navigateBack()
}

function goCouponCenter() {
  // TODO: 领券中心
  uni.showToast({ title: '暂无可领取的优惠券', icon: 'none' })
}

function formatDate(date: string) {
  if (!date) return ''
  return date.substring(0, 10)
}

function onTabChange(key: string) {
  activeTab.value = key
  loadCoupons()
}

function onUse(coupon: any) {
  goMall()
}

async function loadCoupons() {
  loading.value = true
  try {
    const res = await getUserCoupons(getCurrentUserId())
    const all: any[] = Array.isArray(res) ? res : (res?.records || [])
    if (activeTab.value === 'available') {
      coupons.value = all.filter((c: any) => c.status === 0)
    } else if (activeTab.value === 'used') {
      coupons.value = all.filter((c: any) => c.status === 1)
    } else {
      coupons.value = all.filter((c: any) => c.status === 2)
    }
  } catch {
    coupons.value = []
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadCoupons()
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
  display: none;
}

.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.nav-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.nav-right {
  display: flex;
  gap: 12px;
}

.nav-btn {
  padding: 6px 12px;
  background: var(--color-accent-light);
  border-radius: var(--radius-md);
}

.center-text {
  font-size: 13px;
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

/* 标签栏 */
.tab-bar {
  display: flex;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  padding: 0 var(--space-lg);
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
  background: var(--color-accent);
}

/* 优惠券列表 */
.coupon-list {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
}

.coupon-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.coupon-card {
  display: flex;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.coupon-card.disabled {
  opacity: 0.6;
}

.coupon-left {
  width: 100px;
  padding: var(--space-lg) var(--space-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: linear-gradient(135deg, var(--color-accent), #7C3AED);
}

.coupon-card.disabled .coupon-left {
  background: linear-gradient(135deg, var(--text-hint), #94A3B8);
}

.coupon-type {
  font-size: var(--font-xs);
  color: rgba(255,255,255,0.8);
}

.coupon-amount {
  display: flex;
  align-items: baseline;
}

.amount-symbol {
  font-size: var(--font-base);
  color: var(--text-white);
  font-weight: var(--weight-bold);
}

.amount-value {
  font-size: var(--font-4xl);
  color: var(--text-white);
  font-weight: var(--weight-bold);
}

.amount-unit {
  font-size: var(--font-sm);
  color: rgba(255,255,255,0.8);
  margin-left: 2px;
}

.coupon-condition {
  font-size: var(--font-xs);
  color: rgba(255,255,255,0.8);
}

/* 分割线 */
.coupon-divider {
  width: 1px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.divider-circle {
  width: 16px;
  height: 8px;
  background: var(--bg-page);
}

.divider-circle.top {
  border-radius: 0 0 8px 8px;
}

.divider-circle.bottom {
  border-radius: 8px 8px 0 0;
}

.divider-line {
  flex: 1;
  width: 1px;
  background: var(--bg-gray);
}

/* 右侧 */
.coupon-right {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coupon-name {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.coupon-scope {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.coupon-time {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

.coupon-action {
  align-self: flex-start;
  margin-top: 6px;
  padding: 5px 14px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
}

.action-text {
  font-size: var(--font-sm);
  color: var(--text-white);
  font-weight: var(--weight-medium);
}

.coupon-status {
  align-self: flex-start;
  margin-top: 6px;
}

.status-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
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
  border: 3px solid var(--bg-gray);
  border-top-color: var(--color-accent);
  border-radius: var(--radius-circle);
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
  gap: var(--space-sm);
}

.empty-text {
  font-size: var(--font-base);
  color: var(--text-hint);
  margin-top: var(--space-md);
  margin-bottom: var(--space-lg);
}

.empty-btn {
  padding: 10px var(--space-2xl);
  background: var(--color-accent);
  border-radius: var(--radius-xl);
}

.empty-btn:active {
  opacity: 0.9;
}

.empty-btn-text {
  font-size: var(--font-base);
  color: var(--text-white);
  font-weight: var(--weight-medium);
}

/* 领券中心 Banner */
.coupon-header-banner {
  margin: var(--space-md) var(--space-lg) 0;
  background: var(--color-primary-light);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.coupon-header-banner:active {
  opacity: 0.9;
}

.banner-title {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.banner-right {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.banner-desc {
  font-size: var(--font-xs);
  color: var(--color-accent);
}
</style>
