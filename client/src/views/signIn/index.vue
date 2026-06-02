<template>
  <div class="sign-page">
    <!-- 签到统计卡片 -->
    <div class="sign-stats">
      <div class="stat-item">
        <div class="stat-num">{{ totalSignDays }}</div>
        <div class="stat-label">累计签到(天)</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ continuousDays }}</div>
        <div class="stat-label">连续签到(天)</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ totalSignPoints }}</div>
        <div class="stat-label">累计积分</div>
      </div>
    </div>

    <!-- 签到按钮 -->
    <div class="sign-btn-wrap">
      <button
        class="sign-btn"
        :class="{ signed: signedToday }"
        :disabled="signedToday"
        @click="handleSign"
      >
        <template v-if="signedToday">今日已签到</template>
        <template v-else>签到领积分</template>
      </button>
      <div v-if="signResult" class="sign-result">
        获得 <span class="highlight">+{{ signResult.points }}</span> 积分
      </div>
    </div>

    <!-- 累计签到奖励 -->
    <div class="progress-section" v-if="cumulativeDays > 0 && cumulativePoints > 0">
      <div class="progress-header">
        <span>累计签到奖励</span>
        <span class="progress-text">{{ totalSignDays }}/{{ cumulativeDays }} 天</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: cumulativePercent + '%' }"></div>
      </div>
      <div class="progress-desc">
        <template v-if="cumulativeCanClaim">
          累计签到已满{{ cumulativeDays }}天！
          <button class="claim-btn" @click="handleCumulativeClaim">领取 +{{ cumulativePoints }} 积分</button>
        </template>
        <template v-else-if="cumulativeClaimed > 0">
          已领取累计{{ cumulativeClaimed }}天奖励
        </template>
        <template v-else>
          累计签到满{{ cumulativeDays }}天可获得 +{{ cumulativePoints }} 积分
        </template>
      </div>
    </div>

    <!-- 连续签到奖励 -->
    <div class="progress-section" v-if="bonusInterval > 0 && bonusPerInterval > 0">
      <div class="progress-header">
        <span>连续签到奖励</span>
        <span class="progress-text">{{ continuousDays }}/{{ bonusInterval }} 天</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="progress-desc">
        <template v-if="canClaim">
          已完成连续{{ continuousDays }}天签到！
          <button class="claim-btn" @click="handleClaim">领取 +{{ bonusPerInterval * (Math.floor(continuousDays / bonusInterval) - claimedLevel) }} 积分</button>
        </template>
        <template v-else>
          还差 {{ daysToNext }} 天获得 +{{ bonusPerInterval }} 积分奖励
        </template>
      </div>
    </div>

    <!-- 日历 -->
    <div class="calendar">
      <div class="cal-header">
        <span class="cal-nav" @click="prevMonth">&lt;</span>
        <span class="cal-title">{{ currentYear }}年{{ currentMonth }}月</span>
        <span class="cal-nav" @click="nextMonth">&gt;</span>
      </div>
      <div class="cal-weekdays">
        <span v-for="d in weekDays" :key="d" class="weekday">{{ d }}</span>
      </div>
      <div class="cal-days">
        <span
          v-for="(day, idx) in calendarDays"
          :key="idx"
          class="cal-day"
          :class="{
            'is-signed': day.signed,
            'is-today': day.isToday,
            'is-other': !day.currentMonth,
          }"
        >
          {{ day.text }}
        </span>
      </div>
    </div>

    <!-- 签到记录列表 -->
    <div class="record-section">
      <h3 class="section-title">签到记录</h3>
      <div v-if="records.length === 0" class="empty">暂无签到记录</div>
      <div v-else class="record-list">
        <div v-for="rec in records" :key="rec.id" class="record-item">
          <div class="record-date">{{ rec.signDate }}</div>
          <div class="record-info">
            连续 {{ rec.continuousDays }} 天 · 获得 +{{ rec.pointsEarned }} 积分
          </div>
        </div>
      </div>
      <div v-if="hasMore" class="load-more" @click="loadMore">加载更多</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
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
const progressPercent = computed(() => {
  if (bonusInterval.value <= 0) return 0
  return Math.min(100, Math.round((continuousDays.value % bonusInterval.value) / bonusInterval.value * 100))
})
const cumulativePercent = computed(() => {
  if (cumulativeDays.value <= 0) return 0
  return Math.min(100, Math.round(totalSignDays.value / cumulativeDays.value * 100))
})

// 生成日历数据
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDow = firstDay.getDay()
  const totalDays = lastDay.getDate()
  const signedSet = new Set(signedDates.value)

  const days: any[] = []

  // 上月填充
  const prevLast = new Date(year, month - 1, 0).getDate()
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevLast - i
    const dateStr = `${year}-${String(month - 1 || 12).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ text: d, signed: signedSet.has(dateStr), isToday: false, currentMonth: false })
  }

  // 本月
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ text: d, signed: signedSet.has(dateStr), isToday: dateStr === todayStr, currentMonth: true })
  }

  // 下月填充
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month + 1 > 12 ? 1 : month + 1
      const dateStr = `${nextMonth === 1 ? year + 1 : year}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ text: d, signed: signedSet.has(dateStr), isToday: false, currentMonth: false })
    }
  }

  return days
})

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadMonthSignDates()
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadMonthSignDates()
}

async function loadMonthSignDates() {
  try {
    const res = await getSignStatus(userId)
    if (res) {
      signedDates.value = res.signedDates || []
    }
  } catch {}
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
      if (reset) records.value = res.records || []
      else records.value = [...records.value, ...(res.records || [])]
      totalPages.value = Math.ceil((res.total || 0) / 20)
    }
  } catch {}
}

function loadMore() {
  page.value++
  fetchRecords(false)
}

async function handleCumulativeClaim() {
  try {
    const res = await claimCumulative(userId)
    message.success('领取成功！+' + res.points + '积分')
    fetchStatus()
    fetchRecords()
  } catch (e: any) {
    message.error(e?.message || '领取失败')
  }
}

async function handleClaim() {
  try {
    const res = await claimBonus(userId)
    message.success('领取成功！+' + res.bonus + '积分')
    fetchStatus()
    fetchRecords()
  } catch (e: any) {
    message.error(e?.message || '领取失败')
  }
}

async function handleSign() {
  try {
    const res = await doSignIn(userId)
    signResult.value = res
    message.success('签到成功！')
    signedToday.value = true
    fetchStatus()
    fetchRecords()
  } catch (e: any) {
    message.error(e?.message || '签到失败')
  }
}

onMounted(() => {
  fetchStatus()
  fetchRecords()
})
</script>

<style scoped>
.sign-page {
  padding: 16px;
  background: #f5f5f5;
  min-height: 100vh;
}

.sign-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #1677ff;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.sign-btn-wrap {
  text-align: center;
  margin-bottom: 20px;
}

.sign-btn {
  width: 200px;
  height: 48px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #1677ff, #4096ff);
  cursor: pointer;
  transition: all .3s;
}

.sign-btn.signed {
  background: #d9d9d9;
  color: #999;
  cursor: default;
}

.sign-btn:not(.signed):active {
  transform: scale(.95);
}

.sign-result {
  margin-top: 10px;
  font-size: 14px;
  color: #333;
}

.sign-result .highlight {
  color: #f5222d;
  font-weight: 600;
  font-size: 18px;
}

.sign-result .bonus {
  color: #fa8c16;
  font-size: 12px;
}

/* 进度条 */
.progress-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.progress-text {
  color: #1677ff;
  font-weight: 600;
}

.progress-bar-wrap {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #1677ff, #4096ff);
  border-radius: 4px;
  transition: width .3s;
}

.progress-desc {
  font-size: 13px;
  color: #666;
  text-align: center;
}

.claim-btn {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #fa8c16, #ffa940);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

/* 日历 */
.calendar {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cal-title {
  font-size: 16px;
  font-weight: 600;
}

.cal-nav {
  font-size: 18px;
  padding: 4px 12px;
  cursor: pointer;
  color: #1677ff;
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.weekday {
  font-size: 13px;
  color: #999;
  padding: 4px 0;
}

.cal-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.cal-day {
  font-size: 14px;
  padding: 6px 0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  line-height: 32px;
  margin: 2px auto;
  display: block;
}

.cal-day.is-signed {
  background: #1677ff;
  color: #fff;
}

.cal-day.is-today {
  border: 1px solid #1677ff;
  font-weight: 600;
}

.cal-day.is-today.is-signed {
  border: none;
}

.cal-day.is-other {
  color: #d9d9d9;
}

/* 签到记录 */
.record-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
}

.empty {
  text-align: center;
  color: #999;
  padding: 24px 0;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.record-date {
  font-size: 14px;
  color: #333;
}

.record-info {
  font-size: 13px;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 12px 0;
  color: #1677ff;
  font-size: 14px;
  cursor: pointer;
}
</style>
