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
import {
  HomeOutlined,
  ReadOutlined,
  CommentOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import FloatingBottomTabBar from '@/components/FloatingBottomTabBar.vue'
import type { TabItem } from '@/components/FloatingBottomTabBar.vue'

const route = useRoute()
const router = useRouter()

const cachedViews = ['home', 'learn', 'community', 'messages', 'profile']

const tabItems: TabItem[] = [
  { key: 'home', label: '首页', iconComponent: HomeOutlined },
  { key: 'learn', label: '学习', iconComponent: ReadOutlined },
  { key: 'community', label: '社区', iconComponent: CommentOutlined },
  { key: 'messages', label: '消息', iconComponent: BellOutlined },
  { key: 'profile', label: '我的', iconComponent: UserOutlined },
]

const showTabBar = computed(() => {
  return route.meta?.showTabBar !== false
})

const currentTab = computed(() => {
  if (route.meta?.tabKey) return route.meta.tabKey as string
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
  padding-bottom: env(safe-area-inset-bottom, 0);
}

button {
  font-family: inherit;
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
