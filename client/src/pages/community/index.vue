<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-title">社区</text>
      <view class="nav-actions">
        <view class="nav-btn" @tap="goSearch">
          <Icon icon="solar:magnifer-bold" :size="20" color="#fff" />
        </view>
      </view>
    </view>

    <!-- 话题标签横滑区 -->
    <scroll-view scroll-x class="topic-scroll">
      <view class="topic-wrapper">
        <view
          v-for="topic in topics"
          :key="topic.id"
          class="topic-tag"
          :class="{ active: activeTopicId === topic.id }"
          @tap="onSelectTopic(topic.id)"
        >
          <text class="topic-text" :class="{ active: activeTopicId === topic.id }">{{ topic.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 帖子列表 -->
    <scroll-view
      scroll-y
      class="post-list"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      @refresherrefresh="onRefresh"
      :refresher-triggered="refreshing"
    >
      <view v-if="loading && posts.length === 0" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="posts.length > 0" class="post-items">
        <view v-for="(post, idx) in posts" :key="post.id" class="post-card" @tap="goDetail(post.id)">
          <!-- 头部信息 -->
          <view class="post-header">
            <view class="post-user" @tap.stop="goUser(post.userId)">
              <view class="user-avatar" :style="{ background: getPastelAvatarBg(idx) }">
                <text class="avatar-text">{{ (post.nickname || '匿').charAt(0) }}</text>
              </view>
              <view class="user-info">
                <text class="user-name">{{ post.nickname || post.username || '匿名用户' }}</text>
                <text class="post-time">{{ formatTime(post.createTime) }}</text>
              </view>
            </view>
            <view
              v-if="post.topicName"
              class="topic-badge"
              :style="{ background: getPastelBadgeBg(idx) }"
            >
              <text class="topic-badge-text">#{{ post.topicName }}</text>
            </view>
          </view>

          <!-- 帖子内容 -->
          <text class="post-content">{{ post.content }}</text>

          <!-- 图片拼贴 -->
          <view v-if="post.images && post.images.length > 0" class="post-images" :class="'grid-' + Math.min(post.images.length, 3)">
            <image
              v-for="(img, imgIdx) in post.images.slice(0, 9)"
              :key="imgIdx"
              :src="imgUrl(img)"
              class="post-img"
              mode="aspectFill"
              @tap.stop="previewImage(post.images, imgIdx)"
            />
          </view>

          <!-- 胶囊互动栏 (Chip) -->
          <view class="post-actions">
            <!-- 点赞 -->
            <view
              class="action-chip"
              :class="{ active: post.liked }"
              @tap.stop="onLike(post)"
            >
              <Icon
                :icon="post.liked ? 'solar:heart-bold' : 'solar:heart-linear'"
                :size="16"
                :color="post.liked ? '#EF4444' : 'var(--text-secondary)'"
              />
              <text class="action-count" :class="{ active: post.liked }">{{ post.likeCount || 0 }}</text>
            </view>

            <!-- 评论 -->
            <view class="action-chip">
              <Icon icon="solar:chat-round-dots-linear" :size="16" color="var(--text-secondary)" />
              <text class="action-count">{{ post.commentCount || 0 }}</text>
            </view>

            <!-- 收藏 -->
            <view
              class="action-chip"
              :class="{ active: post.favorited }"
              @tap.stop="onFavorite(post)"
            >
              <Icon
                :icon="post.favorited ? 'solar:star-bold' : 'solar:star-linear'"
                :size="16"
                :color="post.favorited ? '#F59E0B' : 'var(--text-secondary)'"
              />
              <text class="action-count" :class="{ active: post.favorited }">
                {{ post.favorited ? '已收藏' : '收藏' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-wrap card">
        <Icon icon="solar:chat-square-like-linear" :size="48" color="var(--text-hint)" />
        <text class="empty-text">还没有帖子，快来发一条吧</text>
      </view>

      <!-- 没有更多 -->
      <view v-if="noMore && posts.length > 0" class="no-more">
        <text class="no-more-text">— 没有更多了 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 全大写等宽悬浮发帖按钮 -->
    <view class="floating-create-post" @tap="goCreate">
      <Icon icon="solar:pen-new-square-bold" :size="18" color="#ffffff" />
      <text class="create-post-text">NEW POST</text>
    </view>

    <!-- 自定义悬浮 TabBar -->
    <CustomTabBar :active="3" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getTopicFrontList, getPostFrontList, toggleLike, toggleFavorite, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'
import { Icon } from '@iconify/vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const loading = ref(false)
const refreshing = ref(false)
const topics = ref<any[]>([{ id: '', name: '全部' }])
const activeTopicId = ref('')
const posts = ref<any[]>([])
const pageNo = ref(1)
const noMore = ref(false)

function goSearch() {
  uni.showToast({ title: '搜索功能即将上线', icon: 'none' })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/community/create' })
}

// 详情、发帖等操作
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

onShow(() => {
  uni.hideTabBar({ animation: false })
})

const badgeColors = [
  'var(--color-block-lilac)',
  'var(--color-block-mint)',
  'var(--color-block-lime)',
  'var(--color-block-coral)',
  'var(--color-block-pink)',
  'var(--color-block-cream)'
]
function getPastelBadgeBg(idx: number) {
  return badgeColors[idx % badgeColors.length]
}

const avatarColors = [
  'linear-gradient(135deg, #FFE0D0, #FFB088)',
  'linear-gradient(135deg, #E0D0FF, #B088FF)',
  'linear-gradient(135deg, #D0E8FF, #88C0FF)',
  'linear-gradient(135deg, #D0FFE0, #88FFB0)',
  'linear-gradient(135deg, #FFE8D0, #FFC088)'
]
function getPastelAvatarBg(idx: number) {
  return avatarColors[idx % avatarColors.length]
}
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
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.nav-title {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  background: linear-gradient(135deg, #ffffff 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: var(--letter-spacing-display, -0.5px);
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- 话题标签横滑区 ---- */
.topic-scroll {
  background: var(--bg-card);
  padding: 12px 0;
  border-bottom: 1px solid var(--color-divider);
  white-space: nowrap;
}

.topic-wrapper {
  padding: 0 16px;
  display: flex;
  gap: 8px;
}

.topic-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  background: var(--bg-gray);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.topic-tag.active {
  background: linear-gradient(135deg, var(--color-accent), #7C3AED);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.topic-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
  transition: color 0.2s;
}

.topic-text.active {
  color: #ffffff;
  font-weight: var(--weight-bold);
}

/* ---- 帖子列表滚动容器 ---- */
.post-list {
  flex: 1;
  padding: 12px 16px;
  box-sizing: border-box;
}

.post-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- 帖子卡片 ---- */
.post-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s;
}

.post-card:active {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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

/* 几何圆角头像 */
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.avatar-text {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.post-time {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

/* 话题标签徽章 */
.topic-badge {
  padding: 4px 10px;
  background: var(--color-primary-light) !important;
  border-radius: var(--radius-full);
}

.topic-badge-text {
  font-size: var(--font-xs);
  color: var(--color-accent);
  font-weight: var(--weight-bold);
}

/* 帖子文字内容 */
.post-content {
  font-size: var(--font-md);
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ---- 图片拼贴网格 ---- */
.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.post-images.grid-1 .post-img {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-md);
}

.post-images.grid-2 .post-img {
  width: calc(50% - 3px);
  height: 140px;
  border-radius: var(--radius-md);
}

.post-images.grid-3 .post-img,
.post-images:not(.grid-1):not(.grid-2) .post-img {
  width: calc(33.33% - 4px);
  height: 96px;
  border-radius: var(--radius-sm);
}

/* ---- 互动栏 ---- */
.post-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-divider);
}

.action-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: var(--bg-gray);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.action-chip:active {
  transform: scale(0.95);
}

.action-count {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.action-count.active {
  font-weight: var(--weight-semibold);
}

/* 点赞高亮 */
.action-chip.active:has(.solar\:heart-bold) {
  background: var(--color-danger-light);
  transform: scale(1.05);
  animation: jelly 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.action-chip.active:has(.solar\:heart-bold) .action-count {
  color: var(--color-danger);
}

/* 收藏高亮 */
.action-chip.active:has(.solar\:star-bold) {
  background: var(--color-warning-light);
  transform: scale(1.05);
  animation: jelly 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.action-chip.active:has(.solar\:star-bold) .action-count {
  color: var(--color-warning);
}

@keyframes jelly {
  0% { transform: scale(1); }
  30% { transform: scale(1.15); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1.05); }
}

/* ---- 悬浮发帖胶囊 ---- */
.floating-create-post {
  position: fixed;
  right: 16px;
  bottom: calc(82px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(135deg, var(--color-accent), #7C3AED);
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  z-index: 998;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.floating-create-post:active {
  transform: scale(0.9) translateY(2px);
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.2);
}

.create-post-text {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-sm);
  letter-spacing: var(--letter-spacing-mono, 1.5px);
  font-weight: var(--weight-bold);
  color: #ffffff;
}

/* ---- 空状态/加载 ---- */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
  gap: 12px;
}

.empty-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
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
  height: 80px;
}
</style>
