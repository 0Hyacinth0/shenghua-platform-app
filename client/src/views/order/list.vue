<template>
  <div class="order-list-page">
    <h2 class="page-title">我的订单</h2>

    <a-tabs v-model:activeKey="currentTab" @change="onTabChange">
      <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.label" />
    </a-tabs>

    <a-spin :spinning="loading">
      <div v-if="orders.length === 0 && !loading" class="empty">
        <a-empty description="暂无订单" />
      </div>

      <div v-else class="order-cards">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <span class="order-time">{{ order.createTime }}</span>
            </div>
            <a-tag :color="statusColor(order.orderStatus, order.orderType, order.remark)">{{ statusLabel(order.orderStatus, order.orderType, order.remark) }}</a-tag>
          </div>

          <div class="order-body">
            <div class="order-items">
              <div
                v-for="item in (order.orderItems || order.items || [])"
                :key="item.id"
                class="order-item"
                @click="$router.push({ name: 'orderDetail', params: { id: order.id } })"
              >
                <a-image
                  :src="imgUrl(item.productImage)"
                  :preview="false"
                  :width="64"
                  :height="64"
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGR5PSIuM2VtIiBmaWxsPSIjYmJiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEwIj7lm77niYfliqDovb0gPC90ZXh0Pjwvc3ZnPg=="
                  style="border-radius:4px"
                />
                <div class="item-info">
                  <div class="item-name">{{ item.productName }}</div>
                  <div class="item-qty">x{{ item.quantity }}</div>
                </div>
              </div>
            </div>
            <div class="order-amount">
              <span>实付：</span>
              <span class="amount-value">&yen;{{ order.payAmount || order.totalAmount || 0 }}</span>
            </div>
          </div>

          <div class="order-footer">
            <slot name="actions" v-bind:order="order">
              <!-- 待付款：取消订单 + 去支付 -->
              <template v-if="order.orderStatus === 0 || order.orderStatus === '0'">
                <a-button @click="handleCancel(order)">取消订单</a-button>
                <a-button type="primary" @click="handlePay(order)">去支付</a-button>
              </template>
              <!-- 待发货 -->
              <template v-else-if="order.orderStatus === 1 || order.orderStatus === '1'">
                <a-button @click="goDetail(order)">查看详情</a-button>
              </template>
              <!-- 已发货：确认收货 -->
              <template v-else-if="order.orderStatus === 2 || order.orderStatus === '2'">
                <a-button type="primary" @click="handleConfirm(order)">确认收货</a-button>
                <a-button @click="goDetail(order)">查看详情</a-button>
              </template>
              <!-- 其他状态 -->
              <template v-else>
                <a-button @click="goDetail(order)">查看详情</a-button>
              </template>
            </slot>
          </div>
        </div>
      </div>

      <div v-if="total > pageSize" class="pagination-wrap">
        <a-pagination
          v-model:current="page"
          :total="total"
          :page-size="pageSize"
          :show-size-changer="false"
          @change="fetchOrders"
        />
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { getOrderList, cancelOrder, dummyPay, confirmReceipt, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()

// 当前用户ID（从登录状态获取）
const currentUserId = getCurrentUserId()

const tabs = [
  { key: '', label: '全部' },
  { key: '0', label: '待付款' },
  { key: '1', label: '待发货' },
  { key: '2', label: '已发货' },
  { key: '3', label: '已完成' },
]

const currentTab = ref('')
const orders = ref<any[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)

const statusLabelMap: Record<number, string> = {
  0: '待付款',
  1: '待发货',
  2: '已发货',
  3: '已完成',
  4: '已取消',
  5: '退款中',
  6: '已退款',
}

const statusColorMap: Record<number, string> = {
  0: 'orange',
  1: 'blue',
  2: 'cyan',
  3: 'green',
  4: 'gray',
  5: 'red',
  6: 'purple',
}

function statusLabel(status: any, orderType?: any, remark?: any): string {
  const s = Number(status)
  if (s === 1 && Number(orderType) === 3) {
    return (remark && String(remark).includes('拼团成功')) ? '待发货' : '拼单中'
  }
  return statusLabelMap[s] ?? '未知'
}

function statusColor(status: any, orderType?: any, remark?: any): string {
  const s = Number(status)
  if (s === 1 && Number(orderType) === 3) {
    return (remark && String(remark).includes('拼团成功')) ? 'blue' : 'orange'
  }
  return statusColorMap[s] ?? 'default'
}

async function fetchOrders() {
  loading.value = true
  try {
    const orderStatus = currentTab.value || undefined
    const res = await getOrderList({ userId: currentUserId, orderStatus, pageNo: page.value, pageSize })
    if (res) {
      orders.value = res.records || []
      total.value = res.total || 0
    }
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

function onTabChange() {
  page.value = 1
  fetchOrders()
}

async function handleCancel(order: any) {
  Modal.confirm({
    title: '取消订单',
    content: '确定要取消该订单吗？',
    okText: '确定',
    cancelText: '返回',
    onOk: async () => {
      try {
        await cancelOrder(order.id)
        message.success('订单已取消')
        fetchOrders()
      } catch {
        message.error('取消失败')
      }
    },
  })
}

async function handlePay(order: any) {
  try {
    await dummyPay(order.id)
    message.success('支付成功')
    fetchOrders()
  } catch {
    message.error('支付失败')
  }
}

async function handleConfirm(order: any) {
  Modal.confirm({
    title: '确认收货',
    content: '确定已收到商品吗？',
    okText: '确定',
    cancelText: '返回',
    onOk: async () => {
      try {
        // 确认收货通过订单状态更新接口
        await confirmReceipt(order.id)
        message.success('已确认收货')
        fetchOrders()
      } catch {
        message.error('操作失败')
      }
    },
  })
}

function goDetail(order: any) {
  router.push({ name: 'orderDetail', params: { id: order.id } })
}

onMounted(fetchOrders)
</script>

<style scoped>
.order-list-page {
  background: #f8f8f8;
  border-radius: 0;
  padding: 16px;
  padding-bottom: 100px;
  max-width: 480px;
  margin: 0 auto;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
}

.empty {
  padding: 80px 0;
}

.order-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.order-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
}

.order-body {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.order-items {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.order-item {
  display: flex;
  gap: 8px;
  cursor: pointer;
}

.item-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 13px;
  color: #333;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-qty {
  font-size: 12px;
  color: #999;
}

.order-amount {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  min-width: 120px;
  font-size: 13px;
  color: #666;
}

.amount-value {
  font-size: 18px;
  font-weight: 700;
  color: #e4393c;
}

.order-footer {
  padding: 10px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>