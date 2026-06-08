<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="title">盛桦商城</h1>
      <a-form :model="form" :rules="rules" ref="formRef" @finish="handleLogin" layout="vertical" size="large">
        <a-form-item name="username">
          <a-input v-model:value="form.username" placeholder="用户名" autocomplete="username">
            <template #prefix><user-outlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="password">
          <a-input-password v-model:value="form.password" placeholder="密码" autocomplete="current-password">
            <template #prefix><lock-outlined /></template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading" block>登录</a-button>
        </a-form-item>
      </a-form>
      <div class="footer">
        没有账号？<router-link to="/register">立即注册</router-link>
      </div>
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
      router.push('/')
    } else if (res?.success === false) {
      message.error(res?.message || '登录失败')
    } else {
      setToken(res?.token || 'dummy_token')
      setUser(res?.userInfo || { username: form.username })
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
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
}
.login-card {
  width: 100%;
  padding: 40px 32px;
  background: #fff;
  border-radius: 16px;
}
.title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 32px;
  letter-spacing: -0.02em;
}
.footer {
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>
