<script setup>
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const currentTab = ref(3)
</script>

<template>
  <view class="page">
    <view class="page-placeholder">我的</view>
    <CustomTabBar :current="currentTab" @change="currentTab = $event" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-page-bg);
  padding-bottom: 200rpx;
}
.page-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
  font-size: var(--font-title-page);
  color: var(--color-text-tertiary);
}
</style>
