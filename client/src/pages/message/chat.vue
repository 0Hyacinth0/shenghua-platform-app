<template>
  <view class="page-container">
    <view class="page-header">
      <view class="header-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="20" />
      </view>
      <text class="page-title">{{ chatTitle }}</text>
      <view style="width:36px" />
    </view>

    <!-- 消息列表 -->
    <scroll-view scroll-y class="chat-messages" :scroll-into-view="scrollTarget" scroll-with-animation>
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="chatMessages.length > 0" class="msg-list">
        <view v-for="msg in chatMessages" :key="msg.id" :id="'msg-' + msg.id" class="msg-item" :class="{ self: msg.isSelf }">
          <view v-if="!msg.isSelf" class="msg-avatar">
            <Icon icon="solar:user-bold" width="18" color="var(--color-accent)" />
          </view>
          <view class="msg-bubble" :class="{ self: msg.isSelf }">
            <text class="msg-text">{{ msg.content }}</text>
            <text class="msg-time">{{ formatTime(msg.createTime) }}</text>
          </view>
          <view v-if="msg.isSelf" class="msg-avatar self-avatar">
            <Icon icon="solar:user-bold" width="18" color="var(--text-white)" />
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-chat">
        <Icon icon="solar:chat-round-dots-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">开始聊天吧</text>
      </view>
    </scroll-view>

    <!-- 输入栏 -->
    <view class="input-bar">
      <view class="input-wrap">
        <input
          v-model="inputText"
          class="chat-input"
          placeholder="输入消息..."
          placeholder-class="input-placeholder"
          :confirm-type="'send'"
          @confirm="sendMessage"
        />
      </view>
      <view class="send-btn" :class="{ active: inputText.trim() }" @tap="sendMessage">
        <Icon icon="solar:plain-2-bold" width="16" :color="inputText.trim() ? '#fff' : '#94A3B8'" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(true)
const chatMessages = ref<any[]>([])
const inputText = ref('')
const chatTitle = ref('聊天')
const scrollTarget = ref('')
let targetId = ''

function goBack() {
  uni.navigateBack()
}

function formatTime(time: string) {
  if (!time) return ''
  const d = new Date(time)
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

async function loadMessages() {
  loading.value = true
  try {
    const res = await http.get('/mall/userMessage/chatList', {
      params: { userId: getCurrentUserId(), targetId, pageNo: 1, pageSize: 50 },
    })
    const list: any[] = res?.records || (Array.isArray(res) ? res : [])
    chatMessages.value = list.map((m: any) => ({
      ...m,
      isSelf: m.senderId === getCurrentUserId(),
    }))
    // 滚动到底部
    if (list.length > 0) {
      scrollTarget.value = 'msg-' + list[list.length - 1].id
    }
  } catch {
    chatMessages.value = []
  } finally {
    loading.value = false
  }
}

async function sendMessage() {
  if (!inputText.value.trim()) return
  const content = inputText.value.trim()
  inputText.value = ''

  // 乐观更新
  const tempMsg = {
    id: 'temp-' + Date.now(),
    content,
    senderId: getCurrentUserId(),
    isSelf: true,
    createTime: new Date().toISOString(),
  }
  chatMessages.value.push(tempMsg)
  scrollTarget.value = 'msg-' + tempMsg.id

  try {
    await http.post('/mall/userMessage/send', {
      senderId: getCurrentUserId(),
      receiverId: targetId,
      content,
    })
    loadMessages()
  } catch (e: any) {
    uni.showToast({ title: e?.message || '发送失败', icon: 'none' })
  }
}

onLoad((options: any) => {
  targetId = options?.targetId || ''
  chatTitle.value = options?.title || '聊天'
  loadMessages()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page-container {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

/* ---- 导航栏 ---- */
.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-card);
  padding: 44px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.header-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.page-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

/* ---- 消息列表 ---- */
.chat-messages {
  flex: 1;
  padding: var(--space-lg);
}

.msg-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.msg-item {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
}

.msg-item.self {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-circle);
  background: var(--color-accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.self-avatar {
  background: var(--color-accent);
}

.msg-bubble {
  max-width: 70%;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border-top-left-radius: 4px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--shadow-sm);
}

.msg-bubble.self {
  background: var(--color-primary-gradient);
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

.msg-text {
  font-size: var(--font-base);
  color: var(--text-primary);
  line-height: 1.5;
  word-break: break-all;
}

.msg-bubble.self .msg-text {
  color: var(--text-white);
}

.msg-time {
  font-size: 10px;
  color: var(--text-hint);
}

.msg-bubble.self .msg-time {
  color: rgba(255, 255, 255, 0.7);
}

/* ---- 空状态 ---- */
.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: var(--space-md);
}

.empty-text {
  font-size: var(--font-base);
  color: var(--text-hint);
}

/* ---- 输入栏 ---- */
.input-bar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 10px 16px calc(24px + var(--safe-area-bottom));
  background: var(--bg-card);
  border-top: 1px solid var(--bg-gray);
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

.chat-input {
  flex: 1;
  height: 40px;
  font-size: var(--font-base);
}

.input-placeholder {
  color: var(--text-hint);
  font-size: var(--font-base);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-circle);
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn.active {
  background: var(--color-accent);
}

/* ---- 加载 ---- */
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
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
</style>
