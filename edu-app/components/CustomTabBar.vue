<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
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

const pressedIndex = ref(-1)

function switchTab(index) {
  uni.switchTab({ url: tabs[index].path })
}

function onPressStart(index) {
  pressedIndex.value = index
}

function onPressEnd() {
  pressedIndex.value = -1
}

const indicatorStyle = computed(() => ({
  left: `${(2 * props.current + 1) / 8 * 100}%`,
}))
</script>

<template>
  <view class="custom-tab-bar">
    <view
      class="tab-indicator"
      :style="indicatorStyle"
    />
    <view
      v-for="(item, index) in tabs"
      :key="index"
      class="tab-item"
      :class="{ active: current === index, 'tab-item-press': pressedIndex === index }"
      @touchstart="onPressStart(index)"
      @touchend="onPressEnd"
      @touchcancel="onPressEnd"
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
  overflow: hidden;
}

.tab-indicator {
  position: absolute;
  top: 10rpx;
  bottom: 10rpx;
  width: 22%;
  background: var(--nav-selected-bg);
  border-radius: 48rpx;
  transform: translateX(-50%);
  animation: indicator-in 380ms var(--motion-ease-standard) both;
  z-index: 0;
}

@keyframes indicator-in {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.75);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 28rpx;
  border-radius: 48rpx;
  z-index: 1;
  transition: transform var(--motion-duration-fast) var(--motion-ease-standard);
}

.tab-item-press {
  transform: scale(0.94);
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
  transition: color var(--motion-duration-fast) var(--motion-ease-standard),
              transform var(--motion-duration-base) var(--motion-ease-standard);
}

.tab-item.active .icon-placeholder {
  color: var(--nav-selected-color);
  transform: translateY(-2rpx);
}

.tab-text {
  font-size: var(--font-tab);
  font-weight: 500;
  color: var(--nav-unselected-color);
  margin-top: 4rpx;
  transition: color var(--motion-duration-fast) var(--motion-ease-standard),
              font-weight var(--motion-duration-fast) var(--motion-ease-standard);
}

.tab-item.active .tab-text {
  color: var(--nav-selected-color);
  font-weight: 600;
}
</style>
