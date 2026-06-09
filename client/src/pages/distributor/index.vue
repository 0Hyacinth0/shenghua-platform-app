<template>
  <view class="page-container">
    <view class="page-header">
      <view class="header-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="22" color="var(--text-primary)" />
      </view>
      <text class="page-title">分销中心</text>
      <view style="width:36px" />
    </view>

    <!-- 分销统计 -->
    <view class="stats-card">
      <view class="stats-hero">
        <text class="stats-label">累计收益(元)</text>
        <text class="stats-value">{{ stats.totalIncome || '0.00' }}</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-num">{{ stats.orderCount || 0 }}</text>
          <text class="stat-label">推广订单</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ stats.teamCount || 0 }}</text>
          <text class="stat-label">团队人数</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ stats.pendingIncome || '0.00' }}</text>
          <text class="stat-label">待结算</text>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="function-grid">
      <view class="function-item" @tap="goPage('/pages/distributor/order')">
        <view class="func-icon">
          <Icon icon="solar:clipboard-bold" width="22" color="var(--color-primary)" />
        </view>
        <text class="func-label">推广订单</text>
      </view>
      <view class="function-item" @tap="goPage('/pages/distributor/team')">
        <view class="func-icon">
          <Icon icon="solar:users-group-rounded-bold" width="22" color="var(--color-primary)" />
        </view>
        <text class="func-label">我的团队</text>
      </view>
      <view class="function-item" @tap="goPage('/pages/distributor/income')">
        <view class="func-icon">
          <Icon icon="solar:wallet-bold" width="22" color="var(--color-primary)" />
        </view>
        <text class="func-label">收益明细</text>
      </view>
      <view class="function-item" @tap="onShare">
        <view class="func-icon">
          <Icon icon="solar:share-bold" width="22" color="var(--color-primary)" />
        </view>
        <text class="func-label">推广二维码</text>
      </view>
    </view>

    <!-- 最近佣金 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">最近佣金</text>
      </view>
      <view v-if="recentList.length > 0" class="commission-list">
        <view v-for="item in recentList" :key="item.id" class="commission-item">
          <view class="commission-left">
            <text class="commission-desc">{{ item.description || '推广佣金' }}</text>
            <text class="commission-time">{{ item.createTime }}</text>
          </view>
          <text class="commission-amount">+{{ item.amount }}</text>
        </view>
      </view>
      <view v-else class="empty-section">
        <Icon icon="solar:wallet-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">暂无佣金记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const stats = ref<any>({})
const recentList = ref<any[]>([])

function goBack() {
  uni.navigateBack()
}

function goPage(url: string) {
  uni.navigateTo({ url })
}

function onShare() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

async function loadData() {
  try {
    const [statsRes, listRes] = await Promise.all([
      http.get('/mall/distribution/stats', { params: { userId: getCurrentUserId() } }).catch(() => ({})),
      http.get('/mall/distribution/commission', { params: { userId: getCurrentUserId(), pageSize: 10 } }).catch(() => ({ records: [] })),
    ])
    stats.value = statsRes || {}
    recentList.value = (listRes as any)?.records || []
  } catch {
    stats.value = {}
    recentList.value = []
  }
}

onLoad(() => {
  loadData()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page-container {
  min-height: 100vh;
  background: var(--bg-page);
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-card);
  padding: 44px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-back {
  padding: var(--space-xs) var(--space-sm);
  display: flex;
  align-items: center;
}

.page-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.stats-card {
  background: var(--color-primary-gradient);
  margin: 0;
  padding: 24px var(--space-lg) 20px;
}

.stats-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: 20px;
}

.stats-label {
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.7);
}

.stats-value {
  font-size: var(--font-4xl);
  font-weight: var(--weight-bold);
  color: var(--text-white);
}

.stats-grid {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.stat-num {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--text-white);
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.function-grid {
  display: flex;
  background: var(--bg-card);
  margin: 12px var(--space-lg);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  justify-content: space-around;
  box-shadow: var(--shadow-sm);
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.function-item:active {
  opacity: 0.7;
}

.func-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.func-label {
  font-size: var(--font-sm);
  color: var(--text-primary);
}

.section-card {
  background: var(--bg-card);
  margin: 0 var(--space-lg) var(--space-lg);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.commission-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.commission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--bg-gray);
}

.commission-item:last-child {
  border-bottom: none;
}

.commission-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.commission-desc {
  font-size: var(--font-base);
  color: var(--text-primary);
}

.commission-time {
  font-size: 10px;
  color: var(--text-hint);
}

.commission-amount {
  font-size: var(--font-lg);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}

.empty-section {
  padding: 24px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.empty-text {
  font-size: var(--font-base);
  color: var(--text-hint);
}
</style>
