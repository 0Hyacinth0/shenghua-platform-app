<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">&lsaquo;</text>
      </view>
      <text class="nav-title">确认订单</text>
      <view style="width: 36px;" />
    </view>

    <view v-if="loading" class="loading-wrap">
      <view class="loading-spinner" />
    </view>

    <template v-else-if="course">
      <!-- 课程信息 -->
      <view class="course-card">
        <view class="card-cover" :style="{ background: course.coverColor || defaultGradient }">
          <view class="card-play">
            <Icon icon="solar:play-bold" width="14" height="14" color="var(--color-primary)" />
          </view>
        </view>
        <view class="card-info">
          <text class="card-title">{{ course.title }}</text>
          <view class="card-meta">
            <text class="meta-text">{{ course.totalLessons || 0 }}课时</text>
            <text class="meta-dot">·</text>
            <text class="meta-text">{{ course.studentCount || 0 }}人学习</text>
          </view>
          <text class="card-price">¥{{ course.price }}</text>
        </view>
      </view>

      <!-- 优惠券 -->
      <view class="coupon-card" @tap="onSelectCoupon">
        <text class="coupon-label">优惠券</text>
        <view class="coupon-value">
          <text v-if="selectedCoupon" class="coupon-selected">-¥{{ selectedCoupon.amount }}</text>
          <text v-else class="coupon-placeholder">{{ availableCoupons.length > 0 ? availableCoupons.length + '张可用' : '暂无可用' }}</text>
          <Icon icon="solar:alt-arrow-right-bold" width="16" height="16" color="var(--text-hint)" />
        </view>
      </view>

      <!-- 价格明细 -->
      <view class="price-card">
        <text class="price-title">价格明细</text>
        <view class="price-row">
          <text class="price-label">课程金额</text>
          <text class="price-value">¥{{ course.price }}</text>
        </view>
        <view v-if="selectedCoupon" class="price-row">
          <text class="price-label">优惠券抵扣</text>
          <text class="price-discount">-¥{{ selectedCoupon.amount }}</text>
        </view>
        <view class="price-divider" />
        <view class="price-row total">
          <text class="price-label">实付金额</text>
          <view class="total-price">
            <text class="price-symbol">¥</text>
            <text class="price-amount">{{ totalAmount }}</text>
          </view>
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="pay-card">
        <text class="pay-title">支付方式</text>
        <view class="pay-item" v-for="pay in payMethods" :key="pay.key" @tap="selectedPay = pay.key">
          <view class="pay-icon" :style="{ background: pay.color }">
            <text class="pay-icon-text">{{ pay.icon }}</text>
          </view>
          <text class="pay-label">{{ pay.label }}</text>
          <view class="pay-radio" :class="{ checked: selectedPay === pay.key }">
            <Icon v-if="selectedPay === pay.key" icon="solar:check-circle-bold" width="16" height="16" color="#fff" />
          </view>
        </view>
      </view>

      <!-- 订单备注 -->
      <view class="remark-card">
        <text class="remark-label">订单备注</text>
        <input class="remark-input" placeholder="选填：有什么要告诉卖家的" />
      </view>

      <view class="bottom-spacer" />

      <!-- 底部提交栏 -->
      <view class="submit-bar">
        <view class="submit-left">
          <text class="submit-label">合计：</text>
          <view class="submit-price">
            <text class="submit-symbol">¥</text>
            <text class="submit-amount">{{ totalAmount }}</text>
          </view>
        </view>
        <button class="submit-btn" @tap="onSubmit">
          <text class="submit-btn-text">提交订单</text>
        </button>
      </view>
    </template>

    <view v-else class="empty-wrap">
      <Icon icon="solar:document-bold" width="48" height="48" color="var(--text-hint)" />
      <text class="empty-text">课程信息加载失败</text>
      <view class="empty-btn" @tap="goBack">
        <text class="empty-btn-text">返回</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import http from '@/utils/http'
import { imgUrl, getUserCoupons } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(true)
const course = ref<any>(null)
const availableCoupons = ref<any[]>([])
const selectedCoupon = ref<any>(null)
const selectedPay = ref('wechat')
let courseId = ''

const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

const payMethods = [
  { key: 'wechat', label: '微信支付', icon: '微', color: '#07C160' },
  { key: 'alipay', label: '支付宝', icon: '支', color: '#1677FF' },
]

const totalAmount = computed(() => {
  const price = course.value?.price || 0
  const discount = selectedCoupon.value?.amount || 0
  return Math.max(0, price - discount).toFixed(2)
})

function goBack() {
  uni.navigateBack()
}

function onSelectCoupon() {
  if (availableCoupons.value.length === 0) return
  if (selectedCoupon.value) {
    selectedCoupon.value = null
  } else {
    selectedCoupon.value = availableCoupons.value[0]
  }
}

async function loadCourse() {
  try {
    const res = await http.get('/course/queryById', { params: { id: courseId } })
    course.value = res || null
  } catch {
    course.value = null
  }
}

async function loadCoupons() {
  try {
    const res = await getUserCoupons(getCurrentUserId())
    const list: any[] = Array.isArray(res) ? res : (res?.records || [])
    availableCoupons.value = list.filter((c: any) => c.status === 0)
  } catch {
    availableCoupons.value = []
  }
}

async function onSubmit() {
  try {
    await http.post('/course/order/create', {
      courseId,
      userId: getCurrentUserId(),
      couponId: selectedCoupon.value?.id,
      payType: selectedPay.value,
    })
    uni.showToast({ title: '购买成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/course/watch?courseId=' + courseId })
    }, 500)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '购买失败', icon: 'none' })
  }
}

onLoad((options: any) => {
  courseId = options?.courseId || ''
  loading.value = true
  Promise.all([loadCourse(), loadCoupons()]).finally(() => {
    loading.value = false
  })
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 80px;
}

/* 顶部导航 */
.nav-bar {
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px var(--space-lg) var(--space-md);
}

.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: var(--font-3xl);
  color: var(--text-primary);
  font-weight: var(--weight-normal);
}

.nav-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

/* 课程卡片 */
.course-card {
  background: var(--bg-card);
  margin-top: var(--space-sm);
  padding: var(--space-lg);
  display: flex;
  gap: var(--space-md);
}

.card-cover {
  width: 100px;
  height: 70px;
  border-radius: var(--radius-sm);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-play {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.card-title {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--space-xs);
}

.meta-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.meta-dot {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.card-price {
  font-size: var(--font-2xl);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  margin-top: var(--space-xs);
}

/* 优惠券 */
.coupon-card {
  background: var(--bg-card);
  margin-top: var(--space-sm);
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.coupon-card:active {
  background: var(--bg-gray);
}

.coupon-label {
  font-size: var(--font-base);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

.coupon-value {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.coupon-selected {
  font-size: var(--font-base);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}

.coupon-placeholder {
  font-size: var(--font-base);
  color: var(--text-hint);
}

/* 价格明细 */
.price-card {
  background: var(--bg-card);
  margin-top: var(--space-sm);
  padding: var(--space-lg);
}

.price-title {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.price-row.total {
  margin-top: var(--space-sm);
}

.price-label {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.price-value {
  font-size: var(--font-base);
  color: var(--text-primary);
}

.price-discount {
  font-size: var(--font-base);
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

.price-divider {
  height: 1px;
  background: var(--bg-gray);
  margin: var(--space-sm) 0;
}

.total-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: var(--font-base);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}

.price-amount {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}

/* 支付方式 */
.pay-card {
  background: var(--bg-card);
  margin-top: var(--space-sm);
  padding: var(--space-lg);
}

.pay-title {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.pay-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 10px 0;
}

.pay-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-icon-text {
  font-size: var(--font-xl);
  color: var(--text-white);
  font-weight: var(--weight-semibold);
}

.pay-label {
  flex: 1;
  font-size: var(--font-base);
  color: var(--text-primary);
}

.pay-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--text-hint);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-radio.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

/* 订单备注 */
.remark-card {
  background: var(--bg-card);
  margin-top: var(--space-sm);
  padding: var(--space-lg);
}

.remark-label {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: 10px;
  display: block;
}

.remark-input {
  width: 100%;
  height: 40px;
  font-size: var(--font-base);
  color: var(--text-primary);
  background: var(--bg-gray);
  border-radius: var(--radius-sm);
  padding: 0 var(--space-md);
}

.bottom-spacer {
  height: var(--space-lg);
}

/* 底部提交栏 */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  padding-bottom: var(--space-3xl);
  background: var(--bg-card);
  border-top: 1px solid var(--bg-gray);
  z-index: 100;
}

.submit-left {
  display: flex;
  align-items: baseline;
}

.submit-label {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.submit-price {
  display: flex;
  align-items: baseline;
}

.submit-symbol {
  font-size: var(--font-lg);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}

.submit-amount {
  font-size: var(--font-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}

.submit-btn {
  width: 160px;
  height: 48px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:active {
  opacity: 0.9;
}

.submit-btn-text {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-white);
}

/* 加载状态 */
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-gray);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 40px;
}

.empty-text {
  font-size: var(--font-base);
  color: var(--text-hint);
  margin-bottom: var(--space-lg);
  margin-top: var(--space-md);
}

.empty-btn {
  padding: 10px var(--space-3xl);
  background: var(--color-primary);
  border-radius: var(--radius-xl);
}

.empty-btn:active {
  opacity: 0.9;
}

.empty-btn-text {
  font-size: var(--font-base);
  color: var(--text-white);
  font-weight: var(--weight-medium);
}
</style>
