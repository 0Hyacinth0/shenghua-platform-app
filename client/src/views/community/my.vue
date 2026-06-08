<template>
  <div class="my-posts-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <span class="header-title">我的帖子</span>
    </header>

    <div v-if="posts.length === 0 && !loading" class="empty-state">
      <a-empty description="还没有发布过帖子" />
      <a-button type="primary" @click="$router.push('/community/create')">去发帖</a-button>
    </div>

    <div class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-card" @click="goDetail(post.id)">
        <div class="post-avatar" :style="{ background: getAvatarColor(post.userName) }">
          {{ (post.userName || '?')[0] }}
        </div>
        <div class="post-body">
          <div class="post-header">
            <span class="post-type-tag" :style="{ color: typeColor(post.postType) }">
              {{ typeLabel(post.postType) }}
            </span>
            <span class="post-time">{{ timeAgo(post.createTime) }}</span>
          </div>
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-excerpt" v-if="post.contentText">{{ post.contentText.substring(0, 150) }}</p>
          <div class="post-stats">
            <span><LikeOutlined /> {{ post.likeCount || 0 }}</span>
            <span><CommentOutlined /> {{ post.commentCount || 0 }}</span>
            <span><EyeOutlined /> {{ post.viewCount || 0 }}</span>
          </div>
        </div>
        <button class="delete-post-btn" @click.stop="handleDelete(post)">删除</button>
      </div>
    </div>

    <div v-if="loading" class="loading-hint">加载中...</div>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { LikeOutlined, CommentOutlined, EyeOutlined } from '@ant-design/icons-vue'
import { getMyPosts, deletePost } from '@/api/index'
import { getCurrentUserId } from '@/utils/user'

const userId = getCurrentUserId()
const router = useRouter()

const posts = ref<any[]>([])
const loading = ref(false)

const typeMap: Record<string, string> = { share: '分享', discussion: '讨论', experience: '经验', help: '求助' }
const typeColorMap: Record<string, string> = { share: '#4CAF50', discussion: '#FF9800', experience: '#9C27B0', help: '#2196F3' }

function typeLabel(t: string) { return typeMap[t] || t }
function typeColor(t: string) { return typeColorMap[t] || '#999' }

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

async function loadPosts() {
  if (!userId) return
  loading.value = true
  try {
    const res = await getMyPosts({ userId, pageSize: 50 })
    posts.value = res?.records || []
  } catch {}
  loading.value = false
}

function goDetail(id: string) {
  router.push('/community/post/' + id)
}

function handleDelete(post: any) {
  Modal.confirm({
    title: '确定删除这条帖子吗？',
    content: '删除后无法恢复',
    okText: '确定删除',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await deletePost(post.id)
        message.success('已删除')
        posts.value = posts.value.filter(p => p.id !== post.id)
      } catch {
        message.error('删除失败')
      }
    },
  })
}

onMounted(loadPosts)
</script>

<style scoped>
.my-posts-page {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
}

/* 顶部导航 */
.page-header {
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

.empty-state {
  padding: 80px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.post-list { display: flex; flex-direction: column; }
.post-card {
  display: flex; gap: 12px;
  padding: 16px 0;
  border-bottom: 0.5px solid #eee;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.post-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px; font-weight: 600;
  color: #666;
}
.post-body { flex: 1; min-width: 0; }
.post-header {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 4px;
}
.post-type-tag { font-size: 10px; font-weight: 540; letter-spacing: 0.03em; }
.post-time { font-size: 11px; color: #bbb; margin-left: auto; }
.post-title {
  font-size: 16px; font-weight: 540; color: #1a1a1a;
  margin: 0 0 4px; line-height: 1.4; letter-spacing: -0.01em;
}
.post-excerpt {
  font-size: 13px; color: #999; font-weight: 340;
  margin: 0 0 8px; line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-stats {
  display: flex; gap: 16px;
  font-size: 12px; color: #bbb; font-weight: 340;
}

.delete-post-btn {
  flex-shrink: 0;
  align-self: center;
  border: none;
  background: none;
  font-size: 12px; color: #ccc;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.delete-post-btn:active { color: #FF3B30; background: rgba(255,59,48,0.06); }

.loading-hint { text-align: center; padding: 24px; color: #bbb; font-size: 13px; }
.bottom-spacer { height: 100px; }
</style>
