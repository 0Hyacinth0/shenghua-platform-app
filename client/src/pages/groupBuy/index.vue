<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">拼团</text>
      <view style="width: 36px;" />
    </view>

    <!-- 拼团横幅 -->
    <view class="banner-card">
      <view class="banner-bg">
        <view class="banner-deco" />
        <view class="banner-deco2" />
      </view>
      <view class="banner-content">
        <text class="banner-title">拼团特惠</text>
        <text class="banner-sub">邀请好友一起学习，享团购价</text>
      </view>
    </view>

    <!-- 拼团列表 -->
    <scroll-view scroll-y class="group-list" @scrolltolower="loadMore">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="groups.length > 0" class="group-items">
        <view v-for="item in groups" :key="item.id" class="group-card" @tap="goDetail(item)">
          <view class="card-cover">
            <image v-if="item.mainImage" :src="imgUrl(item.mainImage)" class="cover-img" mode="aspectFill" />
            <view v-else class="cover-placeholder" :style="{ background: defaultGradient }">
              <Icon icon="solar:users-group-rounded-bold" width="32" color="rgba(255,255,255,0.6)" />
            </view>
            <view class="card-badge">
              <text class="badge-text">{{ item.groupSize || 2 }}人团</text>
            </view>
          </view>
          <view class="card-info">
            <text class="card-title">{{ item.spuName || item.productName }}</text>
            <view class="card-price">
              <text class="price-current">
                <text class="price-symbol">¥</text>{{ item.groupPrice }}
              </text>
              <text class="price-original">¥{{ item.originalPrice || item.price }}</text>
            </view>
            <view class="card-meta">
              <text class="meta-text">已拼{{ item.groupCount || 0 }}件</text>
              <text class="meta-dot">·</text>
              <text class="meta-text">还差{{ item.remaining || item.groupSize || 2 }}人</text>
            </view>
            <view class="card-btn">
              <text class="btn-text">去拼团</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:users-group-rounded-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">暂无拼团活动</text>
        <text class="empty-sub">敬请期待</text>
      </view>

      <view v-if="noMore && groups.length > 0" class="no-more">
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
import { getGroupBuyList, imgUrl } from '@/api'

const loading = ref(false)
const groups = ref<any[]>([])
const pageNo = ref(1)
const noMore = ref(false)

const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

function goBack() {
  uni.navigateBack()
}

function goDetail(item: any) {
  uni.navigateTo({ url: '/pages/groupBuy/checkout?groupBuyId=' + item.id + '&spuId=' + (item.spuId || '') })
}

function loadMore() {
  if (noMore.value || loading.value) return
  pageNo.value++
  loadGroups(true)
}

async function loadGroups(append = false) {
  if (!append) loading.value = true
  try {
    const res = await getGroupBuyList({ pageNo: pageNo.value, pageSize: 10 })
    const records: any[] = res?.records || []
    if (append) {
      groups.value = [...groups.value, ...records]
    } else {
      groups.value = records
    }
    noMore.value = records.length < 10
  } catch {
    if (!append) groups.value = []
    noMore.value = true
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadGroups()
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
}

.back-icon {
  font-size: 28px;
  color: var(--text-primary);
  font-weight: 300;
}

.nav-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

/* 拼团横幅 */
.banner-card {
  position: relative;
  margin: 12px 16px 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.banner-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-accent) 0%, #7C3AED 100%);
}

.banner-deco {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-circle);
  background: rgba(255,255,255,0.1);
}

.banner-deco2 {
  position: absolute;
  left: 30px;
  bottom: -15px;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-circle);
  background: rgba(255,255,255,0.05);
}

.banner-content {
  position: relative;
  z-index: 1;
  padding: 20px;
}

.banner-title {
  font-size: var(--font-2xl);
  font-weight: var(--weight-bold);
  color: var(--text-white);
  display: block;
}

.banner-sub {
  font-size: var(--font-md);
  color: rgba(255,255,255,0.8);
  margin-top: 4px;
  display: block;
}

/* 拼团列表 */
.group-list {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.group-card {
  position: relative;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: 14px;
  padding: 12px;
}

.card-cover {
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: linear-gradient(135deg, var(--color-accent), #7C3AED);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.badge-text {
  font-size: 10px;
  color: var(--text-white);
  font-weight: var(--weight-semibold);
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 0;
}

.card-title {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  margin-bottom: 4px;
}

.price-current {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: var(--font-sm);
  color: var(--color-accent);
  font-weight: var(--weight-semibold);
}

.price-current {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--color-accent);
}

.price-original {
  font-size: var(--font-md);
  color: var(--text-hint);
  text-decoration: line-through;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--space-md);
}

.meta-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.meta-dot {
  font-size: 13px;
  color: #ddd;
}

.card-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: inline-flex;
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--color-accent), #7C3AED);
  border-radius: var(--radius-full);
}

.card-btn:active {
  opacity: 0.9;
}

.btn-text {
  font-size: var(--font-md);
  color: var(--text-white);
  font-weight: var(--weight-semibold);
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
  gap: var(--space-xs);
}

.empty-text {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-top: var(--space-md);
}

.empty-sub {
  font-size: var(--font-md);
  color: var(--text-hint);
}

.no-more {
  padding: var(--space-lg) 0;
  text-align: center;
}

.no-more-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.bottom-spacer {
  height: var(--space-lg);
}
</style>
