<template>
  <div class="group-buy-page">
    <h2>拼团专区</h2>
    <a-spin :spinning="loading">
      <div v-for="act in activities" :key="act.id" class="activity-block">
        <div class="act-header">
          <span class="act-name">{{ act.activityName }}</span>
          <a-tag color="red">拼团中</a-tag>
          <span class="act-time">{{ act.startTime?.substr(0, 10) }} ~ {{ act.endTime?.substr(0, 10) }}</span>
        </div>

        <div class="product-row" style="cursor:pointer" @click="$router.push({ name: 'productDetail', params: { id: act.spuId } })">
          <a-image :src="imgUrl(act.mainImage)" :width="80" :height="80" fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGR5PSIuM2VtIiBmaWxsPSIjYmJiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEwIj7lm77niYfliqDovb0gPC90ZXh0Pjwvc3ZnPg==" style="border-radius:4px" />
          <div class="product-info">
            <div class="product-name">{{ act.spuName || act.activityName }}</div>
            <div class="price-row">
              <span class="group-price">拼团价 &yen;{{ act.groupPrice }}</span>
              <span class="orig-price" v-if="act.originalPrice && act.originalPrice > act.groupPrice">&yen;{{ act.originalPrice }}</span>
            </div>
            <div class="group-size">{{ act.groupSize }}人成团 · 有效期{{ act.validHours }}小时 · 已拼{{ act.successCount || 0 }}单</div>
          </div>
        </div>
        <a-space style="margin: 4px 0 0 92px">
          <a-button v-if="myGroups[act.id]" type="default" size="small" disabled>已发起拼团</a-button>
          <a-button v-else type="primary" size="small" @click="startGroup(act)">发起拼团</a-button>
          <a-button size="small" @click="toggleRecords(act)">
            {{ act._showRecords ? '收起拼团' : '查看拼团' }}
          </a-button>
        </a-space>

        <!-- 进行中的拼团列表 -->
        <div v-if="act._showRecords && act.records && act.records.length > 0" class="records-section">
          <div class="records-title">进行中的拼团</div>
          <div class="record-item" v-for="rec in act.records" :key="rec.id">
            <a-avatar :size="32" style="flex-shrink:0">{{ (rec.leader_name || rec.leader_user_id || '').charAt(0) }}</a-avatar>
            <div class="record-body">
              <div class="record-leader">{{ rec.leader_name || rec.leader_user_id }} 的拼团</div>
              <div class="record-meta">已参 {{ rec.memberCount }}/{{ act.groupSize }} 人 · 剩余 {{ timeLeft(rec.expire_time) }}</div>
            </div>
            <a-button type="primary" size="small" @click="joinGroup(act, rec)">参团</a-button>
          </div>
        </div>
        <div v-else-if="act._showRecords && act._recordsLoaded" class="records-section">
          <div class="records-title">暂无进行中的拼团</div>
        </div>
      </div>
      <a-empty v-if="activities.length === 0 && !loading" description="暂无拼团活动" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
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
    // 自动检查每个活动的用户拼团状态（只查状态不展示列表）
    for (const act of activities.value) {
      try {
        const recs: any = await http.get('/mall/groupBuy/records', { params: { activityId: act.id } })
        act.records = recs || []
        myGroups[act.id] = (recs || []).some((r: any) => r.leader_user_id === userId)
      } catch { act.records = [] }
    }
  } catch (e: any) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function toggleRecords(act: any) {
  if (act._showRecords) {
    act._showRecords = false
    return
  }
  act._showRecords = true
  await loadRecords(act)
}

async function loadRecords(act: any) {
  try {
    const res: any = await http.get('/mall/groupBuy/records', { params: { activityId: act.id } })
    act.records = res || []
    act._recordsLoaded = true
    // 检查用户是否已发起拼团
    if (!myGroups[act.id]) {
      myGroups[act.id] = (res || []).some((r: any) => r.leader_user_id === userId)
    }
  } catch {
    act.records = []
  }
}

async function startGroup(act: any) {
  try {
    const res: any = await http.post('/mall/groupBuy/startGroup', null, { params: { activityId: act.id, userId } })
    if (res?.orderId) {
      myGroups[act.id] = true
      router.push({
        name: 'groupBuyCheckout',
        query: { orderId: res.orderId, activityId: act.id, spuId: act.spuId, spuName: res.spuName, groupPrice: res.groupPrice, groupSize: act.groupSize, recordId: '' }
      })
    }
  } catch (e: any) { message.error(e?.message || '发起失败') }
}

async function joinGroup(act: any, rec: any) {
  try {
    const res: any = await http.post('/mall/groupBuy/joinGroup', null, { params: { recordId: rec.id, userId } })
    if (res?.orderId) {
      router.push({
        name: 'groupBuyCheckout',
        query: { orderId: res.orderId, activityId: act.id, recordId: rec.id, spuId: act.spuId, spuName: res.spuName, groupPrice: res.groupPrice, groupSize: act.groupSize }
      })
    }
  } catch (e: any) { message.error(e?.message || '参团失败') }
}

onMounted(loadData)
</script>

<style scoped>
.group-buy-page { max-width: 800px; margin: 0 auto; padding: 16px; }
h2 { margin: 0 0 16px; }
.activity-block { margin-bottom: 20px; background: #fff; border-radius: 8px; padding: 16px; }
.act-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.act-name { font-size: 18px; font-weight: 700; }
.act-time { color: #999; font-size: 13px; margin-left: auto; }
.product-row { display: flex; gap: 12px; }
.product-info { flex: 1; }
.product-name { font-size: 15px; font-weight: 500; }
.price-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.group-price { font-size: 20px; font-weight: 700; color: #e4393c; }
.orig-price { font-size: 13px; color: #999; text-decoration: line-through; }
.group-size { font-size: 12px; color: #999; margin-top: 2px; }
.records-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.records-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #333; }
.record-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
.record-body { flex: 1; }
.record-leader { font-size: 14px; }
.record-meta { font-size: 12px; color: #999; }
</style>
