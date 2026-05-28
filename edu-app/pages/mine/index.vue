<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'
import MotionView from '@/components/MotionView.vue'

const currentTab = ref(3)

onShow(() => {
  uni.hideTabBar()
})
</script>

<template>
  <view class="page">
    <MotionView custom-class="page-content">
      <view class="page-placeholder">我的</view>
    </MotionView>
    <CustomTabBar :current="currentTab" />
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
