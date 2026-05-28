<script setup>
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const currentTab = ref(2)
</script>

<template>
  <view class="page">
    <view class="page-placeholder">消息</view>
    <CustomTabBar :current="currentTab" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #FFFFFF;
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
