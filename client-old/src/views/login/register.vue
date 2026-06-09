<template>
  <div class="login-page">
    <!-- 顶部 -->
    <header class="page-header">
      <button class="page-back" @click="$router.push('/login')"><LeftOutlined /></button>
      <span class="page-title">注册账号</span>
      <div style="width:32px" />
    </header>

    <!-- 表单 -->
    <div class="login-form">
      <a-form :model="form" :rules="rules" ref="formRef" @finish="handleRegister" @finishFailed="onFinishFailed" layout="vertical">
        <a-form-item name="username">
          <a-input v-model:value="form.username" placeholder="用户名（3-20个字符）" autocomplete="username" size="large" class="form-input">
            <template #prefix><UserOutlined style="color:#bbb" /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="password">
          <a-input-password v-model:value="form.password" placeholder="密码（至少6位）" autocomplete="new-password" size="large" class="form-input">
            <template #prefix><LockOutlined style="color:#bbb" /></template>
          </a-input-password>
        </a-form-item>
        <a-form-item name="confirmPassword">
          <a-input-password v-model:value="form.confirmPassword" placeholder="确认密码" size="large" class="form-input">
            <template #prefix><LockOutlined style="color:#bbb" /></template>
          </a-input-password>
        </a-form-item>
        <a-form-item name="phone">
          <a-input v-model:value="form.phone" placeholder="手机号（选填）" size="large" class="form-input">
            <template #prefix><PhoneOutlined style="color:#bbb" /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="inviteCode">
          <a-input v-model:value="form.inviteCode" placeholder="邀请码（选填）" size="large" class="form-input">
            <template #prefix><TeamOutlined style="color:#bbb" /></template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <button type="submit" class="login-btn" :class="{ loading }" :disabled="loading">
            <a-spin v-if="loading" size="small" style="margin-right:8px" />
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </a-form-item>
      </a-form>

      <div class="login-footer">
        <span>已有账号？</span>
        <span class="login-link" @click="$router.push('/login')">立即登录</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { LeftOutlined, UserOutlined, LockOutlined, PhoneOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { register } from '@/api'

const router = useRouter()
const loading = ref(false)
const formRef = ref()
const form = reactive({ username: '', password: '', confirmPassword: '', phone: '', inviteCode: '' })

const validateConfirmPassword = (_rule: any, value: string) => {
  if (value && value !== form.password) return Promise.reject('两次输入的密码不一致')
  return Promise.resolve()
}

const rules = {
  username: [{ required: true, message: '请输入用户名' }, { min: 3, max: 20, message: '用户名3-20个字符' }],
  password: [{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }],
  confirmPassword: [{ validator: validateConfirmPassword }],
}

function onFinishFailed({ errorFields }: any) {
  if (errorFields?.length) message.warning(errorFields[0].errors?.[0] || '请检查表单')
}

async function handleRegister() {
  loading.value = true
  try {
    await register({ username: form.username, password: form.password, phone: form.phone, inviteCode: form.inviteCode })
    message.success('注册成功，请登录')
    router.push('/login')
  } catch (e: any) {
    message.error(e?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--color-card, #fff);
  padding: 0 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  min-height: 48px;
}

.page-back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-text, #1a1a1a);
  background: transparent;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
}

.login-form {
  padding-top: 24px;
}

.login-form :deep(.ant-form-item) { margin-bottom: 18px; }
.form-input { border-radius: 12px !important; height: 48px; }

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
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
  margin-top: 8px;
}

.login-btn:active { transform: scale(0.98); }
.login-btn.loading { opacity: 0.7; cursor: not-allowed; }

.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  font-size: 13px;
  color: var(--color-text-hint, #999);
}

.login-link {
  color: var(--color-primary, #FF4D4F);
  cursor: pointer;
  font-weight: 500;
}
</style>
