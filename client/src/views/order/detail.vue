<template>
  <div class="order-detail-page">
    <a-page-header title="订单详情" @back="() => $router.push('/orders')">
      <template #subTitle>
        <a-space>
          <a-tag :color="statusColor(order.orderStatus, order.orderType, order.remark)">{{ statusLabel(order.orderStatus, order.orderType, order.remark) }}</a-tag>
          <span class="order-no">订单号：{{ order.orderNo }}</span>
        </a-space>
      </template>
    </a-page-header>

    <a-spin :spinning="loading">
      <div v-if="!order.id && !loading" class="empty">
        <a-result status="404" title="订单不存在" />
      </div>
      <template v-else>
        <!-- 进度条 -->
        <div class="steps-section" v-if="steps.length > 0">
          <a-steps :current="currentStep" size="small">
            <a-step v-for="(step, idx) in steps" :key="idx" :title="step.title" :description="step.description" />
          </a-steps>
        </div>

        <!-- 收货信息 -->
        <div class="info-section">
          <h3 class="section-title">收货信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">收货人：</span>
              <span>{{ order.receiverName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">联系电话：</span>
              <span>{{ order.receiverPhone }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">收货地址：</span>
              <span>{{ order.receiverProvince }}{{ order.receiverCity }}{{ order.receiverDistrict }} {{ order.receiverAddress }}</span>
            </div>
            <div class="info-item" v-if="order.remark">
              <span class="info-label">备注：</span>
              <span>{{ order.remark }}</span>
            </div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="info-section">
          <h3 class="section-title">订单信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">订单号：</span>
              <span>{{ order.orderNo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">订单状态：</span>
              <a-tag :color="statusColor(order.orderStatus, order.orderType, order.remark)">{{ statusLabel(order.orderStatus, order.orderType, order.remark) }}</a-tag>
            </div>
            <div class="info-item">
              <span class="info-label">商品总额：</span>
              <span class="highlight">&yen;{{ order.totalAmount || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">运费：</span>
              <span>&yen;{{ order.freight || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">实付金额：</span>
              <span class="amount">&yen;{{ order.payAmount || order.totalAmount || 0 }}</span>
            </div>
            <div class="info-item" v-if="order.pointsEarned > 0">
              <span class="info-label">获得积分：</span>
              <span class="highlight">+{{ order.pointsEarned }} 积分</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间：</span>
              <span>{{ order.createTime }}</span>
            </div>
            <div class="info-item" v-if="order.payTime">
              <span class="info-label">付款时间：</span>
              <span>{{ order.payTime }}</span>
            </div>
            <div class="info-item" v-if="order.deliveryTime">
              <span class="info-label">发货时间：</span>
              <span>{{ order.deliveryTime }}</span>
            </div>
          </div>
        </div>

        <!-- 虚拟商品发货链接 -->
        <div class="info-section" v-if="virtualUrls.length > 0">
          <div class="virtual-url-box">
            <h3>虚拟商品发货链接</h3>
            <div v-for="(url, idx) in virtualUrls" :key="idx" style="margin-bottom:4px">
              <a :href="url" target="_blank">{{ url }}</a>
            </div>
          </div>
        </div>

        <!-- 物流信息 -->
        <div class="info-section" v-if="order.orderStatus >= 2 && order.expressCompany">
          <h3 class="section-title">物流信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">快递公司：</span>
              <span>{{ order.expressCompany }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">快递单号：</span>
              <span>{{ order.expressNo || '暂无' }}</span>
            </div>
            <div class="info-item" v-if="order.deliveryTime">
              <span class="info-label">发货时间：</span>
              <span>{{ order.deliveryTime }}</span>
            </div>
          </div>
        </div>

        <!-- 商品明细 -->
        <div class="info-section">
          <h3 class="section-title">商品明细</h3>
          <div class="goods-list">
            <div v-for="item in (order.orderItems || order.items || [])" :key="item.id" class="goods-item">
              <div class="goods-img">
                <a-image
                  :src="imgUrl(item.productImage)"
                  :preview="false"
                  :width="64"
                  :height="64"
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGR5PSIuM2VtIiBmaWxsPSIjYmJiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEwIj7lm77niYfliqDovb0gPC90ZXh0Pjwvc3ZnPg=="
                  style="border-radius:4px"
                />
              </div>
              <div class="goods-info">
                <div class="goods-name">{{ item.productName }}</div>
                <div class="goods-spec" v-if="item.specDesc">{{ item.specDesc }}</div>
              </div>
              <div class="goods-price">&yen;{{ item.salePrice }}</div>
              <div class="goods-qty">x{{ item.quantity }}</div>
              <div class="goods-subtotal">&yen;{{ (item.salePrice * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- 操作日志 -->
        <div class="info-section" v-if="(order.logList || order.logs || []).length > 0">
          <h3 class="section-title">操作日志</h3>
          <a-timeline>
            <a-timeline-item
              v-for="log in (order.logList || order.logs || [])"
              :key="log.id"
              :color="log.color || 'blue'"
            >
              <div>{{ log.content || log.description }}</div>
              <div class="log-time">{{ log.createTime }}</div>
            </a-timeline-item>
          </a-timeline>
        </div>

        <!-- 底部操作 -->
        <div class="footer-actions">
          <template v-if="order.orderStatus === 0 || order.orderStatus === '0'">
            <a-button @click="handleCancel">取消订单</a-button>
            <a-button type="primary" @click="handlePay">去支付</a-button>
          </template>
          <template v-else-if="order.orderStatus === 2 || order.orderStatus === '2'">
            <a-button type="primary" @click="handleConfirm">确认收货</a-button>
          </template>
          <a-button @click="$router.push('/orders')">返回订单列表</a-button>
        </div>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { getOrderDetail, cancelOrder, dummyPay, confirmReceipt, imgUrl } from '@/api'

const route = useRoute()
const router = useRouter()

const order = ref<any>({})
const loading = ref(true)

// 提取虚拟商品发货链接
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

const stepStatusMap: Record<number, number> = {
  0: 0, // 待付款
  1: 1, // 待发货
  2: 2, // 已发货
  3: 3, // 已完成
  4: -1, // 已取消 - 不显示进度
  5: 1, // 退款中
  6: 2, // 已退款
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

const steps = computed(() => {
  const status = Number(order.value.orderStatus)
  if (status === 4) return []
  return [
    { title: '提交订单', description: order.value.createTime || '' },
    { title: '付款', description: order.value.payTime || '' },
    { title: '发货', description: order.value.deliveryTime || '' },
    { title: '确认收货', description: order.value.arrivalTime || order.value.finishTime || '' },
  ]
})

const currentStep = computed(() => {
  const status = Number(order.value.orderStatus)
  return stepStatusMap[status] ?? 0
})

onMounted(async () => {
  try {
    const data = await getOrderDetail(route.params.id as string)
    order.value = data || {}
  } catch {
    order.value = {}
  } finally {
    loading.value = false
  }
})

async function handleCancel() {
  Modal.confirm({
    title: '取消订单',
    content: '确定要取消该订单吗？',
    okText: '确定',
    cancelText: '返回',
    onOk: async () => {
      try {
        await cancelOrder(order.value.id)
        message.success('订单已取消')
        const data = await getOrderDetail(route.params.id as string)
        order.value = data || {}
      } catch {
        message.error('取消失败')
      }
    },
  })
}

async function handlePay() {
  try {
    await dummyPay(order.value.id)
    message.success('支付成功')
    const data = await getOrderDetail(route.params.id as string)
    order.value = data || {}
  } catch {
    message.error('支付失败')
  }
}

async function handleConfirm() {
  Modal.confirm({
    title: '确认收货',
    content: '确定已收到商品吗？',
    okText: '确定',
    cancelText: '返回',
    onOk: async () => {
      try {
        await confirmReceipt(order.value.id)
        message.success('已确认收货')
        const data = await getOrderDetail(route.params.id as string)
        order.value = data || {}
      } catch {
        message.error('操作失败')
      }
    },
  })
}
</script>

<style scoped>
.order-detail-page {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.order-no {
  color: #666;
  font-size: 13px;
}

.virtual-url-box { background: #e6f7ff; border: 1px solid #91d5ff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.virtual-url-box h3 { margin: 0 0 8px; font-size: 15px; color: #1890ff; }
.virtual-url-box a { font-size: 14px; word-break: break-all; }

.steps-section {
  padding: 20px 24px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 24px;
}

.info-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 32px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
}

.info-item.full-width {
  width: 100%;
}

.info-label {
  color: #999;
  flex-shrink: 0;
}

.highlight {
  color: #e4393c;
}

.amount {
  font-size: 18px;
  font-weight: 700;
  color: #e4393c;
}

.goods-list {
  display: flex;
  flex-direction: column;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.goods-img {
  margin-right: 12px;
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-name {
  font-size: 14px;
  color: #333;
}

.goods-spec {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.goods-price,
.goods-qty,
.goods-subtotal {
  width: 100px;
  text-align: center;
  font-size: 14px;
  color: #333;
}

.goods-subtotal {
  color: #e4393c;
}

.log-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.empty {
  padding: 80px 0;
}
</style>
