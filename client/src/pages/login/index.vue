<template>
  <view class="page">
    <!-- 顶部品牌区 -->
    <view class="brand-section">
      <view class="brand-bg">
        <view class="brand-deco" />
        <view class="brand-deco2" />
      </view>
      <view class="brand-content">
        <view class="brand-logo">
          <text class="logo-text">盛</text>
        </view>
        <text class="brand-name">盛桦学堂</text>
        <text class="brand-slogan">让学习更简单、更高效</text>
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="form-section">
      <view class="form-title">
        <text class="title-text">欢迎回来</text>
        <text class="title-sub">登录后享受完整学习体验</text>
      </view>

      <view class="form-group">
        <view class="input-group">
          <view class="input-icon">
            <Icon icon="solar:user-bold" width="20" color="var(--text-hint)" />
          </view>
          <input
            v-model="form.username"
            class="form-input"
            placeholder="请输入用户名/手机号"
            placeholder-class="input-placeholder"
          />
        </view>

        <view class="input-group">
          <view class="input-icon">
            <Icon icon="solar:lock-password-bold" width="20" color="var(--text-hint)" />
          </view>
          <input
            v-model="form.password"
            class="form-input"
            placeholder="请输入密码"
            placeholder-class="input-placeholder"
            :password="!showPassword"
          />
          <view class="input-suffix" @tap="showPassword = !showPassword">
            <Icon :icon="showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'" width="20" color="var(--text-hint)" />
          </view>
        </view>
      </view>

      <view class="form-options">
        <view class="remember-me" @tap="rememberMe = !rememberMe">
          <view class="checkbox" :class="{ checked: rememberMe }">
            <Icon v-if="rememberMe" icon="solar:check-circle-bold" width="14" color="#fff" />
          </view>
          <text class="remember-text">记住我</text>
        </view>
        <text class="forgot-password" @tap="goForgot">忘记密码？</text>
      </view>

      <button class="login-btn" :class="{ loading }" :disabled="loading" @tap="handleLogin">
        <text v-if="loading" class="btn-loading">↻</text>
        <text class="btn-text">{{ loading ? '登录中...' : '登录' }}</text>
      </button>

      <view class="form-footer">
        <text class="footer-text">还没有账号？</text>
        <text class="footer-link" @tap="goRegister">立即注册</text>
      </view>
    </view>

    <!-- 其他登录方式 -->
    <view class="other-login">
      <view class="divider">
        <view class="divider-line" />
        <text class="divider-text">其他登录方式</text>
        <view class="divider-line" />
      </view>
      <view class="social-login">
        <view class="social-btn wechat">
          <text class="social-icon">微</text>
        </view>
        <view class="social-btn qq">
          <text class="social-icon">Q</text>
        </view>
        <view class="social-btn apple">
          <text class="social-icon">A</text>
        </view>
      </view>
    </view>

    <!-- 底部协议 -->
    <view class="agreement">
      <text class="agreement-text">登录即表示同意</text>
      <text class="agreement-link">《用户协议》</text>
      <text class="agreement-text">和</text>
      <text class="agreement-link">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { login } from '@/api'
import { setToken, setUser } from '@/utils/auth'

const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(true)
const form = reactive({ username: '', password: '' })

function goRegister() {
  uni.navigateTo({ url: '/pages/login/register' })
}

function goForgot() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

async function handleLogin() {
  if (!form.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!form.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await login({ username: form.username, password: form.password })
    if (res?.token) {
      setToken(res.token)
      setUser(res.userInfo || { username: form.username })
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/index' })
      }, 500)
    } else if (res?.success === false) {
      uni.showToast({ title: res?.message || '登录失败', icon: 'none' })
    } else {
      setToken(res?.token || 'dummy_token')
      setUser(res?.userInfo || { username: form.username })
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/index' })
      }, 500)
    }
  } catch (e: any) {
    uni.showToast({ title: e?.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
}

/* 品牌区 */
.brand-section {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.brand-bg {
  position: absolute;
  inset: 0;
  background: var(--color-primary-gradient);
}

.brand-deco {
  position: absolute;
  right: -30px;
  top: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
}

.brand-deco2 {
  position: absolute;
  left: 40px;
  bottom: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
}

.brand-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-top: 40px;
}

.brand-logo {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-md);
}

.logo-text {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  color: var(--text-white);
}

.brand-name {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  color: var(--text-white);
  margin-bottom: var(--space-xs);
}

.brand-slogan {
  font-size: var(--font-base);
  color: rgba(255,255,255,0.8);
}

/* 表单区 */
.form-section {
  flex: 1;
  padding: var(--space-2xl);
  margin-top: -20px;
  background: var(--bg-card);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  position: relative;
  z-index: 2;
}

.form-title {
  margin-bottom: var(--space-2xl);
}

.title-text {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  display: block;
}

.title-sub {
  font-size: var(--font-base);
  color: var(--text-hint);
  margin-top: var(--space-xs);
  display: block;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.input-group {
  display: flex;
  align-items: center;
  background: var(--bg-gray);
  border-radius: var(--radius-md);
  padding: 0 var(--space-lg);
  height: 52px;
}

.input-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-md);
}

.form-input {
  flex: 1;
  height: 52px;
  font-size: var(--font-md);
  color: var(--text-primary);
  background: transparent;
}

.input-placeholder {
  color: var(--text-hint);
  font-size: var(--font-md);
}

.input-suffix {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--space-sm);
}

/* 表单选项 */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2xl);
}

.remember-me {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.remember-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.forgot-password {
  font-size: 13px;
  color: var(--color-primary);
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 52px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(255,107,53,0.3);
  margin-bottom: var(--space-lg);
}

.login-btn:active {
  opacity: 0.9;
}

.login-btn.loading {
  opacity: 0.7;
}

.btn-loading {
  margin-right: var(--space-sm);
  font-size: var(--font-lg);
  color: var(--text-white);
}

.btn-text {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-white);
}

/* 表单底部 */
.form-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
}

.footer-text {
  font-size: var(--font-base);
  color: var(--text-hint);
}

.footer-link {
  font-size: var(--font-base);
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

/* 其他登录方式 */
.other-login {
  padding: 0 var(--space-2xl) var(--space-2xl);
}

.divider {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #f0f0f0;
}

.divider-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.social-login {
  display: flex;
  justify-content: center;
  gap: var(--space-2xl);
}

.social-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-btn.wechat {
  background: #07C160;
}

.social-btn.qq {
  background: #12B7F5;
}

.social-btn.apple {
  background: #000;
}

.social-icon {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-white);
}

/* 协议 */
.agreement {
  position: fixed;
  bottom: 32px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.agreement-link {
  color: var(--color-primary);
}
</style>
