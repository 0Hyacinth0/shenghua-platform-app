<template>
  <div class="seckill-page">
    <header class="page-header">
      <button class="page-back" @click="$router.back()"><LeftOutlined /></button>
      <span class="page-title">限时秒杀</span>
      <div style="width:32px" />
    </header>

    <a-spin :spinning="loading">
      <div v-if="activities.length === 0 && !loading" class="empty-wrap">
        <ThunderboltOutlined class="empty-icon" />
        <div class="empty-text">暂无秒杀活动</div>
      </div>

      <div v-for="act in activities" :key="act.id" class="act-section">
        <div class="act-header">
          <div class="act-info">
            <span class="act-name">{{ act.activityName }}</span>
            <span class="act-time">{{ act.startTime?.substr(0,16) }} ~ {{ act.endTime?.substr(11,5) }}</span>
          </div>
          <span class="act-status" :class="'status-' + act.status">
            {{ act.status === 0 ? '即将开始' : act.status === 1 ? '进行中' : '已结束' }}
          </span>
        </div>

        <div class="product-grid">
          <div
            v-for="p in act.products" :key="p.id"
            class="product-card"
            :class="{ disabled: p.userBought >= p.limitPerUser && p.limitPerUser > 0 }"
            @click="buyNow(p)"
          >
            <div class="product-img">
              <img :src="imgUrl(p.productImage || p.mainImage)" :alt="p.productName || p.spuName" />
              <span v-if="act.status === 1" class="seckill-tag">秒杀</span>
            </div>
            <div class="product-body">
              <div class="product-name">{{ p.productName || p.spuName }}</div>
              <div class="product-price-row">
                <span class="seckill-price"><span class="price-symbol">¥</span>{{ p.seckillPrice }}</span>
                <span v-if="p.originalPrice" class="orig-price">¥{{ p.originalPrice }}</span>
              </div>
              <div class="product-meta">
                <span>库存{{ p.stock }}</span>
                <span v-if="p.limitPerUser > 0">限{{ p.limitPerUser }}件</span>
              </div>
              <div v-if="p.userBought >= p.limitPerUser && p.limitPerUser > 0" class="limit-badge">已达上限</div>
            </div>
          </div>
        </div>

        <a-empty v-if="act.products.length === 0" description="暂无商品" />
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { LeftOutlined, ThunderboltOutlined } from '@ant-design/icons-vue'
import { imgUrl } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
const activities = ref<any[]>([])
const loading = ref(false)
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
        for (const pid of pids) {
          try {
            const d: any = await http.get('/mall/spu/queryById', { params: { id: pid } })
            if (d) {
              const sp = (pr?.records || []).find((pp: any) => pp.spuId === pid)
              let userBought = 0
              try { userBought = (await http.get('/mall/seckill/userBought', { params: { spuId: pid, userId: currentUserId } })) || 0 } catch {}
              act.products.push({ ...d, seckillPrice: sp?.seckillPrice, stock: sp?.stock, soldCount: sp?.soldCount, limitPerUser: sp?.limitPerUser, originalPrice: d.minPrice, seckillProductId: sp?.id, userBought })
            }
          } catch {}
        }
      } catch {}
    }
    activities.value = acts
  } catch { message.error('加载失败') }
  finally { loading.value = false }
}

function buyNow(p: any) {
  if (p.userBought >= p.limitPerUser && p.limitPerUser > 0) { message.warning('已达限购上限'); return }
  if (p.stock <= 0) { message.warning('已售罄'); return }
  router.push({ name: 'productDetail', params: { id: p.id }, query: { seckillId: p.seckillProductId } })
}

onMounted(loadData)
</script>

<style scoped>
.seckill-page {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px);
}

.page-header {
  position: sticky; top: 0; z-index: 100;
  background: linear-gradient(135deg, var(--color-primary, #FF4D4F) 0%, #FF7875 100%);
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; min-height: 48px;
}

.page-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: white; background: rgba(255,255,255,0.15); border-radius: 50%; }
.page-title { font-size: 17px; font-weight: 600; color: white; }

.act-section {
  background: var(--color-card, #fff);
  margin: 12px 16px;
  border-radius: 12px;
  padding: 16px;
}

.act-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px; padding-bottom: 12px;
  border-bottom: 0.5px solid var(--color-divider, #f0f0f0);
}

.act-name { font-size: 16px; font-weight: 700; color: var(--color-text, #1a1a1a); }
.act-time { font-size: 12px; color: var(--color-text-hint, #999); display: block; margin-top: 2px; }

.act-status {
  font-size: 12px; font-weight: 600; padding: 3px 10px;
  border-radius: 999px; flex-shrink: 0;
}

.status-0 { background: #FFF7E6; color: #FA8C16; }
.status-1 { background: var(--color-primary-light, #FFF1F0); color: var(--color-primary, #FF4D4F); }

.product-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}

.product-card {
  border-radius: 10px; overflow: hidden;
  border: 1px solid var(--color-border, #eee);
  cursor: pointer; transition: transform 0.15s;
  position: relative;
}

.product-card:active { transform: scale(0.97); }
.product-card.disabled { opacity: 0.5; cursor: not-allowed; }

.product-img {
  aspect-ratio: 1; overflow: hidden;
  background: var(--color-bg, #f5f5f5); position: relative;
}

.product-img img { width: 100%; height: 100%; object-fit: cover; }

.seckill-tag {
  position: absolute; top: 8px; left: 8px;
  background: var(--color-primary, #FF4D4F); color: white;
  font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
}

.product-body { padding: 10px; }

.product-name {
  font-size: 13px; font-weight: 500; color: var(--color-text, #1a1a1a);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 6px;
}

.product-price-row { display: flex; align-items: baseline; gap: 6px; }
.seckill-price { font-size: 18px; font-weight: 700; color: var(--color-primary, #FF4D4F); }
.seckill-price .price-symbol { font-size: 12px; }
.orig-price { font-size: 11px; color: var(--color-text-disabled, #ccc); text-decoration: line-through; }

.product-meta {
  font-size: 11px; color: var(--color-text-hint, #999);
  margin-top: 4px; display: flex; gap: 8px;
}

.limit-badge {
  margin-top: 6px; font-size: 11px; color: var(--color-primary, #FF4D4F);
  background: var(--color-primary-light, #FFF1F0); padding: 2px 8px;
  border-radius: 4px; display: inline-block;
}
</style>
