<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-title">社区</text>
      <view class="nav-actions">
        <view class="nav-btn" @tap="goSearch">
          <Icon icon="solar:magnifer-bold" :size="20" color="#111" />
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
              <view class="user-avatar">
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
                :color="post.liked ? '#EF4444' : '#555555'"
              />
              <text class="action-count" :class="{ active: post.liked }">{{ post.likeCount || 0 }}</text>
            </view>

            <!-- 评论 -->
            <view class="action-chip">
              <Icon icon="solar:chat-round-dots-linear" :size="16" color="#555555" />
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
                :color="post.favorited ? '#F59E0B' : '#555555'"
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
        <Icon icon="solar:chat-square-like-linear" :size="48" color="var(--color-text-hint)" />
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
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg-page, #F7F7F8);
  display: flex;
  flex-direction: column;
}

/* ---- 顶部导航 ---- */
.nav-bar {
  background: var(--color-card, #fff);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
  border-bottom: 1px solid var(--color-border, #eee);
}

.nav-title {
  font-size: 28px;
  font-weight: var(--weight-bold, 700);
  color: var(--color-text, #111);
  letter-spacing: var(--letter-spacing-display, -0.5px);
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.nav-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full, 999px);
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- 话题标签横滑区 ---- */
.topic-scroll {
  background: var(--color-card, #fff);
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border, #eee);
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
  border-radius: var(--radius-full, 999px);
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  transition: all 0.2s;
}

.topic-tag.active {
  background: #111111;
  border-color: #111111;
}

.topic-text {
  font-size: var(--font-sm, 12px);
  color: var(--color-text-secondary, #666);
  font-weight: var(--weight-medium, 500);
}

.topic-text.active {
  color: #ffffff;
  font-weight: var(--weight-bold, 700);
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

/* ---- 帖子卡片 (Figma 高端改版) ---- */
.post-card {
  background: var(--color-card, #fff);
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-xl, 20px);
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.post-card:active {
  background: var(--color-bg-page, #f7f7f8);
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

/* 方形几何圆角头像 */
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-block-cream, #FFF3E5);
  border: 1px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 16px;
  font-weight: var(--weight-bold, 700);
  color: #111111;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: var(--font-base, 14px);
  font-weight: var(--weight-bold, 700);
  color: var(--color-text, #111);
}

.post-time {
  font-size: var(--font-xs, 10px);
  color: var(--color-text-hint, #999);
}

/* 粉彩话题标签徽章 */
.topic-badge {
  padding: 3px 10px;
  border-radius: var(--radius-full, 999px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.topic-badge-text {
  font-size: var(--font-xs, 10px);
  color: #111111;
  font-weight: var(--weight-bold, 700);
}

/* 帖子文字内容 */
.post-content {
  font-size: var(--font-base, 14px);
  color: var(--color-text, #1a1a1a);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ---- 精美图片拼贴网格 ---- */
.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.post-images.grid-1 .post-img {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-md, 12px);
  border: 1px solid var(--color-border, #eee);
}

.post-images.grid-2 .post-img {
  width: calc(50% - 3px);
  height: 140px;
  border-radius: var(--radius-md, 12px);
  border: 1px solid var(--color-border, #eee);
}

.post-images.grid-3 .post-img,
.post-images:not(.grid-1):not(.grid-2) .post-img {
  width: calc(33.33% - 4px);
  height: 96px;
  border-radius: var(--radius-sm, 8px);
  border: 1px solid var(--color-border, #eee);
}

/* ---- 药丸互动栏 (Chip) ---- */
.post-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-divider, #f0f0f0);
}

.action-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full, 999px);
  background: rgba(0, 0, 0, 0.03);
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.action-chip:active {
  transform: scale(0.95);
}

.action-count {
  font-size: var(--font-xs, 10px);
  color: var(--color-text-secondary, #666);
  font-weight: var(--weight-medium, 500);
}

.action-count.active {
  font-weight: var(--weight-bold, 700);
}

/* 点赞高亮激活态（淡珊瑚色） */
.action-chip.active:has(.solar\:heart-bold) {
  background: var(--color-block-coral, #FFCDC4);
}
.action-chip.active:has(.solar\:heart-bold) .action-count {
  color: #111111;
}

/* 收藏高亮激活态（淡奶油色） */
.action-chip.active:has(.solar\:star-bold) {
  background: var(--color-block-cream, #FFF3E5);
}
.action-chip.active:has(.solar\:star-bold) .action-count {
  color: #111111;
}

/* ---- 悬浮发帖黑色胶囊 ---- */
.floating-create-post {
  position: fixed;
  right: 20px;
  bottom: calc(82px + env(safe-area-inset-bottom, 0px)); /* 定位在自定义TabBar上方 */
  background: #111111;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-full, 999px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 998;
  transition: all 0.2s;
}

.floating-create-post:active {
  transform: scale(0.95);
  background: #000;
}

.create-post-text {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-sm, 12px);
  letter-spacing: var(--letter-spacing-mono, 1.5px);
  font-weight: var(--weight-bold, 700);
  color: #ffffff;
}

/* ---- 空状态/加载/页尾占位 ---- */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
  gap: 12px;
}

.empty-text {
  font-size: var(--font-sm, 12px);
  color: var(--color-text-hint, #999);
}

.no-more {
  padding: 16px 0;
  text-align: center;
}

.no-more-text {
  font-size: var(--font-sm, 12px);
  color: var(--color-text-hint, #999);
}

.bottom-spacer {
  height: 80px;
}
</style>
