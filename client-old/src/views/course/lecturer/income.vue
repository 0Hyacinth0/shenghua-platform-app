<template>
  <div class="income-page">
    <h2>讲师收益</h2>

    <div class="overview-card">
      <div class="ov-item">
        <div class="ov-value">&yen;{{ overview.availableBalance || 0 }}</div>
        <div class="ov-label">可提现余额</div>
      </div>
      <div class="ov-item">
        <div class="ov-value">&yen;{{ overview.totalIncome || 0 }}</div>
        <div class="ov-label">累计收入</div>
      </div>
      <div class="ov-item">
        <div class="ov-value">&yen;{{ overview.withdrawnAmount || 0 }}</div>
        <div class="ov-label">已提现</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>提现</h3>
        <button class="w-btn" @click="showWithdraw = true" v-if="!showWithdraw">申请提现</button>
      </div>
      <div v-if="showWithdraw" class="withdraw-form">
        <div class="form-group">
          <label>提现金额</label>
          <input v-model="wForm.amount" type="number" placeholder="输入金额" />
          <span class="max-hint">可提现: &yen;{{ overview.availableBalance || 0 }}</span>
        </div>
        <div class="form-group"><label>开户行</label><input v-model="wForm.bankName" placeholder="如：中国工商银行" /></div>
        <div class="form-group"><label>银行账号</label><input v-model="wForm.bankAccount" placeholder="输入卡号" /></div>
        <div class="form-group"><label>开户人</label><input v-model="wForm.accountName" placeholder="持卡人姓名" /></div>
        <div class="btn-row">
          <button @click="showWithdraw = false" class="cancel-btn">取消</button>
          <button @click="submitWithdraw" class="save-btn" :disabled="wSubmitting">提交</button>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>提现记录</h3>
      <div v-if="withdrawList.length === 0" class="empty">暂无记录</div>
      <div v-for="item in withdrawList" :key="item.id" class="withdraw-item">
        <div class="wi-left">
          <span class="wi-amount">&yen;{{ item.amount }}</span>
          <span :class="'wi-s-' + item.status">{{ ['待审核','已通过','已拒绝'][item.status] || '未知' }}</span>
        </div>
        <div class="wi-date">{{ item.createTime }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import http from '@/utils/http'

const userId = computed(() => localStorage.getItem('userId') || '')
const overview = ref({})
const withdrawList = ref([])
const showWithdraw = ref(false)
const wSubmitting = ref(false)
const wForm = ref({ amount: '', bankName: '', bankAccount: '', accountName: '' })

const load = async () => {
  try {
    const lecturers = await http.get('/course/lecturer/list', { params: { userId: userId.value } })
    const lecRecords = lecturers?.records || lecturers || []
    if (lecRecords.length > 0) {
      const lec = lecRecords[0]
      overview.value = {
        totalIncome: lec.totalIncome || 0,
        availableBalance: lec.availableBalance || 0,
        withdrawnAmount: lec.withdrawnAmount || 0,
        lecturerId: lec.id
      }
      const wList = await http.get('/course/lecturerWithdraw/list', { params: { lecturerId: lec.id } })
      withdrawList.value = wList?.records || wList || []
    }
  } catch (e) { /* */ }
}

const submitWithdraw = async () => {
  if (!wForm.value.amount || parseFloat(wForm.value.amount) <= 0) { alert('请输入有效金额'); return }
  if (!wForm.value.bankName || !wForm.value.bankAccount || !wForm.value.accountName) { alert('请完善银行信息'); return }
  wSubmitting.value = true
  try {
    await http.post('/course/lecturerWithdraw/add', {
      lecturerId: overview.value.lecturerId,
      amount: parseFloat(wForm.value.amount),
      bankName: wForm.value.bankName,
      bankAccount: wForm.value.bankAccount,
      accountName: wForm.value.accountName,
      status: 0
    })
    showWithdraw.value = false
    wForm.value = { amount: '', bankName: '', bankAccount: '', accountName: '' }
    load()
  } catch (e) { alert('提交失败：' + (e.message || '')) }
  finally { wSubmitting.value = false }
}

onMounted(() => load())
</script>

<style scoped>
.income-page { padding:16px; background:#f7f8fa; min-height:100vh; }
.income-page h2 { margin:0 0 16px; font-size:20px; }
.overview-card { display:flex; background:#fff; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,.06); margin-bottom:16px; }
.ov-item { flex:1; text-align:center; }
.ov-value { font-size:20px; font-weight:bold; color:var(--color-primary, #FF4D4F); }
.ov-label { font-size:11px; color:#999; margin-top:2px; }
.section { background:#fff; border-radius:12px; padding:16px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.section h3 { margin:0 0 12px; font-size:16px; }
.section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.section-header h3 { margin:0; }
.w-btn { padding:6px 16px; background:var(--color-primary, #FF4D4F); color:#fff; border:none; border-radius:14px; font-size:13px; cursor:pointer; }
.withdraw-form { padding-top:8px; }
.form-group { margin-bottom:12px; }
.form-group label { display:block; font-size:13px; font-weight:bold; margin-bottom:4px; }
.form-group input { width:100%; padding:8px 12px; border:1px solid #e8e8e8; border-radius:8px; font-size:14px; box-sizing:border-box; }
.max-hint { font-size:11px; color:var(--color-primary, #FF4D4F); display:block; margin-top:2px; }
.btn-row { display:flex; gap:12px; }
.cancel-btn { flex:1; padding:10px; border:1px solid #e0e0e0; background:#fff; border-radius:12px; cursor:pointer; }
.save-btn { flex:1; padding:10px; background:var(--color-primary, #FF4D4F); color:#fff; border:none; border-radius:12px; cursor:pointer; }
.withdraw-item { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f5f5f5; }
.wi-amount { font-weight:bold; font-size:15px; margin-right:10px; }
.wi-s-0 { color:#fa8c16; font-size:12px; }
.wi-s-1 { color:#52c41a; font-size:12px; }
.wi-s-2 { color:var(--color-primary, #FF4D4F); font-size:12px; }
.wi-date { font-size:12px; color:#999; }
.empty { text-align:center; padding:20px; color:#999; font-size:13px; }
</style>
