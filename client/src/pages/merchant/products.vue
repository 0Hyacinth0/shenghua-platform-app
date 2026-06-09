<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="22" color="var(--text-primary)" />
      </view>
      <text class="nav-title">商品管理</text>
      <view class="header-action" @tap="onAdd">
        <Icon icon="solar:add-circle-bold" width="18" color="var(--color-primary)" />
        <text class="action-text">新增</text>
      </view>
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
        <view v-if="activeTab === tab.key" class="tab-indicator" />
      </view>
    </view>

    <scroll-view scroll-y class="product-list">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="products.length > 0" class="product-items">
        <view v-for="item in products" :key="item.id" class="product-card">
          <view class="product-img-wrap">
            <image v-if="item.mainImage" :src="imgUrl(item.mainImage)" class="product-img" mode="aspectFill" />
            <view v-else class="img-placeholder">
              <Icon icon="solar:bag-bold" width="28" color="var(--text-hint)" />
            </view>
          </view>
          <view class="product-info">
            <text class="product-name">{{ item.spuName }}</text>
            <text class="product-price">¥{{ item.minPrice }}</text>
            <view class="product-status" :class="'status-' + item.auditStatus">
              <text class="status-text">{{ getStatusText(item.auditStatus) }}</text>
            </view>
          </view>
          <view class="product-actions">
            <view class="action-btn" @tap="onEdit(item)">
              <Icon icon="solar:pen-new-square-bold" width="14" color="var(--color-primary)" />
              <text class="action-btn-text">编辑</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:bag-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">暂无商品</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getMerchantProductList, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const tabs = [
  { key: '', label: '全部' },
  { key: '0', label: '待审核' },
  { key: '1', label: '已通过' },
  { key: '2', label: '已拒绝' },
]

const loading = ref(true)
const activeTab = ref('')
const products = ref<any[]>([])

function goBack() {
  uni.navigateBack()
}

function getStatusText(status: number) {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
  return map[status] || '未知'
}

function onTabChange(key: string) {
  activeTab.value = key
  loadProducts()
}

function onAdd() {
  uni.showToast({ title: '商品新增功能开发中', icon: 'none' })
}

function onEdit(item: any) {
  uni.showToast({ title: '商品编辑功能开发中', icon: 'none' })
}

async function loadProducts() {
  loading.value = true
  try {
    const auditStatus = activeTab.value !== '' ? Number(activeTab.value) : undefined
    const res = await getMerchantProductList(getCurrentUserId(), auditStatus, { pageSize: 50 })
    products.value = res?.records || (Array.isArray(res) ? res : [])
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadProducts()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page-container {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-card);
  padding: 44px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-back {
  padding: var(--space-xs) var(--space-sm);
  display: flex;
  align-items: center;
}

.nav-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.header-action {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) 12px;
}

.action-text {
  font-size: var(--font-base);
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

.tab-bar {
  display: flex;
  background: var(--bg-card);
  border-bottom: 1px solid var(--bg-gray);
  padding: 0 var(--space-sm);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  position: relative;
}

.tab-text {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.tab-text.active {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  width: 24px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-primary);
}

.product-list {
  flex: 1;
  padding: 12px var(--space-lg);
}

.product-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-card {
  display: flex;
  gap: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 12px;
  box-shadow: var(--shadow-sm);
}

.product-img-wrap {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
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
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.product-name {
  font-size: var(--font-base);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: var(--font-base);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}

.product-status {
  align-self: flex-start;
  padding: 2px var(--space-sm);
  border-radius: var(--space-xs);
}

.status-0 {
  background: var(--color-warning-light);
}

.status-0 .status-text {
  color: var(--color-warning);
}

.status-1 {
  background: var(--color-success-light);
}

.status-1 .status-text {
  color: var(--color-success);
}

.status-2 {
  background: var(--color-danger-light);
}

.status-2 .status-text {
  color: var(--color-danger);
}

.status-text {
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
}

.product-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-sm);
  color: var(--color-primary);
  padding: var(--space-xs) 12px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
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
  border: 3px solid var(--bg-gray);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 40px;
  gap: 12px;
}

.empty-text {
  font-size: var(--font-base);
  color: var(--text-hint);
}
</style>
