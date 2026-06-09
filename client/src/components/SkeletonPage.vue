<template>
  <view class="skeleton-page">
    <!-- 首页骨架屏 -->
    <template v-if="type === 'home'">
      <view class="sk-header">
        <Skeleton variant="rect" width="80px" height="24px" />
        <view class="sk-header-actions">
          <Skeleton variant="avatar" width="36px" height="36px" radius="50%" />
          <Skeleton variant="avatar" width="36px" height="36px" radius="50%" />
        </view>
      </view>
      <Skeleton variant="rect" height="42px" radius="21px" style="margin: 0 0 16px;" />
      <Skeleton variant="card" height="140px" radius="16px" style="margin-bottom: 16px;" />
      <view class="sk-grid-4">
        <Skeleton v-for="i in 4" :key="i" variant="rect" height="72px" radius="12px" />
      </view>
      <view class="sk-scroll-pills">
        <Skeleton v-for="i in 6" :key="i" variant="rect" width="64px" height="32px" radius="16px" />
      </view>
      <view class="sk-grid-2">
        <Skeleton v-for="i in 4" :key="i" variant="rect" height="200px" radius="12px" />
      </view>
    </template>

    <!-- 商品详情骨架屏 -->
    <template v-if="type === 'product'">
      <Skeleton variant="image" height="375px" radius="0" />
      <view class="sk-product-price">
        <Skeleton variant="rect" width="120px" height="28px" radius="4px" />
        <Skeleton variant="rect" width="60px" height="16px" radius="4px" />
      </view>
      <view class="sk-product-title">
        <Skeleton variant="text" height="18px" style="width: 90%;" />
        <Skeleton variant="text" height="18px" style="width: 60%; margin-top: 8px;" />
      </view>
      <view class="sk-product-spec">
        <Skeleton variant="rect" height="48px" radius="0" />
      </view>
      <view class="sk-product-detail">
        <Skeleton variant="text" height="16px" style="width: 30%; margin-bottom: 12px;" />
        <Skeleton v-for="i in 4" :key="i" variant="rect" height="14px" :style="{ width: (90 - i * 10) + '%', marginBottom: '8px' }" radius="4px" />
      </view>
    </template>

    <!-- 购物车骨架屏 -->
    <template v-if="type === 'cart'">
      <view class="sk-cart-header">
        <Skeleton variant="rect" width="80px" height="22px" radius="4px" />
      </view>
      <view v-for="i in 3" :key="i" class="sk-cart-item">
        <Skeleton variant="avatar" width="22px" height="22px" radius="50%" />
        <Skeleton variant="rect" width="80px" height="80px" radius="8px" />
        <view class="sk-cart-info">
          <Skeleton variant="text" height="14px" style="width: 80%;" />
          <Skeleton variant="text" height="12px" style="width: 40%; margin-top: 6px;" />
          <view class="sk-cart-bottom">
            <Skeleton variant="rect" width="60px" height="18px" radius="4px" />
            <Skeleton variant="rect" width="80px" height="28px" radius="8px" />
          </view>
        </view>
      </view>
    </template>

    <!-- 列表骨架屏（分类页、订单列表等）-->
    <template v-if="type === 'list'">
      <view class="sk-list-sidebar">
        <Skeleton v-for="i in 8" :key="i" variant="rect" height="44px" radius="22px" style="margin-bottom: 6px;" />
      </view>
      <view class="sk-list-content">
        <view v-for="i in 4" :key="i" class="sk-list-item">
          <Skeleton variant="rect" width="90px" height="90px" radius="12px" />
          <view class="sk-list-info">
            <Skeleton variant="text" height="14px" style="width: 85%;" />
            <Skeleton variant="text" height="14px" style="width: 55%; margin-top: 6px;" />
            <Skeleton variant="rect" width="80px" height="18px" radius="4px" style="margin-top: auto;" />
          </view>
        </view>
      </view>
    </template>

    <!-- 个人中心骨架屏 -->
    <template v-if="type === 'profile'">
      <Skeleton variant="card" height="160px" radius="16px" style="margin: 16px;" />
      <Skeleton variant="card" height="120px" radius="12px" style="margin: 0 16px 12px;" />
      <view class="sk-grid-5">
        <view v-for="i in 5" :key="i" class="sk-tool-item">
          <Skeleton variant="rect" width="42px" height="42px" radius="12px" />
          <Skeleton variant="rect" width="32px" height="10px" radius="3px" />
        </view>
      </view>
      <Skeleton variant="card" height="160px" radius="12px" style="margin: 12px 16px;" />
      <Skeleton variant="card" height="120px" radius="12px" style="margin: 0 16px;" />
    </template>
  </view>
</template>

<script setup lang="ts">
import Skeleton from './Skeleton.vue'

withDefaults(defineProps<{
  type?: 'home' | 'product' | 'cart' | 'list' | 'profile'
}>(), {
  type: 'home',
})
</script>

<style scoped>
.skeleton-page {
  min-height: 100vh;
  background: var(--bg-page, #F8F9FA);
  box-sizing: border-box;
}

.sk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 16px 14px;
}

.sk-header-actions {
  display: flex;
  gap: 10px;
}

.sk-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 18px;
}

.sk-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 16px;
}

.sk-grid-5 {
  display: flex;
  justify-content: space-between;
  padding: 16px;
}

.sk-tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sk-scroll-pills {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 18px;
  overflow: hidden;
}

.sk-product-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 16px;
  background: #fff;
}

.sk-product-title {
  padding: 0 16px 16px;
  background: #fff;
}

.sk-product-spec {
  margin-top: 8px;
  background: #fff;
}

.sk-product-detail {
  margin-top: 8px;
  padding: 16px;
  background: #fff;
}

.sk-cart-header {
  padding: 12px 16px;
  text-align: center;
  background: #fff;
}

.sk-cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin: 12px 16px 0;
}

.sk-cart-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sk-cart-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.sk-list-sidebar {
  position: fixed;
  left: 0;
  top: 56px;
  bottom: 0;
  width: 96px;
  padding: 10px 6px;
  background: #fff;
  border-right: 1px solid var(--color-border, #eee);
  box-sizing: border-box;
}

.sk-list-content {
  margin-left: 96px;
  padding: 12px;
}

.sk-list-item {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
}

.sk-list-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
