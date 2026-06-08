<template>
  <div class="community-page">
    <TopSearchHeader
      placeholder="搜索帖子、话题"
      @focus-search="showSearch = true"
      @open-messages="$router.push('/messages')"
    />

    <!-- 搜索栏 -->
    <div v-if="showSearch" class="search-bar">
      <input
        ref="searchInput"
        v-model="keyword"
        class="search-input"
        placeholder="搜索帖子..."
        @keyup.enter="doSearch"
      />
      <button class="search-cancel" @click="cancelSearch">取消</button>
    </div>

    <!-- 话题标签（收藏模式隐藏） -->
    <section v-if="sortBy !== 'favorites'" class="community-section">
      <div class="topic-scroll">
        <button
          v-for="topic in topics"
          :key="topic.id"
          class="topic-chip"
          :class="{ active: activeTopic === topic.id }"
          @click="onTopicChange(topic.id)"
        >{{ topic.name }}</button>
      </div>
    </section>

    <!-- 排序切换 -->
    <div class="sort-bar">
      <button
        class="sort-btn"
        :class="{ active: sortBy === 'latest' }"
        @click="onSortChange('latest')"
      >最新</button>
      <button
        class="sort-btn"
        :class="{ active: sortBy === 'hot' }"
        @click="onSortChange('hot')"
      >热门</button>
      <button
        class="sort-btn"
        :class="{ active: sortBy === 'favorites' }"
        @click="onSortChange('favorites')"
      >收藏</button>
    </div>

    <!-- 帖子列表 -->
    <section class="community-section">
      <div v-if="posts.length === 0 && !loading" class="empty-state">
        <a-empty :description="sortBy === 'favorites' ? '还没有收藏过帖子' : '暂无帖子'" />
      </div>

      <div class="post-list">
        <div v-for="post in posts" :key="post.id" class="post-card" @click="goDetail(post.id)">
          <div class="post-avatar" :style="{ background: getAvatarColor(post.userName) }" @click.stop="goUser(post.userId)">
            {{ (post.userName || '?')[0] }}
          </div>
          <div class="post-body">
            <div class="post-header">
              <span class="post-author" @click.stop="goUser(post.userId)">{{ post.userName || '匿名用户' }}</span>
              <span class="post-tag" :style="{ color: typeColor(post.postType) }">
                {{ typeLabel(post.postType) }}
              </span>
              <span v-if="post.isTop" class="top-badge">置顶</span>
              <span class="post-time">{{ timeAgo(post.createTime) }}</span>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt" v-if="post.contentText">
              {{ post.contentText.substring(0, 200) }}
            </p>
            <div class="post-stats">
              <span><LikeOutlined /> {{ post.likeCount || 0 }}</span>
              <span><CommentOutlined /> {{ post.commentCount || 0 }}</span>
              <span><EyeOutlined /> {{ post.viewCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-hint">
        <a-spin size="small" />
      </div>
      <div v-if="noMore && posts.length > 0" class="no-more">— 没有更多了 —</div>
    </section>

    <!-- 发帖按钮 -->
    <button class="fab" @click="goCreate">
      <EditOutlined class="fab-icon" />
    </button>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { LikeOutlined, CommentOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons-vue'
import TopSearchHeader from '@/components/TopSearchHeader.vue'
import { getTopicFrontList, getPostFrontList, getMyFavorites } from '@/api/index'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
const currentUserId = getCurrentUserId()

const showSearch = ref(false)
const keyword = ref('')
const searchInput = ref<any>(null)

const topics = ref<any[]>([])
const activeTopic = ref('topic_all')
const sortBy = ref('latest')

const posts = ref<any[]>([])
const loading = ref(false)
const pageNo = ref(1)
const noMore = ref(false)

// 类型映射
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
  return time ? time.substr(0, 10) : ''
}

async function loadTopics() {
  try {
    const res = await getTopicFrontList()
    topics.value = res || []
  } catch {}
}

async function loadPosts(reset = false) {
  if (loading.value) return
  loading.value = true
  if (reset) {
    pageNo.value = 1
    posts.value = []
    noMore.value = false
  }

  try {
    // 收藏模式：调用收藏API
    if (sortBy.value === 'favorites') {
      const res = await getMyFavorites({ userId: currentUserId, pageNo: pageNo.value, pageSize: 10 })
      const records = (res?.records || []).map((fav: any) => ({
        id: fav.postId,
        title: fav.postTitle || '帖子已删除',
        userName: fav.postUserName || '',
        postType: fav.postType || '',
        contentText: '',
        likeCount: 0,
        commentCount: 0,
        viewCount: 0,
        createTime: fav.createTime,
        userId: '',
        isTop: 0,
        status: 1,
      }))
      if (reset) {
        posts.value = records
      } else {
        posts.value.push(...records)
      }
      noMore.value = records.length < 10
    } else {
      const params: any = {
        pageNo: pageNo.value,
        pageSize: 10,
        sortBy: sortBy.value,
      }
      if (activeTopic.value !== 'topic_all') {
        params.topicId = activeTopic.value
      }
      if (keyword.value.trim()) {
        params.keyword = keyword.value.trim()
      }

      const res = await getPostFrontList(params)
      const records = res?.records || []
      if (reset) {
        posts.value = records
      } else {
        posts.value.push(...records)
      }
      const total = res?.total || 0
      noMore.value = posts.value.length >= total
    }
  } catch {}

  loading.value = false
}

function onTopicChange(topicId: string) {
  if (activeTopic.value === topicId) return
  activeTopic.value = topicId
  loadPosts(true)
}

function onSortChange(s: string) {
  if (sortBy.value === s) return
  sortBy.value = s
  loadPosts(true)
}

function doSearch() {
  showSearch.value = false
  loadPosts(true)
}

function cancelSearch() {
  showSearch.value = false
  keyword.value = ''
  loadPosts(true)
}

function goDetail(id: string) {
  router.push('/community/post/' + id)
}

function goUser(uid: string) {
  if (uid) router.push('/community/user/' + uid)
}

function goCreate() {
  router.push('/community/create')
}

// 下拉加载更多
function onScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const docHeight = document.documentElement.scrollHeight

  if (scrollTop + windowHeight >= docHeight - 200 && !loading.value && !noMore.value) {
    pageNo.value++
    loadPosts(false)
  }
}

onMounted(() => {
  loadTopics()
  loadPosts(true)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.community-page {
  padding: 0 16px;
  max-width: 480px;
  margin: 0 auto;
}
.community-section { margin-bottom: 20px; }

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 0 12px;
}
.search-input {
  flex: 1;
  border: none;
  background: #f0f0f0;
  border-radius: 22px;
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  outline: none;
  font-family: inherit;
}
.search-input::placeholder { color: #bbb; }
.search-cancel {
  flex-shrink: 0;
  border: none;
  background: none;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

/* 话题 */
.topic-scroll {
  display: flex; gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.topic-scroll::-webkit-scrollbar { display: none; }
.topic-chip {
  flex-shrink: 0;
  padding: 8px 18px;
  border-radius: 50px;
  border: none;
  background: #f0f0f0;
  color: #666;
  font-size: 13px;
  font-weight: 480;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s;
  white-space: nowrap;
}
.topic-chip.active { background: #1a1a1a; color: #fff; }

/* 排序 */
.sort-bar {
  display: flex;
  gap: 12px;
  padding: 4px 0 8px;
}
.sort-btn {
  border: none;
  background: none;
  font-size: 13px;
  color: #999;
  font-weight: 480;
  cursor: pointer;
  padding: 4px 0;
  -webkit-tap-highlight-color: transparent;
}
.sort-btn.active {
  color: #1a1a1a;
  font-weight: 600;
}

/* 帖子列表 */
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
  cursor: pointer;
}
.post-body { flex: 1; min-width: 0; }
.post-header {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 4px;
}
.post-author { font-size: 13px; color: #666; font-weight: 480; cursor: pointer; }
.post-author:active { opacity: 0.6; }
.post-tag { font-size: 10px; font-weight: 540; letter-spacing: 0.03em; }
.top-badge {
  font-size: 10px; font-weight: 540;
  background: #FF6B6B; color: #fff;
  padding: 1px 6px;
  border-radius: 4px;
}
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

.empty-state { padding: 60px 0; text-align: center; }
.loading-hint { text-align: center; padding: 20px 0; }
.no-more {
  text-align: center; padding: 20px 0;
  font-size: 12px; color: #ccc; font-weight: 340;
}

.fab {
  position: fixed;
  right: calc(50% - 220px);
  bottom: 100px;
  width: 48px; height: 48px;
  border-radius: 50%;
  border: none;
  background: #1a1a1a;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.2s;
}
.fab:active { transform: scale(0.9); }
.fab-icon { font-size: 20px; }

.bottom-spacer { height: 100px; }

@media (min-width: 480px) { .fab { right: calc(50% - 220px); } }
@media (max-width: 420px) { .fab { right: 16px; } }
</style>
