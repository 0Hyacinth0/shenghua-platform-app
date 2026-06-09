<template>
  <view class="page-container">
    <view class="nav-bar">
      <text class="nav-back" @tap="goBack">‹</text>
      <text class="nav-title">{{ title || '页面' }}</text>
      <view style="width:36px" />
    </view>

    <view class="content-card">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="content" class="content-body">
        <text class="content-text">{{ content }}</text>
      </view>

      <view v-else class="empty-wrap">
        <text class="empty-icon">📄</text>
        <text class="empty-text">暂无内容</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import http from '@/utils/http'

const loading = ref(true)
const title = ref('')
const content = ref('')

function goBack() {
  uni.navigateBack()
}

async function loadPage(key: string) {
  loading.value = true
  try {
    const res = await http.get('/mall/page/queryByKey', { params: { key } })
    title.value = (res as any)?.title || ''
    content.value = (res as any)?.content || ''
  } catch {
    title.value = ''
    content.value = ''
  } finally {
    loading.value = false
  }
}

onLoad((options: any) => {
  const key = options?.key || ''
  if (key) {
    loadPage(key)
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F5F6FA;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 44px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-back {
  font-size: 28px;
  font-weight: 300;
  color: #1a1a1a;
  padding: 4px 8px;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.content-card {
  background: #fff;
  margin: 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.content-body {
  /* content body wrapper */
}

.content-text {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
}

.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top-color: #FF7A45;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 40px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}
</style>
