<template>
  <div class="groupbuy-page">
    <header class="page-header">
      <button class="page-back" @click="$router.back()"><LeftOutlined /></button>
      <span class="page-title">拼团专区</span>
      <div style="width:32px" />
    </header>

    <a-spin :spinning="loading">
      <div v-if="activities.length === 0 && !loading" class="empty-wrap">
        <TeamOutlined class="empty-icon" />
        <div class="empty-text">暂无拼团活动</div>
      </div>

      <div v-for="act in activities" :key="act.id" class="act-card">
        <div class="act-header">
          <div class="act-info">
            <span class="act-name">{{ act.activityName }}</span>
            <span class="act-time">{{ act.startTime?.substr(0,10) }} ~ {{ act.endTime?.substr(0,10) }}</span>
          </div>
          <span class="act-badge">拼团中</span>
        </div>

        <div class="product-row" @click="$router.push({ name: 'productDetail', params: { id: act.spuId } })">
          <div class="product-img">
            <img v-if="act.mainImage" :src="imgUrl(act.mainImage)" :alt="act.spuName" />
            <div v-else class="img-placeholder"><ShoppingOutlined style="font-size:24px;color:#ddd" /></div>
          </div>
          <div class="product-body">
            <div class="product-name">{{ act.spuName || act.activityName }}</div>
            <div class="product-price-row">
              <span class="group-price"><span class="price-symbol">¥</span>{{ act.groupPrice }}</span>
              <span v-if="act.originalPrice && act.originalPrice > act.groupPrice" class="orig-price">¥{{ act.originalPrice }}</span>
            </div>
            <div class="product-meta">{{ act.groupSize }}人成团 · {{ act.validHours }}小时有效 · 已拼{{ act.successCount || 0 }}单</div>
          </div>
        </div>

        <div class="act-actions">
          <button v-if="myGroups[act.id]" class="btn-ghost-sm" disabled>已发起拼团</button>
          <button v-else class="btn-primary-sm" @click="startGroup(act)">发起拼团</button>
          <button class="btn-ghost-sm" @click="toggleRecords(act)">
            {{ act._showRecords ? '收起' : '查看拼团' }}
          </button>
        </div>

        <!-- 进行中的拼团 -->
        <div v-if="act._showRecords && act.records && act.records.length > 0" class="records-section">
          <div class="records-title">进行中的拼团</div>
          <div v-for="rec in act.records" :key="rec.id" class="record-item">
            <a-avatar :size="28" style="flex-shrink:0;background:var(--color-primary-light,#FFF1F0);color:var(--color-primary,#FF4D4F);font-size:12px">
              {{ (rec.leader_name || rec.leader_user_id || '').charAt(0) }}
            </a-avatar>
            <div class="record-body">
              <div class="record-leader">{{ rec.leader_name || rec.leader_user_id }} 的拼团</div>
              <div class="record-meta">已参 {{ rec.memberCount }}/{{ act.groupSize }}人 · 剩余 {{ timeLeft(rec.expire_time) }}</div>
            </div>
            <button class="btn-primary-sm" @click="joinGroup(act, rec)">参团</button>
          </div>
        </div>
        <div v-else-if="act._showRecords && act._recordsLoaded" class="records-section">
          <div class="records-empty">暂无进行中的拼团</div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { LeftOutlined, TeamOutlined, ShoppingOutlined } from '@ant-design/icons-vue'
import { imgUrl } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const userId = getCurrentUserId()
const router = useRouter()
const activities = ref<any[]>([])
const loading = ref(false)
const myGroups = reactive<Record<string, boolean>>({})

function timeLeft(expireTime: string) {
  const diff = new Date(expireTime).getTime() - Date.now()
  if (diff <= 0) return '已过期'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return h > 0 ? `${h}小时${m}分` : `${m}分钟`
}

async function loadData() {
  loading.value = true
  try {
    const res: any = await http.get('/mall/groupBuy/clientList')
    activities.value = res || []
    for (const act of activities.value) {
      try {
        const recs: any = await http.get('/mall/groupBuy/records', { params: { activityId: act.id } })
        act.records = recs || []
        myGroups[act.id] = (recs || []).some((r: any) => r.leader_user_id === userId)
      } catch { act.records = [] }
    }
  } catch { message.error('加载失败') }
  finally { loading.value = false }
}

async function toggleRecords(act: any) {
  if (act._showRecords) { act._showRecords = false; return }
  act._showRecords = true
  try {
    const res: any = await http.get('/mall/groupBuy/records', { params: { activityId: act.id } })
    act.records = res || []
    act._recordsLoaded = true
    if (!myGroups[act.id]) myGroups[act.id] = (res || []).some((r: any) => r.leader_user_id === userId)
  } catch { act.records = [] }
}

async function startGroup(act: any) {
  try {
    const res: any = await http.post('/mall/groupBuy/startGroup', null, { params: { activityId: act.id, userId } })
    if (res?.orderId) {
      myGroups[act.id] = true
      router.push({ name: 'groupBuyCheckout', query: { orderId: res.orderId, activityId: act.id, spuId: act.spuId, spuName: res.spuName, groupPrice: res.groupPrice, groupSize: act.groupSize, recordId: '' } })
    }
  } catch (e: any) { message.error(e?.message || '发起失败') }
}

async function joinGroup(act: any, rec: any) {
  try {
    const res: any = await http.post('/mall/groupBuy/joinGroup', null, { params: { recordId: rec.id, userId } })
    if (res?.orderId) router.push({ name: 'groupBuyCheckout', query: { orderId: res.orderId, activityId: act.id, recordId: rec.id, spuId: act.spuId, spuName: res.spuName, groupPrice: res.groupPrice, groupSize: act.groupSize } })
  } catch (e: any) { message.error(e?.message || '参团失败') }
}

onMounted(loadData)
</script>

<style scoped>
.groupbuy-page {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px);
}

.page-header {
  position: sticky; top: 0; z-index: 100;
  background: linear-gradient(135deg, #722ED1 0%, #B37FEB 100%);
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; min-height: 48px;
}

.page-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: white; background: rgba(255,255,255,0.15); border-radius: 50%; }
.page-title { font-size: 17px; font-weight: 600; color: white; }

.act-card {
  background: var(--color-card, #fff);
  margin: 12px 16px; border-radius: 12px; padding: 16px;
}

.act-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px; padding-bottom: 12px;
  border-bottom: 0.5px solid var(--color-divider, #f0f0f0);
}

.act-name { font-size: 16px; font-weight: 700; color: var(--color-text, #1a1a1a); display: block; }
.act-time { font-size: 12px; color: var(--color-text-hint, #999); display: block; margin-top: 2px; }

.act-badge {
  font-size: 11px; font-weight: 600; padding: 3px 10px;
  border-radius: 999px; background: #F0F5FF; color: #2F54EB; flex-shrink: 0;
}

.product-row {
  display: flex; gap: 12px; cursor: pointer;
  padding: 4px 0; margin-bottom: 12px;
}

.product-row:active { opacity: 0.8; }

.product-img {
  width: 80px; height: 80px; border-radius: 10px; overflow: hidden; flex-shrink: 0;
  background: var(--color-bg, #f5f5f5);
}

.product-img img { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

.product-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.product-name { font-size: 14px; font-weight: 500; color: var(--color-text, #1a1a1a); line-height: 1.4; }
.product-price-row { display: flex; align-items: baseline; gap: 6px; margin-top: 6px; }
.group-price { font-size: 20px; font-weight: 700; color: var(--color-primary, #FF4D4F); }
.group-price .price-symbol { font-size: 13px; }
.orig-price { font-size: 12px; color: var(--color-text-disabled, #ccc); text-decoration: line-through; }
.product-meta { font-size: 12px; color: var(--color-text-hint, #999); margin-top: 4px; }

.act-actions { display: flex; gap: 8px; }

.btn-primary-sm {
  padding: 7px 16px; border-radius: 999px; border: none;
  background: var(--color-primary, #FF4D4F); color: white;
  font-size: 13px; font-weight: 500; cursor: pointer;
}

.btn-ghost-sm {
  padding: 7px 16px; border-radius: 999px;
  border: 1px solid var(--color-border, #eee);
  background: transparent; color: var(--color-text-secondary, #666);
  font-size: 13px; cursor: pointer;
}

.btn-primary-sm:active { opacity: 0.85; }
.btn-ghost-sm:active { background: var(--color-bg, #f5f5f5); }
.btn-primary-sm:disabled, .btn-ghost-sm:disabled { opacity: 0.5; cursor: not-allowed; }

.records-section {
  margin-top: 14px; padding-top: 14px;
  border-top: 0.5px solid var(--color-divider, #f0f0f0);
}

.records-title { font-size: 14px; font-weight: 600; color: var(--color-text, #1a1a1a); margin-bottom: 10px; }
.records-empty { font-size: 13px; color: var(--color-text-hint, #999); text-align: center; padding: 12px 0; }

.record-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 0.5px solid var(--color-divider, #f0f0f0);
}

.record-item:last-child { border-bottom: none; }
.record-body { flex: 1; min-width: 0; }
.record-leader { font-size: 13px; color: var(--color-text, #1a1a1a); }
.record-meta { font-size: 12px; color: var(--color-text-hint, #999); margin-top: 2px; }
</style>
