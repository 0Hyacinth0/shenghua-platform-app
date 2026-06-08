<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="title">注册账号</h1>
      <a-form :model="form" :rules="rules" ref="formRef" @finish="handleRegister" @finishFailed="onFinishFailed" layout="vertical" size="large">
        <a-form-item name="username">
          <a-input v-model:value="form.username" placeholder="用户名" autocomplete="username">
            <template #prefix><user-outlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="password">
          <a-input-password v-model:value="form.password" placeholder="密码（至少6位）" autocomplete="new-password">
            <template #prefix><lock-outlined /></template>
          </a-input-password>
        </a-form-item>
        <a-form-item name="confirmPassword">
          <a-input-password v-model:value="form.confirmPassword" placeholder="确认密码">
            <template #prefix><lock-outlined /></template>
          </a-input-password>
        </a-form-item>
        <a-form-item name="phone">
          <a-input v-model:value="form.phone" placeholder="手机号（选填）">
            <template #prefix><phone-outlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="inviteCode">
          <a-input v-model:value="form.inviteCode" placeholder="邀请码（选填）">
            <template #prefix><team-outlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading" block>注册</a-button>
        </a-form-item>
      </a-form>
      <div class="footer">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, PhoneOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { register } from '@/api'

const router = useRouter()
const loading = ref(false)
const formRef = ref()
const form = reactive({ username: '', password: '', confirmPassword: '', phone: '', inviteCode: '' })

const validateConfirmPassword = (_rule: any, value: string) => {
  if (value && value !== form.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名3-20个字符' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6位' },
  ],
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
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
}
.register-card {
  width: 100%;
  padding: 36px 28px;
  background: #fff;
  border-radius: 16px;
}
.title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 28px;
  letter-spacing: -0.02em;
}
.footer {
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>
