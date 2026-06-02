<template>
  <div class="community-page">
    <TopSearchHeader
      placeholder="搜索帖子、话题"
      @focus-search="showSearch = true"
      @open-messages="$router.push('/messages')"
    />

    <!-- 话题标签 -->
    <section class="community-section">
      <div class="topic-scroll">
        <button
          v-for="topic in topics"
          :key="topic.id"
          class="topic-chip"
          :class="{ active: activeTopic === topic.id }"
          @click="activeTopic = topic.id"
        >{{ topic.name }}</button>
      </div>
    </section>

    <!-- 帖子列表 -->
    <section class="community-section">
      <div class="post-list">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <div class="post-avatar" :style="{ background: post.avatarColor }">
            {{ post.author[0] }}
          </div>
          <div class="post-body">
            <div class="post-header">
              <span class="post-author">{{ post.author }}</span>
              <span class="post-tag" :style="{ color: post.tagColor }">{{ post.tag }}</span>
              <span class="post-time">{{ post.time }}</span>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt" v-if="post.excerpt">{{ post.excerpt }}</p>
            <div class="post-stats">
              <span><LikeOutlined /> {{ post.likes }}</span>
              <span><CommentOutlined /> {{ post.comments }}</span>
              <span><EyeOutlined /> {{ post.views }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 发帖按钮 -->
    <button class="fab" @click="onCreatePost">
      <EditOutlined class="fab-icon" />
    </button>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { LikeOutlined, CommentOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons-vue'
import TopSearchHeader from '@/components/TopSearchHeader.vue'

const showSearch = ref(false)
const activeTopic = ref('all')

const topics = [
  { id: 'all', name: '全部' },
  { id: 'frontend', name: '前端开发' },
  { id: 'python', name: 'Python' },
  { id: 'design', name: '设计' },
  { id: 'career', name: '职场交流' },
  { id: 'ai', name: 'AI 讨论' },
  { id: 'other', name: '灌水区' },
]

const posts = ref([
  { id: 'p1', author: '前端小学生', avatarColor: '#D8F0E8', tag: '求助', tagColor: '#2196F3', time: '2小时前', title: 'Vue 3 的 watchEffect 和 watch 到底什么时候用哪个？', excerpt: '最近在学习 Composition API，watchEffect 自动收集依赖这个概念有点绕...', likes: 23, comments: 15, views: 342 },
  { id: 'p2', author: '设计师小王', avatarColor: '#FDE8F0', tag: '分享', tagColor: '#4CAF50', time: '3小时前', title: '分享一套自用的 Figma 设计系统模板', excerpt: '包含完整的 color token、typography、spacing...', likes: 56, comments: 8, views: 1203 },
  { id: 'p3', author: 'Pythonista', avatarColor: '#E8E0F8', tag: '讨论', tagColor: '#FF9800', time: '5小时前', title: 'FastAPI vs Django REST — 2026年选哪个？', likes: 89, comments: 42, views: 2356 },
  { id: 'p4', author: '考证达人', avatarColor: '#FDE8D8', tag: '经验', tagColor: '#9C27B0', time: '8小时前', title: '软考中级一次通过经验分享，附备考资料', likes: 134, comments: 67, views: 4567 },
  { id: 'p5', author: 'AI 探索者', avatarColor: '#D8E8FD', tag: '讨论', tagColor: '#FF9800', time: '12小时前', title: 'Claude Code 实战：用 AI 一周搞定毕设项目', excerpt: '记录一下我用 AI 辅助开发的完整流程...', likes: 210, comments: 89, views: 7801 },
])

function onCreatePost() {
  message.info('发帖功能即将上线')
}
</script>

<style scoped>
.community-page {
  padding: 0 16px;
  max-width: 480px;
  margin: 0 auto;
}
.community-section { margin-bottom: 20px; }

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
.post-author { font-size: 13px; color: #666; font-weight: 480; }
.post-tag { font-size: 10px; font-weight: 540; letter-spacing: 0.03em; }
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
