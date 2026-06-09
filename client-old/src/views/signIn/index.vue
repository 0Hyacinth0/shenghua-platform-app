<template>
  <div class="sign-page">
    <header class="page-header">
      <button class="page-back" @click="$router.back()"><LeftOutlined /></button>
      <span class="page-title">每日签到</span>
      <div style="width:32px" />
    </header>

    <!-- 签到统计 -->
    <section class="sign-hero">
      <div class="hero-bg" />
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-num">{{ totalSignDays }}</div>
          <div class="stat-label">累计签到</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-num">{{ continuousDays }}</div>
          <div class="stat-label">连续签到</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-num">{{ totalSignPoints }}</div>
          <div class="stat-label">累计积分</div>
        </div>
      </div>

      <button class="sign-btn" :class="{ signed: signedToday }" :disabled="signedToday" @click="handleSign">
        <CheckCircleOutlined v-if="signedToday" style="margin-right:6px" />
        {{ signedToday ? '今日已签到' : '签到领积分' }}
      </button>
      <div v-if="signResult" class="sign-result">获得 <strong>+{{ signResult.points }}</strong> 积分</div>
    </section>

    <!-- 累计签到奖励 -->
    <section class="reward-card" v-if="cumulativeDays > 0 && cumulativePoints > 0">
      <div class="reward-header">
        <span class="reward-title">累计签到奖励</span>
        <span class="reward-progress">{{ totalSignDays }}/{{ cumulativeDays }}天</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: cumulativePercent + '%' }" />
      </div>
      <div class="reward-desc">
        <template v-if="cumulativeCanClaim">
          🎉 累计签到已满{{ cumulativeDays }}天！
          <button class="claim-btn" @click="handleCumulativeClaim">领取 +{{ cumulativePoints }} 积分</button>
        </template>
        <template v-else>
          累计签到满{{ cumulativeDays }}天可获得 +{{ cumulativePoints }} 积分
        </template>
      </div>
    </section>

    <!-- 连续签到奖励 -->
    <section class="reward-card" v-if="bonusInterval > 0 && bonusPerInterval > 0">
      <div class="reward-header">
        <span class="reward-title">连续签到奖励</span>
        <span class="reward-progress">{{ continuousDays }}/{{ bonusInterval }}天</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }" />
      </div>
      <div class="reward-desc">
        <template v-if="canClaim">
          🎉 连续签到达标！
          <button class="claim-btn" @click="handleClaim">领取 +{{ bonusPerInterval * (Math.floor(continuousDays / bonusInterval) - claimedLevel) }} 积分</button>
        </template>
        <template v-else>
          还差 {{ daysToNext }} 天获得 +{{ bonusPerInterval }} 积分奖励
        </template>
      </div>
    </section>

    <!-- 日历 -->
    <section class="calendar-card">
      <div class="cal-header">
        <button class="cal-nav" @click="prevMonth"><LeftOutlined /></button>
        <span class="cal-title">{{ currentYear }}年{{ currentMonth }}月</span>
        <button class="cal-nav" @click="nextMonth"><RightOutlined /></button>
      </div>
      <div class="cal-weekdays">
        <span v-for="d in weekDays" :key="d" class="weekday">{{ d }}</span>
      </div>
      <div class="cal-days">
        <span
          v-for="(day, idx) in calendarDays" :key="idx"
          class="cal-day"
          :class="{ 'is-signed': day.signed, 'is-today': day.isToday, 'is-other': !day.currentMonth }"
        >{{ day.text }}</span>
      </div>
    </section>

    <!-- 签到记录 -->
    <section class="record-card">
      <div class="card-title">签到记录</div>
      <div v-if="records.length === 0" class="record-empty">暂无签到记录</div>
      <div v-else>
        <div v-for="rec in records" :key="rec.id" class="record-item">
          <div class="record-left">
            <div class="record-date">{{ rec.signDate }}</div>
            <div class="record-info">连续{{ rec.continuousDays }}天</div>
          </div>
          <span class="record-points">+{{ rec.pointsEarned }}积分</span>
        </div>
      </div>
      <div v-if="hasMore" class="load-more" @click="loadMore">加载更多</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { LeftOutlined, RightOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { doSignIn, claimBonus, claimCumulative, getSignStatus, getSignRecords } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const userId = getCurrentUserId()
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const signedToday = ref(false)
const continuousDays = ref(0)
const totalSignDays = ref(0)
const totalSignPoints = ref(0)
const signedDates = ref<string[]>([])
const signResult = ref<any>(null)
const bonusInterval = ref(0)
const bonusPerInterval = ref(0)
const daysToNext = ref(0)
const canClaim = ref(false)
const claimedLevel = ref(0)
const cumulativeDays = ref(0)
const cumulativePoints = ref(0)
const cumulativeClaimed = ref(0)
const cumulativeCanClaim = ref(false)
const records = ref<any[]>([])
const page = ref(1)
const totalPages = ref(1)

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)

const hasMore = computed(() => page.value < totalPages.value)
const progressPercent = computed(() => bonusInterval.value <= 0 ? 0 : Math.min(100, Math.round((continuousDays.value % bonusInterval.value) / bonusInterval.value * 100)))
const cumulativePercent = computed(() => cumulativeDays.value <= 0 ? 0 : Math.min(100, Math.round(totalSignDays.value / cumulativeDays.value * 100)))

const calendarDays = computed(() => {
  const year = currentYear.value, month = currentMonth.value
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDow = firstDay.getDay()
  const totalDays = lastDay.getDate()
  const signedSet = new Set(signedDates.value)
  const days: any[] = []
  const prevLast = new Date(year, month - 1, 0).getDate()
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevLast - i
    days.push({ text: d, signed: signedSet.has(`${year}-${String(month - 1 || 12).padStart(2, '0')}-${String(d).padStart(2, '0')}`), isToday: false, currentMonth: false })
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ text: d, signed: signedSet.has(dateStr), isToday: dateStr === todayStr, currentMonth: true })
  }
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const nm = month + 1 > 12 ? 1 : month + 1
      days.push({ text: d, signed: false, isToday: false, currentMonth: false })
    }
  }
  return days
})

function prevMonth() { currentMonth.value === 1 ? (currentMonth.value = 12, currentYear.value--) : currentMonth.value--; loadMonthSignDates() }
function nextMonth() { currentMonth.value === 12 ? (currentMonth.value = 1, currentYear.value++) : currentMonth.value++; loadMonthSignDates() }

async function loadMonthSignDates() {
  try { const res = await getSignStatus(userId); if (res) signedDates.value = res.signedDates || [] } catch {}
}

async function fetchStatus() {
  try {
    const res = await getSignStatus(userId)
    if (res) {
      signedToday.value = res.signedToday ?? false
      continuousDays.value = res.continuousDays ?? 0
      totalSignDays.value = res.totalSignDays ?? 0
      totalSignPoints.value = res.totalSignPoints ?? 0
      signedDates.value = res.signedDates ?? []
      bonusInterval.value = res.bonusInterval ?? 0
      bonusPerInterval.value = res.bonusPerInterval ?? 0
      daysToNext.value = res.daysToNext ?? 0
      canClaim.value = res.canClaim ?? false
      claimedLevel.value = res.claimedLevel ?? 0
      cumulativeDays.value = res.cumulativeDays ?? 0
      cumulativePoints.value = res.cumulativePoints ?? 0
      cumulativeClaimed.value = res.cumulativeClaimed ?? 0
      cumulativeCanClaim.value = res.cumulativeCanClaim ?? false
    }
  } catch {}
}

async function fetchRecords(reset = true) {
  if (reset) page.value = 1
  try {
    const res = await getSignRecords({ userId, pageNo: page.value, pageSize: 20 })
    if (res) {
      records.value = reset ? (res.records || []) : [...records.value, ...(res.records || [])]
      totalPages.value = Math.ceil((res.total || 0) / 20)
    }
  } catch {}
}

function loadMore() { page.value++; fetchRecords(false) }

async function handleSign() {
  try { signResult.value = await doSignIn(userId); message.success('签到成功！'); signedToday.value = true; fetchStatus(); fetchRecords() }
  catch (e: any) { message.error(e?.message || '签到失败') }
}

async function handleClaim() {
  try { const res = await claimBonus(userId); message.success('领取成功！+' + res.bonus + '积分'); fetchStatus(); fetchRecords() }
  catch (e: any) { message.error(e?.message || '领取失败') }
}

async function handleCumulativeClaim() {
  try { const res = await claimCumulative(userId); message.success('领取成功！+' + res.points + '积分'); fetchStatus(); fetchRecords() }
  catch (e: any) { message.error(e?.message || '领取失败') }
}

onMounted(() => { fetchStatus(); fetchRecords() })
</script>

<style scoped>
.sign-page {
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

/* ---- Hero ---- */
.sign-hero {
  position: relative;
  background: linear-gradient(135deg, var(--color-primary, #FF4D4F) 0%, #FF7875 100%);
  margin: 0;
  padding: 28px 20px 24px;
  text-align: center;
  color: white;
  overflow: hidden;
}

.hero-bg {
  position: absolute; top: -40px; right: -40px;
  width: 160px; height: 160px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
}

.stats-row {
  display: flex; align-items: center; justify-content: center;
  gap: 0; margin-bottom: 20px; position: relative; z-index: 1;
}

.stat-item { flex: 1; text-align: center; }
.stat-num { font-size: 28px; font-weight: 700; }
.stat-label { font-size: 12px; opacity: 0.85; margin-top: 2px; }
.stat-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.2); }

.sign-btn {
  height: 48px; padding: 0 40px;
  border-radius: 999px; border: none;
  background: white; color: var(--color-primary, #FF4D4F);
  font-size: 16px; font-weight: 700;
  cursor: pointer; position: relative; z-index: 1;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.sign-btn.signed { background: rgba(255,255,255,0.3); color: white; cursor: default; }
.sign-btn:not(.signed):active { transform: scale(0.97); }

.sign-result {
  margin-top: 12px; font-size: 14px; position: relative; z-index: 1;
}
.sign-result strong { font-size: 18px; }

/* ---- 奖励卡片 ---- */
.reward-card {
  background: var(--color-card, #fff);
  margin: 12px 16px; border-radius: 12px; padding: 16px;
}

.reward-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
}

.reward-title { font-size: 14px; font-weight: 600; color: var(--color-text, #1a1a1a); }
.reward-progress { font-size: 13px; color: var(--color-primary, #FF4D4F); font-weight: 600; }

.progress-bar-wrap {
  height: 8px; background: var(--color-bg, #f5f5f5);
  border-radius: 4px; overflow: hidden; margin-bottom: 10px;
}

.progress-bar {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, var(--color-primary, #FF4D4F), #FF7875);
  transition: width 0.3s;
}

.reward-desc {
  font-size: 13px; color: var(--color-text-secondary, #666); text-align: center;
}

.claim-btn {
  display: inline-block; margin-left: 8px; padding: 3px 14px;
  border: none; border-radius: 999px;
  background: linear-gradient(135deg, #FA8C16, #FFA940);
  color: white; font-size: 13px; font-weight: 500; cursor: pointer;
}

/* ---- 日历 ---- */
.calendar-card {
  background: var(--color-card, #fff);
  margin: 0 16px 12px; border-radius: 12px; padding: 16px;
}

.cal-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
}

.cal-title { font-size: 16px; font-weight: 600; color: var(--color-text, #1a1a1a); }
.cal-nav { width: 32px; height: 32px; border-radius: 50%; background: var(--color-bg, #f5f5f5); display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--color-text-secondary, #666); }

.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 6px; }
.weekday { font-size: 12px; color: var(--color-text-hint, #999); padding: 4px 0; }

.cal-days { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; }
.cal-day {
  font-size: 13px; width: 32px; height: 32px; line-height: 32px;
  border-radius: 50%; margin: 2px auto; display: block;
  color: var(--color-text, #1a1a1a);
}

.cal-day.is-signed { background: var(--color-primary, #FF4D4F); color: white; font-weight: 600; }
.cal-day.is-today { border: 1.5px solid var(--color-primary, #FF4D4F); font-weight: 600; }
.cal-day.is-today.is-signed { border: none; }
.cal-day.is-other { color: var(--color-text-disabled, #ccc); }

/* ---- 记录 ---- */
.record-card {
  background: var(--color-card, #fff);
  margin: 0 16px 12px; border-radius: 12px; padding: 16px;
}

.card-title { font-size: 15px; font-weight: 600; color: var(--color-text, #1a1a1a); margin-bottom: 12px; }
.record-empty { text-align: center; color: var(--color-text-hint, #999); padding: 24px 0; }

.record-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 0.5px solid var(--color-divider, #f0f0f0);
}

.record-item:last-child { border-bottom: none; }
.record-date { font-size: 14px; color: var(--color-text, #1a1a1a); }
.record-info { font-size: 12px; color: var(--color-text-hint, #999); margin-top: 2px; }
.record-points { font-size: 14px; font-weight: 600; color: var(--color-primary, #FF4D4F); }

.load-more {
  text-align: center; padding: 12px 0;
  font-size: 13px; color: var(--color-primary, #FF4D4F); cursor: pointer;
}
</style>
