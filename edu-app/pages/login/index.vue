<script setup>
import { ref } from 'vue'
import { sendSmsCode, loginBySms } from '@/api/auth'
import { setToken, setUserInfo } from '@/utils/storage'
import { switchTab } from '@/utils/router'
import PrivacyModal from '@/components/PrivacyModal.vue'

const phone = ref('')
const smsCode = ref('')
const agreed = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const showPrivacy = ref(false)

let timer = null

function getCode() {
  if (codeSending.value || countdown.value > 0) return
  if (!/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  codeSending.value = true
  sendSmsCode(phone.value)
    .then(() => {
      uni.showToast({ title: '验证码已发送', icon: 'none' })
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
          timer = null
        }
      }, 1000)
    })
    .catch(() => {
      uni.showToast({ title: '发送失败，请重试', icon: 'none' })
    })
    .finally(() => {
      codeSending.value = false
    })
}

function handleLogin() {
  if (!phone.value || !smsCode.value) {
    uni.showToast({ title: '请输入手机号和验证码', icon: 'none' })
    return
  }
  if (!agreed.value) {
    uni.showToast({ title: '请先同意隐私协议', icon: 'none' })
    return
  }

  loginBySms(phone.value, smsCode.value)
    .then((res) => {
      setToken(res.result.token)
      setUserInfo(res.result.user)
      uni.showToast({ title: '登录成功', icon: 'none' })
      setTimeout(() => {
        switchTab('/pages/index/index')
      }, 500)
    })
    .catch(() => {
      uni.showToast({ title: '验证码错误或已过期', icon: 'none' })
    })
}

function openPrivacy() {
  showPrivacy.value = true
}
</script>

<template>
  <view class="login-page">
    <view class="nav-back" @tap="() => switchTab('/pages/index/index')">
      <text class="back-arrow">←</text>
    </view>
    <view class="login-header">
      <text class="login-title">手机号登录</text>
      <text class="login-desc">首次登录将自动注册账号</text>
    </view>

    <view class="login-form">
      <view class="input-group">
        <text class="input-label">手机号</text>
        <input
          v-model="phone"
          class="login-input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          placeholder-style="color: #9AA0AA"
        />
      </view>

      <view class="input-group">
        <text class="input-label">验证码</text>
        <view class="sms-row">
          <input
            v-model="smsCode"
            class="login-input sms-input"
            type="number"
            maxlength="6"
            placeholder="6位验证码"
            placeholder-style="color: #9AA0AA"
          />
          <view
            class="sms-btn"
            :class="{ disabled: countdown > 0 || codeSending }"
            @tap="getCode"
          >
            <text v-if="countdown > 0">{{ countdown }}s</text>
            <text v-else>{{ codeSending ? '发送中' : '获取验证码' }}</text>
          </view>
        </view>
      </view>

      <view class="privacy-check">
        <view class="checkbox" :class="{ checked: agreed }" @tap="agreed = !agreed">
          <text v-if="agreed" class="check-icon">✓</text>
        </view>
        <text class="privacy-check-text">
          已阅读并同意
          <text class="privacy-link" @tap.stop="openPrivacy">《隐私协议》</text>
        </text>
      </view>

      <view class="btn-login" @tap="handleLogin">登录</view>
    </view>

    <PrivacyModal v-model:show="showPrivacy" />
  </view>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #FFFFFF;
  padding: 0 64rpx;
}

.nav-back {
  padding-top: calc(var(--status-bar-height, 44px) + 24rpx);
}
.back-arrow {
  font-size: 40rpx;
  color: var(--color-text-primary);
  font-weight: 700;
}

.login-header {
  padding-top: 160rpx;
  padding-bottom: 64rpx;
}

.login-title {
  display: block;
  font-size: var(--font-title-page);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 16rpx;
}

.login-desc {
  font-size: var(--font-body);
  color: var(--color-text-tertiary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.input-label {
  font-size: var(--font-auxiliary);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.login-input {
  height: 96rpx;
  background: #F5F6F8;
  border-radius: 24rpx;
  padding: 0 28rpx;
  font-size: var(--font-body);
  color: var(--color-text-primary);
}

.sms-row {
  display: flex;
  gap: 20rpx;
}

.sms-input {
  flex: 1;
}

.sms-btn {
  width: 200rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 24rpx;
  font-size: var(--font-auxiliary);
  font-weight: 500;
  white-space: nowrap;
}

.sms-btn.disabled {
  opacity: 0.5;
}

.privacy-check {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid var(--color-border);
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.check-icon {
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 700;
}

.privacy-check-text {
  font-size: var(--font-auxiliary);
  color: var(--color-text-tertiary);
}

.privacy-link {
  color: var(--color-link);
}

.btn-login {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: #FFFFFF;
  border-radius: var(--radius-button);
  font-size: var(--font-body);
  font-weight: 600;
  margin-top: 20rpx;
}
</style>
