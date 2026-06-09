<template>
  <div class="favorites-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <span class="header-title">我的收藏</span>
    </header>

    <div v-if="posts.length === 0 && !loading" class="empty-state">
      <a-empty description="还没有收藏过帖子" />
    </div>

    <div class="post-list">
      <div v-for="fav in posts" :key="fav.id" class="post-card" @click="goDetail(fav.postId)">
        <div class="post-body">
          <div class="post-header">
            <span class="post-type-tag" :style="{ color: typeColor(fav.postType) }">
              {{ typeLabel(fav.postType) }}
            </span>
            <span class="post-author" v-if="fav.postUserName">{{ fav.postUserName }}</span>
            <span class="post-time">{{ timeAgo(fav.createTime) }}</span>
          </div>
          <h3 class="post-title">{{ fav.postTitle || '帖子已删除' }}</h3>
          <button class="unfav-btn" @click.stop="handleUnfav(fav)">取消收藏</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-hint">加载中...</div>
    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getMyFavorites, toggleFavorite } from '@/api/index'
import { getCurrentUserId } from '@/utils/user'

const userId = getCurrentUserId()
const router = useRouter()

const posts = ref<any[]>([])
const loading = ref(false)

const typeMap: Record<string, string> = { share: '分享', discussion: '讨论', experience: '经验', help: '求助' }
const typeColorMap: Record<string, string> = { share: '#4CAF50', discussion: '#FF9800', experience: '#9C27B0', help: '#2196F3' }

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

async function loadFavorites() {
  if (!userId) return
  loading.value = true
  try {
    const res = await getMyFavorites({ userId, pageSize: 50 })
    posts.value = res?.records || []
  } catch {}
  loading.value = false
}

async function handleUnfav(fav: any) {
  try {
    await toggleFavorite(fav.postId, userId)
    message.success('已取消收藏')
    posts.value = posts.value.filter(p => p.id !== fav.id)
  } catch {}
}

function goDetail(id: string) {
  router.push('/community/post/' + id)
}

onMounted(loadFavorites)
</script>

<style scoped>
.favorites-page {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-header {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center;
  padding: 12px 16px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
}
.back-btn { border: none; background: none; font-size: 15px; color: #1a1a1a; cursor: pointer; padding: 4px 8px 4px 0; font-weight: 480; }
.header-title { flex: 1; text-align: center; font-size: 16px; font-weight: 600; color: #1a1a1a; margin-right: 56px; }

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
.post-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.post-type-tag { font-size: 10px; font-weight: 540; letter-spacing: 0.03em; }
.post-author { font-size: 12px; color: #999; margin-left: auto; }
.post-time { font-size: 11px; color: #bbb; margin-left: 4px; }
.post-title { font-size: 15px; font-weight: 540; color: #1a1a1a; margin: 0 0 8px; line-height: 1.4; }
.unfav-btn {
  border: none; background: none;
  font-size: 12px; color: #ccc;
  cursor: pointer; padding: 2px 0;
  -webkit-tap-highlight-color: transparent;
}
.unfav-btn:active { color: #FF3B30; }

.loading-hint { text-align: center; padding: 24px; color: #bbb; font-size: 13px; }
.bottom-spacer { height: 100px; }
</style>
