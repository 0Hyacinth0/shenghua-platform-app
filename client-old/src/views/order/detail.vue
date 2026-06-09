<template>
  <div class="order-detail-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <button class="page-back" @click="$router.push('/orders')"><LeftOutlined /></button>
      <span class="page-title">订单详情</span>
      <div style="width:32px" />
    </header>

    <a-spin :spinning="loading">
      <div v-if="!order.id && !loading" class="empty-wrap">
        <FileTextOutlined class="empty-icon" />
        <div class="empty-text">订单不存在</div>
      </div>

      <template v-else>
        <!-- 状态栏 -->
        <section class="status-section" :class="'status-bg-' + Number(order.orderStatus)">
          <div class="status-text">{{ statusLabel(order.orderStatus, order.orderType, order.remark) }}</div>
          <div class="status-no">订单号：{{ order.orderNo }}</div>
        </section>

        <!-- 进度条 -->
        <section class="progress-section" v-if="steps.length > 0 && Number(order.orderStatus) !== 4">
          <div class="progress-steps">
            <div v-for="(step, idx) in steps" :key="idx" class="step-item" :class="{ active: idx <= currentStep, done: idx < currentStep }">
              <div class="step-dot">{{ idx < currentStep ? '✓' : idx + 1 }}</div>
              <div class="step-label">{{ step.title }}</div>
            </div>
          </div>
        </section>

        <!-- 收货信息 -->
        <section class="info-card">
          <div class="card-title"><EnvironmentOutlined /> 收货信息</div>
          <div class="addr-info">
            <div class="addr-top">
              <span class="addr-name">{{ order.receiverName }}</span>
              <span class="addr-phone">{{ order.receiverPhone }}</span>
            </div>
            <div class="addr-detail">{{ order.receiverProvince }}{{ order.receiverCity }}{{ order.receiverDistrict }} {{ order.receiverAddress }}</div>
          </div>
        </section>

        <!-- 虚拟商品链接 -->
        <section class="info-card virtual-card" v-if="virtualUrls.length > 0">
          <div class="card-title"><LinkOutlined /> 虚拟商品发货链接</div>
          <div v-for="(url, idx) in virtualUrls" :key="idx" class="virtual-url">
            <a :href="url" target="_blank">{{ url }}</a>
          </div>
        </section>

        <!-- 商品明细 -->
        <section class="info-card">
          <div class="card-title"><ShoppingOutlined /> 商品明细</div>
          <div v-for="item in (order.orderItems || order.items || [])" :key="item.id" class="goods-item">
            <div class="goods-img">
              <img v-if="item.productImage" :src="imgUrl(item.productImage)" :alt="item.productName" />
              <div v-else class="img-placeholder"><ShoppingOutlined style="font-size:18px;color:#ddd" /></div>
            </div>
            <div class="goods-body">
              <div class="goods-name">{{ item.productName }}</div>
              <div class="goods-spec" v-if="item.specDesc">{{ item.specDesc }}</div>
              <div class="goods-bottom">
                <span class="goods-price">¥{{ item.salePrice }}</span>
                <span class="goods-qty">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 物流信息 -->
        <section class="info-card" v-if="order.orderStatus >= 2 && order.expressCompany">
          <div class="card-title"><CarOutlined /> 物流信息</div>
          <div class="info-row">
            <span class="info-label">快递公司</span>
            <span class="info-value">{{ order.expressCompany }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">快递单号</span>
            <span class="info-value">{{ order.expressNo || '暂无' }}</span>
          </div>
        </section>

        <!-- 订单信息 -->
        <section class="info-card">
          <div class="card-title"><FileTextOutlined /> 订单信息</div>
          <div class="info-row">
            <span class="info-label">商品总额</span>
            <span class="info-value">¥{{ order.totalAmount || 0 }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">运费</span>
            <span class="info-value">{{ order.freight > 0 ? '¥' + order.freight : '免运费' }}</span>
          </div>
          <div class="info-row total">
            <span class="info-label">实付金额</span>
            <span class="info-value total-price"><span class="price-symbol">¥</span>{{ order.payAmount || order.totalAmount || 0 }}</span>
          </div>
          <div class="info-divider" />
          <div class="info-row">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ order.createTime }}</span>
          </div>
          <div class="info-row" v-if="order.payTime">
            <span class="info-label">付款时间</span>
            <span class="info-value">{{ order.payTime }}</span>
          </div>
          <div class="info-row" v-if="order.deliveryTime">
            <span class="info-label">发货时间</span>
            <span class="info-value">{{ order.deliveryTime }}</span>
          </div>
          <div class="info-row" v-if="order.remark">
            <span class="info-label">备注</span>
            <span class="info-value">{{ order.remark }}</span>
          </div>
        </section>

        <!-- 操作日志 -->
        <section class="info-card" v-if="(order.logList || order.logs || []).length > 0">
          <div class="card-title"><ClockCircleOutlined /> 操作日志</div>
          <div v-for="log in (order.logList || order.logs || [])" :key="log.id" class="log-item">
            <div class="log-dot" />
            <div class="log-content">
              <div class="log-text">{{ log.content || log.description }}</div>
              <div class="log-time">{{ log.createTime }}</div>
            </div>
          </div>
        </section>

        <!-- 底部操作 -->
        <section class="action-section">
          <template v-if="order.orderStatus === 0 || order.orderStatus === '0'">
            <button class="btn-ghost" @click="handleCancel">取消订单</button>
            <button class="btn-primary" @click="handlePay">去支付</button>
          </template>
          <template v-else-if="order.orderStatus === 2 || order.orderStatus === '2'">
            <button class="btn-primary" @click="handleConfirm">确认收货</button>
          </template>
          <button class="btn-ghost" @click="$router.push('/orders')">返回订单列表</button>
        </section>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  LeftOutlined, EnvironmentOutlined, ShoppingOutlined,
  FileTextOutlined, CarOutlined, ClockCircleOutlined, LinkOutlined,
} from '@ant-design/icons-vue'
import { getOrderDetail, cancelOrder, dummyPay, confirmReceipt, imgUrl } from '@/api'

const route = useRoute()
const router = useRouter()
const order = ref<any>({})
const loading = ref(true)

const virtualUrls = computed(() => {
  const logs = order.value.logList || order.value.logs || []
  const urls: string[] = []
  for (const log of logs) {
    const desc = log.actionDesc || log.actionType || log.content || log.description || ''
    if (desc.includes('虚拟商品自动发货') || desc.includes('auto_ship')) {
      const match = desc.match(/https?:\/\/\S+/)
      if (match) urls.push(match[0])
      else urls.push(desc.replace('虚拟商品自动发货:', '').replace('auto_ship:', '').trim())
    }
  }
  return urls
})

const statusLabelMap: Record<number, string> = { 0: '待付款', 1: '待发货', 2: '待收货', 3: '已完成', 4: '已取消', 5: '退款中', 6: '已退款' }

function statusLabel(status: any, orderType?: any, remark?: any): string {
  const s = Number(status)
  if (s === 1 && Number(orderType) === 3) return (remark && String(remark).includes('拼团成功')) ? '待发货' : '拼单中'
  return statusLabelMap[s] ?? '未知'
}

const steps = computed(() => {
  if (Number(order.value.orderStatus) === 4) return []
  return [
    { title: '下单', time: order.value.createTime || '' },
    { title: '付款', time: order.value.payTime || '' },
    { title: '发货', time: order.value.deliveryTime || '' },
    { title: '完成', time: order.value.arrivalTime || order.value.finishTime || '' },
  ]
})

const currentStep = computed(() => {
  const m: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3, 4: -1, 5: 1, 6: 2 }
  return m[Number(order.value.orderStatus)] ?? 0
})

onMounted(async () => {
  try { order.value = await getOrderDetail(route.params.id as string) || {} } catch { order.value = {} }
  finally { loading.value = false }
})

async function handleCancel() {
  Modal.confirm({ title: '取消订单', content: '确定要取消该订单吗？', okText: '确定', cancelText: '返回',
    onOk: async () => { try { await cancelOrder(order.value.id); message.success('已取消'); order.value = await getOrderDetail(route.params.id as string) || {} } catch { message.error('取消失败') } },
  })
}

async function handlePay() {
  try { await dummyPay(order.value.id); message.success('支付成功'); order.value = await getOrderDetail(route.params.id as string) || {} } catch { message.error('支付失败') }
}

async function handleConfirm() {
  Modal.confirm({ title: '确认收货', content: '确定已收到商品吗？', okText: '确定', cancelText: '返回',
    onOk: async () => { try { await confirmReceipt(order.value.id); message.success('已确认收货'); order.value = await getOrderDetail(route.params.id as string) || {} } catch { message.error('操作失败') } },
  })
}
</script>

<style scoped>
.order-detail-page {
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

/* ---- 状态栏 ---- */
.status-section {
  padding: 24px 20px;
  background: linear-gradient(135deg, var(--color-primary, #FF4D4F) 0%, #FF7875 100%);
  color: white;
}

.status-bg-4 { background: linear-gradient(135deg, #999 0%, #bbb 100%); }
.status-bg-3 { background: linear-gradient(135deg, #52C41A 0%, #95DE64 100%); }

.status-text { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.status-no { font-size: 12px; opacity: 0.8; }

/* ---- 进度条 ---- */
.progress-section {
  background: var(--color-card, #fff);
  margin: 12px 16px;
  border-radius: 12px;
  padding: 20px 16px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  height: 2px;
  background: var(--color-border, #eee);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-border, #eee);
  color: var(--color-text-hint, #999);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.step-item.active .step-dot {
  background: var(--color-primary, #FF4D4F);
  color: white;
}

.step-item.done .step-dot {
  background: var(--color-success, #52C41A);
  color: white;
}

.step-label { font-size: 11px; color: var(--color-text-hint, #999); }
.step-item.active .step-label { color: var(--color-text, #1a1a1a); font-weight: 500; }

/* ---- 信息卡片 ---- */
.info-card {
  background: var(--color-card, #fff);
  margin: 0 16px 12px;
  border-radius: 12px;
  padding: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-title :deep(svg) { color: var(--color-primary, #FF4D4F); }

/* ---- 地址 ---- */
.addr-info { padding-left: 22px; }
.addr-top { display: flex; gap: 8px; margin-bottom: 4px; }
.addr-name { font-size: 15px; font-weight: 600; color: var(--color-text, #1a1a1a); }
.addr-phone { font-size: 14px; color: var(--color-text-secondary, #666); }
.addr-detail { font-size: 13px; color: var(--color-text-secondary, #666); line-height: 1.4; }

/* ---- 虚拟商品 ---- */
.virtual-card { background: #E6F7FF; }
.virtual-url { font-size: 13px; word-break: break-all; margin-top: 6px; }
.virtual-url a { color: var(--color-info, #1890FF); }

/* ---- 商品 ---- */
.goods-item {
  display: flex; gap: 12px; padding: 10px 0;
  border-bottom: 0.5px solid var(--color-divider, #f0f0f0);
}

.goods-item:last-child { border-bottom: none; }

.goods-img {
  width: 64px; height: 64px; border-radius: 8px; overflow: hidden; flex-shrink: 0;
  background: var(--color-bg, #f5f5f5);
}

.goods-img img { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

.goods-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.goods-name { font-size: 13px; color: var(--color-text, #1a1a1a); line-height: 1.4; }
.goods-spec { font-size: 12px; color: var(--color-text-hint, #999); margin-top: 2px; }
.goods-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.goods-price { font-size: 14px; font-weight: 600; color: var(--color-primary, #FF4D4F); }
.goods-qty { font-size: 12px; color: var(--color-text-hint, #999); }

/* ---- 信息行 ---- */
.info-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; font-size: 14px;
}

.info-row.total { padding-top: 12px; }
.info-label { color: var(--color-text-hint, #999); }
.info-value { color: var(--color-text, #1a1a1a); }
.total-price { font-size: 18px; font-weight: 700; color: var(--color-primary, #FF4D4F); }
.total-price .price-symbol { font-size: 12px; }
.info-divider { height: 1px; background: var(--color-divider, #f0f0f0); margin: 8px 0; }

/* ---- 日志 ---- */
.log-item {
  display: flex; gap: 12px; padding: 8px 0;
  position: relative;
}

.log-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--color-primary, #FF4D4F);
  margin-top: 6px; flex-shrink: 0;
}

.log-content { flex: 1; }
.log-text { font-size: 13px; color: var(--color-text, #1a1a1a); }
.log-time { font-size: 12px; color: var(--color-text-hint, #999); margin-top: 2px; }

/* ---- 操作 ---- */
.action-section {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 16px; margin: 0 16px 12px;
  background: var(--color-card, #fff);
  border-radius: 12px;
}

.btn-primary {
  padding: 10px 24px; border-radius: 999px; border: none;
  background: var(--color-primary, #FF4D4F); color: white;
  font-size: 14px; font-weight: 600; cursor: pointer;
}

.btn-ghost {
  padding: 10px 24px; border-radius: 999px;
  border: 1px solid var(--color-border, #eee);
  background: transparent; color: var(--color-text-secondary, #666);
  font-size: 14px; cursor: pointer;
}

.btn-primary:active { opacity: 0.85; }
.btn-ghost:active { background: var(--color-bg, #f5f5f5); }
</style>
