<template>
  <div class="login-page">
    <!-- 顶部品牌区 -->
    <div class="login-brand">
      <div class="brand-logo">
        <div class="logo-icon">盛</div>
      </div>
      <h1 class="brand-name">盛桦商城</h1>
      <p class="brand-slogan">品质生活，从这里开始</p>
    </div>

    <!-- 登录表单 -->
    <div class="login-form">
      <a-form :model="form" :rules="rules" ref="formRef" @finish="handleLogin" layout="vertical">
        <a-form-item name="username">
          <a-input
            v-model:value="form.username"
            placeholder="请输入用户名"
            autocomplete="username"
            size="large"
            class="form-input"
          >
            <template #prefix><UserOutlined style="color:#bbb" /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="password">
          <a-input-password
            v-model:value="form.password"
            placeholder="请输入密码"
            autocomplete="current-password"
            size="large"
            class="form-input"
          >
            <template #prefix><LockOutlined style="color:#bbb" /></template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <button
            type="submit"
            class="login-btn"
            :class="{ loading }"
            :disabled="loading"
          >
            <a-spin v-if="loading" size="small" style="margin-right:8px" />
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </a-form-item>
      </a-form>

      <div class="login-footer">
        <span class="login-link" @click="$router.push('/register')">注册账号</span>
        <span class="login-divider">|</span>
        <span class="login-link">忘记密码</span>
      </div>
    </div>

    <!-- 底部协议 -->
    <div class="login-agreement">
      登录即表示同意
      <span class="agreement-link">《用户协议》</span>
      和
      <span class="agreement-link">《隐私政策》</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { login } from '@/api'
import { setToken, setUser } from '@/utils/auth'

const router = useRouter()
const loading = ref(false)
const formRef = ref()
const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
}

async function handleLogin() {
  loading.value = true
  try {
    const res = await login({ username: form.username, password: form.password })
    if (res?.token) {
      setToken(res.token)
      setUser(res.userInfo || { username: form.username })
      message.success('登录成功')
      router.push('/')
    } else if (res?.success === false) {
      message.error(res?.message || '登录失败')
    } else {
      setToken(res?.token || 'dummy_token')
      setUser(res?.userInfo || { username: form.username })
      message.success('登录成功')
      router.push('/')
    }
  } catch (e: any) {
    message.error(e?.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-card, #fff);
  padding: 0 24px;
}

/* ---- 品牌区 ---- */
.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
  margin-bottom: 48px;
}

.brand-logo {
  margin-bottom: 16px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--color-primary, #FF4D4F) 0%, #FF7875 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
  box-shadow: 0 8px 24px rgba(255, 77, 79, 0.3);
}

.brand-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.brand-slogan {
  font-size: 14px;
  color: var(--color-text-hint, #999);
  margin: 0;
}

/* ---- 表单 ---- */
.login-form {
  width: 100%;
  max-width: 360px;
}

.login-form :deep(.ant-form-item) {
  margin-bottom: 20px;
}

.form-input {
  border-radius: 12px !important;
  height: 48px;
}

.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 999px;
  border: none;
  background: var(--color-primary, #FF4D4F);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

.login-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.login-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.login-link {
  font-size: 13px;
  color: var(--color-text-secondary, #666);
  cursor: pointer;
}

.login-link:active {
  color: var(--color-primary, #FF4D4F);
}

.login-divider {
  font-size: 12px;
  color: var(--color-border, #eee);
}

/* ---- 协议 ---- */
.login-agreement {
  position: fixed;
  bottom: 32px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-hint, #999);
}

.agreement-link {
  color: var(--color-primary, #FF4D4F);
  cursor: pointer;
}
</style>
