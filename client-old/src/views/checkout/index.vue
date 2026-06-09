<template>
  <div class="checkout-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <button class="page-back" @click="$router.back()"><LeftOutlined /></button>
      <span class="page-title">确认订单</span>
      <div style="width:32px" />
    </header>

    <a-spin :spinning="loading">
      <!-- 收货地址 -->
      <section class="addr-section" @click="$router.push('/address')">
        <template v-if="selectedAddress">
          <div class="addr-content">
            <div class="addr-top">
              <span class="addr-name">{{ selectedAddress.consignee }}</span>
              <span class="addr-phone">{{ selectedAddress.phone }}</span>
              <span v-if="selectedAddress.isDefault" class="addr-default">默认</span>
            </div>
            <div class="addr-detail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }} {{ selectedAddress.detailAddress }}</div>
          </div>
          <RightOutlined class="addr-arrow" />
        </template>
        <template v-else>
          <div class="addr-empty">
            <EnvironmentOutlined style="font-size:20px;color:var(--color-text-hint,#999)" />
            <span>请添加收货地址</span>
          </div>
          <RightOutlined class="addr-arrow" />
        </template>
      </section>

      <!-- 商品列表 -->
      <section class="goods-section">
        <div v-for="item in selectedItems" :key="item.id" class="goods-card">
          <div class="goods-img">
            <img v-if="item.mainImage" :src="imgUrl(item.mainImage)" :alt="item.productName" />
            <div v-else class="img-placeholder"><ShoppingOutlined style="font-size:20px;color:#ddd" /></div>
          </div>
          <div class="goods-body">
            <div class="goods-name">{{ item.productName }}</div>
            <div class="goods-spec" v-if="item.specDesc">{{ item.specDesc }}</div>
            <div class="goods-bottom">
              <span class="goods-price"><span class="price-symbol">¥</span>{{ item.price }}</span>
              <span class="goods-qty">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 优惠券 -->
      <section class="coupon-section" v-if="myCoupons.length > 0 && !isSeckillOrder">
        <div class="coupon-row" @click="showCouponPicker = true">
          <span class="coupon-label">优惠券</span>
          <span class="coupon-value" :class="{ active: selectedCouponId }">
            {{ selectedCouponId ? '已选1张' : myCoupons.length + '张可用' }}
          </span>
          <RightOutlined style="font-size:12px;color:var(--color-text-disabled,#ccc)" />
        </div>
      </section>

      <!-- 订单汇总 -->
      <section class="summary-section">
        <div class="summary-row">
          <span>商品金额</span>
          <span>¥{{ goodsTotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>运费</span>
          <span>{{ freight > 0 ? '¥' + freight.toFixed(2) : '免运费' }}</span>
        </div>
        <div class="summary-row discount" v-if="couponDiscount > 0">
          <span>优惠券抵扣</span>
          <span>-¥{{ couponDiscount.toFixed(2) }}</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-row total">
          <span>合计</span>
          <span class="total-price"><span class="price-symbol">¥</span>{{ orderTotal.toFixed(2) }}</span>
        </div>
      </section>

      <!-- 备注 -->
      <section class="remark-section">
        <div class="remark-row">
          <span class="remark-label">备注</span>
          <input v-model="remark" class="remark-input" placeholder="选填：给卖家留言" maxlength="200" />
        </div>
      </section>
    </a-spin>

    <!-- 底部提交栏 -->
    <footer class="submit-bar">
      <div class="submit-info">
        <span class="submit-count">{{ selectedItems.length }}件</span>
        <span class="submit-total"><span class="price-symbol">¥</span>{{ orderTotal.toFixed(2) }}</span>
      </div>
      <button class="submit-btn" :disabled="!canSubmit || submitting" :class="{ loading: submitting }" @click="handleSubmit">
        {{ submitting ? '提交中...' : '提交订单' }}
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  LeftOutlined, RightOutlined, EnvironmentOutlined, ShoppingOutlined,
} from '@ant-design/icons-vue'
import { getCartList, getAddressList, createOrder, imgUrl, getUserCoupons } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const route = useRoute()
const router = useRouter()
const currentUserId = getCurrentUserId()

const loading = ref(false)
const submitting = ref(false)
const addressList = ref<any[]>([])
const selectedAddressId = ref('')
const selectedItems = ref<any[]>([])
const remark = ref('')
const isSeckillOrder = ref(false)
const seckillProductId = ref('')
const seckillPrice = ref(0)
const freight = ref(0)
const myCoupons = ref<any[]>([])
const selectedCouponId = ref('')
const couponTemplates = ref<any[]>([])
const showCouponPicker = ref(false)

const goodsTotal = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
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
  if (c.couponType === 1) { return total >= (c.minPurchaseAmount || 0) ? c.discountValue || 0 : 0 }
  if (c.couponType === 2) {
    const d = total * (1 - (c.discountValue || 1))
    return c.maxDiscountAmount && d > c.maxDiscountAmount ? c.maxDiscountAmount : Math.round(d * 100) / 100
  }
  if (c.couponType === 3) return freight.value
  return 0
})
const orderTotal = computed(() => goodsTotal.value + freight.value - couponDiscount.value)
const selectedAddress = computed(() => addressList.value.find(addr => addr.id === selectedAddressId.value))
const canSubmit = computed(() => selectedAddressId.value !== '' && selectedItems.value.length > 0)

onMounted(async () => {
  loading.value = true
  try {
    const seckillId = route.query.seckillId as string
    if (seckillId) {
      isSeckillOrder.value = true
      seckillProductId.value = seckillId
      seckillPrice.value = Number(route.query.seckillPrice) || 0
    }

    const addrs: any = await getAddressList(currentUserId)
    addressList.value = addrs?.records || []
    const defaultAddr = addressList.value.find((a: any) => a.isDefault)
    if (defaultAddr) selectedAddressId.value = defaultAddr.id
    else if (addressList.value.length > 0) selectedAddressId.value = addressList.value[0].id

    if (isSeckillOrder.value) {
      const spuId = route.query.spuId as string
      if (spuId) {
        try {
          const spuData: any = await http.get('/mall/spu/queryById', { params: { id: spuId } })
          if (spuData) {
            selectedItems.value = [{ id: 'seckill_' + seckillProductId.value, spuId, skuId: spuData.skuList?.[0]?.id || '', price: seckillPrice.value, quantity: 1, productName: spuData.spuName || '秒杀商品', mainImage: spuData.mainImage || '' }]
          }
        } catch {}
      }
      if (selectedItems.value.length === 0) {
        selectedItems.value = [{ id: 'seckill_' + seckillProductId.value, spuId: route.query.spuId, price: seckillPrice.value, quantity: 1, productName: '秒杀商品', mainImage: '' }]
      }
      loading.value = false
      return
    }

    const cart: any = await getCartList(currentUserId)
    const cartArr = Array.isArray(cart) ? cart : []
    const itemIdsParam = (route.query.items as string) || ''
    const singleItemId = (route.query.itemId as string) || ''
    if (singleItemId) {
      const found = cartArr.filter((item: any) => item.skuId === singleItemId)
      selectedItems.value = found.length > 0 ? [found[found.length - 1]] : cartArr.filter((item: any) => item.id === singleItemId)
    } else if (itemIdsParam) {
      const ids = itemIdsParam.split(',').filter(Boolean)
      selectedItems.value = cartArr.filter((item: any) => ids.includes(item.id))
    } else {
      selectedItems.value = cartArr.filter((item: any) => item.selected)
    }

    const coupons: any = await getUserCoupons(currentUserId)
    myCoupons.value = (coupons?.records || []).filter((c: any) => c.couponStatus === 0)
    if (myCoupons.value.length > 0) {
      try {
        const tplRes = await http.get('/mall/coupon/list', { params: { pageSize: 999 } })
        couponTemplates.value = tplRes?.records || []
      } catch {}
    }
  } catch {
    message.error('加载失败，请重试')
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  const addr = selectedAddress.value
  if (!addr) { message.warning('请选择收货地址'); return }
  if (selectedItems.value.length === 0) { message.warning('请选择商品'); return }

  submitting.value = true
  try {
    if (isSeckillOrder.value) {
      const result: any = await http.post('/mall/seckill/buy', {
        productId: seckillProductId.value, userId: currentUserId, quantity: 1,
        receiverName: addr.consignee, receiverPhone: addr.phone,
        receiverProvince: addr.province, receiverCity: addr.city,
        receiverDistrict: addr.district, receiverAddress: addr.detailAddress,
        remark: remark.value,
      })
      message.success('秒杀下单成功')
      const orderId = result?.id || result
      router.push(orderId ? { name: 'orderDetail', params: { id: String(orderId) } } : { name: 'orders' })
      return
    }

    const result = await createOrder({
      userId: currentUserId,
      receiverName: addr.consignee, receiverPhone: addr.phone,
      receiverProvince: addr.province, receiverCity: addr.city,
      receiverDistrict: addr.district, receiverAddress: addr.detailAddress,
      remark: remark.value, couponId: selectedCouponId.value || undefined,
      items: selectedItems.value.map(item => ({ cartItemId: item.id, spuId: item.spuId, skuId: item.skuId, quantity: item.quantity })),
    })
    message.success('下单成功')
    const orderId = result?.id || result
    router.push(orderId ? { name: 'orderDetail', params: { id: String(orderId) } } : { name: 'orders' })
  } catch (e: any) {
    message.error(e.message || '下单失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: 80px;
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

.page-back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-text, #1a1a1a);
  background: transparent;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
}

/* ---- 地址 ---- */
.addr-section {
  background: var(--color-card, #fff);
  margin: 12px 16px;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.addr-content { flex: 1; }
.addr-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.addr-name { font-size: 15px; font-weight: 600; color: var(--color-text, #1a1a1a); }
.addr-phone { font-size: 14px; color: var(--color-text-secondary, #666); }
.addr-default { font-size: 10px; background: var(--color-primary-light, #FFF1F0); color: var(--color-primary, #FF4D4F); padding: 1px 6px; border-radius: 3px; font-weight: 500; }
.addr-detail { font-size: 13px; color: var(--color-text-secondary, #666); line-height: 1.4; }
.addr-arrow { font-size: 12px; color: var(--color-text-disabled, #ccc); }

.addr-empty {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-hint, #999);
}

/* ---- 商品 ---- */
.goods-section {
  background: var(--color-card, #fff);
  margin: 0 16px 12px;
  border-radius: 12px;
  padding: 4px 16px;
}

.goods-card {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 0.5px solid var(--color-divider, #f0f0f0);
}

.goods-card:last-child { border-bottom: none; }

.goods-img {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg, #f5f5f5);
}

.goods-img img { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

.goods-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.goods-name { font-size: 14px; font-weight: 500; color: var(--color-text, #1a1a1a); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.goods-spec { font-size: 12px; color: var(--color-text-hint, #999); margin-top: 4px; }
.goods-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.goods-price { font-size: 15px; font-weight: 700; color: var(--color-primary, #FF4D4F); }
.goods-price .price-symbol { font-size: 11px; }
.goods-qty { font-size: 13px; color: var(--color-text-hint, #999); }

/* ---- 优惠券 ---- */
.coupon-section {
  background: var(--color-card, #fff);
  margin: 0 16px 12px;
  border-radius: 12px;
  padding: 0 16px;
}

.coupon-row {
  display: flex;
  align-items: center;
  padding: 14px 0;
  cursor: pointer;
}

.coupon-label { font-size: 14px; color: var(--color-text, #1a1a1a); font-weight: 500; }
.coupon-value { flex: 1; text-align: right; font-size: 13px; color: var(--color-text-hint, #999); margin-right: 8px; }
.coupon-value.active { color: var(--color-primary, #FF4D4F); }

/* ---- 汇总 ---- */
.summary-section {
  background: var(--color-card, #fff);
  margin: 0 16px 12px;
  border-radius: 12px;
  padding: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
  color: var(--color-text-secondary, #666);
}

.summary-row.discount { color: var(--color-primary, #FF4D4F); }
.summary-divider { height: 1px; background: var(--color-divider, #f0f0f0); margin: 8px 0; }
.summary-row.total { font-size: 15px; font-weight: 600; color: var(--color-text, #1a1a1a); }
.total-price { font-size: 20px; font-weight: 700; color: var(--color-primary, #FF4D4F); }
.total-price .price-symbol { font-size: 13px; }

/* ---- 备注 ---- */
.remark-section {
  background: var(--color-card, #fff);
  margin: 0 16px 12px;
  border-radius: 12px;
  padding: 0 16px;
}

.remark-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
}

.remark-label { font-size: 14px; color: var(--color-text, #1a1a1a); font-weight: 500; flex-shrink: 0; }
.remark-input { flex: 1; border: none; outline: none; font-size: 14px; color: var(--color-text, #1a1a1a); background: transparent; }
.remark-input::placeholder { color: var(--color-text-hint, #999); }

/* ---- 底部提交栏 ---- */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-card, #fff);
  border-top: 0.5px solid var(--color-border, #eee);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  padding-bottom: calc(10px + var(--safe-bottom, 0px));
  z-index: 100;
}

.submit-info { display: flex; align-items: baseline; gap: 8px; }
.submit-count { font-size: 13px; color: var(--color-text-hint, #999); }
.submit-total { font-size: 22px; font-weight: 700; color: var(--color-primary, #FF4D4F); }
.submit-total .price-symbol { font-size: 14px; }

.submit-btn {
  height: 44px;
  min-width: 140px;
  border-radius: 999px;
  border: none;
  background: var(--color-primary, #FF4D4F);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

.submit-btn:active { opacity: 0.85; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.submit-btn.loading { opacity: 0.7; }
</style>
