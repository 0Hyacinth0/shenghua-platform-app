<script setup>
import { ref, watch } from 'vue'
import { setPrivacyAgreed } from '@/utils/storage'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['agree', 'disagree', 'update:show'])
const visible = ref(props.show)

watch(() => props.show, (val) => {
  visible.value = val
})

function handleAgree() {
  setPrivacyAgreed(true)
  visible.value = false
  emit('update:show', false)
  emit('agree')
}

function handleDisagree() {
  uni.showToast({ title: '需同意隐私协议才能使用', icon: 'none' })
  emit('disagree')
}

function handleClose() {
  visible.value = false
  emit('update:show', false)
}
</script>

<template>
  <view v-if="visible" class="privacy-overlay" @tap="handleClose">
    <view class="privacy-card" @tap.stop>
      <view class="privacy-title">隐私协议</view>
      <view class="privacy-body">
        <text class="privacy-text">
欢迎使用盛桦教育。我们重视您的隐私和个人信息保护。

在您使用本应用前，请仔细阅读以下内容：

1. 信息收集：我们会收集您的手机号码用于账号注册和登录，收集您的学习进度用于提供继续学习服务。

2. 信息使用：您的信息仅用于提供课程学习、消息通知等核心功能，不会用于其他商业用途。

3. 信息保护：我们采用业界通行的安全技术保护您的个人信息，未经您同意不会向第三方提供。

4. 协议更新：我们可能会更新本隐私协议，更新后的协议将在应用内公示。

如您同意以上条款，请点击"同意并继续"进入应用。如您不同意，将无法使用本应用的任何服务。
        </text>
      </view>
      <view class="privacy-actions">
        <view class="btn-disagree" @tap="handleDisagree">不同意</view>
        <view class="btn-agree" @tap="handleAgree">同意并继续</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.privacy-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 64rpx;
}

.privacy-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 48rpx 36rpx 36rpx;
  max-width: 600rpx;
  width: 100%;
}

.privacy-title {
  font-size: var(--font-title-section);
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: 32rpx;
}

.privacy-body {
  max-height: 50vh;
  overflow-y: auto;
  margin-bottom: 36rpx;
  padding-right: 8rpx;
}

.privacy-text {
  font-size: var(--font-body);
  color: var(--color-text-secondary);
  line-height: 1.8;
  white-space: pre-line;
}

.privacy-actions {
  display: flex;
  gap: 24rpx;
}

.btn-disagree {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-border);
  color: var(--color-text-secondary);
  border-radius: var(--radius-button);
  font-size: var(--font-body);
  font-weight: 500;
}

.btn-agree {
  flex: 2;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: #FFFFFF;
  border-radius: var(--radius-button);
  font-size: var(--font-body);
  font-weight: 600;
}
</style>
