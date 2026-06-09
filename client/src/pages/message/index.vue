<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="20" />
      </view>
      <text class="nav-title">消息</text>
      <view class="nav-right">
        <view class="nav-btn" @tap="onClear">
          <text class="clear-text">清除</text>
        </view>
      </view>
    </view>

    <!-- 消息分类 -->
    <view class="category-bar">
      <view
        v-for="cat in categories"
        :key="cat.key"
        class="category-item"
        :class="{ active: activeCategory === cat.key }"
        @tap="activeCategory = cat.key"
      >
        <view class="category-icon" :class="{ active: activeCategory === cat.key }">
          <Icon :icon="cat.icon" width="22" :color="activeCategory === cat.key ? 'var(--color-accent)' : 'var(--text-secondary)'" />
          <view v-if="cat.badge > 0" class="category-badge">
            <text class="badge-text">{{ cat.badge > 99 ? '99+' : cat.badge }}</text>
          </view>
        </view>
        <text class="category-label" :class="{ active: activeCategory === cat.key }">{{ cat.label }}</text>
      </view>
    </view>

    <!-- 消息操作条 -->
    <view v-if="filteredMessages.length > 0" class="message-action-header">
      <text class="message-count-text">最近消息</text>
      <view class="clear-action-btn" @tap="onClear">
        <Icon icon="solar:trash-bin-trash-bold" width="14" color="var(--text-hint)" />
        <text class="clear-action-text">清除全部</text>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view scroll-y class="message-list">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="filteredMessages.length > 0" class="message-items">
        <view v-for="msg in filteredMessages" :key="msg.id" class="message-card" @tap="goChat(msg)">
          <view class="msg-avatar-wrap">
            <view class="msg-avatar" :class="msg.type">
              <Icon :icon="getAvatarIcon(msg.type)" width="22" :color="getAvatarColor(msg.type)" />
            </view>
            <view v-if="msg.unread" class="msg-dot" />
          </view>
          <view class="msg-content">
            <view class="msg-header">
              <text class="msg-title">{{ msg.title || msg.senderName || '系统消息' }}</text>
              <text class="msg-time">{{ formatTime(msg.createTime) }}</text>
            </view>
            <text class="msg-preview">{{ msg.content || msg.lastMessage }}</text>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:bell-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">暂无消息</text>
        <text class="empty-sub">去社区互动获取更多消息</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(true)
const messages = ref<any[]>([])
const activeCategory = ref('all')

const categories = ref([
  { key: 'all', label: '全部', icon: 'solar:mailbox-bold', badge: 0 },
  { key: 'system', label: '系统', icon: 'solar:settings-bold', badge: 0 },
  { key: 'order', label: '订单', icon: 'solar:box-bold', badge: 0 },
  { key: 'comment', label: '评论', icon: 'solar:chat-round-dots-bold', badge: 0 },
  { key: 'like', label: '点赞', icon: 'solar:heart-bold', badge: 0 },
])



const filteredMessages = computed(() => {
  if (activeCategory.value === 'all') return messages.value
  return messages.value.filter(m => m.type === activeCategory.value)
})

function goBack() {
  uni.navigateBack()
}

function goChat(msg: any) {
  if (msg.type === 'system' || msg.type === 'order') {
    // 系统消息/订单消息直接查看详情
    return
  }
  uni.navigateTo({ url: '/pages/message/chat?targetId=' + (msg.senderId || msg.id) + '&title=' + (msg.title || msg.senderName || '') })
}

function onClear() {
  uni.showModal({
    title: '提示',
    content: '确定清除所有消息吗？',
    success: (res) => {
      if (res.confirm) {
        messages.value = []
        uni.showToast({ title: '已清除', icon: 'success' })
      }
    },
  })
}

function getAvatarIcon(type: string) {
  const iconMap: Record<string, string> = {
    system: 'solar:settings-bold',
    order: 'solar:box-bold',
    comment: 'solar:chat-round-dots-bold',
    like: 'solar:heart-bold',
  }
  return iconMap[type] || 'solar:mailbox-bold'
}

function getAvatarColor(type: string) {
  const colorMap: Record<string, string> = {
    system: 'var(--color-info)',
    order: 'var(--color-success)',
    comment: 'var(--color-accent)',
    like: 'var(--color-danger)',
  }
  return colorMap[type] || 'var(--text-secondary)'
}

function formatTime(time: string) {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) {
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
  }
  if (diff < 172800000) return '昨天'
  return (d.getMonth() + 1) + '/' + d.getDate()
}

async function loadMessages() {
  loading.value = true
  try {
    const res = await http.get('/mall/userMessage/list', { params: { userId: getCurrentUserId(), pageNo: 1, pageSize: 50 } })
    messages.value = res?.records || (Array.isArray(res) ? res : [])
  } catch {
    messages.value = []
  } finally {
    loading.value = false
    // 动态计算 badge
    updateBadges()
  }
}

function updateBadges() {
  const unreadAll = messages.value.filter((m: any) => m.unread).length
  categories.value.forEach(cat => {
    if (cat.key === 'all') {
      cat.badge = unreadAll
    } else {
      cat.badge = messages.value.filter((m: any) => m.type === cat.key && m.unread).length
    }
  })
}

onLoad(() => {
  loadMessages()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.nav-bar {
  display: none;
}

.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
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
  padding: 6px 12px;
}

.clear-text {
  font-size: var(--font-base);
  color: var(--text-hint);
}

/* 消息分类 */
.category-bar {
  background: var(--bg-card);
  display: flex;
  justify-content: space-around;
  padding: var(--space-lg) var(--space-sm);
  box-shadow: var(--shadow-sm);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.category-icon.active {
  background: var(--color-accent-light);
}

.category-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  background: var(--color-danger);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.badge-text {
  font-size: 10px;
  color: var(--text-white);
  font-weight: var(--weight-semibold);
}

.category-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.category-label.active {
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

/* 消息列表 */
.message-list {
  flex: 1;
  padding-top: var(--space-md);
}

.message-items {
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
}

.message-card {
  display: flex;
  gap: var(--space-md);
  background: var(--bg-card);
  padding: 14px var(--space-lg);
  margin: 0 var(--space-lg) 10px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.message-card:active {
  background: var(--bg-gray);
}

.msg-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.msg-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.msg-avatar.system {
  background: var(--color-info-light);
}

.msg-avatar.order {
  background: var(--color-success-light);
}

.msg-avatar.comment {
  background: var(--color-accent-light);
}

.msg-avatar.like {
  background: var(--color-danger-light);
}

.msg-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: var(--radius-circle);
  background: var(--color-danger);
  border: 2px solid var(--bg-card);
}

.msg-content {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.msg-title {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.msg-time {
  font-size: var(--font-sm);
  color: var(--text-hint);
  flex-shrink: 0;
}

.msg-preview {
  font-size: 13px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* 空状态 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 40px;
  gap: var(--space-sm);
}

.empty-text {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-top: var(--space-md);
}

.empty-sub {
  font-size: var(--font-base);
  color: var(--text-hint);
}

/* 消息操作条 */
.message-action-header {
  padding: var(--space-md) var(--space-lg) var(--space-xs);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message-count-text {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.clear-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.clear-action-btn:active {
  opacity: 0.8;
}

.clear-action-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}
</style>
