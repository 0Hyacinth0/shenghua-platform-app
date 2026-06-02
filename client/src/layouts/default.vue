<template>
  <div class="default-layout">
    <header class="page-nav-bar">
      <button v-if="showBack" class="back-btn" @click="$router.back()">
        ← 返回
      </button>
      <span class="page-nav-title">{{ pageTitle }}</span>
    </header>
    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 判断是否有上一页历史
const showBack = computed(() => {
  return window.history.length > 1
})

const pageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    'productDetail': '商品详情',
    'cart': '购物车',
    'checkout': '确认订单',
    'orders': '我的订单',
    'orderDetail': '订单详情',
    'address': '收货地址',
    'merchantApply': '商家入驻',
    'merchantProducts': '商品管理',
    'coupon': '优惠券',
    'seckill': '限时秒杀',
    'signIn': '每日签到',
    'groupBuy': '拼团',
    'groupBuyCheckout': '拼团下单',
    'page': '',
  }
  return titleMap[(route.name as string)] || ''
})
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  background: #f8f8f8;
  max-width: 480px;
  margin: 0 auto;
}
.page-nav-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
}
.back-btn {
  border: none;
  background: none;
  font-size: 15px;
  color: #1a1a1a;
  cursor: pointer;
  padding: 4px 8px 4px 0;
  font-weight: 480;
}
.page-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-right: 64px; /* 平衡返回按钮宽度 */
}
.page-content {
  padding: 0 16px;
}
</style>
