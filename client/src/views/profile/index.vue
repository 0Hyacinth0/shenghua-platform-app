<template>
  <div class="profile-page">
    <!-- 用户信息卡片 -->
    <section class="profile-section">
      <div class="user-card">
        <template v-if="loggedIn">
          <div class="user-avatar">
            <a-avatar :size="56" :src="userInfo.avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </div>
          <div class="user-detail">
            <div class="user-name">{{ userInfo.nickname || userInfo.username || '用户' }}</div>
            <div class="user-sub">
              <a-tag v-if="userInfo.memberLevel" color="default" size="small">
                <CrownOutlined /> {{ userInfo.memberLevel }}
              </a-tag>
              <span v-if="userInfo.points !== undefined" class="points-info">
                积分：{{ userInfo.points }}
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="user-avatar">
            <a-avatar :size="56"><template #icon><UserOutlined /></template></a-avatar>
          </div>
          <div class="user-detail">
            <div class="user-name" @click="$router.push('/login')">登录 / 注册</div>
            <div class="user-sub">登录后享受更多权益</div>
          </div>
        </template>
      </div>
    </section>

    <!-- 常用功能入口 -->
    <section class="profile-section">
      <div class="menu-group">
        <h3 class="menu-group-title">我的交易</h3>
        <div class="menu-item" @click="$router.push('/orders')">
          <span class="menu-icon-wrap" style="background:#D8F0E8"><SnippetsOutlined /></span>
          <span class="menu-label">我的订单</span>
          <RightOutlined class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$router.push('/cart')">
          <span class="menu-icon-wrap" style="background:#FDE8D8"><ShoppingCartOutlined /></span>
          <span class="menu-label">购物车</span>
          <span class="menu-badge" v-if="cartBadge > 0">{{ cartBadge }}</span>
          <RightOutlined class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$router.push('/coupon')">
          <span class="menu-icon-wrap" style="background:#FDE8F0"><GiftOutlined /></span>
          <span class="menu-label">优惠券</span>
          <RightOutlined class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$router.push('/signIn')">
          <span class="menu-icon-wrap" style="background:#E8E0F8"><CheckCircleOutlined /></span>
          <span class="menu-label">每日签到</span>
          <RightOutlined class="menu-arrow" />
        </div>
      </div>
    </section>

    <!-- 更多功能 -->
    <section class="profile-section">
      <div class="menu-group">
        <h3 class="menu-group-title">更多服务</h3>
        <div class="menu-item" @click="$router.push('/seckill')">
          <span class="menu-icon-wrap" style="background:#FDE8E8"><ThunderboltOutlined /></span>
          <span class="menu-label">限时秒杀</span>
          <RightOutlined class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$router.push('/groupBuy')">
          <span class="menu-icon-wrap" style="background:#FFF0E0"><TeamOutlined /></span>
          <span class="menu-label">拼团优惠</span>
          <RightOutlined class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$router.push('/address')">
          <span class="menu-icon-wrap" style="background:#D8E8FD"><EnvironmentOutlined /></span>
          <span class="menu-label">收货地址</span>
          <RightOutlined class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$router.push('/merchant/apply')">
          <span class="menu-icon-wrap" style="background:#E8FDEC"><ShopOutlined /></span>
          <span class="menu-label">商家入驻</span>
          <RightOutlined class="menu-arrow" />
        </div>
      </div>
    </section>

    <!-- 退出登录 -->
    <section class="profile-section" v-if="loggedIn">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </section>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  UserOutlined, CrownOutlined, SnippetsOutlined, ShoppingCartOutlined,
  GiftOutlined, CheckCircleOutlined, ThunderboltOutlined, TeamOutlined,
  EnvironmentOutlined, ShopOutlined, RightOutlined,
} from '@ant-design/icons-vue'
import { getToken, removeToken, getUser } from '@/utils/auth'
import { getCartList } from '@/api'
import { getCurrentUserId } from '@/utils/user'
import http from '@/utils/http'

const router = useRouter()

const loggedIn = ref(!!getToken())
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

const cartBadge = ref(0)

async function fetchCartCount() {
  if (!loggedIn.value) return
  try {
    const userId = getCurrentUserId()
    const res = await getCartList(userId)
    if (Array.isArray(res)) cartBadge.value = res.length
  } catch { cartBadge.value = 0 }
}

function handleLogout() {
  Modal.confirm({
    title: '退出登录',
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      removeToken()
      loggedIn.value = false
      cartBadge.value = 0
      message.success('已退出登录')
      router.push('/')
    },
  })
}

onMounted(async () => {
  fetchCartCount()
  if (loggedIn.value) {
    try {
      const userId = getCurrentUserId()
      const res = await http.get('/mall/user/queryByUserId', { params: { userId } })
      if (res) {
        userInfo.value.points = res.availablePoints || res.totalPoints || 0
        userInfo.value.memberLevel = res.memberLevelId ? '会员' : '普通会员'
      }
    } catch { /* fallback */ }
  }
})
</script>

<style scoped>
.profile-page {
  padding: 0 16px;
  max-width: 480px;
  margin: 0 auto;
}
.profile-section { margin-bottom: 24px; }

.user-card {
  display: flex; align-items: center; gap: 16px;
  padding: 24px 20px;
  background: #fff;
  border-radius: 20px;
  margin-top: 8px;
}
.user-detail { flex: 1; }
.user-name {
  font-size: 20px; font-weight: 600;
  color: #1a1a1a; margin-bottom: 6px;
  letter-spacing: -0.02em;
}
.user-sub {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #999; font-weight: 340;
}
.points-info { font-size: 12px; color: #666; }

.menu-group-title {
  font-size: 12px; color: #bbb; font-weight: 400;
  margin: 0 0 4px; padding: 0 4px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.menu-item {
  display: flex; align-items: center;
  padding: 14px 12px;
  background: #fff;
  border-radius: 14px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s;
  margin-bottom: 4px;
}
.menu-item:active { transform: scale(0.98); }
.menu-icon-wrap {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: #555;
  margin-right: 12px;
  flex-shrink: 0;
}
.menu-label {
  flex: 1;
  font-size: 15px; color: #1a1a1a; font-weight: 480;
}
.menu-badge {
  background: #FF3B30; color: #fff;
  font-size: 11px; min-width: 18px; height: 18px;
  line-height: 18px; text-align: center;
  border-radius: 50px;
  padding: 0 6px; margin-right: 8px;
}
.menu-arrow { color: #ccc; font-size: 14px; }

.logout-btn {
  width: 100%; padding: 14px;
  border-radius: 14px; border: none;
  background: #fff; color: #FF3B30;
  font-size: 15px; font-weight: 480;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.bottom-spacer { height: 100px; }
</style>
