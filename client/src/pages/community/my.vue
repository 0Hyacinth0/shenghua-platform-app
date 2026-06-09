<template>
  <view class="page-container">
    <view class="page-header">
      <view class="header-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="22" color="var(--text-primary)" />
      </view>
      <text class="page-title">我的帖子</text>
      <view style="width:36px" />
    </view>

    <scroll-view scroll-y class="post-list" @scrolltolower="loadMore">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="posts.length > 0" class="post-items">
        <view v-for="post in posts" :key="post.id" class="post-card">
          <view class="post-content" @tap="goDetail(post.id)">
            <text class="post-text">{{ post.content }}</text>
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
              <text class="meta-time">{{ formatTime(post.createTime) }}</text>
              <view class="meta-stats">
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
          <view class="post-actions">
            <view class="action-btn" @tap="onDelete(post)">
              <Icon icon="solar:trash-bin-minimalistic-bold" width="14" color="var(--color-primary)" />
              <text class="action-btn-text">删除</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:pen-new-square-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">还没有发过帖子</text>
        <button class="btn-create" @tap="goCreate">去发帖</button>
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
import { getMyPosts, deletePost, imgUrl } from '@/api'
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

function goCreate() {
  uni.navigateTo({ url: '/pages/community/create' })
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
    const res = await getMyPosts({ userId: getCurrentUserId(), pageNo: pageNo.value, pageSize: 10 })
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

async function onDelete(post: any) {
  uni.showModal({
    title: '提示',
    content: '确定删除这条帖子吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deletePost(post.id)
          uni.showToast({ title: '已删除', icon: 'success' })
          posts.value = posts.value.filter((p: any) => p.id !== post.id)
        } catch (e: any) {
          uni.showToast({ title: e?.message || '删除失败', icon: 'none' })
        }
      }
    },
  })
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
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.post-content {
  padding: var(--space-lg);
}

.post-content:active {
  background: var(--bg-gray);
}

.post-text {
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
  align-items: center;
  justify-content: space-between;
}

.meta-time {
  font-size: 10px;
  color: var(--text-hint);
}

.meta-stats {
  display: flex;
  gap: 12px;
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

.post-actions {
  display: flex;
  justify-content: flex-end;
  padding: var(--space-sm) var(--space-lg);
  border-top: 1px solid var(--bg-gray);
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
  margin-bottom: var(--space-lg);
}

.btn-create {
  font-size: var(--font-base);
  color: var(--text-white);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-full);
  padding: var(--space-sm) 24px;
  line-height: 1.5;
}

.btn-create:active {
  opacity: 0.85;
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
