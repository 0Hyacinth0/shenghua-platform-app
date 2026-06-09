<template>
  <view class="page">
    <!-- 用户信息卡片 -->
    <view class="profile-hero">
      <view class="hero-bg" />
      <view class="hero-content">
        <template v-if="loggedIn">
          <view class="hero-avatar">
            <text class="avatar-text">{{ (userInfo.nickname || '用').charAt(0) }}</text>
          </view>
          <view class="hero-info">
            <text class="hero-name">{{ userInfo.nickname || userInfo.username || '用户' }}</text>
            <view class="hero-tag">
              <view v-if="userInfo.memberLevel" class="member-badge">
                <Icon icon="solar:crown-bold" :size="12" color="#fff" />
                <text class="member-text">{{ userInfo.memberLevel }}</text>
              </view>
              <view class="points-row">
                <Icon icon="solar:star-bold" :size="12" color="rgba(255,255,255,0.7)" />
                <text class="hero-points">积分 {{ userInfo.points }}</text>
              </view>
            </view>
          </view>
          <view class="hero-setting" @tap="goPage('/pages/page/index')">
            <Icon icon="solar:settings-bold" :size="20" color="#fff" />
          </view>
        </template>
        <template v-else>
          <view class="hero-avatar">
            <Icon icon="solar:user-bold" :size="28" color="#fff" />
          </view>
          <view class="hero-info">
            <text class="hero-name hero-login" @tap="goPage('/pages/login/index')">登录 / 注册</text>
            <text class="hero-sub">登录后享受更多权益</text>
          </view>
        </template>
      </view>

      <!-- 订单快捷入口 -->
      <view class="order-shortcuts">
        <view class="order-title">
          <text class="order-title-text">我的订单</text>
          <view class="order-all" @tap="goPage('/pages/order/list')">
            <text class="order-all-text">全部订单</text>
            <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--text-hint)" />
          </view>
        </view>
        <view class="order-grid">
          <view class="order-item" @tap="goPage('/pages/order/list?tab=unpaid')">
            <view class="order-icon-wrap">
              <Icon icon="solar:wallet-bold" :size="24" color="var(--text-primary)" />
              <view v-if="orderCounts.unpaid" class="order-dot">
                <text class="order-dot-text">{{ orderCounts.unpaid }}</text>
              </view>
            </view>
            <text class="order-label">待付款</text>
          </view>
          <view class="order-item" @tap="goPage('/pages/order/list?tab=unshipped')">
            <view class="order-icon-wrap">
              <Icon icon="solar:box-bold" :size="24" color="var(--text-primary)" />
              <view v-if="orderCounts.unshipped" class="order-dot">
                <text class="order-dot-text">{{ orderCounts.unshipped }}</text>
              </view>
            </view>
            <text class="order-label">待发货</text>
          </view>
          <view class="order-item" @tap="goPage('/pages/order/list?tab=shipped')">
            <view class="order-icon-wrap">
              <Icon icon="solar:delivery-bold" :size="24" color="var(--text-primary)" />
              <view v-if="orderCounts.shipped" class="order-dot">
                <text class="order-dot-text">{{ orderCounts.shipped }}</text>
              </view>
            </view>
            <text class="order-label">待收货</text>
          </view>
          <view class="order-item" @tap="goPage('/pages/order/list?tab=received')">
            <view class="order-icon-wrap">
              <Icon icon="solar:check-circle-bold" :size="24" color="var(--text-primary)" />
            </view>
            <text class="order-label">已完成</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 工具栏 -->
    <view class="profile-tools">
      <view class="tool-grid">
        <view class="tool-item" @tap="goPage('/pages/coupon/index')">
          <view class="tool-icon" style="background: #FEF2F2">
            <Icon icon="solar:ticket-bold" :size="20" color="#EF4444" />
          </view>
          <text class="tool-label">优惠券</text>
        </view>
        <view class="tool-item" @tap="goPage('/pages/signIn/index')">
          <view class="tool-icon" style="background: #FFFBEB">
            <Icon icon="solar:check-circle-bold" :size="20" color="#F59E0B" />
          </view>
          <text class="tool-label">签到</text>
        </view>
        <view class="tool-item" @tap="goPage('/pages/seckill/index')">
          <view class="tool-icon" style="background: #F5F3FF">
            <Icon icon="solar:flash-bold" :size="20" color="#8B5CF6" />
          </view>
          <text class="tool-label">秒杀</text>
        </view>
        <view class="tool-item" @tap="goPage('/pages/groupBuy/index')">
          <view class="tool-icon" style="background: #EFF6FF">
            <Icon icon="solar:users-group-rounded-bold" :size="20" color="#3B82F6" />
          </view>
          <text class="tool-label">拼团</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="profile-menu">
      <view class="menu-group">
        <view class="menu-item" @tap="goPage('/pages/course/my')">
          <view class="menu-icon"><Icon icon="solar:notebook-bold" :size="18" color="var(--text-secondary)" /></view>
          <text class="menu-label">我的课程</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="16" color="var(--text-hint)" />
        </view>
        <view class="menu-item" @tap="goPage('/pages/address/index')">
          <view class="menu-icon"><Icon icon="solar:map-point-bold" :size="18" color="var(--text-secondary)" /></view>
          <text class="menu-label">收货地址</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="16" color="var(--text-hint)" />
        </view>
        <view class="menu-item" @tap="goPage('/pages/distributor/index')">
          <view class="menu-icon"><Icon icon="solar:wallet-money-bold" :size="18" color="var(--text-secondary)" /></view>
          <text class="menu-label">分销中心</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="16" color="var(--text-hint)" />
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @tap="goPage('/pages/merchant/apply')">
          <view class="menu-icon"><Icon icon="solar:shop-bold" :size="18" color="var(--text-secondary)" /></view>
          <text class="menu-label">商家入驻</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="16" color="var(--text-hint)" />
        </view>
        <view class="menu-item" @tap="goPage('/pages/course/lecturer/apply')">
          <view class="menu-icon"><Icon icon="solar:user-speak-bold" :size="18" color="var(--text-secondary)" /></view>
          <text class="menu-label">讲师入驻</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="16" color="var(--text-hint)" />
        </view>
        <view class="menu-item" @tap="goPage('/pages/message/index')">
          <view class="menu-icon"><Icon icon="solar:bell-bold" :size="18" color="var(--text-secondary)" /></view>
          <text class="menu-label">消息通知</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="16" color="var(--text-hint)" />
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view v-if="loggedIn" class="profile-logout">
      <button class="logout-btn" @tap="handleLogout">
        <Icon icon="solar:logout-3-bold" :size="18" color="var(--color-accent)" />
        <text class="logout-text">退出登录</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getToken, removeToken, getUser } from '@/utils/auth'
import http from '@/utils/http'
import { Icon } from '@iconify/vue'

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

function goPage(url: string) {
  uni.navigateTo({ url })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        removeToken()
        loggedIn.value = false
        uni.showToast({ title: '已退出登录', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/home/index' })
        }, 500)
      }
    }
  })
}

onShow(() => {
  loggedIn.value = !!getToken()
})

onLoad(async () => {
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
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 16px;
}

/* ---- Hero 区域 ---- */
.profile-hero {
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: var(--color-primary);
}

.hero-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 48px 20px 20px;
}

.hero-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 28px;
  color: #fff;
  font-weight: var(--weight-bold);
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: #fff;
  margin-bottom: 4px;
}

.hero-login {
  color: #fff;
}

.hero-sub {
  font-size: var(--font-md);
  color: rgba(255, 255, 255, 0.5);
}

.hero-tag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-text {
  font-size: var(--font-xs);
  color: #fff;
  font-weight: var(--weight-semibold);
}

.points-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hero-points {
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.5);
}

.hero-setting {
  position: absolute;
  top: 48px;
  right: 16px;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- 订单快捷入口 ---- */
.order-shortcuts {
  margin: -12px 16px 0;
  position: relative;
  z-index: 1;
}

.order-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.order-title-text {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.order-all {
  display: flex;
  align-items: center;
  gap: 2px;
}

.order-all-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.order-grid {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  justify-content: space-around;
  box-shadow: var(--shadow-md);
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.order-item:active {
  opacity: 0.7;
}

.order-icon-wrap {
  position: relative;
}

.order-dot {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.order-dot-text {
  color: #fff;
  font-size: 10px;
  font-weight: var(--weight-bold);
}

.order-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* ---- 工具栏 ---- */
.profile-tools {
  margin: 12px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.tool-grid {
  display: flex;
  justify-content: space-around;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tool-item:active {
  opacity: 0.7;
}

.tool-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-label {
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

/* ---- 菜单 ---- */
.profile-menu {
  margin: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-group {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 16px;
}

.menu-item:active {
  background: #fafafa;
}

.menu-item + .menu-item {
  border-top: 0.5px solid #f0f0f0;
}

.menu-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-label {
  flex: 1;
  font-size: var(--font-md);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

/* ---- 退出登录 ---- */
.profile-logout {
  margin: 20px 16px;
  padding-bottom: 16px;
}

.logout-btn {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: var(--shadow-sm);
}

.logout-btn:active {
  background: var(--color-accent-light);
}

.logout-text {
  font-size: var(--font-md);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}
</style>
