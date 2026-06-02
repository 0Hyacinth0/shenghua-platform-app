<template>
  <a-layout class="layout">
    <a-layout-header class="header">
      <div class="header-inner">
        <router-link to="/" class="logo">盛桦商城</router-link>
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索商品"
          class="search"
          @search="onSearch"
        />
        <div class="nav-right">
          <router-link to="/cart" class="nav-item">
            <a-badge :count="cartCount">
              <ShoppingCartOutlined style="font-size: 22px" />
            </a-badge>
            <span class="nav-label">购物车</span>
          </router-link>
          <template v-if="loggedIn">
            <router-link to="/seckill" class="nav-item">
              <span class="nav-label" style="color:#e4393c">秒杀</span>
            </router-link>
            <router-link to="/groupBuy" class="nav-item">
              <span class="nav-label" style="color:#fa8c16">拼团</span>
            </router-link>
            <router-link to="/signIn" class="nav-item">
              <span class="nav-label" style="color:#fa8c16">签到</span>
            </router-link>
            <router-link to="/coupon" class="nav-item">
              <span class="nav-label">领券中心</span>
            </router-link>
            <router-link to="/orders" class="nav-item">
              <span class="nav-label">我的订单</span>
            </router-link>
            <router-link to="/profile" class="nav-item">
              <span class="nav-label">{{ username }}</span>
            </router-link>
            <a class="nav-item" @click="handleLogout">
              <span class="nav-label">退出</span>
            </a>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-item">
              <span class="nav-label">登录</span>
            </router-link>
          </template>
        </div>
      </div>
    </a-layout-header>
    <a-layout-content class="content">
      <router-view />
    </a-layout-content>
    <a-layout-footer class="footer">
      盛桦商城 &copy; 2026
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ShoppingCartOutlined } from '@ant-design/icons-vue'
import { getToken, removeToken, getUser } from '@/utils/auth'
import { getCartList } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
const keyword = ref('')
const cartCount = ref(0)
const loggedIn = ref(!!getToken())
const username = ref(getUser()?.username || '')

async function fetchCartCount() {
  if (!loggedIn.value) return
  try {
    const userId = getCurrentUserId()
    const res = await getCartList(userId)
    if (Array.isArray(res)) {
      cartCount.value = res.length
    }
  } catch {
    cartCount.value = 0
  }
}

function onSearch(value: string) {
  if (!value.trim()) return
  router.push({ name: 'home', query: { keyword: value.trim() } })
}

function handleLogout() {
  removeToken()
  loggedIn.value = false
  username.value = ''
  cartCount.value = 0
  router.push('/login')
}

const route = useRoute()
watch(() => route.path, () => { fetchCartCount() })
fetchCartCount()
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  height: 56px;
  line-height: 56px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
  gap: 32px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #e4393c;
  white-space: nowrap;
  text-decoration: none;
}

.search {
  flex: 1;
  max-width: 480px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.nav-item:hover {
  color: #e4393c;
}

.nav-label {
  margin-left: 4px;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  min-height: calc(100vh - 56px - 52px);
}

.footer {
  text-align: center;
  color: #999;
  font-size: 13px;
  background: #fff;
  padding: 14px 24px;
}
</style>