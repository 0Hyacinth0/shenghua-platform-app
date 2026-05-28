<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import MotionView from '@/components/MotionView.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import { getLessonPlayInfo } from '@/api/course'
import { goBack } from '@/utils/router'

const lessonId = ref(0)
const courseId = ref(0)
const lessonInfo = ref(null)
const loading = ref(true)

onLoad((options) => {
  lessonId.value = Number(options.lessonId) || 1
  courseId.value = Number(options.courseId) || 1

  getLessonPlayInfo(lessonId.value)
    .then((res) => {
      lessonInfo.value = res.result
    })
    .catch(() => {
      uni.showToast({ title: '获取播放信息失败', icon: 'none' })
    })
    .finally(() => {
      loading.value = false
    })
})

function onBack() {
  goBack()
}

function onError() {
  uni.showToast({ title: '视频播放失败', icon: 'none' })
}
</script>

<template>
  <view class="page">
    <!-- 顶部栏 -->
    <view class="play-header">
      <view class="btn-back" @tap="onBack">←</view>
      <text class="header-title" v-if="lessonInfo">{{ lessonInfo.title }}</text>
    </view>

    <!-- 播放器区域 -->
    <view class="player-area">
      <view v-if="loading" class="player-skeleton">
        <SkeletonBlock width="120rpx" height="120rpx" radius="50%" dark />
        <SkeletonBlock width="260rpx" height="28rpx" radius="10rpx" dark />
      </view>
      <view v-else-if="lessonInfo" class="player-wrapper">
        <!-- H5 和 App 端使用 video 组件 -->
        <!-- #ifdef H5 || APP-PLUS -->
        <video
          class="video-el"
          :src="lessonInfo.playAuth.url"
          :poster="lessonInfo.coverUrl"
          controls
          :initial-time="lessonInfo.lastPosition"
          @error="onError"
        />
        <!-- #endif -->

        <!-- 小程序端 mock 展示 -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="video-mock">
          <text class="mock-icon">▶</text>
          <text class="mock-text">视频播放区域</text>
          <text class="mock-info">{{ lessonInfo.title }}</text>
          <text class="mock-info">时长 {{ Math.floor(lessonInfo.duration / 60) }}:{{ String(lessonInfo.duration % 60).padStart(2, '0') }}</text>
          <text class="mock-info" v-if="lessonInfo.lastPosition > 0">上次播放到 {{ Math.floor(lessonInfo.lastPosition / 60) }}:{{ String(lessonInfo.lastPosition % 60).padStart(2, '0') }}</text>
        </view>
        <!-- #endif -->
      </view>
    </view>

    <!-- 课节信息 -->
    <MotionView v-if="lessonInfo" animation="fadeInUp" custom-class="info-bar">
      <text class="info-text">正在播放：{{ lessonInfo.title }}</text>
      <text class="info-text" v-if="lessonInfo.lastPosition > 0">
        上次播放到 {{ Math.floor(lessonInfo.lastPosition / 60) }}:{{ String(lessonInfo.lastPosition % 60).padStart(2, '0') }}
      </text>
    </MotionView>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #000000;
}

/* 顶部栏 */
.play-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 32rpx;
  padding-top: calc(var(--status-bar-height, 44px) + 20rpx);
  background: #000000;
  position: relative;
  z-index: 10;
}
.btn-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 36rpx;
  font-weight: 700;
  flex-shrink: 0;
}
.header-title {
  color: #FFFFFF;
  font-size: var(--font-body);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 播放器 */
.player-area {
  width: 100%;
  height: 460rpx;
  background: #1A1A1A;
  display: flex;
  align-items: center;
  justify-content: center;
}
.player-skeleton {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}
.player-wrapper {
  width: 100%;
  height: 100%;
}
.video-el {
  width: 100%;
  height: 100%;
}

/* 小程序 mock 播放器 */
.video-mock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #FFFFFF;
}
.mock-icon {
  font-size: 80rpx;
  opacity: 0.6;
}
.mock-text {
  font-size: var(--font-title-card);
  font-weight: 600;
}
.mock-info {
  font-size: var(--font-auxiliary);
  opacity: 0.7;
}

/* 信息栏 */
.info-bar {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.info-text {
  font-size: var(--font-body);
  color: #FFFFFF;
}
</style>
