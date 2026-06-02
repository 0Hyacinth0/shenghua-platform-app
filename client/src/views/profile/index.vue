<template>
  <div class="profile-page">
    <h2 class="page-title">个人中心</h2>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar">
        <a-avatar :size="72" :src="userInfo.avatar">
          <template #icon><UserOutlined /></template>
        </a-avatar>
      </div>
      <div class="user-detail">
        <div class="user-name">{{ userInfo.nickname || userInfo.username || '用户' }}</div>
        <div class="user-phone" v-if="userInfo.phone">{{ userInfo.phone }}</div>
        <div class="user-tags">
          <a-tag v-if="userInfo.memberLevel" color="gold">
            <CrownOutlined /> {{ userInfo.memberLevel }}
          </a-tag>
          <a-tag v-if="userInfo.points !== undefined" color="blue">
            积分：{{ userInfo.points }}
          </a-tag>
        </div>
      </div>
    </div>

    <!-- 功能入口 -->
    <div class="menu-list">
      <div class="menu-group">
        <h3 class="menu-group-title">我的交易</h3>
        <div class="menu-item" @click="$router.push('/orders')">
          <ShoppingOutlined class="menu-icon" />
          <span class="menu-label">我的订单</span>
          <span class="menu-arrow">&gt;</span>
        </div>
        <div class="menu-item" @click="$router.push('/cart')">
          <ShoppingCartOutlined class="menu-icon" />
          <span class="menu-label">购物车</span>
          <span class="menu-arrow">&gt;</span>
        </div>
      </div>

      <div class="menu-group">
        <h3 class="menu-group-title">账户设置</h3>
        <div class="menu-item" @click="$router.push('/address')">
          <EnvironmentOutlined class="menu-icon" />
          <span class="menu-label">收货地址</span>
          <span class="menu-arrow">&gt;</span>
        </div>
        <div class="menu-item" @click="$router.push('/merchant/apply')">
          <ShopOutlined class="menu-icon" />
          <span class="menu-label">商家入驻</span>
          <span class="menu-arrow">&gt;</span>
        </div>
      </div>
    </div>

    <!-- 退出登录 -->
    <div class="logout-wrap">
      <a-button block size="large" @click="handleLogout">退出登录</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { getUser, removeToken } from '@/utils/auth'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'
import {
  UserOutlined,
  CrownOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  ShopOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()

// 从登录状态获取用户信息
const storedUser = getUser()
const userInfo = ref({
  id: storedUser?.id || storedUser?.userId || 'demo_user_001',
  username: storedUser?.username || storedUser?.name || 'demo_user_001',
  nickname: storedUser?.nickname || storedUser?.username || '演示用户',
  avatar: storedUser?.avatar || '',
  phone: storedUser?.phone ? storedUser.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '138****0000',
  memberLevel: '普通会员',
  points: 0,
})

function handleLogout() {
  Modal.confirm({
    title: '退出登录',
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      removeToken()
      message.success('已退出登录')
      // TODO: 跳转到登录页（JeecgBoot对接后替换为实际登录路径）
      router.push('/')
    },
  })
}

onMounted(async () => {
  try {
    const userId = getCurrentUserId()
    const res = await http.get('/mall/user/queryByUserId', { params: { userId } })
    if (res) {
      userInfo.value.points = res.availablePoints || res.totalPoints || 0
      userInfo.value.memberLevel = res.memberLevelId ? '会员' : '普通会员'
    }
  } catch {}
})
</script>

<style scoped>
.profile-page {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-phone {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.user-tags {
  display: flex;
  gap: 8px;
}

.menu-list {
  margin-bottom: 24px;
}

.menu-group {
  margin-bottom: 20px;
}

.menu-group-title {
  font-size: 14px;
  color: #999;
  margin: 0 0 8px;
  padding: 0 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-icon {
  font-size: 20px;
  color: #666;
  margin-right: 12px;
}

.menu-label {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.menu-arrow {
  color: #ccc;
  font-size: 14px;
}

.logout-wrap {
  padding: 24px 0;
}
</style>