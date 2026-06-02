<template>
  <div class="coupon-page">
    <h2>领券中心</h2>
    <a-spin :spinning="loading">
      <a-row :gutter="[16, 16]">
        <a-col :span="24" v-for="c in coupons" :key="c.id">
          <div class="coupon-card" :class="{ disabled: c.receivedCount >= c.totalCount }">
            <div class="coupon-left">
              <div class="coupon-value">
                <template v-if="c.couponType === 1"><span class="sign">¥</span>{{ c.discountValue }}</template>
                <template v-else-if="c.couponType === 2">{{ c.discountValue * 10 }}<span class="sign">折</span></template>
                <template v-else>免<span class="sign">运费</span></template>
              </div>
              <div class="coupon-type">{{ c.couponType === 1 ? '满减券' : c.couponType === 2 ? '折扣券' : '运费券' }}</div>
            </div>
            <div class="coupon-right">
              <div class="coupon-name">{{ c.couponName }}</div>
              <div class="coupon-condition" v-if="c.minPurchaseAmount > 0">满¥{{ c.minPurchaseAmount }}可用</div>
              <div class="coupon-condition" v-else>无门槛</div>
              <div class="coupon-time">{{ c.startTime?.substr(0,10) }} ~ {{ c.endTime?.substr(0,10) }}</div>
              <div class="coupon-count">已领 {{ c.receivedCount || 0 }}/{{ c.totalCount }}</div>
              <a-button type="primary" size="small" :disabled="!canReceive(c)" @click="handleReceive(c)">{{ canReceive(c) ? '立即领取' : '已领取' }}</a-button>
            </div>
          </div>
        </a-col>
      </a-row>
      <a-empty v-if="coupons.length === 0 && !loading" description="暂无可领优惠券" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
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
  const stock = c.totalCount || 0
  const issued = c.receivedCount || 0
  if (issued >= stock) return false
  const limit = c.limitPerUser || 1
  if ((myCouponCounts.value[c.id] || 0) >= limit) return false
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
.coupon-page { max-width: 600px; margin: 0 auto; padding: 16px; }
h2 { margin: 0 0 12px; font-size: 18px; }
.coupon-card { display: flex; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; }
.coupon-card.disabled { opacity: 0.5; }
.coupon-left { width: 100px; min-width: 100px; background: #e4393c; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 8px; }
.coupon-value { font-size: 24px; font-weight: 700; line-height: 1.2; }
.sign { font-size: 12px; }
.coupon-type { font-size: 11px; margin-top: 2px; opacity: 0.9; }
.coupon-right { flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: center; gap: 3px; min-width: 0; }
.coupon-name { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.coupon-condition { color: #e4393c; font-size: 12px; }
.coupon-time { color: #999; font-size: 11px; }
.coupon-count { color: #999; font-size: 11px; margin-bottom: 4px; }
</style>