<template>
  <div class="checkout-page">
    <h2 class="page-title">确认订单</h2>

    <a-spin :spinning="loading" tip="加载中...">

      <!-- 收货地址 -->
      <div class="section">
        <h3 class="section-title">收货地址</h3>
        <div v-if="addressList.length === 0" class="no-address">
          <a-empty description="暂未添加收货地址">
            <template #children>
              <a-button type="primary" @click="$router.push('/address')">添加地址</a-button>
            </template>
          </a-empty>
        </div>
        <a-radio-group v-else v-model:value="selectedAddressId" style="width: 100%">
          <div class="address-list">
            <div
              v-for="addr in addressList"
              :key="addr.id"
              class="address-card"
              :class="{ active: selectedAddressId === addr.id }"
              @click="selectedAddressId = addr.id"
            >
              <a-radio :value="addr.id" />
              <div class="addr-info">
                <div class="addr-contact">
                  <strong>{{ addr.consignee }}</strong>
                  <span class="addr-phone">{{ addr.phone }}</span>
                  <a-tag v-if="addr.isDefault" color="red" size="small">默认</a-tag>
                </div>
                <div class="addr-detail">
                  {{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detailAddress }}
                </div>
              </div>
            </div>
          </div>
        </a-radio-group>
      </div>

      <!-- 优惠券 - 秒杀订单不使用优惠券 -->
      <div class="section" v-if="myCoupons.length > 0 && !isSeckillOrder">
        <h3 class="section-title">优惠券</h3>
        <a-radio-group v-model:value="selectedCouponId" style="width:100%">
          <div v-for="c in myCoupons" :key="c.id" class="coupon-option" :class="{ active: selectedCouponId === c.id }" @click="selectedCouponId = c.id">
            <a-radio :value="c.id" />
            <span class="coupon-label">
              {{ c.couponType != null ? (c.couponType === 1 ? '满减券' : c.couponType === 2 ? '折扣券' : '运费券') : '优惠券' }}
              {{ c.couponName || c.templateName || '' }}
              {{ c.discountValue != null ? ('满' + (c.minPurchaseAmount || 0) + '减' + c.discountValue) : '(ID:' + c.templateId + ')' }}
            </span>
          </div>
        </a-radio-group>
        <a-button type="link" v-if="selectedCouponId" @click="selectedCouponId = ''">不使用优惠券</a-button>
      </div>

      <!-- 商品列表 -->
      <div class="section">
        <h3 class="section-title">商品信息</h3>
        <div v-if="selectedItems.length === 0" class="empty">
          <a-empty description="未选择商品" />
        </div>
        <div v-else class="goods-list">
          <div v-for="item in selectedItems" :key="item.id" class="goods-item">
            <div class="goods-img">
              <a-image
                :src="imgUrl(item.mainImage)"
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
            <div class="goods-price">&yen;{{ item.price }}</div>
            <div class="goods-qty">x{{ item.quantity }}</div>
            <div class="goods-subtotal">&yen;{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <!-- 金额汇总 -->
      <div class="section">
        <h3 class="section-title">订单汇总</h3>
        <div class="summary-list">
          <div class="summary-row">
            <span>商品总额</span>
            <span class="highlight">&yen;{{ goodsTotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>运费</span>
            <span>&yen;{{ freight.toFixed(2) }}</span>
          </div>
          <div class="summary-row" v-if="couponDiscount > 0" style="color:#e4393c">
            <span>优惠券抵扣</span>
            <span>-&yen;{{ couponDiscount.toFixed(2) }}</span>
          </div>
          <div class="summary-row total-row">
            <span>合计</span>
            <span class="total-price">&yen;{{ orderTotal.toFixed(2) }}</span>
          </div>
        </div>

        <div class="remark-row">
          <span class="remark-label">备注：</span>
          <a-textarea v-model:value="remark" placeholder="选填：给卖家的留言" :rows="2" :maxlength="200" show-count />
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-row">
        <a-button type="primary" size="large" class="submit-btn" @click="handleSubmit" :disabled="!canSubmit" :loading="submitting">
          提交订单
        </a-button>
      </div>

    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getCartList, getAddressList, createOrder, imgUrl, getUserCoupons } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const route = useRoute()
const router = useRouter()

// 当前用户ID（从登录状态获取）
const currentUserId = getCurrentUserId()

const loading = ref(false)
const submitting = ref(false)
const addressList = ref<any[]>([])
const selectedAddressId = ref<string>('')
const selectedItems = ref<any[]>([])
const remark = ref('')

// 秒杀订单相关
const isSeckillOrder = ref(false)
const seckillProductId = ref('')
const seckillPrice = ref(0)

const freight = ref(0)

// 优惠券
const myCoupons = ref<any[]>([])
const selectedCouponId = ref('')
const couponTemplates = ref<any[]>([])

const goodsTotal = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const selectedCoupon = computed(() => {
  if (!selectedCouponId.value) return null
  const uc = myCoupons.value.find((c: any) => c.id === selectedCouponId.value)
  if (!uc) return null
  return couponTemplates.value.find((t: any) => t.id === uc.templateId) || uc
})

const couponDiscount = computed(() => {
  const c = selectedCoupon.value
  if (!c) return 0
  const total = goodsTotal.value
  if (c.couponType === 1) {
    // 满减券
    if (total >= (c.minPurchaseAmount || 0)) return c.discountValue || 0
    return 0
  }
  if (c.couponType === 2) {
    // 折扣券
    const d = total * (1 - (c.discountValue || 1))
    if (c.maxDiscountAmount && d > c.maxDiscountAmount) return c.maxDiscountAmount
    return Math.round(d * 100) / 100
  }
  if (c.couponType === 3) {
    // 运费券
    return freight.value
  }
  return 0
})

const orderTotal = computed(() => goodsTotal.value + freight.value - couponDiscount.value)

const selectedAddress = computed(() =>
  addressList.value.find(addr => addr.id === selectedAddressId.value)
)

const canSubmit = computed(() =>
  selectedAddressId.value !== '' && selectedItems.value.length > 0
)

onMounted(async () => {
  loading.value = true
  try {
    // 检查是否为秒杀订单
    const seckillId = route.query.seckillId as string
    if (seckillId) {
      isSeckillOrder.value = true
      seckillProductId.value = seckillId
      seckillPrice.value = Number(route.query.seckillPrice) || 0
    }

    // 加载地址
    const addrs: any = await getAddressList(currentUserId)
    addressList.value = addrs?.records || []
    const defaultAddr = addressList.value.find((a: any) => a.isDefault)
    if (defaultAddr) selectedAddressId.value = defaultAddr.id
    else if (addressList.value.length > 0) selectedAddressId.value = addressList.value[0].id

    // 秒杀订单不需要加载购物车
    if (isSeckillOrder.value) {
      // 加载秒杀商品信息用于展示
      const spuId = route.query.spuId as string
      if (spuId) {
        try {
          const spuData: any = await http.get('/mall/spu/queryById', { params: { id: spuId } })
          if (spuData) {
            selectedItems.value = [{
              id: 'seckill_' + seckillProductId.value,
              spuId: spuId,
              skuId: spuData.skuList?.[0]?.id || '',
              price: seckillPrice.value,
              quantity: 1,
              productName: spuData.spuName || '秒杀商品',
              mainImage: spuData.mainImage || '',
            }]
          }
        } catch { /* ignore */ }
      }
      if (selectedItems.value.length === 0) {
        selectedItems.value = [{
          id: 'seckill_' + seckillProductId.value,
          spuId: route.query.spuId,
          price: seckillPrice.value,
          quantity: 1,
          productName: '秒杀商品',
          mainImage: '',
        }]
      }
      loading.value = false
      return
    }

    // 加载购物车中选中的商品
    const cart: any = await getCartList(currentUserId)
    const cartArr = Array.isArray(cart) ? cart : []
    const itemIdsParam = (route.query.items as string) || ''
    const singleItemId = (route.query.itemId as string) || ''
    if (singleItemId) {
      // 从商品详情"立即购买"传入的单个商品ID
      const found = cartArr.filter((item: any) => item.skuId === singleItemId)
      selectedItems.value = found.length > 0 ? [found[found.length - 1]] : cartArr.filter((item: any) => item.id === singleItemId)
    } else if (itemIdsParam) {
      const ids = itemIdsParam.split(',').filter(Boolean)
      if (ids.length === 1 && ids[0].includes('_')) {
        const selected = cartArr.filter((item: any) => item.selected || ids.includes(item.id))
        selectedItems.value = selected
      } else {
        selectedItems.value = cartArr.filter((item: any) => ids.includes(item.id))
      }
    } else {
      // 未传参则取已选中的
      selectedItems.value = cartArr.filter((item: any) => item.selected)
    }

    // 加载用户优惠券(仅未使用)
    const coupons: any = await getUserCoupons(currentUserId)
    myCoupons.value = (coupons?.records || []).filter((c: any) => c.couponStatus === 0)
    // 加载优惠券模板用于计算抵扣
    if (myCoupons.value.length > 0) {
      try {
        const tplRes = await http.get('/mall/coupon/list', { params: { pageSize: 999 } })
        couponTemplates.value = tplRes?.records || []
      } catch { /* ignore */ }
    }
  } catch {
    message.error('加载失败，请重试')
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  const addr = selectedAddress.value
  if (!addr) {
    message.warning('请选择收货地址')
    return
  }
  if (selectedItems.value.length === 0) {
    message.warning('请选择商品')
    return
  }

  submitting.value = true
  try {
    // 秒杀订单走秒杀接口
    if (isSeckillOrder.value) {
      const seckillData = {
        productId: seckillProductId.value,
        userId: currentUserId,
        quantity: 1,
        receiverName: addr.consignee,
        receiverPhone: addr.phone,
        receiverProvince: addr.province,
        receiverCity: addr.city,
        receiverDistrict: addr.district,
        receiverAddress: addr.detailAddress,
        remark: remark.value,
      }
      const result: any = await http.post('/mall/seckill/buy', seckillData)
      message.success('秒杀下单成功')
      const orderId = result?.id || result
      if (orderId) {
        router.push({ name: 'orderDetail', params: { id: String(orderId) } })
      } else {
        router.push({ name: 'orders' })
      }
      return
    }

    // 普通订单走原有接口
    const orderData = {
      userId: currentUserId,
      receiverName: addr.consignee,
      receiverPhone: addr.phone,
      receiverProvince: addr.province,
      receiverCity: addr.city,
      receiverDistrict: addr.district,
      receiverAddress: addr.detailAddress,
      remark: remark.value,
      couponId: selectedCouponId.value || undefined,
      items: selectedItems.value.map(item => ({
        cartItemId: item.id,
        spuId: item.spuId,
        skuId: item.skuId,
        quantity: item.quantity,
      })),
    }
    const result = await createOrder(orderData)
    message.success('下单成功')
    // 跳转到订单详情
    const orderId = result?.id || result
    if (orderId) {
      router.push({ name: 'orderDetail', params: { id: String(orderId) } })
    } else {
      router.push({ name: 'orders' })
    }
  } catch (e: any) {
    message.error(e.message || '下单失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px;
}

.section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.no-address {
  padding: 24px 0;
}

.address-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.address-card {
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px 16px;
  min-width: 260px;
  cursor: pointer;
  transition: border-color 0.2s;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.address-card:hover {
  border-color: #e4393c;
}

.address-card.active {
  border-color: #e4393c;
  background: #fff5f5;
}

.addr-info {
  flex: 1;
}

.addr-contact {
  margin-bottom: 4px;
}

.addr-contact strong {
  margin-right: 8px;
}

.addr-phone {
  color: #666;
  margin-right: 8px;
}

.addr-detail {
  font-size: 13px;
  color: #666;
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

.summary-list {
  max-width: 320px;
  margin-left: auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
}

.summary-row .highlight {
  color: #e4393c;
}

.summary-row.total-row {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.total-price {
  font-size: 22px;
  font-weight: 700;
  color: #e4393c;
}

.remark-row {
  display: flex;
  align-items: flex-start;
  margin-top: 16px;
  max-width: 480px;
}

.remark-label {
  width: 50px;
  flex-shrink: 0;
  line-height: 32px;
  font-size: 14px;
  color: #666;
}

.submit-row {
  text-align: right;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.submit-btn {
  height: 46px;
  min-width: 160px;
  font-size: 16px;
  background: #e4393c;
  border-color: #e4393c;
}

.coupon-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.coupon-option:hover {
  border-color: #e4393c;
}

.coupon-option.active {
  border-color: #e4393c;
  background: #fff5f5;
}

.coupon-label {
  font-size: 14px;
  color: #333;
  flex: 1;
}
</style>