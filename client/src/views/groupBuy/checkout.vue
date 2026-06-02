<template>
  <div class="checkout-page">
    <h2>确认拼团订单</h2>
    <a-spin :spinning="loading">
      <!-- 商品信息 -->
      <div class="section">
        <h3>商品信息</h3>
        <div class="product-item">
          <div class="p-name">{{ spuName }}</div>
          <div class="p-price">拼团价 <span class="price">&yen;{{ groupPrice }}</span></div>
          <div class="p-desc">{{ groupSize }}人成团</div>
        </div>
        <!-- 选择规格 -->
        <div v-if="skus.length > 0" style="margin-top:10px">
          <div class="p-label">选择规格</div>
          <a-radio-group v-model:value="selectedSkuId">
            <a-radio v-for="sku in skus" :key="sku.id" :value="sku.id" style="display:block;margin:4px 0">
              {{ sku.specText || sku.spec_text || '默认规格' }}
              <span class="price" style="font-size:16px">&yen;{{ groupPrice }}</span>
              <span v-if="sku.price && sku.price > groupPrice" style="font-size:12px;color:#999;text-decoration:line-through;margin-left:4px">&yen;{{ sku.price }}</span>
            </a-radio>
          </a-radio-group>
        </div>
      </div>

      <!-- 收货地址 -->
      <div class="section">
        <h3>收货地址</h3>
        <div v-if="addresses.length === 0">
          <a-button type="primary" size="small" @click="showAddAddress = true">新增地址</a-button>
        </div>
        <a-radio-group v-else v-model:value="selectedAddressId" style="width:100%">
          <div v-for="addr in addresses" :key="addr.id" class="addr-item" :class="{ selected: selectedAddressId === addr.id }">
            <a-radio :value="addr.id">
              <div class="addr-info">
                <span class="addr-name">{{ addr.consignee || addr.receiverName }}</span>
                <span class="addr-phone">{{ addr.phone || addr.receiverPhone }}</span>
                <span class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detailAddress || addr.receiverAddress }}</span>
              </div>
            </a-radio>
          </div>
        </a-radio-group>
        <a-button v-if="addresses.length > 0" size="small" style="margin-top:8px" @click="showAddAddress = true">新增地址</a-button>
      </div>

      <!-- 新增地址 -->
      <div v-if="showAddAddress" class="section" style="background:#fafafa;padding:12px;border-radius:8px">
        <a-form layout="vertical" :model="newAddr">
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="收货人"><a-input v-model:value="newAddr.consignee" /></a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="手机号"><a-input v-model:value="newAddr.phone" /></a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="省市区">
            <a-space>
              <a-input v-model:value="newAddr.province" placeholder="省" style="width:80px" />
              <a-input v-model:value="newAddr.city" placeholder="市" style="width:80px" />
              <a-input v-model:value="newAddr.district" placeholder="区" style="width:80px" />
            </a-space>
          </a-form-item>
          <a-form-item label="详细地址"><a-input v-model:value="newAddr.detailAddress" /></a-form-item>
          <a-button type="primary" @click="saveAddress">保存地址</a-button>
        </a-form>
      </div>

      <!-- 支付 -->
      <div class="section pay-section">
        <div class="pay-row">
          <span>应付金额：</span>
          <span class="pay-amount">&yen;{{ groupPrice }}</span>
        </div>
        <a-button type="primary" size="large" block :loading="paying" @click="handlePay">
          确认支付并{{ recordId ? '参团' : '发起拼团' }}
        </a-button>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const route = useRoute()
const router = useRouter()
const userId = getCurrentUserId()

const orderId = route.query.orderId as string
const activityId = route.query.activityId as string
const recordId = (route.query.recordId as string) || ''
const spuId = route.query.spuId as string || ''
const spuName = route.query.spuName as string || ''
const groupPrice = route.query.groupPrice as string || '0'
const groupSize = route.query.groupSize as string || '2'

const skus = ref<any[]>([])
const selectedSkuId = ref('')

const addresses = ref<any[]>([])
const selectedAddressId = ref('')
const showAddAddress = ref(false)
const loading = ref(false)
const paying = ref(false)

const newAddr = ref({ consignee: '', phone: '', province: '', city: '', district: '', detailAddress: '' })

async function loadSkus() {
  if (!spuId) return
  try {
    const res: any = await http.get('/mall/spu/queryById', { params: { id: spuId } })
    skus.value = res?.skuList || res?.skus || []
    if (skus.value.length > 0) selectedSkuId.value = skus.value[0].id
  } catch { skus.value = [] }
}

async function loadAddresses() {
  try {
    const res: any = await http.get('/mall/userAddress/list', { params: { userId } })
    addresses.value = res?.records || res || []
    if (addresses.value.length > 0) {
      const def = addresses.value.find((a: any) => a.isDefault === 1)
      selectedAddressId.value = def?.id || addresses.value[0].id
    }
  } catch { addresses.value = [] }
}

async function saveAddress() {
  const a = newAddr.value
  if (!a.consignee || !a.phone || !a.detailAddress) { message.warn('请填写完整地址信息'); return }
  try {
    await http.post('/mall/userAddress/add', { ...a, userId })
    message.success('地址已保存')
    showAddAddress.value = false
    newAddr.value = { consignee: '', phone: '', province: '', city: '', district: '', detailAddress: '' }
    loadAddresses()
  } catch (e: any) { message.error('保存失败') }
}

async function handlePay() {
  const addr = addresses.value.find((a: any) => a.id === selectedAddressId.value)
  if (!addr) { message.warn('请选择收货地址'); return }
  paying.value = true
  try {
    await http.post('/mall/groupBuy/confirmAndJoin', null, {
      params: { orderId, userId, recordId, activityId, skuId: selectedSkuId.value, addressId: addr.id }
    })
    message.success('支付成功！')
    router.replace('/orders')
  } catch (e: any) { message.error(e?.message || '支付失败') }
  paying.value = false
}

onMounted(() => { loadSkus(); loadAddresses() })
</script>

<style scoped>
.checkout-page { max-width: 600px; margin: 0 auto; padding: 16px; }
h2 { margin: 0 0 16px; }
.section { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.section h3 { margin: 0 0 10px; font-size: 15px; }
.product-item { padding: 8px 0; }
.p-name { font-size: 14px; }
.p-price { margin-top: 4px; font-size: 13px; }
.price { font-size: 20px; font-weight: 700; color: #e4393c; }
.p-desc { font-size: 12px; color: #999; margin-top: 2px; }
.p-label { font-size: 13px; color: #666; margin-bottom: 6px; }
.addr-item { padding: 8px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.addr-info { display: flex; flex-wrap: wrap; gap: 6px; font-size: 13px; }
.addr-name { font-weight: 500; }
.addr-phone { color: #666; }
.addr-detail { width: 100%; color: #999; }
.pay-section { text-align: center; }
.pay-row { display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 16px; }
.pay-amount { font-size: 28px; font-weight: 700; color: #e4393c; }
</style>
