<script setup>
defineProps({
  current: {
    type: Number,
    default: 0,
  },
})

const tabs = [
  { text: '首页', path: '/pages/index/index' },
  { text: '课程', path: '/pages/course/index' },
  { text: '消息', path: '/pages/message/index' },
  { text: '我的', path: '/pages/mine/index' },
]

function switchTab(index) {
  uni.switchTab({ url: tabs[index].path })
}
</script>

<template>
  <view class="custom-tab-bar">
    <view
      v-for="(item, index) in tabs"
      :key="index"
      class="tab-item"
      :class="{ active: current === index }"
      @tap="switchTab(index)"
    >
      <view class="tab-icon">
        <text class="icon-placeholder">{{ item.text.slice(0, 1) }}</text>
      </view>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<style scoped>
.custom-tab-bar {
  position: fixed;
  bottom: calc(20rpx + var(--safe-area-bottom));
  left: 32rpx;
  right: 32rpx;
  height: var(--nav-height);
  background: var(--nav-bg);
  border-radius: var(--radius-bottom-nav);
  box-shadow: var(--nav-shadow);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 999;
  backdrop-filter: saturate(180%) blur(var(--nav-bg-blur));
  -webkit-backdrop-filter: saturate(180%) blur(var(--nav-bg-blur));
  border: 1rpx solid var(--nav-border);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 28rpx;
  border-radius: 48rpx;
  transition: background 0.2s;
}

.tab-item.active {
  background: var(--nav-selected-bg);
}

.tab-icon {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-placeholder {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--nav-unselected-color);
}

.tab-item.active .icon-placeholder {
  color: var(--nav-selected-color);
}

.tab-text {
  font-size: var(--font-tab);
  font-weight: 500;
  color: var(--nav-unselected-color);
  margin-top: 4rpx;
}

.tab-item.active .tab-text {
  color: var(--nav-selected-color);
  font-weight: 600;
}
</style>
