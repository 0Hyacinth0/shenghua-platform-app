<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="20" />
      </view>
      <text class="nav-title">每日签到</text>
      <view class="nav-right">
        <view class="nav-btn" @tap="goRecords">
          <Icon icon="solar:document-text-bold" width="20" />
        </view>
      </view>
    </view>

    <!-- 签到卡片 -->
    <view class="sign-card">
      <view class="sign-bg">
        <view class="sign-deco" />
        <view class="sign-deco2" />
      </view>
      <view class="sign-content">
        <view class="sign-hero">
          <Icon :icon="todaySigned ? 'solar:confetti-bold' : 'solar:pen-new-round-bold'" width="48" color="#fff" />
          <text class="sign-streak">已连续签到 <text class="streak-num">{{ signStatus.consecutiveDays || 0 }}</text> 天</text>
          <text class="sign-points">累计获得 {{ signStatus.totalPoints || 0 }} 积分</text>
        </view>

        <button class="sign-btn" :class="{ signed: todaySigned }" :disabled="todaySigned" @tap="onSignIn">
          <view class="sign-btn-inner">
            <Icon v-if="todaySigned" icon="solar:check-circle-bold" width="16" color="rgba(255,255,255,0.9)" />
            <text class="sign-btn-text">{{ todaySigned ? '今日已签到' : '立即签到' }}</text>
          </view>
        </button>
      </view>
    </view>

    <!-- 日历 -->
    <view class="calendar-card">
      <view class="calendar-header">
        <text class="calendar-title">{{ currentYear }}年{{ currentMonth }}月</text>
      </view>
      <view class="calendar-weekdays">
        <text v-for="day in weekdays" :key="day" class="weekday-text">{{ day }}</text>
      </view>
      <view class="calendar-grid">
        <view
          v-for="(day, idx) in calendarDays"
          :key="idx"
          class="calendar-day"
          :class="{ signed: day.signed, today: day.isToday, empty: !day.day }"
        >
          <text v-if="day.day" class="day-text">{{ day.day }}</text>
          <Icon v-if="day.signed" icon="solar:check-circle-bold" width="8" color="var(--color-accent)" />
        </view>
      </view>
    </view>

    <!-- 签到奖励 -->
    <view class="reward-card">
      <view class="section-header">
        <text class="section-title">签到奖励</text>
        <text class="section-sub">连续签到7天可领额外奖励</text>
      </view>
      <scroll-view scroll-x class="reward-scroll">
        <view class="reward-list">
          <view v-for="reward in rewards" :key="reward.day" class="reward-item" :class="{ claimed: reward.claimed, current: reward.isCurrent }">
            <text class="reward-day">第{{ reward.day }}天</text>
            <view class="reward-icon-wrap">
              <Icon :icon="reward.day <= 2 ? 'solar:star-bold' : reward.day <= 4 ? 'solar:star-bold' : reward.day <= 6 ? 'solar:star-bold' : 'solar:cup-bold'" width="20" :color="reward.claimed ? '#94A3B8' : 'var(--color-accent)'" />
            </view>
            <text class="reward-points">+{{ reward.points }}</text>
            <view v-if="reward.claimed" class="reward-badge">
              <text class="badge-text">已领</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 签到规则 -->
    <view class="rule-card">
      <view class="section-header">
        <text class="section-title">签到规则</text>
      </view>
      <view class="rule-list">
        <view class="rule-item">
          <view class="rule-icon">
            <text class="icon-text">1</text>
          </view>
          <text class="rule-text">每日签到可获得10积分</text>
        </view>
        <view class="rule-item">
          <view class="rule-icon">
            <text class="icon-text">2</text>
          </view>
          <text class="rule-text">连续签到7天可获得50积分奖励</text>
        </view>
        <view class="rule-item">
          <view class="rule-icon">
            <text class="icon-text">3</text>
          </view>
          <text class="rule-text">积分可用于兑换课程优惠券</text>
        </view>
        <view class="rule-item">
          <view class="rule-icon">
            <text class="icon-text">4</text>
          </view>
          <text class="rule-text">断签后连续天数重新计算</text>
        </view>
      </view>
    </view>

    <!-- 签到记录 -->
    <view class="record-card">
      <view class="section-header">
        <text class="section-title">最近签到</text>
        <text class="section-more" @tap="goRecords">全部 <Icon icon="solar:alt-arrow-right-bold" width="12" /></text>
      </view>
      <view v-if="records.length > 0" class="record-list">
        <view v-for="record in records.slice(0, 5)" :key="record.id" class="record-item">
          <view class="record-left">
            <view class="record-icon">
              <Icon icon="solar:check-circle-bold" width="16" color="var(--color-success)" />
            </view>
            <text class="record-text">每日签到</text>
          </view>
          <view class="record-right">
            <text class="record-points">+{{ record.points || 10 }}</text>
            <text class="record-time">{{ record.signDate }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-records">
        <text class="empty-text">暂无签到记录</text>
      </view>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getSignStatus, doSignIn, getSignRecords } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

const signStatus = ref<any>({})
const todaySigned = ref(false)
const records = ref<any[]>([])
const signedDays = ref<Set<number>>(new Set())

const rewards = [
  { day: 1, points: 10, icon: '⭐', claimed: false, isCurrent: false },
  { day: 2, points: 10, icon: '⭐', claimed: false, isCurrent: false },
  { day: 3, points: 20, icon: '🌟', claimed: false, isCurrent: false },
  { day: 4, points: 20, icon: '🌟', claimed: false, isCurrent: false },
  { day: 5, points: 30, icon: '✨', claimed: false, isCurrent: false },
  { day: 6, points: 30, icon: '✨', claimed: false, isCurrent: false },
  { day: 7, points: 50, icon: '🏆', claimed: false, isCurrent: false },
]

const calendarDays = computed(() => {
  const days: any[] = []
  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay()
  const totalDays = new Date(currentYear, currentMonth, 0).getDate()
  const today = new Date().getDate()

  for (let i = 0; i < firstDay; i++) {
    days.push({ day: 0, signed: false, isToday: false })
  }
  for (let d = 1; d <= totalDays; d++) {
    days.push({
      day: d,
      signed: signedDays.value.has(d),
      isToday: d === today,
    })
  }
  return days
})

function goBack() {
  uni.navigateBack()
}

function goRecords() {
  // TODO: 签到记录页
}

async function loadSignStatus() {
  try {
    const res = await getSignStatus(getCurrentUserId())
    signStatus.value = res || {}
    todaySigned.value = !!res?.todaySigned
    if (res?.signedDates) {
      signedDays.value = new Set(res.signedDates.map((d: string) => new Date(d).getDate()))
    }
  } catch {
    signStatus.value = {}
  }
}

async function loadRecords() {
  try {
    const res = await getSignRecords({ userId: getCurrentUserId(), pageNo: 1, pageSize: 30 })
    records.value = res?.records || (Array.isArray(res) ? res : [])
  } catch {
    records.value = []
  }
}

async function onSignIn() {
  if (todaySigned.value) return
  try {
    const res = await doSignIn(getCurrentUserId())
    todaySigned.value = true
    signedDays.value.add(new Date().getDate())
    uni.showToast({ title: '签到成功 +' + (res?.points || 10) + '积分', icon: 'success' })
    loadSignStatus()
    loadRecords()
  } catch (e: any) {
    uni.showToast({ title: e?.message || '签到失败', icon: 'none' })
  }
}

onLoad(() => {
  loadSignStatus()
  loadRecords()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
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
  color: var(--text-primary);
}

.nav-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.nav-right {
  display: flex;
  gap: 12px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

/* 签到卡片 */
.sign-card {
  position: relative;
  margin: 12px 16px 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.sign-bg {
  position: absolute;
  inset: 0;
  background: var(--color-primary-gradient);
}

.sign-deco {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  border-radius: var(--radius-circle);
  background: rgba(255,255,255,0.1);
}

.sign-deco2 {
  position: absolute;
  left: 30px;
  bottom: -15px;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-circle);
  background: rgba(255,255,255,0.05);
}

.sign-content {
  position: relative;
  z-index: 1;
  padding: var(--space-2xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.sign-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.sign-streak {
  font-size: var(--font-lg);
  color: rgba(255,255,255,0.9);
}

.streak-num {
  font-size: var(--font-4xl);
  font-weight: var(--weight-bold);
  color: var(--text-white);
}

.sign-points {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
}

.sign-btn {
  width: 200px;
  height: 48px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.sign-btn.signed {
  background: rgba(255,255,255,0.3);
  box-shadow: none;
}

.sign-btn:active {
  opacity: 0.9;
}

.sign-btn-inner {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sign-btn-text {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-accent);
}

.sign-btn.signed .sign-btn-text {
  color: rgba(255,255,255,0.9);
}

/* 日历 */
.calendar-card {
  background: var(--bg-card);
  margin: 12px 16px 0;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.calendar-header {
  margin-bottom: var(--space-md);
}

.calendar-title {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.calendar-weekdays {
  display: flex;
  margin-bottom: var(--space-sm);
}

.weekday-text {
  flex: 1;
  text-align: center;
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-day {
  width: 14.28%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  position: relative;
}

.calendar-day.signed {
  background: var(--color-accent-light);
  border-radius: var(--radius-circle);
}

.calendar-day.today {
  border: 1.5px solid var(--color-accent);
  border-radius: var(--radius-circle);
}

.calendar-day.empty {
  visibility: hidden;
}

.day-text {
  font-size: var(--font-base);
  color: var(--text-primary);
}

.calendar-day.signed .day-text {
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

/* 签到奖励 */
.reward-card {
  background: var(--bg-card);
  margin: 12px 16px 0;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.section-sub {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.section-more {
  font-size: 13px;
  color: var(--text-hint);
  display: flex;
  align-items: center;
  gap: 2px;
}

.reward-scroll {
  white-space: nowrap;
}

.reward-list {
  display: inline-flex;
  gap: 10px;
}

.reward-item {
  flex-shrink: 0;
  width: 72px;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-md);
  background: var(--bg-gray);
  position: relative;
}

.reward-item.current {
  background: var(--color-accent-light);
  box-shadow: 0 0 0 1.5px var(--color-accent);
}

.reward-item.claimed {
  opacity: 0.5;
}

.reward-day {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

.reward-icon-wrap {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reward-points {
  font-size: var(--font-xs);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

.reward-badge {
  position: absolute;
  top: 4px;
  right: 4px;
}

.badge-text {
  font-size: 9px;
  color: var(--color-success);
}

/* 签到规则 */
.rule-card {
  background: var(--bg-card);
  margin: 12px 16px 0;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rule-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-circle);
  background: var(--color-accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-text {
  font-size: var(--font-sm);
  color: var(--color-accent);
  font-weight: var(--weight-semibold);
}

.rule-text {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

/* 签到记录 */
.record-card {
  background: var(--bg-card);
  margin: 12px 16px 0;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-circle);
  background: var(--color-success-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-text {
  font-size: var(--font-base);
  color: var(--text-primary);
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.record-points {
  font-size: var(--font-base);
  font-weight: var(--weight-bold);
  color: var(--color-accent);
}

.record-time {
  font-size: var(--font-xs);
  color: var(--text-hint);
}

.empty-records {
  padding: 24px 0;
  text-align: center;
}

.empty-text {
  font-size: var(--font-base);
  color: var(--text-hint);
}

.bottom-spacer {
  height: 16px;
}
</style>
