<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="route.path" />
    </keep-alive>
  </router-view>

  <!-- 底部导航栏 -->
  <FloatingBottomTabBar
    v-if="showTabBar"
    :tabs="tabItems"
    :model-value="currentTab"
    :badge="cartBadge"
    @update:model-value="onTabChange"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeOutlined,
  AppstoreOutlined,
  EyeOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import FloatingBottomTabBar from '@/components/FloatingBottomTabBar.vue'
import type { TabItem } from '@/components/FloatingBottomTabBar.vue'
import { getCartCount } from '@/api'
import { isLoggedIn } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const cachedViews = ['home', 'category', 'community', 'cart', 'profile']

const cartBadge = ref(0)

const tabItems: TabItem[] = [
  { key: 'home', label: '首页', iconComponent: HomeOutlined },
  { key: 'category', label: '分类', iconComponent: AppstoreOutlined },
  { key: 'community', label: '逛逛', iconComponent: EyeOutlined },
  { key: 'cart', label: '购物车', iconComponent: ShoppingOutlined },
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
    category: '/category',
    community: '/community',
    cart: '/cart',
    profile: '/profile',
  }
  const target = routeMap[key]
  if (target && target !== route.path) {
    router.push(target)
  }
}

async function loadCartBadge() {
  if (!isLoggedIn()) { cartBadge.value = 0; return }
  try {
    const count = await getCartCount()
    cartBadge.value = typeof count === 'number' ? count : 0
  } catch { cartBadge.value = 0 }
}

watch(() => route.path, () => {
  loadCartBadge()
})

onMounted(() => {
  loadCartBadge()
})
</script>

<style>
@import './styles/design-system.css';
</style>
