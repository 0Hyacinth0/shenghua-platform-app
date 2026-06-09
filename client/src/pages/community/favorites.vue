<template>
  <view class="page-container">
    <view class="page-header">
      <view class="header-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="22" color="var(--text-primary)" />
      </view>
      <text class="page-title">我的收藏</text>
      <view style="width:36px" />
    </view>

    <scroll-view scroll-y class="post-list" @scrolltolower="loadMore">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="posts.length > 0" class="post-items">
        <view v-for="post in posts" :key="post.id" class="post-card" @tap="goDetail(post.id)">
          <view class="post-header">
            <view class="post-user">
              <view class="user-avatar">
                <Icon icon="solar:user-bold" width="16" color="var(--color-primary)" />
              </view>
              <text class="user-name">{{ post.nickname || post.username || '匿名' }}</text>
            </view>
            <text class="post-time">{{ formatTime(post.createTime) }}</text>
          </view>
          <text class="post-content">{{ post.content }}</text>
          <view v-if="post.images && post.images.length > 0" class="post-images">
            <image
              v-for="(img, idx) in post.images.slice(0, 3)"
              :key="idx"
              :src="imgUrl(img)"
              class="post-img"
              mode="aspectFill"
            />
          </view>
          <view class="post-meta">
            <view class="stat-item">
              <Icon icon="solar:heart-bold" width="14" color="var(--text-hint)" />
              <text class="stat-text">{{ post.likeCount || 0 }}</text>
            </view>
            <view class="stat-item">
              <Icon icon="solar:chat-round-dots-bold" width="14" color="var(--text-hint)" />
              <text class="stat-text">{{ post.commentCount || 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:star-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">还没有收藏帖子</text>
      </view>

      <view v-if="noMore && posts.length > 0" class="no-more">
        <text class="no-more-text">— 没有更多了 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getMyFavorites, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(false)
const posts = ref<any[]>([])
const pageNo = ref(1)
const noMore = ref(false)

function goBack() {
  uni.navigateBack()
}

function goDetail(id: string) {
  uni.navigateTo({ url: '/pages/community/detail?id=' + id })
}

function formatTime(time: string) {
  if (!time) return ''
  return time.substring(0, 10)
}

function loadMore() {
  if (noMore.value || loading.value) return
  pageNo.value++
  loadPosts(true)
}

async function loadPosts(append = false) {
  if (!append) loading.value = true
  try {
    const res = await getMyFavorites({ userId: getCurrentUserId(), pageNo: pageNo.value, pageSize: 10 })
    const records: any[] = res?.records || []
    if (append) {
      posts.value = [...posts.value, ...records]
    } else {
      posts.value = records
    }
    noMore.value = records.length < 10
  } catch {
    if (!append) posts.value = []
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadPosts()
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

.post-list {
  flex: 1;
  padding: 12px var(--space-lg);
}

.post-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.post-card:active {
  background: var(--bg-gray);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: var(--font-base);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.post-time {
  font-size: 10px;
  color: var(--text-hint);
}

.post-content {
  font-size: var(--font-base);
  color: var(--text-primary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.post-images {
  display: flex;
  gap: 6px;
  margin-bottom: var(--space-sm);
}

.post-img {
  width: 80px;
  height: 80px;
  border-radius: var(--space-xs);
}

.post-meta {
  display: flex;
  gap: var(--space-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.stat-text {
  font-size: 10px;
  color: var(--text-hint);
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
  to { transform: rotate(360deg); }
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

.no-more {
  padding: var(--space-lg) 0;
  text-align: center;
}

.no-more-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}
</style>
