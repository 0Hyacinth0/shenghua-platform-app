<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="getTitle" @ok="handleSubmit">
    <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="活动" required><a-select v-model:value="form.activityId" placeholder="选择秒杀活动" :options="activityOpts" show-search option-filter-prop="label" /></a-form-item>
      <a-form-item label="商品" required><a-select v-model:value="form.spuId" placeholder="选择商品" :options="spuOpts" show-search option-filter-prop="label" @change="onSpuChange" /></a-form-item>
      <a-form-item label="SKU" required><a-select v-model:value="form.skuId" placeholder="先选商品" :options="skuOpts" show-search /></a-form-item>
      <a-form-item label="秒杀价" required><a-input-number v-model:value="form.seckillPrice" :min="0" style="width:100%" /></a-form-item>
      <a-form-item label="库存" required><a-input-number v-model:value="form.stock" :min="0" style="width:100%" /></a-form-item>
      <a-form-item label="限购"><a-input-number v-model:value="form.limitPerUser" :min="1" style="width:100%" /></a-form-item>
    </a-form>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, unref } from 'vue'
import { BasicModal, useModalInner } from '/@/components/Modal'
import { saveOrUpdate } from '../seckillProduct.api'
import { defHttp } from '/@/utils/http/axios'
import { message } from 'ant-design-vue'

const emit = defineEmits(['register', 'success'])
const isUpdate = ref(false)
const editId = ref('')
const activityOpts = ref<any[]>([])
const spuOpts = ref<any[]>([])
const skuOpts = ref<any[]>([])
const form = reactive({ activityId: undefined as any, spuId: undefined as any, skuId: undefined as any, seckillPrice: 0, stock: 0, limitPerUser: 1 })
let editData: any = {}

async function loadData() {
  if (activityOpts.value.length > 0) return
  try { const r: any = await defHttp.get({ url: '/mall/seckill/list', params: { pageSize: 99 } }); activityOpts.value = (r?.records||[]).map((a:any)=>({label:a.activityName,value:a.id})) } catch {}
  try { const r: any = await defHttp.get({ url: '/mall/spu/list', params: { pageSize: 999 } }); spuOpts.value = (r?.records||[]).map((s:any)=>({label:s.spuName+' ¥'+s.minPrice,value:s.id})) } catch {}
}

async function onSpuChange(v: string) {
  form.skuId = undefined; skuOpts.value = []
  if (!v) return
  try { const r: any = await defHttp.get({ url: '/mall/spu/queryById', params: { id: v } }, { joinParamsToUrl: true }); skuOpts.value = (r?.skuList||[]).map((s:any)=>({label:(s.specText||s.id)+' ¥'+s.price,value:s.id})) } catch {}
}

const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  Object.assign(form, { activityId: undefined, spuId: undefined, skuId: undefined, seckillPrice: 0, stock: 0, limitPerUser: 1 })
  loadData()
  if (data && data.id) {
    isUpdate.value = true; editId.value = data.id; editData = data
    form.activityId = data.activityId; form.spuId = data.spuId; form.seckillPrice = data.seckillPrice; form.stock = data.stock; form.limitPerUser = data.limitPerUser || 1
    await onSpuChange(data.spuId)
    form.skuId = data.skuId
  } else { isUpdate.value = false; editId.value = '' }
})

const getTitle = computed(() => !unref(isUpdate) ? '新增秒杀商品' : '编辑秒杀商品')

async function handleSubmit() {
  if (!form.activityId || !form.spuId || !form.skuId) { message.warning('请填写完整信息'); return }
  setModalProps({ confirmLoading: true })
  try {
    await saveOrUpdate({ ...form, id: isUpdate.value ? editId.value : undefined }, unref(isUpdate))
    closeModal(); emit('success')
  } catch { message.error('保存失败') }
  finally { setModalProps({ confirmLoading: false }) }
}
</script>
