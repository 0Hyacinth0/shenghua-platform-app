<template>
  <view class="page-container">
    <view class="nav-bar">
      <text class="nav-back" @tap="goBack">‹</text>
      <text class="nav-title">讲师收益</text>
      <view style="width:36px" />
    </view>

    <!-- 收益统计 -->
    <view class="income-card">
      <view class="income-hero">
        <text class="income-label">累计收益(元)</text>
        <text class="income-value">{{ stats.totalIncome || '0.00' }}</text>
      </view>
      <view class="income-grid">
        <view class="income-item">
          <text class="income-num">{{ stats.monthIncome || '0.00' }}</text>
          <text class="income-sub">本月收益</text>
        </view>
        <view class="income-item">
          <text class="income-num">{{ stats.pendingIncome || '0.00' }}</text>
          <text class="income-sub">待结算</text>
        </view>
        <view class="income-item">
          <text class="income-num">{{ stats.studentCount || 0 }}</text>
          <text class="income-sub">总学员</text>
        </view>
      </view>
    </view>

    <!-- 收益明细 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">💰 收益明细</text>
      </view>
      <view v-if="records.length > 0" class="record-list">
        <view v-for="item in records" :key="item.id" class="record-item">
          <view class="record-left">
            <text class="record-desc">{{ item.description || '课程收入' }}</text>
            <text class="record-time">{{ item.createTime }}</text>
          </view>
          <text class="record-amount">+{{ item.amount }}</text>
        </view>
      </view>
      <view v-else class="empty-section">
        <text class="empty-text">暂无收益记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const stats = ref<any>({})
const records = ref<any[]>([])

function goBack() {
  uni.navigateBack()
}

async function loadData() {
  try {
    const [statsRes, recordsRes] = await Promise.all([
      http.get('/course/lecturer/income/stats', { params: { userId: getCurrentUserId() } }).catch(() => ({})),
      http.get('/course/lecturer/income/records', { params: { userId: getCurrentUserId(), pageSize: 20 } }).catch(() => ({ records: [] })),
    ])
    stats.value = statsRes || {}
    records.value = (recordsRes as any)?.records || []
  } catch {
    stats.value = {}
    records.value = []
  }
}

onLoad(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F5F6FA;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 44px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-back {
  font-size: 28px;
  font-weight: 300;
  color: #1a1a1a;
  padding: 4px 8px;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.income-card {
  background: linear-gradient(135deg, #FF7A45, #FF9A6C);
  margin: 16px;
  border-radius: 12px;
  padding: 24px 16px 20px;
  box-shadow: 0 2px 8px rgba(255, 122, 69, 0.3);
}

.income-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 20px;
}

.income-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.income-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.income-grid {
  display: flex;
  justify-content: space-around;
}

.income-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.income-num {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.income-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.section-card {
  background: #fff;
  margin: 0 16px 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-desc {
  font-size: 14px;
  color: #1a1a1a;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.record-amount {
  font-size: 16px;
  font-weight: 700;
  color: #FF7A45;
}

.empty-section {
  padding: 24px 0;
  text-align: center;
}

.empty-text {
  font-size: 14px;
  color: #999;
}
</style>
