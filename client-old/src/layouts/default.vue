<template>
  <div class="default-layout">
    <header class="page-nav-bar" v-if="pageTitle">
      <button v-if="showBack" class="back-btn" @click="$router.back()">
        <LeftOutlined />
      </button>
      <span class="page-nav-title">{{ pageTitle }}</span>
      <div style="width:32px" />
    </header>
    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { LeftOutlined } from '@ant-design/icons-vue'

const route = useRoute()

const showBack = computed(() => window.history.length > 1)

const pageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    'productDetail': '商品详情',
    'checkout': '确认订单',
    'orders': '我的订单',
    'orderDetail': '订单详情',
    'address': '收货地址',
    'merchantApply': '商家入驻',
    'merchantProducts': '商品管理',
    'coupon': '领券中心',
    'seckill': '限时秒杀',
    'signIn': '每日签到',
    'groupBuy': '拼团专区',
    'groupBuyCheckout': '拼团下单',
    'distributor': '分销中心',
    'messages': '消息',
    'learn': '学习',
    'course': '课程',
    'courseMy': '我的课程',
    'courseDetail': '课程详情',
    'courseCheckout': '课程下单',
    'lecturerApply': '讲师入驻',
    'lecturerCourses': '我的课程',
    'lecturerIncome': '收益管理',
  }
  return titleMap[(route.name as string)] || ''
})
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px);
}

.page-nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  min-height: 48px;
  background: var(--color-card, #fff);
  border-bottom: 0.5px solid var(--color-divider, #f0f0f0);
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-text, #1a1a1a);
  background: transparent;
  border: none;
  cursor: pointer;
}

.page-nav-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
}

.page-content {
  padding: 0;
}
</style>
