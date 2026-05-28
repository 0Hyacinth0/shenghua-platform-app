<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'
import MotionView from '@/components/MotionView.vue'

const currentTab = ref(2)

onShow(() => {
  uni.hideTabBar()
})
</script>

<template>
  <view class="page">
    <view class="page-content">
      <MotionView animation="fadeInUp" delay="0ms">
        <view class="hero-icon">
          <text class="hero-emoji">💬</text>
        </view>
      </MotionView>
      <MotionView animation="fadeInUp" delay="60ms">
        <view class="hero-title">消息中心</view>
      </MotionView>
      <MotionView animation="fadeInUp" delay="120ms">
        <view class="hero-subtitle">暂无新消息</view>
      </MotionView>
    </view>
    <CustomTabBar :current="currentTab" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #FFFFFF;
  padding-bottom: 200rpx;
}

.page-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
}

.hero-icon {
  width: 160rpx;
  height: 160rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #EEF9FF, #DEF0FF);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 36rpx;
}

.hero-emoji {
  font-size: 72rpx;
}

.hero-title {
  font-size: var(--font-title-page);
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 16rpx;
}

.hero-subtitle {
  font-size: var(--font-body);
  color: var(--color-text-tertiary);
}
</style>
