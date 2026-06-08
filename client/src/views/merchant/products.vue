<template>
  <div class="merchant-products-page">
    <div class="page-header">
      <h2>商品管理</h2>
      <a-button type="primary" @click="openAdd">发布商品</a-button>
    </div>

    <a-tabs v-model:activeKey="statusTab" @change="loadList">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane key="0" tab="待审核" />
      <a-tab-pane key="1" tab="审核通过" />
      <a-tab-pane key="2" tab="审核拒绝" />
      <a-tab-pane key="onshelf" tab="上架中" />
      <a-tab-pane key="offshelf" tab="已下架" />
    </a-tabs>

    <a-spin :spinning="loading">
      <a-empty v-if="list.length === 0 && !loading" description="暂无商品" />
      <a-table v-else :data-source="list" :pagination="false" rowKey="id" size="small" bordered>
        <a-table-column title="图片" dataIndex="mainImage" width="80">
          <template #default="{ text }"><img v-if="text" :src="imgUrl(text)" style="width:50px;height:50px;object-fit:cover" /><span v-else>-</span></template>
        </a-table-column>
        <a-table-column title="商品名称" dataIndex="spuName" />
        <a-table-column title="价格" width="120">
          <template #default="{ record }"><span style="color:#e4393c">￥{{ record.minPrice }}</span></template>
        </a-table-column>
        <a-table-column title="库存" dataIndex="stock" width="80" />
        <a-table-column title="销量" dataIndex="sales" width="80" />
        <a-table-column title="审核状态" width="100">
          <template #default="{ record }">
            <a-tag v-if="record.auditStatus === 0" color="orange">待审核</a-tag>
            <a-tag v-else-if="record.auditStatus === 1" color="green">审核通过</a-tag>
            <a-tag v-else-if="record.auditStatus === 2" color="red">审核拒绝</a-tag>
            <a-tag v-else>-</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="上架状态" width="80">
          <template #default="{ record }">
            <a-tag :color="record.shelfStatus === 1 ? 'green' : 'default'">{{ record.shelfStatus === 1 ? '上架' : '下架' }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作" width="200">
          <template #default="{ record }">
            <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-button v-if="record.auditStatus === 1 && record.shelfStatus === 0" type="link" size="small" @click="shelf(record.id)">上架</a-button>
            <a-button v-else-if="record.auditStatus === 1 && record.shelfStatus === 1" type="link" size="small" @click="unshelf(record.id)">下架</a-button>
            <a-button v-if="record.auditStatus === 2" type="link" size="small" @click="resubmit(record.id)">重新提交</a-button>
          </template>
        </a-table-column>
      </a-table>
      <a-pagination
        v-if="total > pageSize"
        v-model:current="page"
        :total="total"
        :page-size="pageSize"
        :show-size-changer="false"
        style="margin-top:16px;text-align:right"
        @change="loadList"
      />
    </a-spin>

    <!-- 发布/编辑弹窗 -->
    <a-modal v-model:open="modalOpen" :title="editing ? '编辑商品' : '发布商品'" width="700px" @ok="handleSave" :confirm-loading="saving">
      <a-form :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="商品名称" required>
          <a-input v-model:value="form.spuName" placeholder="请输入商品名称" />
        </a-form-item>
        <a-form-item label="分类" required>
          <a-select v-model:value="form.categoryId" placeholder="选择分类" :options="categoryOptions" />
        </a-form-item>
        <a-form-item label="主图">
          <a-upload
            :custom-request="handleUpload"
            :show-upload-list="false"
            accept="image/*"
          >
            <div v-if="form.mainImage" class="img-preview">
              <img :src="imgUrl(form.mainImage)" style="width:120px;height:120px;object-fit:cover;border-radius:4px" />
              <a-button size="small" style="margin-top:4px;display:block">更换图片</a-button>
            </div>
            <div v-else class="upload-placeholder">
              <plus-outlined /><div>点击上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="商品详情">
          <a-textarea v-model:value="form.description" placeholder="商品描述" :rows="4" />
        </a-form-item>
        <a-form-item label="商品类型">
          <a-radio-group v-model:value="form.productType">
            <a-radio :value="1">实物</a-radio>
            <a-radio :value="2">虚拟</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="form.productType === 2" label="虚拟商品链接">
          <a-input v-model:value="form.virtualUrl" placeholder="虚拟商品付款后自动发送的链接" />
        </a-form-item>
        <a-divider>规格模板</a-divider>
        <a-space wrap style="margin-bottom:12px">
          <a-button v-for="tpl in specTemplates" :key="tpl.name" size="small" @click="useTemplate(tpl)">{{ tpl.name }}</a-button>
        </a-space>
        <a-divider>SKU管理</a-divider>
        <div v-for="(sku, idx) in form.skuList" :key="idx" style="display:flex;gap:8px;margin-bottom:8px">
          <a-input v-model:value="sku.specText" placeholder="规格如：红色 L" style="width:150px" />
          <a-input-number v-model:value="sku.price" placeholder="价格" :min="0" style="width:110px" />
          <a-input-number v-model:value="sku.stock" placeholder="库存" :min="0" style="width:100px" />
          <a-button danger size="small" @click="removeSku(idx)">删</a-button>
        </div>
        <a-button type="dashed" block @click="addSku">+ 添加规格</a-button>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getProductList, getCategoryTree, getMyMerchant, getProductDetail, imgUrl, getMerchantProductList, resubmitProduct } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

// 当前用户ID（从登录状态获取）
const currentUserId = getCurrentUserId()
const currentMerchantId = ref('')

const specTemplates = [
  { name: '颜色+尺码', specs: [
    { color: ['红色','蓝色','黑色','白色'], size: ['S','M','L','XL'] }
  ]},
  { name: '容量', specs: [
    { capacity: ['64GB','128GB','256GB','512GB'] }
  ]},
  { name: '规格', specs: [
    { spec: ['标准版','升级版','豪华版'] }
  ]},
]

function useTemplate(tpl: any) {
  form.skuList = []
  const dims = tpl.specs[0]
  const keys = Object.keys(dims)
  const values = Object.values(dims) as string[][]
  function combine(idx: number, prefix: string[]) {
    if (idx >= values.length) {
      form.skuList.push({ specText: prefix.join(' '), price: 0, stock: 0 })
      return
    }
    for (const v of values[idx]) {
      combine(idx + 1, [...prefix, v])
    }
  }
  combine(0, [])
}

async function handleUpload({ file, onSuccess, onError }: any) {
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await http.post('/mall/file/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    form.mainImage = res || ''
    onSuccess(res)
  } catch {
    onError(new Error('上传失败'))
  }
}

const list = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 10
const total = ref(0)
const statusTab = ref('all')
const modalOpen = ref(false)
const editing = ref(false)
const saving = ref(false)
const categoryOptions = ref<any[]>([])
const form = reactive<any>({ spuName: '', categoryId: undefined, mainImage: '', description: '', productType: 1, virtualUrl: '', skuList: [] })

async function loadList() {
  loading.value = true
  try {
    const params: any = { merchantId: currentMerchantId.value, pageNo: page.value, pageSize }
    
    if (statusTab.value === 'all') {
      params.auditStatus = undefined
    } else if (statusTab.value === '0') {
      params.auditStatus = 0
    } else if (statusTab.value === '1') {
      params.auditStatus = 1
    } else if (statusTab.value === '2') {
      params.auditStatus = 2
    } else if (statusTab.value === 'onshelf') {
      params.auditStatus = 1
      params.shelfStatus = 1
    } else if (statusTab.value === 'offshelf') {
      params.auditStatus = 1
      params.shelfStatus = 0
    }
    
    const res = await getMerchantProductList(currentMerchantId.value, params.auditStatus, { 
      pageNo: page.value, 
      pageSize,
      shelfStatus: params.shelfStatus 
    })
    list.value = res?.records || []
    total.value = res?.total || 0
  } catch { list.value = [] }
  finally { loading.value = false }
}

async function loadCategories() {
  try {
    const tree = await getCategoryTree()
    const opts: any[] = []
    function walk(nodes: any[], prefix = '') {
      for (const n of nodes) {
        opts.push({ label: prefix + n.categoryName, value: n.id })
        if (n.children) walk(n.children, prefix + '  ')
      }
    }
    walk(Array.isArray(tree) ? tree : [])
    categoryOptions.value = opts
  } catch { /* ignore */ }
}

async function getMerchant() {
  try {
    const m = await getMyMerchant(currentUserId)
    if (m?.id) currentMerchantId.value = m.id
  } catch { /* ignore */ }
}

function resetForm() {
  form.id = undefined; form.spuName = ''; form.categoryId = undefined; form.mainImage = ''; form.description = ''; form.productType = 1; form.virtualUrl = ''; form.skuList = []
  addSku()
}

function addSku() { form.skuList.push({ specText: '', price: 0, stock: 0 }) }
function removeSku(idx: number) { form.skuList.splice(idx, 1) }

function openAdd() { editing.value = false; resetForm(); modalOpen.value = true }
async function openEdit(record: any) {
  editing.value = true
  form.id = record.id
  form.spuName = record.spuName
  form.categoryId = record.categoryId
  form.mainImage = record.mainImage
  form.description = record.description
  form.productType = record.productType || 1
  form.virtualUrl = record.virtualUrl || ''
  form.skuList = []
  try { const d = await getProductDetail(record.id); form.skuList = d?.skuList || [] } catch { /* ignore */ }
  if (!form.skuList.length) addSku()
  modalOpen.value = true
}

async function handleSave() {
  if (!form.spuName) { message.warning('请输入商品名称'); return }
  saving.value = true
  try {
    const data: any = {
      id: form.id, merchantId: currentMerchantId.value, spuName: form.spuName,
      categoryId: form.categoryId, mainImage: form.mainImage, description: form.description,
      productType: form.productType, virtualUrl: form.virtualUrl || undefined,
      skuList: form.skuList.map((s: any) => ({ ...s, id: s.id || undefined })),
    }
    const url = editing.value ? '/mall/spu/edit' : '/mall/spu/add'
    if (!editing.value) data.auditStatus = 0 // 商家发布需审核
    await http.post(url, data)
    message.success(editing.value ? '更新成功' : '发布成功，等待审核')
    modalOpen.value = false
    loadList()
  } catch { message.error('操作失败') }
  finally { saving.value = false }
}

async function shelf(id: string) {
  try {
    await http.put('/mall/spu/shelf', null, { params: { id } })
    message.success('已上架')
    loadList()
  } catch (e: any) {
    message.error(e?.response?.data?.message || '上架失败')
  }
}
async function unshelf(id: string) {
  try { await http.put('/mall/spu/unshelf', null, { params: { id } }); message.success('已下架'); loadList() } catch { message.error('失败') }
}

async function resubmit(id: string) {
  try {
    await resubmitProduct(id)
    message.success('已重新提交审核')
    loadList()
  } catch {
    message.error('提交失败')
  }
}

onMounted(async () => {
  await getMerchant()
  if (currentMerchantId.value) { loadCategories(); loadList() }
})
</script>

<style scoped>
.merchant-products-page { background: #f8f8f8; padding: 16px; padding-bottom: 100px; max-width: 480px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { font-size: 20px; margin: 0; }
.upload-placeholder { width:120px;height:120px;border:1px dashed #d9d9d9;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:#999;font-size:13px;transition:border-color 0.3s }
.upload-placeholder:hover { border-color: #1890ff }
.img-preview { display:flex;flex-direction:column;align-items:center }
</style>