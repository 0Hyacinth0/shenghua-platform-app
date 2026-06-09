<template>
  <div class="page-container">
    <!-- 用户信息卡片 -->
    <section class="profile-hero">
      <div class="hero-bg" />
      <div class="hero-content">
        <template v-if="loggedIn">
          <a-avatar :size="64" :src="userInfo.avatar" class="hero-avatar">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <div class="hero-info">
            <div class="hero-name">{{ userInfo.nickname || userInfo.username || '用户' }}</div>
            <div class="hero-tag">
              <span v-if="userInfo.memberLevel" class="member-badge">{{ userInfo.memberLevel }}</span>
              <span class="hero-points">积分 {{ userInfo.points }}</span>
            </div>
          </div>
          <button class="hero-setting" @click="$router.push('/page')">
            <SettingOutlined />
          </button>
        </template>
        <template v-else>
          <a-avatar :size="64" class="hero-avatar">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <div class="hero-info">
            <div class="hero-name hero-login" @click="$router.push('/login')">登录 / 注册</div>
            <div class="hero-sub">登录后享受更多权益</div>
          </div>
        </template>
      </div>

      <!-- 订单快捷入口 -->
      <div class="order-shortcuts">
        <div class="order-title">
          <span>我的订单</span>
          <span class="order-all" @click="$router.push('/orders')">全部订单 <RightOutlined /></span>
        </div>
        <div class="order-grid">
          <div class="order-item" @click="$router.push('/orders?tab=unpaid')">
            <div class="order-icon">
              <WalletOutlined />
              <span v-if="orderCounts.unpaid" class="order-dot">{{ orderCounts.unpaid }}</span>
            </div>
            <span class="order-label">待付款</span>
          </div>
          <div class="order-item" @click="$router.push('/orders?tab=unshipped')">
            <div class="order-icon">
              <GiftOutlined />
              <span v-if="orderCounts.unshipped" class="order-dot">{{ orderCounts.unshipped }}</span>
            </div>
            <span class="order-label">待发货</span>
          </div>
          <div class="order-item" @click="$router.push('/orders?tab=shipped')">
            <div class="order-icon">
              <CarOutlined />
              <span v-if="orderCounts.shipped" class="order-dot">{{ orderCounts.shipped }}</span>
            </div>
            <span class="order-label">待收货</span>
          </div>
          <div class="order-item" @click="$router.push('/orders?tab=received')">
            <div class="order-icon">
              <CheckCircleOutlined />
            </div>
            <span class="order-label">已完成</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 工具栏 -->
    <section class="profile-tools">
      <div class="tool-grid">
        <div class="tool-item" @click="$router.push('/coupon')">
          <div class="tool-icon" style="background: linear-gradient(135deg, #FF4D4F, #FF7875)">
            <GiftOutlined style="color:#fff;font-size:18px" />
          </div>
          <span class="tool-label">优惠券</span>
        </div>
        <div class="tool-item" @click="$router.push('/signIn')">
          <div class="tool-icon" style="background: linear-gradient(135deg, #FA8C16, #FFA940)">
            <CheckCircleOutlined style="color:#fff;font-size:18px" />
          </div>
          <span class="tool-label">签到</span>
        </div>
        <div class="tool-item" @click="$router.push('/seckill')">
          <div class="tool-icon" style="background: linear-gradient(135deg, #722ED1, #B37FEB)">
            <ThunderboltOutlined style="color:#fff;font-size:18px" />
          </div>
          <span class="tool-label">秒杀</span>
        </div>
        <div class="tool-item" @click="$router.push('/groupBuy')">
          <div class="tool-icon" style="background: linear-gradient(135deg, #13C2C2, #5CDBD3)">
            <TeamOutlined style="color:#fff;font-size:18px" />
          </div>
          <span class="tool-label">拼团</span>
        </div>
      </div>
    </section>

    <!-- 功能菜单 -->
    <section class="profile-menu">
      <div class="menu-group">
        <div class="menu-item" @click="$router.push('/course/my')">
          <div class="menu-icon"><ReadOutlined /></div>
          <span class="menu-label">我的课程</span>
          <RightOutlined class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$router.push('/address')">
          <div class="menu-icon"><EnvironmentOutlined /></div>
          <span class="menu-label">收货地址</span>
          <RightOutlined class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$router.push('/distributor')">
          <div class="menu-icon"><ShareAltOutlined /></div>
          <span class="menu-label">分销中心</span>
          <RightOutlined class="menu-arrow" />
        </div>
      </div>

      <div class="menu-group">
        <div class="menu-item" @click="$router.push('/merchant/apply')">
          <div class="menu-icon"><ShopOutlined /></div>
          <span class="menu-label">商家入驻</span>
          <RightOutlined class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$router.push('/course/lecturer/apply')">
          <div class="menu-icon"><IdcardOutlined /></div>
          <span class="menu-label">讲师入驻</span>
          <RightOutlined class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$router.push('/messages')">
          <div class="menu-icon"><BellOutlined /></div>
          <span class="menu-label">消息通知</span>
          <RightOutlined class="menu-arrow" />
        </div>
      </div>
    </section>

    <!-- 退出登录 -->
    <section class="profile-logout" v-if="loggedIn">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  UserOutlined, SettingOutlined, RightOutlined,
  WalletOutlined, GiftOutlined, CarOutlined, CheckCircleOutlined,
  ThunderboltOutlined, TeamOutlined,
  ReadOutlined, EnvironmentOutlined, ShareAltOutlined,
  ShopOutlined, IdcardOutlined, BellOutlined,
} from '@ant-design/icons-vue'
import { getToken, removeToken, getUser } from '@/utils/auth'
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

const orderCounts = ref({ unpaid: 0, unshipped: 0, shipped: 0 })

function handleLogout() {
  Modal.confirm({
    title: '退出登录',
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      removeToken()
      loggedIn.value = false
      message.success('已退出登录')
      router.push('/')
    },
  })
}

onMounted(async () => {
  if (loggedIn.value) {
    try {
      const res: any = await http.get('/mall/user/queryByUserId', { params: { userId: userInfo.value.id } })
      if (res) {
        userInfo.value.points = res.availablePoints || res.totalPoints || 0
        userInfo.value.memberLevel = res.memberLevelId ? '会员' : '普通会员'
      }
    } catch { /* fallback */ }
  }
})
</script>

<style scoped>
/* ---- Hero 区域 ---- */
.profile-hero {
  position: relative;
  margin: 0 16px;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
  background: var(--color-card, #fff);
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, var(--color-primary, #FF4D4F) 0%, #FF7875 100%);
}

.hero-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 32px 20px 20px;
}

.hero-avatar {
  flex-shrink: 0;
  border: 3px solid rgba(255,255,255,0.3);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
}

.hero-login {
  cursor: pointer;
}

.hero-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.8);
}

.hero-tag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255,255,255,0.2);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

.hero-points {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}

.hero-setting {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  color: white;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

/* ---- 订单快捷入口 ---- */
.order-shortcuts {
  margin: 0 20px;
  padding: 16px 0 20px;
}

.order-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.order-title span:first-child {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
}

.order-all {
  font-size: 12px;
  color: var(--color-text-hint, #999);
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.order-grid {
  display: flex;
  justify-content: space-around;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.order-item:active { opacity: 0.7; }

.order-icon {
  position: relative;
  font-size: 24px;
  color: var(--color-text, #1a1a1a);
}

.order-dot {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: var(--color-primary, #FF4D4F);
  color: white;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.order-label {
  font-size: 12px;
  color: var(--color-text-secondary, #666);
}

/* ---- 工具栏 ---- */
.profile-tools {
  margin: 0 16px 12px;
  background: var(--color-card, #fff);
  border-radius: 16px;
  padding: 20px 16px;
}

.tool-grid {
  display: flex;
  justify-content: space-around;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.tool-item:active { opacity: 0.7; }

.tool-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text, #1a1a1a);
}

/* ---- 菜单 ---- */
.profile-menu {
  margin: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-group {
  background: var(--color-card, #fff);
  border-radius: 16px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:active {
  background: var(--color-bg, #f5f5f5);
}

.menu-item + .menu-item {
  border-top: 0.5px solid var(--color-divider, #f0f0f0);
}

.menu-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-bg, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--color-text-secondary, #666);
}

.menu-label {
  flex: 1;
  font-size: 15px;
  color: var(--color-text, #1a1a1a);
  font-weight: 500;
}

.menu-arrow {
  font-size: 12px;
  color: var(--color-text-disabled, #ccc);
}

/* ---- 退出登录 ---- */
.profile-logout {
  margin: 20px 16px;
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px);
}

.logout-btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: var(--color-card, #fff);
  color: var(--color-primary, #FF4D4F);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.logout-btn:active {
  background: var(--color-primary-light, #FFF1F0);
}
</style>
