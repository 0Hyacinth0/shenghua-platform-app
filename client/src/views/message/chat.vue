<template>
  <div class="chat-page">
    <div class="chat-header">
      <span class="chat-title">客服中心</span>
    </div>

    <div class="chat-body" ref="chatBody">
      <div v-if="messages.length === 0 && !loading" class="empty-state">
        <a-empty description="暂无消息，发送消息联系客服" />
      </div>
      <div v-for="msg in messages" :key="msg.id" class="chat-bubble"
        :class="msg.senderId === userId ? 'mine' : 'theirs'">
        <div class="bubble-content">{{ msg.content }}</div>
        <div class="bubble-time">{{ timeAgo(msg.createTime) }}</div>
      </div>
    </div>

    <div class="chat-input-bar">
      <a-input v-model:value="inputText" placeholder="输入消息..." @pressEnter="sendMsg" />
      <a-button type="primary" size="small" @click="sendMsg" :disabled="!inputText.trim()">发送</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const userId = getCurrentUserId()
const messages = ref<any[]>([])
const inputText = ref('')
const chatBody = ref<HTMLElement>()
const loading = ref(false)

function timeAgo(time: string) {
  if (!time) return ''
  const diff = Date.now() - new Date(time).getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分前'
  return time.substr(0, 16)
}

async function loadChat() {
  loading.value = true
  try {
    const res = await http.get('/mall/userMessage/chatList', { params: { userId } })
    messages.value = res?.records || []
    await nextTick()
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
  } catch {}
  finally { loading.value = false }
}

async function sendMsg() {
  const txt = inputText.value.trim()
  if (!txt) return
  inputText.value = ''
  try {
    await http.post('/mall/userMessage/sendToService', null, { params: { userId, content: txt } })
    await loadChat()
  } catch (e: any) { message.error('发送失败') }
}

onMounted(loadChat)
</script>

<style scoped>
.chat-page { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; height: 100vh; background: #f8f8f8; }
.chat-header { padding: 12px 16px; background: #fff; text-align: center; border-bottom: 1px solid #eee; }
.chat-title { font-size: 16px; font-weight: 600; color: #1a1a1a; }
.chat-body { flex: 1; overflow-y: auto; padding: 16px; }
.empty-state { padding: 80px 0; text-align: center; }
.chat-bubble { margin-bottom: 12px; max-width: 80%; }
.chat-bubble.mine { margin-left: auto; }
.chat-bubble.theirs { margin-right: auto; }
.bubble-content { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.4; }
.mine .bubble-content { background: #1a1a1a; color: #fff; border-bottom-right-radius: 4px; }
.theirs .bubble-content { background: #fff; color: #333; border-bottom-left-radius: 4px; }
.bubble-time { font-size: 11px; color: #999; margin-top: 4px; padding: 0 4px; }
.mine .bubble-time { text-align: right; }
.chat-input-bar { display: flex; gap: 8px; padding: 12px 16px; background: #fff; border-top: 1px solid #eee; padding-bottom: 80px; }
</style>
