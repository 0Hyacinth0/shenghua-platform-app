<template>
  <view class="page">
    <!-- 用户信息大色块 (Hero) -->
    <view class="profile-hero-section">
      <view class="color-block-section color-block-section-lilac hero-block">
        <template v-if="loggedIn">
          <view class="hero-content">
            <view class="hero-avatar">
              <text class="avatar-text">{{ (userInfo.nickname || '用').charAt(0) }}</text>
            </view>
            <view class="hero-info">
              <text class="hero-name">{{ userInfo.nickname || userInfo.username || '用户' }}</text>
              <view class="hero-tag-row">
                <view v-if="userInfo.memberLevel" class="member-badge">
                  <Icon icon="solar:crown-bold" :size="12" color="#111" />
                  <text class="member-text">{{ userInfo.memberLevel }}</text>
                </view>
                <view class="points-badge">
                  <Icon icon="solar:star-bold" :size="12" color="#666" />
                  <text class="points-text">积分 {{ userInfo.points }}</text>
                </view>
              </view>
            </view>
            <view class="hero-setting" @tap="goPage('/pages/page/index')">
              <Icon icon="solar:settings-bold" :size="18" color="#111" />
            </view>
          </view>
        </template>
        <template v-else>
          <view class="hero-content">
            <view class="hero-avatar">
              <Icon icon="solar:user-bold" :size="24" color="#111" />
            </view>
            <view class="hero-info" @tap="goPage('/pages/login/index')">
              <text class="hero-name hero-login">登录 / 注册</text>
              <text class="hero-sub">登录后享受更多会员权益</text>
            </view>
          </view>
        </template>
      </view>

      <!-- 我的订单快捷入口 -->
      <view class="order-container card">
        <view class="order-title-row">
          <text class="order-title-text">我的订单</text>
          <view class="order-all" @tap="goPage('/pages/order/list')">
            <text class="order-all-text">全部订单</text>
            <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-text-hint)" />
          </view>
        </view>
        <view class="order-grid">
          <view class="order-item" @tap="goPage('/pages/order/list?tab=unpaid')">
            <view class="order-icon-wrap">
              <Icon icon="solar:wallet-bold" :size="24" color="#111" />
              <view v-if="orderCounts.unpaid" class="order-dot">
                <text class="order-dot-text">{{ orderCounts.unpaid }}</text>
              </view>
            </view>
            <text class="order-label">待付款</text>
          </view>
          <view class="order-item" @tap="goPage('/pages/order/list?tab=unshipped')">
            <view class="order-icon-wrap">
              <Icon icon="solar:box-bold" :size="24" color="#111" />
              <view v-if="orderCounts.unshipped" class="order-dot">
                <text class="order-dot-text">{{ orderCounts.unshipped }}</text>
              </view>
            </view>
            <text class="order-label">待发货</text>
          </view>
          <view class="order-item" @tap="goPage('/pages/order/list?tab=shipped')">
            <view class="order-icon-wrap">
              <Icon icon="solar:delivery-bold" :size="24" color="#111" />
              <view v-if="orderCounts.shipped" class="order-dot">
                <text class="order-dot-text">{{ orderCounts.shipped }}</text>
              </view>
            </view>
            <text class="order-label">待收货</text>
          </view>
          <view class="order-item" @tap="goPage('/pages/order/list?tab=received')">
            <view class="order-icon-wrap">
              <Icon icon="solar:check-circle-bold" :size="24" color="#111" />
            </view>
            <text class="order-label">已完成</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 工具栏 -->
    <view class="profile-tools card">
      <view class="tools-header">
        <text class="tools-title-text">我的服务</text>
      </view>
      <view class="tool-grid">
        <view class="tool-item" @tap="goCart">
          <view class="tool-icon" style="background: var(--color-block-cream)">
            <Icon icon="solar:cart-large-2-bold" :size="20" color="#D97706" />
          </view>
          <text class="tool-label">购物车</text>
        </view>
        <view class="tool-item" @tap="goPage('/pages/coupon/index')">
          <view class="tool-icon" style="background: var(--color-block-pink)">
            <Icon icon="solar:ticket-bold" :size="20" color="#EF4444" />
          </view>
          <text class="tool-label">优惠券</text>
        </view>
        <view class="tool-item" @tap="goPage('/pages/signIn/index')">
          <view class="tool-icon" style="background: var(--color-block-lime)">
            <Icon icon="solar:check-circle-bold" :size="20" color="#4F7E04" />
          </view>
          <text class="tool-label">签到</text>
        </view>
        <view class="tool-item" @tap="goPage('/pages/seckill/index')">
          <view class="tool-icon" style="background: var(--color-block-coral)">
            <Icon icon="solar:flash-bold" :size="20" color="#EA580C" />
          </view>
          <text class="tool-label">秒杀</text>
        </view>
        <view class="tool-item" @tap="goPage('/pages/groupBuy/index')">
          <view class="tool-icon" style="background: var(--color-block-mint)">
            <Icon icon="solar:users-group-rounded-bold" :size="20" color="#0D9488" />
          </view>
          <text class="tool-label">拼团</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="profile-menu">
      <view class="menu-group card">
        <view class="menu-item" @tap="goPage('/pages/course/my')">
          <view class="menu-icon"><Icon icon="solar:notebook-bold" :size="18" color="#111" /></view>
          <text class="menu-label">我的课程</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-text-hint)" />
        </view>
        <view class="menu-item" @tap="goPage('/pages/address/index')">
          <view class="menu-icon"><Icon icon="solar:map-point-bold" :size="18" color="#111" /></view>
          <text class="menu-label">收货地址</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-text-hint)" />
        </view>
        <view class="menu-item" @tap="goPage('/pages/distributor/index')">
          <view class="menu-icon"><Icon icon="solar:wallet-money-bold" :size="18" color="#111" /></view>
          <text class="menu-label">分销中心</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-text-hint)" />
        </view>
      </view>

      <view class="menu-group card">
        <view class="menu-item" @tap="goPage('/pages/merchant/apply')">
          <view class="menu-icon"><Icon icon="solar:shop-bold" :size="18" color="#111" /></view>
          <text class="menu-label">商家入驻</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-text-hint)" />
        </view>
        <view class="menu-item" @tap="goPage('/pages/course/lecturer/apply')">
          <view class="menu-icon"><Icon icon="solar:user-speak-bold" :size="18" color="#111" /></view>
          <text class="menu-label">讲师入驻</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-text-hint)" />
        </view>
        <view class="menu-item" @tap="goPage('/pages/message/index')">
          <view class="menu-icon"><Icon icon="solar:bell-bold" :size="18" color="#111" /></view>
          <text class="menu-label">消息通知</text>
          <Icon icon="solar:alt-arrow-right-bold" :size="14" color="var(--color-text-hint)" />
        </view>
      </view>
    </view>

    <!-- 退出登录药丸按钮 -->
    <view v-if="loggedIn" class="profile-logout">
      <button class="logout-btn btn btn-primary" @tap="handleLogout">
        <Icon icon="solar:logout-3-bold" :size="18" color="#fff" />
        <text class="logout-text">退出登录</text>
      </button>
    </view>
    <CustomTabBar :active="4" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'
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

function goCart() {
  uni.switchTab({ url: '/pages/cart/index' })
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

onShow(async () => {
  uni.hideTabBar({ animation: false })
  loggedIn.value = !!getToken()
  if (loggedIn.value) {
    // 刷新用户信息
    try {
      const res: any = await http.get('/mall/user/queryByUserId', { params: { userId: userInfo.value.id } })
      if (res) {
        userInfo.value.points = res.availablePoints || res.totalPoints || 0
        userInfo.value.memberLevel = res.memberLevelId ? '会员' : '普通会员'
        if (res.nickname) userInfo.value.nickname = res.nickname
      }
    } catch { /* fallback */ }

    // 加载订单计数
    try {
      const countRes: any = await http.get('/mall/order/countByStatus', { params: { userId: userInfo.value.id } })
      if (countRes) {
        orderCounts.value = {
          unpaid: countRes.unpaid || countRes.waitPay || 0,
          unshipped: countRes.unshipped || countRes.waitSend || 0,
          shipped: countRes.shipped || countRes.waitReceive || 0,
        }
      }
    } catch {
      orderCounts.value = { unpaid: 0, unshipped: 0, shipped: 0 }
    }
  }
})

onLoad(() => {
  // onShow 已处理数据加载
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: 16px;
  box-sizing: border-box;
}

/* ---- Hero 区域大色块 ---- */
.profile-hero-section {
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
}

.hero-block {
  margin-bottom: 12px;
  padding: 24px var(--space-base);
  min-height: 120px;
  display: flex;
  align-items: center;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  position: relative;
}

.hero-avatar {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md, 12px);
  background: #ffffff;
  border: 1px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 24px;
  color: #111111;
  font-weight: var(--weight-bold, 700);
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-size: var(--font-xl, 18px);
  font-weight: var(--weight-bold, 700);
  color: #111111;
  margin-bottom: 6px;
  display: block;
}

.hero-login {
  color: #111111;
  text-decoration: underline;
}

.hero-sub {
  font-size: var(--font-sm, 12px);
  color: var(--color-text-secondary, #666);
}

.hero-tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.member-badge {
  background: #ffffff;
  border: 1px solid var(--color-border, #eee);
  padding: 2px 8px;
  border-radius: var(--radius-full, 999px);
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-text {
  font-size: 10px;
  color: #111111;
  font-weight: var(--weight-bold, 700);
}

.points-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
}

.points-text {
  font-size: var(--font-xs, 10px);
  color: var(--color-text-secondary, #666);
  font-weight: var(--weight-medium, 500);
}

.hero-setting {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full, 999px);
  background: #ffffff;
  border: 1px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- 订单快捷入口容器 ---- */
.order-container {
  padding: 16px;
}

.order-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.order-title-text {
  font-size: var(--font-base, 14px);
  font-weight: var(--weight-bold, 700);
  color: var(--color-text, #111);
}

.order-all {
  display: flex;
  align-items: center;
  gap: 2px;
}

.order-all-text {
  font-size: var(--font-sm, 12px);
  color: var(--color-text-secondary, #666);
}

.order-grid {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 50px;
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
  min-width: 15px;
  height: 15px;
  border-radius: var(--radius-full, 999px);
  background: var(--color-commerce, #e4393c);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.order-dot-text {
  color: #fff;
  font-size: 9px;
  font-weight: var(--weight-bold, 700);
}

.order-label {
  font-size: 11px;
  color: var(--color-text-secondary, #666);
}

/* ---- 我的服务工具栏 ---- */
.profile-tools {
  margin: 12px 16px;
  padding: 16px;
}

.tools-header {
  margin-bottom: 12px;
}

.tools-title-text {
  font-size: var(--font-base, 14px);
  font-weight: var(--weight-bold, 700);
  color: var(--color-text, #111);
}

.tool-grid {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 56px;
}

.tool-item:active {
  opacity: 0.7;
}

.tool-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-label {
  font-size: 11px;
  font-weight: var(--weight-medium, 500);
  color: var(--color-text, #111);
}

/* ---- 功能菜单列表 ---- */
.profile-menu {
  margin: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-group {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.menu-item:active {
  background: var(--color-bg-page, #f7f7f8);
}

.menu-item + .menu-item {
  border-top: 1px solid var(--color-border, #eee);
}

.menu-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm, 8px);
  background: var(--color-bg-page, #f7f7f8);
  border: 1px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-label {
  flex: 1;
  font-size: var(--font-base, 14px);
  color: var(--color-text, #111);
  font-weight: var(--weight-medium, 500);
}

/* ---- 退出登录 ---- */
.profile-logout {
  margin: 20px 16px;
  padding-bottom: calc(76px + var(--safe-area-bottom));
}

.logout-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: #111111;
  color: #ffffff;
  font-size: var(--font-base, 14px);
  font-weight: var(--weight-bold, 700);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-btn:active {
  background: #000000;
}
</style>
