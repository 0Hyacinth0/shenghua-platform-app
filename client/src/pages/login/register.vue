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
        <text class="brand-name">创建账号</text>
        <text class="brand-slogan">加入盛桦学堂，开启学习之旅</text>
      </view>
    </view>

    <!-- 注册表单 -->
    <view class="form-section">
      <view class="form-title">
        <text class="title-text">注册</text>
        <text class="title-sub">创建您的学习账号</text>
      </view>

      <view class="form-group">
        <view class="input-group">
          <view class="input-icon">
            <Icon icon="solar:user-bold" width="20" color="var(--text-hint)" />
          </view>
          <input
            v-model="form.username"
            class="form-input"
            placeholder="请输入用户名"
            placeholder-class="input-placeholder"
          />
        </view>

        <view class="input-group">
          <view class="input-icon">
            <Icon icon="solar:phone-bold" width="20" color="var(--text-hint)" />
          </view>
          <input
            v-model="form.phone"
            class="form-input"
            placeholder="请输入手机号"
            placeholder-class="input-placeholder"
            type="number"
            :maxlength="11"
          />
        </view>

        <view class="input-group">
          <view class="input-icon">
            <Icon icon="solar:lock-password-bold" width="20" color="var(--text-hint)" />
          </view>
          <input
            v-model="form.password"
            class="form-input"
            placeholder="请输入密码（至少6位）"
            placeholder-class="input-placeholder"
            :password="!showPassword"
          />
          <view class="input-suffix" @tap="showPassword = !showPassword">
            <Icon :icon="showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'" width="20" color="var(--text-hint)" />
          </view>
        </view>

        <view class="input-group">
          <view class="input-icon">
            <Icon icon="solar:lock-password-bold" width="20" color="var(--text-hint)" />
          </view>
          <input
            v-model="form.confirmPassword"
            class="form-input"
            placeholder="请确认密码"
            placeholder-class="input-placeholder"
            :password="!showPassword"
          />
        </view>
      </view>

      <view class="agreement-row" @tap="agreed = !agreed">
        <view class="checkbox" :class="{ checked: agreed }">
          <Icon v-if="agreed" icon="solar:check-circle-bold" width="14" color="#fff" />
        </view>
        <text class="agreement-text">我已阅读并同意</text>
        <text class="agreement-link">《用户协议》</text>
        <text class="agreement-text">和</text>
        <text class="agreement-link">《隐私政策》</text>
      </view>

      <button class="register-btn" :class="{ loading }" :disabled="loading" @tap="handleRegister">
        <text v-if="loading" class="btn-loading">↻</text>
        <text class="btn-text">{{ loading ? '注册中...' : '注册' }}</text>
      </button>

      <view class="form-footer">
        <text class="footer-text">已有账号？</text>
        <text class="footer-link" @tap="goLogin">去登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { register } from '@/api'
import { setToken, setUser } from '@/utils/auth'

const loading = ref(false)
const agreed = ref(false)
const showPassword = ref(false)
const form = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

function goLogin() {
  uni.navigateBack()
}

async function handleRegister() {
  if (!form.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!form.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!/^1\d{10}$/.test(form.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  if (!form.password || form.password.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' })
    return
  }
  if (form.password !== form.confirmPassword) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }
  if (!agreed.value) {
    uni.showToast({ title: '请同意用户协议', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await register({
      username: form.username,
      password: form.password,
      phone: form.phone,
    })
    uni.showToast({ title: '注册成功', icon: 'success' })
    if (res?.token) {
      setToken(res.token)
      setUser(res.userInfo || { username: form.username })
    }
    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/index' })
    }, 500)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '注册失败', icon: 'none' })
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
  height: 200px;
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
  border-radius: var(--radius-circle);
  background: rgba(255,255,255,0.1);
}

.brand-deco2 {
  position: absolute;
  left: 40px;
  bottom: -20px;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-circle);
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
  width: 64px;
  height: 64px;
  border-radius: 18px;
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

/* 协议行 */
.agreement-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-2xl);
}

.checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-xs);
}

.checkbox.checked {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.agreement-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.agreement-link {
  font-size: var(--font-sm);
  color: var(--color-accent);
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 52px;
  border-radius: var(--radius-full);
  border: none;
  background: linear-gradient(135deg, var(--color-accent), #7C3AED);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
  margin-bottom: var(--space-lg);
}

.register-btn:active {
  opacity: 0.9;
}

.register-btn.loading {
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
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}
</style>
