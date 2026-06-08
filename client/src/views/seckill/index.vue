<template>
  <div class="seckill-page">
    <h2>秒杀专区</h2>
    <a-spin :spinning="loading">
      <div v-for="act in activities" :key="act.id" class="activity-block">
        <div class="act-header">
          <span class="act-name">{{ act.activityName }}</span>
          <a-tag :color="act.status===0?'orange':act.status===1?'red':'gray'">{{ act.status===0?'即将开始':act.status===1?'正在秒杀':'已结束' }}</a-tag>
          <span class="act-time">{{ act.startTime?.substr(0,16) }} ~ {{ act.endTime?.substr(0,16) }}</span>
        </div>
        <a-row :gutter="[12,12]">
          <a-col :xs="12" :sm="8" :md="6" v-for="p in act.products" :key="p.id">
            <div class="product-card" :class="{ disabled: p.userBought >= p.limitPerUser && p.limitPerUser > 0 }" @click="buyNow(p)">
              <div class="img-wrap">
                <img :src="imgUrl(p.productImage||p.mainImage)" style="width:100%;aspect-ratio:1;object-fit:cover" />
                <div class="seckill-badge" v-if="act.status===1">秒杀</div>
              </div>
              <div class="info">
                <div class="name">{{ p.productName||p.spuName }}</div>
                <div class="price-row">
                  <span class="seckill-price">¥{{ p.seckillPrice }}</span>
                  <span class="orig-price" v-if="p.originalPrice">¥{{ p.originalPrice }}</span>
                </div>
                <div class="stock-row">
                  库存 {{ p.stock }} | 已售 {{ p.soldCount||0 }}
                  <span v-if="p.limitPerUser > 0"> | 限购{{ p.limitPerUser }}件</span>
                </div>
                <div v-if="p.userBought >= p.limitPerUser && p.limitPerUser > 0" class="limit-tip">已达购买上限</div>
              </div>
            </div>
            <div v-if="p.userBought >= p.limitPerUser && p.limitPerUser > 0" class="limit-overlay">
              已买{{ p.userBought }}件
            </div>
          </a-col>
        </a-row>
        <a-empty v-if="act.products.length===0" description="暂无商品" />
      </div>
      <a-empty v-if="activities.length===0 && !loading" description="暂无秒杀活动" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { imgUrl } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
const activities = ref<any[]>([])
const loading = ref(false)

// 当前用户ID（从登录状态获取）
const currentUserId = getCurrentUserId()

async function loadData() {
  loading.value = true
  try {
    const res: any = await http.get('/mall/seckill/list', { params: { pageSize: 99 } })
    const acts = (res?.records || []).filter((a: any) => a.status !== 2)
    for (const act of acts) {
      act.products = []
      try {
        const pr: any = await http.get('/mall/seckillProduct/list', { params: { activityId: act.id, pageSize: 999 } })
        const pids = (pr?.records || []).map((p: any) => p.spuId).filter(Boolean)
        if (pids.length > 0) {
          for (const pid of pids) {
            try {
              const d: any = await http.get('/mall/spu/queryById', { params: { id: pid } })
              if (d) {
                const sp = (pr?.records||[]).find((pp:any)=>pp.spuId===pid)
                // 查询用户已购数量
                let userBought = 0
                try {
                  const ubRes: any = await http.get('/mall/seckill/userBought', { params: { spuId: pid, userId: currentUserId } })
                  userBought = ubRes || 0
                } catch { userBought = 0 }
                act.products.push({ ...d, seckillPrice: sp?.seckillPrice, stock: sp?.stock, soldCount: sp?.soldCount, limitPerUser: sp?.limitPerUser, originalPrice: d.minPrice, seckillProductId: sp?.id, userBought })
              }
            } catch (e: any) {
              console.error(`加载商品${pid}失败:`, e)
            }
          }
        }
      } catch (e: any) {
        console.error(`加载秒杀商品失败,活动ID:${act.id}`, e)
      }
    }
    activities.value = acts
  } catch (e: any) {
    console.error('加载秒杀活动失败:', e)
    message.error('加载失败，请刷新重试')
  } finally { 
    loading.value = false 
  }
}

async function buyNow(p: any) {
  if (p.userBought >= p.limitPerUser && p.limitPerUser > 0) {
    message.warning('已达限购上限，每人限购' + p.limitPerUser + '件')
    return
  }
  if (p.stock <= 0) {
    message.warning('已售罄')
    return
  }
  router.push({ name: 'productDetail', params: { id: p.id }, query: { seckillId: p.seckillProductId } })
}

onMounted(loadData)
</script>

<style scoped>
.seckill-page { max-width: 480px; margin: 0 auto; padding: 16px; padding-bottom: 100px; }
h2 { margin: 0 0 16px; }
.activity-block { margin-bottom: 24px; background: #fff; border-radius: 8px; padding: 16px; }
.act-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.act-name { font-size: 18px; font-weight: 700; }
.act-time { color: #999; font-size: 13px; margin-left: auto; }
.product-card { background: #fff; border-radius: 6px; overflow: hidden; cursor: pointer; border: 1px solid #f0f0f0; }
.product-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.product-card.disabled { opacity: 0.6; cursor: not-allowed; }
.product-card.disabled:hover { box-shadow: none; }
.img-wrap { position: relative; }
.seckill-badge { position: absolute; top: 0; left: 0; background: #e4393c; color: #fff; padding: 2px 8px; font-size: 12px; }
.info { padding: 8px; }
.name { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.price-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.seckill-price { font-size: 18px; font-weight: 700; color: #e4393c; }
.orig-price { font-size: 12px; color: #999; text-decoration: line-through; }
.stock-row { font-size: 11px; color: #999; margin-top: 2px; }
.limit-tip { font-size: 11px; color: #e4393c; margin-top: 2px; }
.product-card { position: relative; }
.limit-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.6); color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 12px; pointer-events: none; }
</style>