<template>
  <div class="checkout-page">
    <div class="checkout-card">
      <div class="checkout-title">确认购买</div>
      <div class="item-row">
        <span class="label">购买内容</span>
        <span class="value">{{ data.title || '课程' }}</span>
      </div>
      <div class="item-row">
        <span class="label">购买类型</span>
        <span class="value">{{ data.type === 'chapter' ? '单章购买' : '整课购买' }}</span>
      </div>
      <div class="item-row">
        <span class="label">价格</span>
        <span class="price">&yen;{{ data.price }}</span>
      </div>
      <div class="item-row small" v-if="data.chapterTitle">
        <span class="label">章节</span>
        <span class="value">{{ data.chapterTitle }}</span>
      </div>
    </div>

    <button class="pay-btn" @click="handlePay" :disabled="paying">
      {{ paying ? '支付中...' : '确认支付 ¥' + (data.price || 0) }}
    </button>
    <p class="hint">模拟支付，点击即付</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
const data = ref({})
const paying = ref(false)
const userId = getCurrentUserId()

onMounted(() => {
  try {
    const raw = localStorage.getItem('checkoutData')
    if (raw) data.value = JSON.parse(raw)
    else router.back()
  } catch (e) { router.back() }
})

const handlePay = async () => {
  if (!userId) { alert('请先登录'); router.push('/login'); return }
  paying.value = true
  try {
    // 创建订单
    const orderParams = {
      userId, buyType: data.value.type === 'chapter' ? 2 : 1,
      courseId: data.value.courseId,
    }
    if (data.value.type === 'chapter') orderParams.chapterId = data.value.chapterId

    const order = await http.post('/course/order/create', orderParams)
    if (order && order.orderNo === 'FREE') {
      // 免费直接完成
      localStorage.removeItem('checkoutData')
      router.replace('/course/my')
      return
    }
    // 支付
    await http.post('/course/order/pay', { orderId: order.orderId, userId, payType: 'dummy' })
    localStorage.removeItem('checkoutData')
    alert('购买成功！')
    router.replace('/course/my')
  } catch (e) {
    alert('支付失败：' + (e.message || '未知错误'))
  } finally { paying.value = false }
}
</script>

<style scoped>
.checkout-page { padding:24px 16px; background:#f7f8fa; min-height:100vh; }
.checkout-card { background:#fff; border-radius:16px; padding:20px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
.checkout-title { font-size:18px; font-weight:bold; margin-bottom:16px; text-align:center; }
.item-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f5f5f5; }
.item-row.small { font-size:13px; color:#888; }
.label { color:#666; font-size:14px; }
.value { font-weight:bold; font-size:14px; }
.price { font-size:22px; font-weight:bold; color:var(--color-primary, #FF4D4F); }
.pay-btn { width:100%; padding:14px; margin-top:24px; border:none; border-radius:24px; font-size:17px; font-weight:bold; color:#fff; background:linear-gradient(135deg,var(--color-primary, #FF4D4F),#FF7875); cursor:pointer; }
.pay-btn:disabled { opacity:.6; }
.hint { text-align:center; font-size:12px; color:#bbb; margin-top:12px; }
</style>
