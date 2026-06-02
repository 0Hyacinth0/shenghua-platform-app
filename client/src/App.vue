<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="route.path" />
    </keep-alive>
  </router-view>

  <!-- 底部悬浮导航栏 -->
  <FloatingBottomTabBar
    v-if="showTabBar"
    :tabs="tabItems"
    :model-value="currentTab"
    @update:model-value="onTabChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FloatingBottomTabBar from '@/components/FloatingBottomTabBar.vue'
import type { TabItem } from '@/components/FloatingBottomTabBar.vue'

const route = useRoute()
const router = useRouter()

// 需要 keep-alive 缓存的页面
const cachedViews = ['home', 'learn', 'community', 'messages', 'profile']

const tabItems: TabItem[] = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'learn', label: '学习', icon: '📖' },
  { key: 'community', label: '社区', icon: '💬' },
  { key: 'messages', label: '消息', icon: '🔔' },
  { key: 'profile', label: '我的', icon: '👤' },
]

// 是否显示 TabBar
const showTabBar = computed(() => {
  return route.meta?.showTabBar !== false
})

// 当前激活的 tab，基于路由 meta.tabKey 或路径推断
const currentTab = computed(() => {
  if (route.meta?.tabKey) return route.meta.tabKey as string
  // 内部页面默认高亮首页
  return 'home'
})

function onTabChange(key: string) {
  const routeMap: Record<string, string> = {
    home: '/',
    learn: '/learn',
    community: '/community',
    messages: '/messages',
    profile: '/profile',
  }
  const target = routeMap[key]
  if (target && target !== route.path) {
    router.push(target)
  }
}
</script>

<style>
/* 全局重置 — 适配 DESIGN.md 审美 */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', 'Geist', 'SF Pro Display', system-ui, -apple-system, sans-serif;
  background: #f8f8f8;
  color: #1a1a1a;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 340;
  letter-spacing: -0.01em;
  overflow-x: hidden;
  /* 底部 TabBar 安全区 */
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* 移除默认按钮样式 */
button {
  font-family: inherit;
}

/* 滚动条隐藏（可选） */
::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
