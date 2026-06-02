<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="title">注册账号</h1>
      <a-form :model="form" :rules="rules" ref="formRef" @finish="handleRegister" layout="vertical" size="large">
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
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons-vue'
import { register } from '@/api'

const router = useRouter()
const loading = ref(false)
const formRef = ref()
const form = reactive({ username: '', password: '', confirmPassword: '', phone: '' })

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

async function handleRegister() {
  loading.value = true
  try {
    await register({ username: form.username, password: form.password, phone: form.phone })
    router.push('/login')
  } catch {
    // 错误由拦截器处理
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.register-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}
.title {
  text-align: center;
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
}
.footer {
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
