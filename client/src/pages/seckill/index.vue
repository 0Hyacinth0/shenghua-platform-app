<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="20" color="#fff" />
      </view>
      <text class="nav-title">限时抢购</text>
      <view style="width: 36px;" />
    </view>

    <!-- 时间场次 -->
    <scroll-view scroll-x class="time-scroll">
      <view
        v-for="session in sessions"
        :key="session.id"
        class="time-item"
        :class="{ active: activeSessionId === session.id }"
        @tap="onSelectSession(session)"
      >
        <text class="time-text" :class="{ active: activeSessionId === session.id }">{{ session.time }}</text>
        <text class="time-label" :class="{ active: activeSessionId === session.id }">{{ session.label }}</text>
      </view>
    </scroll-view>

    <!-- 倒计时 -->
    <view class="countdown-bar">
      <Icon icon="solar:clock-circle-bold" width="16" color="var(--text-secondary)" />
      <text class="countdown-label">距离{{ countdownLabel }}还有</text>
      <view class="countdown-digits">
        <view class="digit-box">
          <text class="digit-text">{{ countdown.hours }}</text>
        </view>
        <text class="digit-sep">:</text>
        <view class="digit-box">
          <text class="digit-text">{{ countdown.minutes }}</text>
        </view>
        <text class="digit-sep">:</text>
        <view class="digit-box">
          <text class="digit-text">{{ countdown.seconds }}</text>
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <scroll-view scroll-y class="seckill-list" @scrolltolower="loadMore">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <view v-else-if="products.length > 0" class="seckill-items">
        <view v-for="item in products" :key="item.id" class="seckill-card" @tap="goDetail(item)">
          <view class="card-cover">
            <image v-if="item.mainImage" :src="imgUrl(item.mainImage)" class="cover-img" mode="aspectFill" />
            <view v-else class="cover-placeholder" :style="{ background: defaultGradient }">
              <Icon icon="solar:flash-bold" width="32" color="rgba(255,255,255,0.6)" />
            </view>
            <view class="card-badge">
              <Icon icon="solar:flash-bold" width="12" color="#fff" />
              <text class="badge-text">秒杀</text>
            </view>
          </view>
          <view class="card-info">
            <text class="card-title">{{ item.spuName || item.productName }}</text>
            <view class="card-price">
              <text class="price-current">
                <text class="price-symbol">¥</text>{{ item.seckillPrice }}
              </text>
              <text class="price-original">¥{{ item.originalPrice || item.price }}</text>
            </view>
            <view class="card-progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: getProgress(item) + '%' }" />
              </view>
              <text class="progress-text">已抢{{ getProgress(item) }}%</text>
            </view>
            <view class="card-btn" :class="{ disabled: item.stock <= 0 }">
              <Icon v-if="item.stock > 0" icon="solar:flash-bold" width="14" color="#fff" />
              <text class="btn-text">{{ item.stock <= 0 ? '已抢光' : '立即抢购' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:flash-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">暂无秒杀商品</text>
        <text class="empty-sub">敬请期待</text>
      </view>

      <view v-if="noMore && products.length > 0" class="no-more">
        <text class="no-more-text">— 没有更多了 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getSeckillProductList, getSeckillList, imgUrl } from '@/api'

const loading = ref(false)
const sessions = ref<any[]>([
  { id: 'default', time: '--:--', label: '加载中', status: 'loading' },
])
const activeSessionId = ref('default')
const products = ref<any[]>([])
const pageNo = ref(1)
const noMore = ref(false)
const countdownLabel = ref('开抢')
const countdown = reactive({ hours: '00', minutes: '00', seconds: '00' })
let timer: any = null

const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

function goBack() {
  uni.navigateBack()
}

function goDetail(item: any) {
  if (item.stock <= 0) return
  uni.navigateTo({ url: '/pages/product/detail?id=' + (item.spuId || item.id) })
}

function getProgress(item: any) {
  if (!item.totalStock || item.totalStock <= 0) return 0
  return Math.min(100, Math.round(((item.totalStock - item.stock) / item.totalStock) * 100))
}

function onSelectSession(session: any) {
  activeSessionId.value = session.id
  pageNo.value = 1
  noMore.value = false
  products.value = []
  loadProducts()
}

function loadMore() {
  if (noMore.value || loading.value) return
  pageNo.value++
  loadProducts(true)
}

function startCountdown() {
  if (timer) clearInterval(timer)
  let total = 3 * 3600 + 25 * 60 + 42
  timer = setInterval(() => {
    if (total <= 0) {
      clearInterval(timer)
      return
    }
    total--
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    countdown.hours = String(h).padStart(2, '0')
    countdown.minutes = String(m).padStart(2, '0')
    countdown.seconds = String(s).padStart(2, '0')
  }, 1000)
}

async function loadProducts(append = false) {
  if (!append) loading.value = true
  try {
    const params: any = { pageNo: pageNo.value, pageSize: 10 }
    if (activeSessionId.value && activeSessionId.value !== 'default') {
      params.activityId = activeSessionId.value
    }
    const res = await getSeckillProductList(params)
    const records: any[] = res?.records || []
    if (append) {
      products.value = [...products.value, ...records]
    } else {
      products.value = records
    }
    noMore.value = records.length < 10
  } catch {
    if (!append) products.value = []
    noMore.value = true
  } finally {
    loading.value = false
  }
}

async function loadSessions() {
  try {
    const res = await getSeckillList({ pageSize: 99 })
    const activities: any[] = res?.records || []
    if (activities.length > 0) {
      const now = Date.now()
      sessions.value = activities.map((act: any) => {
        const start = new Date(act.startTime).getTime()
        const end = new Date(act.endTime).getTime()
        let label = '即将开始'
        let status = 'upcoming'
        if (now >= start && now <= end) { label = '抢购中'; status = 'active' }
        else if (now > end) { label = '已结束'; status = 'ended' }
        const time = act.startTime ? act.startTime.substring(11, 16) : '--:--'
        return { id: act.id, time, label, status, startTime: start, endTime: end }
      })
      const active = sessions.value.find(s => s.status === 'active')
      const upcoming = sessions.value.find(s => s.status === 'upcoming')
      activeSessionId.value = (active || upcoming || sessions.value[0]).id
    } else {
      sessions.value = [{ id: 'all', time: '全部', label: '秒杀商品', status: 'active' }]
      activeSessionId.value = 'all'
    }
  } catch {
    sessions.value = [{ id: 'all', time: '全部', label: '秒杀商品', status: 'active' }]
    activeSessionId.value = 'all'
  }
}

onLoad(async () => {
  await loadSessions()
  loadProducts()
  startCountdown()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.nav-bar {
  display: none;
}

.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-white);
}

/* 时间场次 */
.time-scroll {
  background: var(--color-primary-gradient);
  padding: var(--space-sm) var(--space-lg) var(--space-md);
  white-space: nowrap;
}

.time-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  margin-right: var(--space-sm);
  background: rgba(255,255,255,0.15);
}

.time-item.active {
  background: var(--bg-card);
}

.time-text {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: rgba(255,255,255,0.8);
}

.time-text.active {
  color: var(--color-accent);
}

.time-label {
  font-size: var(--font-xs);
  color: rgba(255,255,255,0.6);
}

.time-label.active {
  color: var(--color-accent);
}

/* 倒计时 */
.countdown-bar {
  background: var(--bg-card);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.countdown-label {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.countdown-digits {
  display: flex;
  align-items: center;
  gap: 4px;
}

.digit-box {
  background: var(--text-primary);
  border-radius: 4px;
  padding: 3px 6px;
  min-width: 28px;
  text-align: center;
}

.digit-text {
  font-size: var(--font-base);
  font-weight: var(--weight-bold);
  color: var(--text-white);
}

.digit-sep {
  font-size: var(--font-base);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}

/* 商品列表 */
.seckill-list {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
}

.seckill-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.seckill-card {
  position: relative;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: 14px;
  padding: 12px;
}

.card-cover {
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--color-danger);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 2px;
}

.badge-text {
  font-size: 10px;
  color: var(--text-white);
  font-weight: var(--weight-semibold);
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 0;
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
  margin-bottom: 4px;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  margin-bottom: 4px;
}

.price-current {
  display: flex;
  align-items: baseline;
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--color-danger);
}

.price-symbol {
  font-size: var(--font-base);
  color: var(--color-danger);
  font-weight: var(--weight-semibold);
}

.price-original {
  font-size: var(--font-base);
  color: var(--text-hint);
  text-decoration: line-through;
}

.card-progress {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: 4px;
  width: 60%;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-danger-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-danger), #FF7875);
  border-radius: var(--radius-full);
}

.progress-text {
  font-size: var(--font-sm);
  color: var(--color-danger);
  white-space: nowrap;
}

.card-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: var(--color-danger);
  border-radius: var(--radius-full);
}

.card-btn.disabled {
  background: var(--bg-gray);
}

.card-btn:active {
  opacity: 0.9;
}

.btn-text {
  font-size: var(--font-base);
  color: var(--text-white);
  font-weight: var(--weight-semibold);
}

.card-btn.disabled .btn-text {
  color: var(--text-hint);
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
  border-top-color: var(--color-accent);
  border-radius: var(--radius-circle);
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
  padding: 60px 40px;
  gap: var(--space-xs);
}

.empty-text {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-top: var(--space-md);
}

.empty-sub {
  font-size: var(--font-base);
  color: var(--text-hint);
}

.no-more {
  padding: var(--space-lg) 0;
  text-align: center;
}

.no-more-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.bottom-spacer {
  height: 16px;
}
</style>
