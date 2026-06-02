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
            <span>{{ msg.icon }}</span>
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

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()

interface Message {
  id: string
  title: string
  preview: string
  time: string
  icon: string
  avatarColor: string
  unread: boolean
  route?: string
}

const messages = ref<Message[]>([
  { id: 'm1', title: '系统通知', preview: '欢迎来到盛桦教育平台，开始你的学习之旅吧！', time: '刚刚', icon: '📢', avatarColor: '#D8F0E8', unread: true },
  { id: 'm2', title: '订单消息', preview: '你的订单 #20240601001 已发货，请留意收货～', time: '2小时前', icon: '📦', avatarColor: '#FDE8D8', unread: true },
  { id: 'm3', title: '课程提醒', preview: '《Vue 3 + TypeScript 实战》今晚 20:00 更新新章节', time: '5小时前', icon: '📖', avatarColor: '#E8E0F8', unread: false },
  { id: 'm4', title: '优惠通知', preview: '你有一张满199减30的优惠券即将过期，快去使用吧', time: '昨天', icon: '🎫', avatarColor: '#FDE8F0', unread: false },
  { id: 'm5', title: '互动消息', preview: '你的评论收到了 3 个赞', time: '昨天', icon: '💬', avatarColor: '#D8E8FD', unread: false },
])

// 尝试加载订单相关通知
onMounted(async () => {
  try {
    const userId = getCurrentUserId()
    const res = await http.get('/mall/order/myOrders', { params: { userId, pageSize: 5 } })
    const orders = res?.records || []
    if (orders.length > 0) {
      const latest = orders[0]
      const statusMap: Record<string, string> = {
        '0': '待付款',
        '1': '待发货', // 有些后端用不同编码
        '2': '已发货',
      }
      messages.value.unshift({
        id: 'order_' + latest.id,
        title: '订单状态更新',
        preview: `订单 #${String(latest.id).slice(-8)} ${latest.statusDesc || '已更新'}`,
        time: '最近',
        icon: '📦',
        avatarColor: '#FDE8D8',
        unread: false,
        route: `/order/${latest.id}`,
      })
    }
  } catch { /* ignore */ }
})

function onMessageClick(msg: Message) {
  if (msg.route) {
    router.push(msg.route)
  }
}
</script>

<style scoped>
.message-page {
  padding: 0 16px;
  max-width: 480px;
  margin: 0 auto;
}
.page-header {
  padding: 8px 0 4px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.03em;
}
.message-section {
  margin-bottom: 20px;
}
.message-list {
  display: flex;
  flex-direction: column;
}
.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 0.5px solid #eee;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}
.msg-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.msg-body {
  flex: 1;
  min-width: 0;
}
.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}
.msg-title {
  font-size: 15px;
  font-weight: 540;
  color: #1a1a1a;
}
.msg-time {
  font-size: 11px;
  color: #bbb;
  flex-shrink: 0;
  margin-left: 12px;
}
.msg-preview {
  font-size: 13px;
  color: #999;
  font-weight: 340;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.msg-dot {
  position: absolute;
  right: 2px;
  top: 22px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FF3B30;
}
.empty-state {
  padding: 80px 0;
  text-align: center;
}
.bottom-spacer {
  height: 100px;
}
</style>
