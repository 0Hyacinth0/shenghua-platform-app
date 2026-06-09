<template>
  <view class="floating-tabbar-container">
    <view class="floating-tabbar">
      <!-- 绝对定位流体背景滑块 -->
      <view
        class="tab-active-indicator"
        :style="{ transform: `translateX(${active * 100}%)` }"
      />
      <!-- 各导航项 -->
      <view
        v-for="(tab, idx) in tabs"
        :key="tab.pagePath"
        class="tab-item"
        :class="{ active: active === idx }"
        @tap="switchTab(tab.pagePath)"
      >
        <Icon
          :icon="tab.icon"
          :size="20"
          :color="active === idx ? '#ffffff' : '#555555'"
          class="tab-icon"
        />
        <text class="tab-text" :class="{ active: active === idx }">{{ tab.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  active: number
}>()

const tabs = [
  { pagePath: '/pages/home/index', text: '首页', icon: 'solar:home-2-bold' },
  { pagePath: '/pages/mall/index', text: '商城', icon: 'solar:bag-bold' },
  { pagePath: '/pages/learn/index', text: '学习', icon: 'solar:notebook-bold' },
  { pagePath: '/pages/community/index', text: '社区', icon: 'solar:users-group-rounded-bold' },
  { pagePath: '/pages/profile/index', text: '我的', icon: 'solar:user-bold' },
]

function switchTab(url: string) {
  uni.switchTab({ url })
}
</script>

<style scoped>
.floating-tabbar-container {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  z-index: 999;
  box-sizing: border-box;
}

.floating-tabbar {
  display: flex;
  position: relative;
  height: 58px;
  background: rgba(255, 255, 255, 0.72);
  border-radius: var(--radius-full, 999px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 4px;
  box-sizing: border-box;
  align-items: center;
}

/* 绝对定位滑块 - 液态流光指示器 */
.tab-active-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(20% - 1.6px); /* 5等分，扣除内间距 */
  background: #111111;
  border-radius: var(--radius-full, 999px);
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 1;
}

/* 导航项 */
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  z-index: 2;
  gap: 3px;
  transition: all 0.2s;
}

.tab-icon {
  transition: color 0.35s;
}

.tab-text {
  font-size: 10px;
  font-weight: var(--weight-medium, 500);
  color: var(--color-text-secondary, #666);
  transition: color 0.35s, font-weight 0.2s;
}

.tab-text.active {
  color: #ffffff;
  font-weight: var(--weight-bold, 700);
}
</style>
