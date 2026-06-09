<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-title">社区</text>
      <view class="nav-actions">
        <view class="nav-btn" @tap="goSearch">
          <Icon icon="solar:magnifer-bold" :size="20" color="var(--text-secondary)" />
        </view>
        <view class="nav-btn create-btn" @tap="goCreate">
          <Icon icon="solar:pen-new-square-bold" :size="18" color="var(--color-primary)" />
        </view>
      </view>
    </view>

    <!-- 话题标签 -->
    <scroll-view scroll-x class="topic-scroll">
      <view
        v-for="topic in topics"
        :key="topic.id"
        class="topic-tag"
        :class="{ active: activeTopicId === topic.id }"
        @tap="onSelectTopic(topic.id)"
      >
        <text class="topic-text" :class="{ active: activeTopicId === topic.id }">{{ topic.name }}</text>
      </view>
    </scroll-view>

    <!-- 帖子列表 -->
    <scroll-view scroll-y class="post-list" @scrolltolower="loadMore" :refresher-enabled="true" @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <view v-if="loading && posts.length === 0" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="posts.length > 0" class="post-items">
        <view v-for="post in posts" :key="post.id" class="post-card" @tap="goDetail(post.id)">
          <!-- 用户信息 -->
          <view class="post-header">
            <view class="post-user" @tap.stop="goUser(post.userId)">
              <view class="user-avatar">
                <text class="avatar-text">{{ (post.nickname || '匿').charAt(0) }}</text>
              </view>
              <view class="user-info">
                <text class="user-name">{{ post.nickname || post.username || '匿名用户' }}</text>
                <text class="post-time">{{ formatTime(post.createTime) }}</text>
              </view>
            </view>
            <view v-if="post.topicName" class="topic-badge">
              <text class="topic-badge-text">#{{ post.topicName }}</text>
            </view>
          </view>

          <!-- 内容 -->
          <text class="post-content">{{ post.content }}</text>

          <!-- 图片 -->
          <view v-if="post.images && post.images.length > 0" class="post-images" :class="'grid-' + Math.min(post.images.length, 3)">
            <image
              v-for="(img, idx) in post.images.slice(0, 9)"
              :key="idx"
              :src="imgUrl(img)"
              class="post-img"
              mode="aspectFill"
              @tap.stop="previewImage(post.images, idx)"
            />
          </view>

          <!-- 互动栏 -->
          <view class="post-actions">
            <view class="action-item" @tap.stop="onLike(post)">
              <Icon :icon="post.liked ? 'solar:heart-bold' : 'solar:heart-linear'" :size="18" :color="post.liked ? '#EF4444' : 'var(--text-hint)'" />
              <text class="action-count">{{ post.likeCount || 0 }}</text>
            </view>
            <view class="action-item">
              <Icon icon="solar:chat-round-dots-linear" :size="18" color="var(--text-hint)" />
              <text class="action-count">{{ post.commentCount || 0 }}</text>
            </view>
            <view class="action-item" @tap.stop="onFavorite(post)">
              <Icon :icon="post.favorited ? 'solar:star-bold' : 'solar:star-linear'" :size="18" :color="post.favorited ? '#F59E0B' : 'var(--text-hint)'" />
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:chat-square-like-linear" :size="48" color="var(--text-hint)" />
        <text class="empty-text">还没有帖子，快来发一条吧</text>
        <view class="empty-btn" @tap="goCreate">
          <Icon icon="solar:pen-new-square-bold" :size="16" color="#fff" />
          <text class="empty-btn-text">发帖</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="noMore && posts.length > 0" class="no-more">
        <text class="no-more-text">— 没有更多了 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getTopicFrontList, getPostFrontList, toggleLike, toggleFavorite, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'
import { Icon } from '@iconify/vue'

const loading = ref(false)
const refreshing = ref(false)
const topics = ref<any[]>([{ id: '', name: '全部' }])
const activeTopicId = ref('')
const posts = ref<any[]>([])
const pageNo = ref(1)
const noMore = ref(false)

function goSearch() {
  uni.showToast({ title: '搜索功能开发中', icon: 'none' })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/community/create' })
}

function goDetail(id: string) {
  uni.navigateTo({ url: '/pages/community/detail?id=' + id })
}

function goUser(userId: string) {
  uni.navigateTo({ url: '/pages/community/user?userId=' + userId })
}

function previewImage(images: string[], idx: number) {
  uni.previewImage({
    urls: images.map((img: string) => imgUrl(img)),
    current: idx,
  })
}

function formatTime(time: string) {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return (d.getMonth() + 1) + '/' + d.getDate()
}

function onSelectTopic(id: string) {
  activeTopicId.value = id
  pageNo.value = 1
  noMore.value = false
  posts.value = []
  loadPosts()
}

function loadMore() {
  if (noMore.value || loading.value) return
  pageNo.value++
  loadPosts(true)
}

function onRefresh() {
  refreshing.value = true
  pageNo.value = 1
  noMore.value = false
  loadPosts(false, true)
}

async function loadTopics() {
  try {
    const res = await getTopicFrontList()
    const list: any[] = Array.isArray(res) ? res : (res?.records || [])
    topics.value = [{ id: '', name: '全部' }, ...list]
  } catch { /* keep default */ }
}

async function loadPosts(append = false, isRefresh = false) {
  if (!append) loading.value = true
  try {
    const params: any = { pageNo: pageNo.value, pageSize: 10, userId: getCurrentUserId() }
    if (activeTopicId.value) params.topicId = activeTopicId.value
    const res = await getPostFrontList(params)
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
    if (isRefresh) refreshing.value = false
  }
}

async function onLike(post: any) {
  try {
    await toggleLike('post', post.id, getCurrentUserId())
    post.liked = !post.liked
    post.likeCount = (post.likeCount || 0) + (post.liked ? 1 : -1)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

async function onFavorite(post: any) {
  try {
    await toggleFavorite(post.id, getCurrentUserId())
    post.favorited = !post.favorited
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

onLoad(() => {
  loadTopics()
  loadPosts()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  height: 100vh;
  overflow: hidden;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

/* ---- 顶部导航 ---- */
.nav-bar {
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
}

.nav-title {
  font-size: var(--font-2xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-btn {
  background: var(--color-primary-light);
}

/* ---- 话题标签 ---- */
.topic-scroll {
  background: var(--bg-card);
  padding: 8px 16px 12px;
  white-space: nowrap;
  border-bottom: 1px solid #f0f0f0;
}

.topic-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  margin-right: 8px;
  background: var(--bg-gray);
}

.topic-tag.active {
  background: var(--color-primary);
}

.topic-text {
  font-size: var(--font-base);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.topic-text.active {
  color: #fff;
}

/* ---- 帖子列表 ---- */
.post-list {
  flex: 1;
  padding: 12px 16px;
}

.post-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.post-card:active {
  background: #fafafa;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE0D0, #FFB088);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 16px;
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.post-time {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

.topic-badge {
  background: var(--color-primary-light);
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.topic-badge-text {
  font-size: var(--font-xs);
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

.post-content {
  font-size: var(--font-md);
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ---- 图片网格 ---- */
.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.post-images.grid-1 .post-img {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-sm);
}

.post-images.grid-2 .post-img {
  width: calc(50% - 3px);
  height: 160px;
  border-radius: var(--radius-sm);
}

.post-images.grid-3 .post-img,
.post-images:not(.grid-1):not(.grid-2) .post-img {
  width: calc(33.33% - 4px);
  height: 110px;
  border-radius: 6px;
}

/* ---- 互动栏 ---- */
.post-actions {
  display: flex;
  align-items: center;
  gap: 32px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-count {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* ---- 加载/空状态 ---- */
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

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
  gap: 12px;
}

.empty-text {
  font-size: var(--font-base);
  color: var(--text-hint);
}

.empty-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  margin-top: 8px;
}

.empty-btn:active {
  opacity: 0.9;
}

.empty-btn-text {
  font-size: var(--font-base);
  color: #fff;
  font-weight: var(--weight-medium);
}

.no-more {
  padding: 16px 0;
  text-align: center;
}

.no-more-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.bottom-spacer {
  height: 16px;
}
</style>
