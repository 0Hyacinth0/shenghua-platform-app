<template>
  <view class="page-container">
    <view class="nav-bar">
      <text class="nav-back" @tap="goBack">‹</text>
      <text class="nav-title">商品审核</text>
      <view style="width:36px" />
    </view>

    <scroll-view scroll-y class="product-list" @scrolltolower="loadMore">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="products.length > 0" class="product-items">
        <view v-for="item in products" :key="item.id" class="product-card">
          <view class="product-header">
            <text class="product-name">{{ item.spuName }}</text>
            <text class="product-time">{{ item.createTime }}</text>
          </view>
          <view class="product-body">
            <view class="product-img-wrap">
              <image v-if="item.mainImage" :src="imgUrl(item.mainImage)" class="product-img" mode="aspectFill" />
              <view v-else class="img-placeholder">
                <Icon icon="solar:bag-bold" width="28" color="var(--text-hint)" />
              </view>
            </view>
            <view class="product-info">
              <text class="product-price">¥{{ item.minPrice }}</text>
              <text class="product-category">{{ item.categoryName || '' }}</text>
              <text class="product-merchant">{{ item.merchantName || '' }}</text>
            </view>
          </view>
          <view class="product-actions">
            <view class="action-btn reject" @tap="onReject(item)">
              <text class="action-btn-text">拒绝</text>
            </view>
            <view class="action-btn approve" @tap="onApprove(item)">
              <text class="action-btn-text">通过</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:check-circle-bold" width="48" color="var(--color-success)" />
        <text class="empty-text">暂无待审核商品</text>
      </view>

      <view v-if="noMore && products.length > 0" class="no-more">
        <text class="no-more-text">— 没有更多了 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProductList, approveProduct, rejectProduct, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(false)
const products = ref<any[]>([])
const pageNo = ref(1)
const noMore = ref(false)

function goBack() {
  uni.navigateBack()
}

function loadMore() {
  if (noMore.value || loading.value) return
  pageNo.value++
  loadProducts(true)
}

async function loadProducts(append = false) {
  if (!append) loading.value = true
  try {
    const res = await getProductList({ pageNo: pageNo.value, pageSize: 10, auditStatus: 0 })
    const records: any[] = res?.records || []
    if (append) {
      products.value = [...products.value, ...records]
    } else {
      products.value = records
    }
    noMore.value = records.length < 10
  } catch {
    if (!append) products.value = []
  } finally {
    loading.value = false
  }
}

async function onApprove(item: any) {
  try {
    await approveProduct(item.id, getCurrentUserId())
    uni.showToast({ title: '已通过', icon: 'success' })
    products.value = products.value.filter((p: any) => p.id !== item.id)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

async function onReject(item: any) {
  uni.showModal({
    title: '拒绝原因',
    editable: true,
    placeholderText: '请输入拒绝原因',
    success: async (res) => {
      if (res.confirm) {
        try {
          await rejectProduct(item.id, res.content || '', getCurrentUserId())
          uni.showToast({ title: '已拒绝', icon: 'success' })
          products.value = products.value.filter((p: any) => p.id !== item.id)
        } catch (e: any) {
          uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
        }
      }
    },
  })
}

onLoad(() => {
  loadProducts()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');
.page-container {
  min-height: 100vh;
  background: #F5F6FA;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 44px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.product-list {
  flex: 1;
  padding: 12px 16px;
}

.product-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.product-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.product-time {
  font-size: 12px;
  color: #999;
}

.product-body {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
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
  gap: 4px;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-accent);
}

.product-category {
  font-size: 12px;
  color: #999;
}

.product-merchant {
  font-size: 12px;
  color: #999;
}

.product-actions {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
}

.action-btn:active {
  background: #F5F6FA;
}

.action-btn.reject .action-btn-text {
  color: #999;
}

.action-btn.approve .action-btn-text {
  color: var(--color-accent);
  font-weight: 500;
}

.action-btn-text {
  font-size: 14px;
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

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 40px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.no-more {
  padding: 16px 0;
  text-align: center;
}

.no-more-text {
  font-size: 12px;
  color: #ccc;
}
</style>
