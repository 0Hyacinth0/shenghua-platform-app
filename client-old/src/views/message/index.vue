<template>
  <div class="message-page">
    <div class="page-header">
      <h1 class="page-title">消息</h1>
    </div>

    <section class="message-section">
      <div class="message-list">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          @click="onMessageClick(msg)"
        >
          <div class="msg-avatar" :style="{ background: msg.avatarColor }">
            <component :is="msg.icon" class="msg-avatar-icon" />
          </div>
          <div class="msg-body">
            <div class="msg-header">
              <span class="msg-title">{{ msg.title }}</span>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
            <p class="msg-preview">{{ msg.preview }}</p>
          </div>
          <span v-if="msg.unread" class="msg-dot"></span>
        </div>
      </div>
    </section>

    <div v-if="messages.length === 0" class="empty-state">
      <a-empty description="暂无消息" />
    </div>

    <div class="service-btn-wrap">
      <a-button type="primary" block size="large" @click="$router.push('/chat')">联系客服</a-button>
    </div>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { SoundOutlined, InboxOutlined, ReadOutlined, GiftOutlined, MessageOutlined } from '@ant-design/icons-vue'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const userId = getCurrentUserId()
const router = useRouter()

interface Message {
  id: string; title: string; preview: string; time: string
  icon: Component; avatarColor: string; unread: boolean; route?: string
}
const iconMap: Record<number, Component> = { 1: InboxOutlined, 2: GiftOutlined, 3: SoundOutlined, 4: ReadOutlined }
const colorMap: Record<number, string> = { 1: '#FDE8D8', 2: '#E8E0F8', 3: '#D8F0E8', 4: '#D8E8FD' }
function getMessageRoute(m: any) {
  if (!m.relatedId) {
    return m.messageType === 1 ? '/orders' : undefined
  }
  // 社区通知 → 跳转帖子详情
  if (m.messageType === 4) {
    return '/community/post/' + m.relatedId
  }
  return '/order/' + m.relatedId
}

const messages = ref<Message[]>([])

function timeAgo(time: string) {
  if (!time) return ''
  const diff = Date.now() - new Date(time).getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return time.substr(0, 10)
}

async function loadMessages() {
  try {
    const res = await http.get('/mall/userMessage/myMessages', { params: { userId, pageSize: 50 } })
    const records = res?.records || []
    messages.value = records.map((m: any) => ({
      id: m.id, title: m.title, preview: m.content,
      time: timeAgo(m.createTime),
      icon: iconMap[m.messageType] || SoundOutlined,
      avatarColor: colorMap[m.messageType] || '#D8F0E8',
      unread: m.isRead === 0,
      route: getMessageRoute(m),
    }))
  } catch { /* ignore */ }
}
onMounted(loadMessages)

async function onMessageClick(msg: Message) {
  if (msg.unread) {
    try { await http.put('/mall/userMessage/read', null, { params: { id: msg.id, userId } }); msg.unread = false } catch {}
  }
  if (msg.route) router.push(msg.route)
}
</script>

<style scoped>
.message-page {
  padding: 0 16px;
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px);
}
.page-header { padding: 8px 0 4px; }
.page-title {
  font-size: 24px; font-weight: 600;
  color: #1a1a1a; margin: 0;
  letter-spacing: -0.03em;
}
.message-section { margin-bottom: 20px; }
.message-list { display: flex; flex-direction: column; }
.message-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 16px 0;
  border-bottom: 0.5px solid #eee;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}
.msg-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.msg-avatar-icon {
  font-size: 20px;
  color: rgba(0,0,0,0.35);
}
.msg-body { flex: 1; min-width: 0; }
.msg-header {
  display: flex; justify-content: space-between;
  align-items: baseline; margin-bottom: 4px;
}
.msg-title { font-size: 15px; font-weight: 540; color: #1a1a1a; }
.msg-time { font-size: 11px; color: #bbb; flex-shrink: 0; margin-left: 12px; }
.msg-preview {
  font-size: 13px; color: #999; font-weight: 340;
  margin: 0; line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1; -webkit-box-orient: vertical;
  overflow: hidden;
}
.msg-dot {
  position: absolute; right: 2px; top: 22px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #FF3B30;
}
.empty-state { padding: 80px 0; text-align: center; }
.bottom-spacer { height: 100px; }
</style>
