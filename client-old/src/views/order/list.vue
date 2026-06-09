<template>
  <div class="order-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <button class="page-back" @click="$router.back()"><LeftOutlined /></button>
      <span class="page-title">我的订单</span>
      <div style="width:32px" />
    </header>

    <!-- Tab 切换 -->
    <div class="order-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="order-tab"
        :class="{ active: currentTab === tab.key }"
        @click="onTabChange(tab.key)"
      >{{ tab.label }}</button>
    </div>

    <!-- 订单列表 -->
    <a-spin :spinning="loading">
      <div v-if="orders.length === 0 && !loading" class="empty-wrap">
        <FileTextOutlined class="empty-icon" />
        <div class="empty-text">暂无订单</div>
      </div>

      <div v-else class="order-list">
        <div v-for="order in orders" :key="order.id" class="order-card" @click="goDetail(order)">
          <div class="order-header">
            <span class="order-no">{{ order.orderNo }}</span>
            <span class="order-status" :class="'status-' + Number(order.orderStatus)">
              {{ statusLabel(order.orderStatus, order.orderType, order.remark) }}
            </span>
          </div>

          <div class="order-items">
            <div v-for="item in (order.orderItems || order.items || [])" :key="item.id" class="order-item">
              <div class="order-item-img">
                <img v-if="item.productImage" :src="imgUrl(item.productImage)" :alt="item.productName" />
                <div v-else class="img-placeholder"><ShoppingOutlined style="font-size:18px;color:#ddd" /></div>
              </div>
              <div class="order-item-body">
                <div class="order-item-name">{{ item.productName }}</div>
                <div class="order-item-qty">x{{ item.quantity }}</div>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <span class="order-total">共{{ (order.orderItems || order.items || []).reduce((s: number, i: any) => s + i.quantity, 0) }}件 实付 <strong>¥{{ order.payAmount || order.totalAmount || 0 }}</strong></span>
            <div class="order-actions" @click.stop>
              <template v-if="order.orderStatus === 0 || order.orderStatus === '0'">
                <button class="btn-ghost-sm" @click="handleCancel(order)">取消</button>
                <button class="btn-primary-sm" @click="handlePay(order)">去支付</button>
              </template>
              <template v-else-if="order.orderStatus === 2 || order.orderStatus === '2'">
                <button class="btn-primary-sm" @click="handleConfirm(order)">确认收货</button>
              </template>
              <template v-else>
                <button class="btn-ghost-sm" @click="goDetail(order)">查看详情</button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { LeftOutlined, FileTextOutlined, ShoppingOutlined } from '@ant-design/icons-vue'
import { getOrderList, cancelOrder, dummyPay, confirmReceipt, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
const currentUserId = getCurrentUserId()

const tabs = [
  { key: '', label: '全部' },
  { key: '0', label: '待付款' },
  { key: '1', label: '待发货' },
  { key: '2', label: '待收货' },
  { key: '3', label: '已完成' },
]

const currentTab = ref('')
const orders = ref<any[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)

const statusLabelMap: Record<number, string> = { 0: '待付款', 1: '待发货', 2: '待收货', 3: '已完成', 4: '已取消', 5: '退款中', 6: '已退款' }

function statusLabel(status: any, orderType?: any, remark?: any): string {
  const s = Number(status)
  if (s === 1 && Number(orderType) === 3) return (remark && String(remark).includes('拼团成功')) ? '待发货' : '拼单中'
  return statusLabelMap[s] ?? '未知'
}

async function fetchOrders() {
  loading.value = true
  try {
    const orderStatus = currentTab.value || undefined
    const res = await getOrderList({ userId: currentUserId, orderStatus, pageNo: page.value, pageSize })
    orders.value = res?.records || []
    total.value = res?.total || 0
  } catch { orders.value = [] }
  finally { loading.value = false }
}

function onTabChange(key: string) {
  currentTab.value = key
  page.value = 1
  fetchOrders()
}

async function handleCancel(order: any) {
  Modal.confirm({
    title: '取消订单', content: '确定要取消该订单吗？', okText: '确定', cancelText: '返回',
    onOk: async () => { try { await cancelOrder(order.id); message.success('已取消'); fetchOrders() } catch { message.error('取消失败') } },
  })
}

async function handlePay(order: any) {
  try { await dummyPay(order.id); message.success('支付成功'); fetchOrders() } catch { message.error('支付失败') }
}

async function handleConfirm(order: any) {
  Modal.confirm({
    title: '确认收货', content: '确定已收到商品吗？', okText: '确定', cancelText: '返回',
    onOk: async () => { try { await confirmReceipt(order.id); message.success('已确认收货'); fetchOrders() } catch { message.error('操作失败') } },
  })
}

function goDetail(order: any) { router.push({ name: 'orderDetail', params: { id: order.id } }) }

onMounted(fetchOrders)
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px);
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-card, #fff);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  min-height: 48px;
}

.page-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--color-text, #1a1a1a); background: transparent; }
.page-title { font-size: 17px; font-weight: 600; color: var(--color-text, #1a1a1a); }

/* ---- Tabs ---- */
.order-tabs {
  display: flex;
  background: var(--color-card, #fff);
  padding: 0 8px;
  border-bottom: 0.5px solid var(--color-divider, #f0f0f0);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.order-tab {
  flex: 1;
  min-width: 60px;
  padding: 12px 8px;
  font-size: 14px;
  color: var(--color-text-secondary, #666);
  background: transparent;
  border: none;
  position: relative;
  white-space: nowrap;
  font-weight: 500;
  cursor: pointer;
}

.order-tab.active {
  color: var(--color-text, #1a1a1a);
  font-weight: 600;
}

.order-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-primary, #FF4D4F);
}

/* ---- 订单列表 ---- */
.order-list { padding: 12px 16px; }

.order-card {
  background: var(--color-card, #fff);
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  cursor: pointer;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--color-divider, #f0f0f0);
}

.order-no { font-size: 12px; color: var(--color-text-hint, #999); }

.order-status {
  font-size: 13px;
  font-weight: 600;
}

.status-0 { color: var(--color-warning, #FAAD14); }
.status-1 { color: var(--color-info, #1890FF); }
.status-2 { color: var(--color-primary, #FF4D4F); }
.status-3 { color: var(--color-success, #52C41A); }
.status-4 { color: var(--color-text-hint, #999); }

.order-items { padding: 12px 16px; }

.order-item {
  display: flex;
  gap: 12px;
  padding: 6px 0;
}

.order-item + .order-item { border-top: 0.5px solid var(--color-divider, #f0f0f0); }

.order-item-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg, #f5f5f5);
}

.order-item-img img { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

.order-item-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
.order-item-name { font-size: 13px; color: var(--color-text, #1a1a1a); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.order-item-qty { font-size: 12px; color: var(--color-text-hint, #999); margin-top: 2px; }

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 0.5px solid var(--color-divider, #f0f0f0);
}

.order-total { font-size: 13px; color: var(--color-text-secondary, #666); }
.order-total strong { font-size: 16px; font-weight: 700; color: var(--color-primary, #FF4D4F); }

.order-actions { display: flex; gap: 8px; }

.btn-ghost-sm {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border, #eee);
  background: transparent;
  font-size: 12px;
  color: var(--color-text-secondary, #666);
  cursor: pointer;
}

.btn-primary-sm {
  padding: 6px 14px;
  border-radius: 999px;
  border: none;
  background: var(--color-primary, #FF4D4F);
  font-size: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.btn-ghost-sm:active { background: var(--color-bg, #f5f5f5); }
.btn-primary-sm:active { opacity: 0.85; }
</style>
