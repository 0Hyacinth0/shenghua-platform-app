<template>
  <div class="coupon-page">
    <header class="page-header">
      <button class="page-back" @click="$router.back()"><LeftOutlined /></button>
      <span class="page-title">领券中心</span>
      <div style="width:32px" />
    </header>

    <a-spin :spinning="loading">
      <div v-if="coupons.length === 0 && !loading" class="empty-wrap">
        <GiftOutlined class="empty-icon" />
        <div class="empty-text">暂无可领优惠券</div>
      </div>

      <div v-else class="coupon-list">
        <div v-for="c in coupons" :key="c.id" class="coupon-card" :class="{ disabled: !canReceive(c) }">
          <div class="coupon-left">
            <div class="coupon-value">
              <template v-if="c.couponType === 1"><span class="symbol">¥</span>{{ c.discountValue }}</template>
              <template v-else-if="c.couponType === 2">{{ c.discountValue * 10 }}<span class="symbol">折</span></template>
              <template v-else>免<span class="symbol">运费</span></template>
            </div>
            <div class="coupon-type">{{ c.couponType === 1 ? '满减券' : c.couponType === 2 ? '折扣券' : '运费券' }}</div>
          </div>
          <div class="coupon-right">
            <div class="coupon-name">{{ c.couponName }}</div>
            <div class="coupon-condition">{{ c.minPurchaseAmount > 0 ? '满¥' + c.minPurchaseAmount + '可用' : '无门槛' }}</div>
            <div class="coupon-time">{{ c.startTime?.substr(0,10) }} ~ {{ c.endTime?.substr(0,10) }}</div>
            <div class="coupon-bottom">
              <span class="coupon-progress">已领 {{ c.receivedCount || 0 }}/{{ c.totalCount }}</span>
              <button class="coupon-btn" :disabled="!canReceive(c)" @click="handleReceive(c)">
                {{ canReceive(c) ? '立即领取' : '已领取' }}
              </button>
            </div>
          </div>
          <!-- 裁切装饰 -->
          <div class="coupon-notch top" />
          <div class="coupon-notch bottom" />
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { LeftOutlined, GiftOutlined } from '@ant-design/icons-vue'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const currentUserId = getCurrentUserId()
const coupons = ref<any[]>([])
const myCouponCounts = ref<Record<string, number>>({})
const loading = ref(false)

async function loadCoupons() {
  loading.value = true
  try {
    const [tplRes, myRes] = await Promise.all([
      http.get('/mall/coupon/list', { params: { status: 1 } }),
      http.get('/mall/userCoupon/list', { params: { userId: currentUserId, pageSize: 999 } }),
    ])
    coupons.value = tplRes?.records || []
    const myList: any[] = myRes?.records || []
    const counts: Record<string, number> = {}
    myList.forEach((c: any) => { counts[c.templateId] = (counts[c.templateId] || 0) + 1 })
    myCouponCounts.value = counts
  } catch { coupons.value = [] }
  finally { loading.value = false }
}

function canReceive(c: any) {
  if ((c.receivedCount || 0) >= (c.totalCount || 0)) return false
  if ((myCouponCounts.value[c.id] || 0) >= (c.limitPerUser || 1)) return false
  return true
}

async function handleReceive(c: any) {
  try {
    await http.post('/mall/userCoupon/receive', null, { params: { userId: currentUserId, templateId: c.id } })
    message.success('领取成功')
    loadCoupons()
  } catch { message.error('领取失败') }
}

onMounted(loadCoupons)
</script>

<style scoped>
.coupon-page {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px);
}

.page-header {
  position: sticky; top: 0; z-index: 100;
  background: var(--color-card, #fff);
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; min-height: 48px;
}

.page-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--color-text, #1a1a1a); background: transparent; }
.page-title { font-size: 17px; font-weight: 600; color: var(--color-text, #1a1a1a); }

.coupon-list { padding: 12px 16px; }

.coupon-card {
  display: flex;
  background: var(--color-card, #fff);
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-sm);
}

.coupon-card.disabled { opacity: 0.5; }

.coupon-left {
  width: 100px;
  min-width: 100px;
  background: linear-gradient(135deg, var(--color-primary, #FF4D4F) 0%, #FF7875 100%);
  color: white;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 16px 8px;
}

.coupon-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
.coupon-value .symbol { font-size: 14px; }
.coupon-type { font-size: 11px; margin-top: 4px; opacity: 0.85; }

.coupon-right {
  flex: 1; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 4px;
  min-width: 0;
}

.coupon-name { font-size: 14px; font-weight: 600; color: var(--color-text, #1a1a1a); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.coupon-condition { font-size: 12px; color: var(--color-primary, #FF4D4F); }
.coupon-time { font-size: 11px; color: var(--color-text-hint, #999); }

.coupon-bottom {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: auto; padding-top: 6px;
}

.coupon-progress { font-size: 11px; color: var(--color-text-hint, #999); }

.coupon-btn {
  padding: 5px 14px;
  border-radius: 999px;
  border: none;
  background: var(--color-primary, #FF4D4F);
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.coupon-btn:disabled { background: var(--color-border, #eee); color: var(--color-text-hint, #999); cursor: not-allowed; }
.coupon-btn:active:not(:disabled) { opacity: 0.85; }

/* 裁切装饰 */
.coupon-notch {
  position: absolute;
  left: 98px;
  width: 16px;
  height: 8px;
  background: var(--color-bg-page, #F7F7F8);
  border-radius: 0 0 8px 8px;
}

.coupon-notch.top { top: 0; border-radius: 0 0 8px 8px; }
.coupon-notch.bottom { bottom: 0; border-radius: 8px 8px 0 0; }
</style>
