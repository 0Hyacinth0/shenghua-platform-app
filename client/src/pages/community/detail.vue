<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="22" color="var(--text-primary)" />
      </view>
      <text class="nav-title">帖子详情</text>
      <view class="nav-right">
        <view class="nav-btn" @tap="onMore">
          <Icon icon="solar:menu-dots-bold" width="20" color="var(--text-secondary)" />
        </view>
      </view>
    </view>

    <view v-if="loading" class="loading-wrap">
      <view class="loading-spinner" />
    </view>

    <template v-else-if="post">
      <!-- 帖子内容 -->
      <view class="post-card">
        <view class="post-header">
          <view class="post-user" @tap="goUser(post.userId)">
            <view class="user-avatar">
              <text class="avatar-text">{{ (post.nickname || '匿').charAt(0) }}</text>
            </view>
            <view class="user-info">
              <text class="user-name">{{ post.nickname || post.username || '匿名用户' }}</text>
              <text class="post-time">{{ post.createTime }}</text>
            </view>
          </view>
          <view v-if="post.topicName" class="topic-badge">
            <text class="topic-text">#{{ post.topicName }}</text>
          </view>
        </view>

        <text class="post-content">{{ post.content }}</text>

        <view v-if="post.images && post.images.length > 0" class="post-images">
          <image
            v-for="(img, idx) in post.images"
            :key="idx"
            :src="imgUrl(img)"
            class="post-img"
            mode="aspectFill"
            @tap="previewImage(post.images, idx)"
          />
        </view>

        <!-- 互动栏 -->
        <view class="post-actions">
          <view class="action-item" @tap="onLike">
            <Icon :icon="post.liked ? 'solar:heart-bold' : 'solar:heart-linear'" width="20" :color="post.liked ? 'var(--color-danger)' : 'var(--text-hint)'" />
            <text class="action-count">{{ post.likeCount || 0 }}</text>
          </view>
          <view class="action-item">
            <Icon icon="solar:chat-round-dots-linear" width="20" color="var(--text-hint)" />
            <text class="action-count">{{ post.commentCount || 0 }}</text>
          </view>
          <view class="action-item" @tap="onFavorite">
            <Icon :icon="post.favorited ? 'solar:star-bold' : 'solar:star-linear'" width="20" :color="post.favorited ? 'var(--color-warning)' : 'var(--text-hint)'" />
            <text class="action-count">收藏</text>
          </view>
          <view class="action-item" @tap="onShare">
            <Icon icon="solar:share-bold" width="20" color="var(--text-hint)" />
            <text class="action-count">分享</text>
          </view>
        </view>
      </view>

      <!-- 评论区 -->
      <view class="comment-card">
        <view class="section-header">
          <text class="section-title">评论 ({{ post.commentCount || 0 }})</text>
        </view>

        <view v-if="comments.length > 0" class="comment-list">
          <view v-for="comment in comments" :key="comment.id" class="comment-item">
            <view class="comment-header">
              <view class="comment-user">
                <view class="comment-avatar">
                  <text class="avatar-text-sm">{{ (comment.nickname || '匿').charAt(0) }}</text>
                </view>
                <text class="comment-username">{{ comment.nickname || comment.username || '匿名' }}</text>
              </view>
              <text class="comment-time">{{ formatTime(comment.createTime) }}</text>
            </view>
            <text class="comment-content">{{ comment.content }}</text>

            <!-- 回复列表 -->
            <view v-if="comment.replies && comment.replies.length > 0" class="reply-list">
              <view v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <text class="reply-user">{{ reply.nickname || reply.username || '匿名' }}</text>
                <text class="reply-sep">：</text>
                <text class="reply-content">{{ reply.content }}</text>
              </view>
            </view>

            <view class="comment-actions">
              <view class="comment-action" @tap="onReply(comment)">
                <text class="action-text">回复</text>
              </view>
              <view class="comment-action" @tap="onLikeComment(comment)">
                <Icon :icon="comment.liked ? 'solar:heart-bold' : 'solar:heart-linear'" width="16" :color="comment.liked ? 'var(--color-danger)' : 'var(--text-hint)'" />
                <text class="action-text-count">{{ comment.likeCount || 0 }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="empty-comments">
          <Icon icon="solar:chat-round-dots-linear" width="40" color="var(--text-hint)" />
          <text class="empty-text">暂无评论，快来抢沙发吧</text>
        </view>
      </view>
    </template>

    <view v-else class="empty-wrap">
      <Icon icon="solar:sad-circle-linear" width="48" color="var(--text-hint)" />
      <text class="empty-text">帖子不存在</text>
    </view>

    <view class="bottom-spacer" />

    <!-- 底部评论输入 -->
    <view class="comment-bar">
      <view class="input-wrap">
        <input
          v-model="commentText"
          class="comment-input"
          :placeholder="replyTarget ? '回复 ' + replyTarget : '写评论...'"
          placeholder-class="input-placeholder"
          :focus="inputFocus"
          @blur="inputFocus = false"
        />
      </view>
      <view class="send-btn" :class="{ active: commentText.trim() }" @tap="submitComment">
        <text class="send-text">发送</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getPostDetail, getCommentList, createComment, toggleLike, toggleFavorite, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(true)
const post = ref<any>(null)
const comments = ref<any[]>([])
const commentText = ref('')
const replyTarget = ref('')
const replyCommentId = ref('')
const inputFocus = ref(false)
let postId = ''

function goBack() {
  uni.navigateBack()
}

function goUser(userId: string) {
  uni.navigateTo({ url: '/pages/community/user?userId=' + userId })
}

function onMore() {
  uni.showActionSheet({
    itemList: ['举报', '复制链接'],
    success: (res) => {
      if (res.tapIndex === 1) {
        uni.showToast({ title: '链接已复制', icon: 'success' })
      }
    },
  })
}

function onShare() {
  // #ifdef H5
  const url = window.location.href
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
    uni.showToast({ title: '链接已复制', icon: 'success' })
  } else {
    uni.showToast({ title: '复制失败', icon: 'none' })
  }
  // #endif
  // #ifndef H5
  uni.setClipboardData({
    data: '分享帖子: ' + postId,
    success: () => uni.showToast({ title: '链接已复制', icon: 'success' }),
  })
  // #endif
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

function onReply(comment: any) {
  replyTarget.value = comment.nickname || comment.username || '匿名'
  replyCommentId.value = comment.id
  inputFocus.value = true
}

async function loadPost() {
  loading.value = true
  try {
    const res = await getPostDetail(postId, getCurrentUserId())
    post.value = res || null
  } catch {
    post.value = null
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  try {
    const res = await getCommentList(postId, 1, 50)
    comments.value = res?.records || (Array.isArray(res) ? res : [])
  } catch {
    comments.value = []
  }
}

async function submitComment() {
  if (!commentText.value.trim()) return
  try {
    await createComment({
      postId,
      userId: getCurrentUserId(),
      content: commentText.value.trim(),
      parentId: replyCommentId.value || undefined,
    })
    uni.showToast({ title: '评论成功', icon: 'success' })
    commentText.value = ''
    replyTarget.value = ''
    replyCommentId.value = ''
    loadComments()
    if (post.value) post.value.commentCount = (post.value.commentCount || 0) + 1
  } catch (e: any) {
    uni.showToast({ title: e?.message || '评论失败', icon: 'none' })
  }
}

async function onLike() {
  if (!post.value) return
  try {
    await toggleLike('post', post.value.id, getCurrentUserId())
    post.value.liked = !post.value.liked
    post.value.likeCount = (post.value.likeCount || 0) + (post.value.liked ? 1 : -1)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

async function onFavorite() {
  if (!post.value) return
  try {
    await toggleFavorite(post.value.id, getCurrentUserId())
    post.value.favorited = !post.value.favorited
    uni.showToast({ title: post.value.favorited ? '已收藏' : '已取消收藏', icon: 'success' })
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

async function onLikeComment(comment: any) {
  try {
    await toggleLike('comment', comment.id, getCurrentUserId())
    comment.liked = !comment.liked
    comment.likeCount = (comment.likeCount || 0) + (comment.liked ? 1 : -1)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

onLoad((options: any) => {
  postId = options?.id || ''
  if (postId) {
    loadPost()
    loadComments()
  }
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 60px;
}

/* 顶部导航 */
.nav-bar {
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 12px;
}

.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 帖子内容 */
.post-card {
  background: var(--bg-card);
  margin-top: var(--space-sm);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-circle);
  background: var(--color-accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-accent);
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
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.topic-badge {
  background: var(--color-accent-light);
  padding: var(--space-xs) 12px;
  border-radius: 14px;
}

.topic-text {
  font-size: var(--font-sm);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

.post-content {
  font-size: var(--font-lg);
  color: var(--text-primary);
  line-height: 1.7;
  margin-bottom: 14px;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: 14px;
}

.post-img {
  width: calc(33.33% - 6px);
  height: 110px;
  border-radius: var(--radius-sm);
}

.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 14px;
  border-top: 1px solid var(--bg-gray);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.action-count {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

/* 评论区 */
.comment-card {
  background: var(--bg-card);
  margin-top: var(--space-sm);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.section-header {
  margin-bottom: var(--space-lg);
}

.section-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.comment-item {
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--bg-gray);
}

.comment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.comment-user {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-circle);
  background: var(--color-accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text-sm {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--color-accent);
}

.comment-username {
  font-size: var(--font-base);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.comment-time {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.comment-content {
  font-size: var(--font-md);
  color: var(--text-primary);
  line-height: 1.6;
}

.reply-list {
  background: var(--bg-gray);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  margin-top: 10px;
}

.reply-item {
  font-size: var(--font-base);
  line-height: 1.6;
  margin-bottom: 6px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-user {
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

.reply-sep {
  color: var(--text-hint);
}

.reply-content {
  color: var(--text-primary);
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-text {
  font-size: var(--font-base);
  color: var(--text-hint);
}

.action-text-count {
  font-size: var(--font-base);
  color: var(--text-hint);
}

.empty-comments {
  padding: 32px 0;
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

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 40px;
  gap: 12px;
}

.bottom-spacer {
  height: 16px;
}

/* 底部评论栏 */
.comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  padding-bottom: 24px;
  background: var(--bg-card);
  border-top: 1px solid var(--bg-gray);
  z-index: 100;
}

.input-wrap {
  flex: 1;
  background: var(--bg-gray);
  border-radius: var(--radius-full);
  padding: 0 var(--space-lg);
  height: 40px;
  display: flex;
  align-items: center;
}

.comment-input {
  flex: 1;
  height: 40px;
  font-size: var(--font-base);
  color: var(--text-primary);
}

.input-placeholder {
  color: var(--text-hint);
  font-size: var(--font-base);
}

.send-btn {
  padding: var(--space-sm) 18px;
  border-radius: var(--radius-full);
  background: var(--bg-gray);
}

.send-btn.active {
  background: var(--color-accent);
}

.send-text {
  font-size: var(--font-base);
  color: var(--text-hint);
  font-weight: var(--weight-medium);
}

.send-btn.active .send-text {
  color: var(--text-white);
}
</style>
