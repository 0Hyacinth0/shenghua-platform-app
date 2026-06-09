<template>
  <div class="post-detail">
    <!-- 顶部导航 -->
    <header class="detail-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <span class="header-title">帖子详情</span>
    </header>

    <!-- 帖子主体 -->
    <div class="post-main">
      <!-- 作者信息 -->
      <div class="post-author-bar">
        <div class="author-avatar" :style="{ background: avatarColor }" @click="goUser(post.userId)">
          {{ (post.userName || '?')[0] }}
        </div>
        <div class="author-info">
          <span class="author-name" @click="goUser(post.userId)">{{ post.userName || '匿名用户' }}</span>
          <span class="post-time">{{ timeAgo(post.createTime) }}</span>
        </div>
        <span class="post-type-tag" :style="{ color: typeColor, borderColor: typeColor }">
          {{ typeLabel }}
        </span>
      </div>

      <!-- 标题和内容 -->
      <h1 class="post-title">{{ post.title }}</h1>
      <div class="post-content" v-if="post.content">
        {{ post.content }}
      </div>

      <!-- 图片 -->
      <div v-if="post.cover" class="post-images">
        <img
          v-for="(img, i) in post.cover.split(',')"
          :key="i"
          :src="imgUrl(img)"
          class="post-image"
          @click="previewImage(imgUrl(img))"
        />
      </div>

      <!-- 操作栏 -->
      <div class="post-actions">
        <button class="action-btn" :class="{ liked: postLiked }" @click="handleLike">
          <LikeOutlined class="action-icon" :class="{ 'liked-icon': postLiked }" />
          <span>{{ post.likeCount || 0 }}</span>
        </button>
        <button class="action-btn" :class="{ favorited: postFavorited }" @click="handleFavorite">
          <component :is="postFavorited ? StarFilled : StarOutlined" class="action-icon" :class="{ 'fav-icon': postFavorited }" />
          <span>收藏</span>
        </button>
        <span class="action-stat">
          <CommentOutlined /> {{ post.commentCount || 0 }}
        </span>
        <span class="action-stat">
          <EyeOutlined /> {{ post.viewCount || 0 }}
        </span>
        <button v-if="isOwner" class="action-btn delete-btn" @click="handleDelete">
          <DeleteOutlined />
          <span>删除</span>
        </button>
        <button v-if="!isOwner" class="action-btn report-btn" @click="openReportModal">
          <WarningOutlined />
          <span>举报</span>
        </button>
      </div>
    </div>

    <!-- 分割线 -->
    <div class="section-divider" />

    <!-- 评论区 -->
    <div class="comment-section">
      <h3 class="comment-title">全部评论 ({{ commentTotal }})</h3>

      <div v-if="comments.length === 0 && !loadingComments" class="empty-comments">
        暂无评论，快来抢沙发~
      </div>

      <div v-for="c in comments" :key="c.id" class="comment-item">
        <div class="comment-avatar" :style="{ background: getAvatarColor(c.userName) }">
          {{ (c.userName || '?')[0] }}
        </div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-name">{{ c.userName || '匿名用户' }}</span>
            <span class="comment-time">{{ timeAgo(c.createTime) }}</span>
          </div>
          <div class="comment-text">{{ c.content }}</div>
          <div class="comment-footer">
            <span class="comment-reply-btn" @click="startReply(c)">回复</span>
          </div>

          <!-- 子回复 -->
          <div v-if="c.replies && c.replies.length > 0" class="sub-replies">
            <div v-for="r in c.replies" :key="r.id" class="sub-reply-item">
              <span class="sub-reply-name">{{ r.userName || '匿名用户' }}</span>
              <span v-if="r.replyToUserName" class="sub-reply-to">
                回复 <span class="sub-reply-target">@{{ r.replyToUserName }}</span>
              </span>
              ：{{ r.content }}
            </div>
            <div v-if="c.replyCount > 3" class="view-all-replies" @click="loadAllReplies(c)">
              查看全部 {{ c.replyCount }} 条回复
            </div>
          </div>
        </div>
      </div>

      <div v-if="loadingComments" class="loading-hint">加载中...</div>
      <div v-if="hasMoreComments && !loadingComments" class="load-more" @click="loadMoreComments">
        加载更多评论
      </div>
    </div>

    <!-- 底部输入栏 -->
    <div class="bottom-input-bar">
      <input
        ref="commentInput"
        v-model="commentText"
        class="comment-input"
        :placeholder="replyTarget ? '回复 @' + replyTarget.userName + '...' : '发表评论...'"
        @focus="onInputFocus"
      />
      <button
        class="send-btn"
        :disabled="!commentText.trim()"
        @click="sendComment"
      >发送</button>
    </div>

    <!-- 举报弹窗 -->
    <a-modal v-model:open="showReportModal" title="举报帖子" :footer="null" width="340px">
      <a-textarea v-model:value="reportReason" placeholder="请填写举报理由" :rows="3" style="margin-bottom:12px" />
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <a-button @click="showReportModal = false">取消</a-button>
        <a-button type="primary" danger @click="submitReport">提交举报</a-button>
      </div>
    </a-modal>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { LikeOutlined, CommentOutlined, EyeOutlined, DeleteOutlined, StarOutlined, StarFilled, WarningOutlined } from '@ant-design/icons-vue'
import { getPostDetail, getCommentList, createComment, toggleLike, checkLikeStatus, getCommentReplies, deletePost, imgUrl, toggleFavorite, checkFavoriteStatus } from '@/api/index'
import http from '@/utils/http'
import { getCurrentUserId, getCurrentUser } from '@/utils/user'

const route = useRoute()
const router = useRouter()
const postId = route.params.id as string
const userId = getCurrentUserId()

// 帖子类型映射
const typeMap: Record<string, string> = { share: '分享', discussion: '讨论', experience: '经验', help: '求助' }
const typeColorMap: Record<string, string> = { share: '#4CAF50', discussion: '#FF9800', experience: '#9C27B0', help: '#2196F3' }
const typeLabel = ref('')
const typeColor = ref('#999')

const post = ref<any>({})
const postLiked = ref(false)
const postFavorited = ref(false)
const avatarColor = ref('#D8F0E8')
const isOwner = computed(() => post.value.userId === userId)

// 评论相关
const comments = ref<any[]>([])
const commentTotal = ref(0)
const commentPage = ref(1)
const loadingComments = ref(false)
const hasMoreComments = ref(false)
const commentText = ref('')
const replyTarget = ref<any>(null)
const commentInput = ref<any>(null)

const avatarColors = ['#D8F0E8', '#FDE8F0', '#E8E0F8', '#FDE8D8', '#D8E8FD', '#E8F0D8']

function getAvatarColor(name: string) {
  if (!name) return '#D8F0E8'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function timeAgo(time: string) {
  if (!time) return ''
  const diff = Date.now() - new Date(time).getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return time.substr(0, 10)
}

async function loadPost() {
  try {
    const res = await getPostDetail(postId, userId || undefined)
    post.value = res || {}
    typeLabel.value = typeMap[post.value.postType] || post.value.postType
    typeColor.value = typeColorMap[post.value.postType] || '#999'
    avatarColor.value = getAvatarColor(post.value.userName)
    // 查询点赞状态
    if (userId) {
      try {
        const likeRs = await checkLikeStatus('post', postId, userId)
        postLiked.value = likeRs?.liked || false
      } catch {}
      try {
        const favRs = await checkFavoriteStatus(postId, userId)
        postFavorited.value = favRs?.favorited || false
      } catch {}
    }
  } catch {
    message.error('帖子不存在或已下架')
  }
}

async function loadComments() {
  loadingComments.value = true
  try {
    const res = await getCommentList(postId, commentPage.value, 10)
    const records = res?.records || []
    if (commentPage.value === 1) {
      comments.value = records
    } else {
      comments.value.push(...records)
    }
    commentTotal.value = res?.total || 0
    hasMoreComments.value = (res?.current || 1) * (res?.size || 10) < (res?.total || 0)
  } catch { /* ignore */ }
  loadingComments.value = false
}

async function loadMoreComments() {
  commentPage.value++
  await loadComments()
}

async function loadAllReplies(comment: any) {
  try {
    const res = await getCommentReplies(comment.id)
    comment.replies = res || []
    comment.replyCount = comment.replies.length
  } catch {}
}

async function handleLike() {
  if (!userId) { message.info('请先登录'); return }
  try {
    const res = await toggleLike('post', postId, userId)
    postLiked.value = res?.liked
    post.value.likeCount = res?.likeCount
  } catch {}
}

async function handleFavorite() {
  if (!userId) { message.info('请先登录'); return }
  try {
    const res = await toggleFavorite(postId, userId)
    postFavorited.value = res?.favorited
    message.success(postFavorited.value ? '已收藏' : '已取消收藏')
  } catch {}
}

function startReply(comment: any) {
  replyTarget.value = comment
  commentText.value = ''
  commentInput.value?.focus()
}

function onInputFocus() {
  if (!replyTarget.value) return
}

async function sendComment() {
  if (!commentText.value.trim()) return
  if (!userId) { message.info('请先登录'); return }

  try {
    const data: any = { postId, userId, content: commentText.value.trim() }
    if (replyTarget.value) {
      data.parentId = replyTarget.value.id
      data.replyToUserId = replyTarget.value.userId
    }
    await createComment(data)
    message.success('评论成功')
    commentText.value = ''
    replyTarget.value = null
    // 重新加载评论
    commentPage.value = 1
    await loadComments()
    // 更新帖子评论数
    post.value.commentCount = (post.value.commentCount || 0) + 1
  } catch {}
}

function goUser(uid: string) {
  if (uid) router.push('/community/user/' + uid)
}

function previewImage(url: string) {
  window.open(url)
}

const reportReason = ref('')
const showReportModal = ref(false)

function openReportModal() {
  reportReason.value = ''
  showReportModal.value = true
}

async function submitReport() {
  if (!reportReason.value.trim()) {
    message.warning('请填写举报理由')
    return
  }
  try {
    const currentUser = getCurrentUser()
    const reporterName = currentUser?.nickname || currentUser?.username || userId
    await http.post('/community/report/submit', null, {
      params: { postId, reporterId: userId, reporterName, reason: reportReason.value.trim() },
    })
    message.success('举报已提交')
    showReportModal.value = false
  } catch {
    message.error('举报失败')
  }
}

async function handleDelete() {
  Modal.confirm({
    title: '确定删除这条帖子吗？',
    content: '删除后无法恢复',
    okText: '确定删除',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await deletePost(postId)
        message.success('已删除')
        router.back()
      } catch {
        message.error('删除失败')
      }
    },
  })
}

onMounted(() => {
  loadPost()
  loadComments()
})
</script>

<style scoped>
.post-detail {
  max-width: 480px;
  margin: 0 auto;
}

/* 顶部导航 */
.detail-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
}
.back-btn {
  border: none;
  background: none;
  font-size: 15px;
  color: #1a1a1a;
  cursor: pointer;
  padding: 4px 8px 4px 0;
  font-weight: 480;
}
.header-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-right: 56px;
}

/* 帖子主体 */
.post-main {
  padding: 0 16px 16px;
}
.post-author-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.author-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px; font-weight: 600;
  color: #666;
  cursor: pointer;
}
.author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.author-name {
  font-size: 14px; font-weight: 540; color: #1a1a1a;
  cursor: pointer;
}
.author-name:active { opacity: 0.6; }
.post-time {
  font-size: 11px; color: #bbb; font-weight: 340;
}
.post-type-tag {
  font-size: 11px; font-weight: 540;
  padding: 2px 10px;
  border: 0.5px solid;
  border-radius: 50px;
  letter-spacing: 0.03em;
}
.post-title {
  font-size: 22px; font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px;
  line-height: 1.35;
  letter-spacing: -0.02em;
}
.post-content {
  font-size: 15px; color: #333; font-weight: 380;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 12px;
}
.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}
.post-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
}
.post-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 0;
  border-top: 0.5px solid rgba(0,0,0,0.06);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  font-size: 14px; color: #666;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.action-btn:active { background: rgba(0,0,0,0.04); }
.action-btn.liked { color: #FF3B30; }
.liked-icon { color: #FF3B30; }
.action-btn.favorited { color: #FFB800; }
.fav-icon { color: #FFB800; }
.delete-btn { margin-left: auto; color: #ccc; }
.delete-btn:active { color: #FF3B30; background: rgba(255,59,48,0.06); }
.report-btn { color: #ccc; }
.report-btn:active { color: #FF9800; background: rgba(255,152,0,0.06); }
.action-stat {
  font-size: 14px; color: #666;
  display: flex; align-items: center; gap: 4px;
}

/* 分割线 */
.section-divider {
  height: 8px;
  background: #f0f0f0;
  margin: 0 -16px;
}

/* 评论区 */
.comment-section {
  padding: 20px 16px 16px;
}
.comment-title {
  font-size: 16px; font-weight: 580;
  color: #1a1a1a;
  margin: 0 0 16px;
}
.empty-comments {
  text-align: center;
  padding: 40px 0;
  font-size: 14px; color: #bbb; font-weight: 340;
}
.comment-item {
  display: flex;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 0.5px solid rgba(0,0,0,0.04);
}
.comment-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px; font-weight: 600;
  color: #666;
}
.comment-body { flex: 1; min-width: 0; }
.comment-header {
  display: flex; justify-content: space-between;
  align-items: baseline; margin-bottom: 4px;
}
.comment-name { font-size: 13px; font-weight: 540; color: #1a1a1a; }
.comment-time { font-size: 11px; color: #bbb; }
.comment-text {
  font-size: 14px; color: #333; font-weight: 380;
  line-height: 1.55;
  word-break: break-word;
}
.comment-footer { margin-top: 6px; }
.comment-reply-btn {
  font-size: 12px; color: #999; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* 子回复 */
.sub-replies {
  margin-top: 10px;
  background: #f6f7f8;
  border-radius: 10px;
  padding: 10px 12px;
}
.sub-reply-item {
  font-size: 13px; color: #555; font-weight: 380;
  line-height: 1.55;
  padding: 4px 0;
}
.sub-reply-item + .sub-reply-item {
  border-top: 0.5px solid rgba(0,0,0,0.04);
}
.sub-reply-name { font-weight: 540; color: #333; }
.sub-reply-to { color: #999; }
.sub-reply-target { color: #2196F3; }
.view-all-replies {
  font-size: 12px; color: #2196F3; cursor: pointer;
  margin-top: 6px;
  -webkit-tap-highlight-color: transparent;
}

.loading-hint {
  text-align: center; padding: 16px;
  font-size: 13px; color: #bbb;
}
.load-more {
  text-align: center; padding: 16px;
  font-size: 13px; color: #666; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* 底部输入栏 */
.bottom-input-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  gap: 10px;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0));
  background: #fff;
  border-top: 0.5px solid rgba(0,0,0,0.06);
  z-index: 100;
}
.comment-input {
  flex: 1;
  border: none;
  background: var(--color-bg, #f5f5f5);
  border-radius: 22px;
  padding: 10px 16px;
  font-size: 14px; color: #333;
  outline: none;
  font-family: inherit;
  font-weight: 380;
}
.comment-input::placeholder { color: #bbb; }
.send-btn {
  border: none;
  background: var(--color-primary, #FF4D4F);
  color: #fff;
  padding: 10px 20px;
  border-radius: 22px;
  font-size: 14px; font-weight: 540;
  cursor: pointer;
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.bottom-spacer { height: 80px; }
</style>
