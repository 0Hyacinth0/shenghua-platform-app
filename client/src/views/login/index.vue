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
    console.log('login response:', res)
    if (res?.token) {
      setToken(res.token)
      setUser(res.userInfo || { username: form.username })
      router.push('/')
    } else {
      console.error('no token in response')
    }
  } catch (e: any) {
    console.error('login error:', e)
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
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
