<template>
  <div class="dist-page">
    <!-- 邀请码卡片 -->
    <div class="card invite-card">
      <div class="card-title">我的邀请码</div>
      <div class="invite-code">{{ info.inviteCode || '暂无' }}</div>
      <div class="invite-tip">分享邀请码给好友，好友下单你赚佣金</div>
    </div>

    <!-- 佣金统计 -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-val">&yen;{{ fmt(info.totalCommission) }}</div>
        <div class="stat-label">累计佣金</div>
      </div>
      <div class="stat-item">
        <div class="stat-val">&yen;{{ fmt(info.availableCommission) }}</div>
        <div class="stat-label">可提现</div>
      </div>
      <div class="stat-item">
        <div class="stat-val">&yen;{{ fmt(info.pendingAmount) }}</div>
        <div class="stat-label">待审核</div>
      </div>
      <div class="stat-item">
        <div class="stat-val">&yen;{{ fmt(info.withdrawnCommission) }}</div>
        <div class="stat-label">已提现</div>
      </div>
      <div class="stat-item">
        <div class="stat-val">{{ info.subordinateCount || 0 }}</div>
        <div class="stat-label">团队成员</div>
      </div>
    </div>

    <!-- 操作 -->
    <div class="action-row" v-if="info.isDistributor && info.availableCommission > 0">
      <a-button type="primary" block size="large" @click="showWithdraw = true">申请提现</a-button>
    </div>

    <!-- 团队列表 -->
    <div class="card" v-if="team.length > 0">
      <div class="card-title">我的团队（{{ team.length }}人）</div>
      <div class="team-item" v-for="t in team" :key="t.user_id">
        <div>
          <div class="team-name">{{ t.nickname || t.user_id }}</div>
          <div class="team-time">{{ (t.create_time || '').substr(0,10) }}</div>
        </div>
        <div class="team-commission">+&yen;{{ (Number(t.total_commission) || 0).toFixed(2) }}</div>
      </div>
    </div>

    <a-modal v-model:open="showWithdraw" title="申请提现" @ok="doWithdraw" okText="确认提现">
      <a-form-item label="提现金额">
        <a-input-number v-model:value="withdrawAmount" :min="1" :max="info.availableCommission" style="width:100%" placeholder="请输入金额" />
      </a-form-item>
      <div style="color:#999;font-size:12px">可提现余额：&yen;{{ fmt(info.availableCommission) }}</div>
    </a-modal>

    <!-- 提现记录 -->
    <div class="card" v-if="withdrawRecords.length > 0">
      <div class="card-title">提现记录</div>
      <div class="record-item" v-for="r in withdrawRecords" :key="r.id">
        <div>
          <div class="record-no">{{ r.apply_no }}</div>
          <div class="record-time">{{ (r.create_time||'').substr(0,10) }}</div>
        </div>
        <div style="text-align:right">
          <div class="record-amount">&yen;{{ (Number(r.withdrawal_amount)||0).toFixed(2) }}</div>
          <a-tag :color="r.apply_status===0?'orange':r.apply_status===1?'green':'red'" size="small">
            {{ r.apply_status===0?'待审核':r.apply_status===1?'已打款':'已拒绝' }}
          </a-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const userId = getCurrentUserId()
const info = ref<any>({})
const team = ref<any[]>([])
const withdrawRecords = ref<any[]>([])
const showWithdraw = ref(false)
const withdrawAmount = ref(0)

function fmt(v: any) { return (Number(v) || 0).toFixed(2) }

async function loadData() {
  try {
    const res = await http.get('/mall/distributor/myInfo', { params: { userId } })
    info.value = res || {}
  } catch {}
  try {
    const res = await http.get('/mall/distributor/myTeam', { params: { userId } })
    team.value = res || []
  } catch {}
  try {
    const res = await http.get('/mall/distributor/myWithdrawRecords', { params: { userId } })
    withdrawRecords.value = res || []
  } catch {}
}

async function doWithdraw() {
  if (!withdrawAmount.value || withdrawAmount.value <= 0) { message.warning('请输入金额'); return }
  try {
    await http.post('/mall/distributor/applyWithdraw', null, { params: { userId, amount: withdrawAmount.value } })
    message.success('提现申请已提交')
    showWithdraw.value = false
    loadData()
  } catch (e: any) { message.error(e?.message || '提现失败') }
}

onMounted(loadData)
</script>

<style scoped>
.dist-page { padding: 16px; max-width: 480px; margin: 0 auto; padding-bottom: 100px; }
.card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; }
.invite-card { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; text-align: center; }
.invite-card .card-title { color: rgba(255,255,255,0.8); }
.invite-code { font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 8px 0; }
.invite-tip { font-size: 12px; color: rgba(255,255,255,0.6); }
.stats-row { display: flex; gap: 8px; margin-bottom: 16px; }
.stat-item { flex: 1; background: #fff; border-radius: 12px; padding: 14px 8px; text-align: center; }
.stat-val { font-size: 18px; font-weight: 600; color: #1a1a1a; }
.stat-label { font-size: 11px; color: #999; margin-top: 2px; }
.action-row { margin-bottom: 16px; }
.team-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.team-name { font-size: 14px; color: #333; }
.team-time { font-size: 11px; color: #999; margin-top: 2px; }
.team-commission { font-size: 15px; font-weight: 600; color: #e4393c; }
.record-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.record-no { font-size: 13px; color: #333; }
.record-time { font-size: 11px; color: #999; margin-top: 2px; }
.record-amount { font-size: 14px; font-weight: 600; color: #e4393c; }
</style>
