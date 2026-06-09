<template>
  <div class="user-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <span class="header-title">TA的主页</span>
    </header>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar" :style="{ background: avatarColor }">
        {{ (userName || '?')[0] }}
      </div>
      <div class="user-name">{{ userName || '匿名用户' }}</div>
      <div class="user-stat">共发布 {{ totalPosts }} 篇帖子</div>
    </div>

    <!-- 帖子列表 -->
    <div v-if="posts.length === 0 && !loading" class="empty-state">
      <a-empty description="TA还没有发布过帖子" />
    </div>

    <div class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-card" @click="goDetail(post.id)">
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
      </div>
    </div>

    <div v-if="loading" class="loading-hint">加载中...</div>
    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LikeOutlined, CommentOutlined, EyeOutlined } from '@ant-design/icons-vue'
import { getMyPosts } from '@/api/index'

const route = useRoute()
const router = useRouter()
const targetUserId = route.params.userId as string

const userName = ref('')
const posts = ref<any[]>([])
const totalPosts = ref(0)
const loading = ref(false)

const typeMap: Record<string, string> = { share: '分享', discussion: '讨论', experience: '经验', help: '求助' }
const typeColorMap: Record<string, string> = { share: '#4CAF50', discussion: '#FF9800', experience: '#9C27B0', help: '#2196F3' }
const avatarColors = ['#D8F0E8', '#FDE8F0', '#E8E0F8', '#FDE8D8', '#D8E8FD', '#E8F0D8']

const avatarColor = ref('#D8F0E8')

function typeLabel(t: string) { return typeMap[t] || t }
function typeColor(t: string) { return typeColorMap[t] || '#999' }

function timeAgo(time: string) {
  if (!time) return ''
  const diff = Date.now() - new Date(time).getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return time.substr(0, 10)
}

async function loadPosts() {
  loading.value = true
  try {
    const res = await getMyPosts({ userId: targetUserId, pageSize: 50 })
    const records = res?.records || []
    posts.value = records
    totalPosts.value = res?.total || records.length
    if (records.length > 0) {
      userName.value = records[0].userName || ''
      const name = userName.value
      let hash = 0
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
      avatarColor.value = avatarColors[Math.abs(hash) % avatarColors.length]
    }
  } catch {}
  loading.value = false
}

function goDetail(id: string) {
  router.push('/community/post/' + id)
}

onMounted(loadPosts)
</script>

<style scoped>
.user-page {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
}

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
.back-btn { border: none; background: none; font-size: 15px; color: #1a1a1a; cursor: pointer; padding: 4px 8px 4px 0; font-weight: 480; }
.header-title { flex: 1; text-align: center; font-size: 16px; font-weight: 600; color: #1a1a1a; margin-right: 56px; }

.user-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 28px 20px 20px;
  background: #fff;
  margin-bottom: 8px;
}
.user-avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 600; color: #fff;
}
.user-name { font-size: 18px; font-weight: 600; color: #1a1a1a; }
.user-stat { font-size: 13px; color: #999; font-weight: 380; }

.empty-state { padding: 80px 0; text-align: center; }

.post-list { display: flex; flex-direction: column; padding: 0 16px; }
.post-card {
  display: flex; gap: 12px;
  padding: 16px 0;
  border-bottom: 0.5px solid #eee;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.post-body { flex: 1; min-width: 0; }
.post-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.post-type-tag { font-size: 10px; font-weight: 540; letter-spacing: 0.03em; }
.post-time { font-size: 11px; color: #bbb; margin-left: auto; }
.post-title { font-size: 16px; font-weight: 540; color: #1a1a1a; margin: 0 0 4px; line-height: 1.4; }
.post-excerpt { font-size: 13px; color: #999; font-weight: 340; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.post-stats { display: flex; gap: 16px; font-size: 12px; color: #bbb; font-weight: 340; }

.loading-hint { text-align: center; padding: 24px; color: #bbb; font-size: 13px; }
.bottom-spacer { height: 100px; }
</style>
