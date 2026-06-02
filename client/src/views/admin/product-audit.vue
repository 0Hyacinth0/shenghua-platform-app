<template>
  <div class="product-audit-page">
    <div class="page-header">
      <h2>商品审核</h2>
    </div>

    <a-tabs v-model:activeKey="statusTab" @change="loadList">
      <a-tab-pane key="0" tab="待审核" />
      <a-tab-pane key="1" tab="审核通过" />
      <a-tab-pane key="2" tab="审核拒绝" />
    </a-tabs>

    <a-spin :spinning="loading">
      <a-empty v-if="list.length === 0 && !loading" description="暂无商品" />
      <a-table v-else :data-source="list" :pagination="false" rowKey="id" size="small" bordered>
        <a-table-column title="图片" dataIndex="mainImage" width="80">
          <template #default="{ text }"><img v-if="text" :src="imgUrl(text)" style="width:50px;height:50px;object-fit:cover" /><span v-else>-</span></template>
        </a-table-column>
        <a-table-column title="商品名称" dataIndex="spuName" />
        <a-table-column title="商家" dataIndex="merchantId" width="120" />
        <a-table-column title="价格" width="120">
          <template #default="{ record }"><span style="color:#e4393c">￥{{ record.minPrice }}</span></template>
        </a-table-column>
        <a-table-column title="库存" dataIndex="stock" width="80" />
        <a-table-column title="提交时间" dataIndex="createTime" width="150" />
        <a-table-column title="审核状态" width="100">
          <template #default="{ record }">
            <a-tag v-if="record.auditStatus === 0" color="orange">待审核</a-tag>
            <a-tag v-else-if="record.auditStatus === 1" color="green">审核通过</a-tag>
            <a-tag v-else-if="record.auditStatus === 2" color="red">审核拒绝</a-tag>
            <a-tag v-else>-</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作" width="200">
          <template #default="{ record }">
            <a-button v-if="record.auditStatus === 0" type="link" size="small" @click="openApprove(record)">审核</a-button>
            <a-button type="link" size="small" @click="viewDetail(record)">查看详情</a-button>
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

    <!-- 审核弹窗 -->
    <a-modal v-model:open="auditModalOpen" title="商品审核" width="600px" @ok="handleAudit" :confirm-loading="auditing">
      <div v-if="currentProduct">
        <a-descriptions bordered :column="1" size="small">
          <a-descriptions-item label="商品名称">{{ currentProduct.spuName }}</a-descriptions-item>
          <a-descriptions-item label="价格区间">￥{{ currentProduct.minPrice }} - ￥{{ currentProduct.maxPrice }}</a-descriptions-item>
          <a-descriptions-item label="库存">{{ currentProduct.stock }}</a-descriptions-item>
          <a-descriptions-item label="商品描述">{{ currentProduct.description }}</a-descriptions-item>
        </a-descriptions>
        <div style="margin-top:16px">
          <a-radio-group v-model:value="auditForm.status">
            <a-radio :value="1">审核通过</a-radio>
            <a-radio :value="2">审核拒绝</a-radio>
          </a-radio-group>
        </div>
        <div v-if="auditForm.status === 2" style="margin-top:12px">
          <a-textarea v-model:value="auditForm.reason" placeholder="请输入拒绝原因" :rows="3" />
        </div>
      </div>
    </a-modal>

    <!-- 详情弹窗 -->
    <a-modal v-model:open="detailModalOpen" title="商品详情" width="800px" :footer="null">
      <div v-if="currentProduct">
        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="商品名称" :span="2">{{ currentProduct.spuName }}</a-descriptions-item>
          <a-descriptions-item label="价格区间">￥{{ currentProduct.minPrice }} - ￥{{ currentProduct.maxPrice }}</a-descriptions-item>
          <a-descriptions-item label="库存">{{ currentProduct.stock }}</a-descriptions-item>
          <a-descriptions-item label="市场价">￥{{ currentProduct.marketPrice }}</a-descriptions-item>
          <a-descriptions-item label="销量">{{ currentProduct.sales }}</a-descriptions-item>
          <a-descriptions-item label="审核状态" :span="2">
            <a-tag v-if="currentProduct.auditStatus === 0" color="orange">待审核</a-tag>
            <a-tag v-else-if="currentProduct.auditStatus === 1" color="green">审核通过</a-tag>
            <a-tag v-else-if="currentProduct.auditStatus === 2" color="red">审核拒绝</a-tag>
          </a-descriptions-item>
          <a-descriptions-item v-if="currentProduct.auditStatus === 2" label="拒绝原因" :span="2">{{ currentProduct.auditReason }}</a-descriptions-item>
          <a-descriptions-item v-if="currentProduct.auditor" label="审核人">{{ currentProduct.auditor }}</a-descriptions-item>
          <a-descriptions-item v-if="currentProduct.auditTime" label="审核时间">{{ currentProduct.auditTime }}</a-descriptions-item>
          <a-descriptions-item label="商品描述" :span="2">
            <div v-html="currentProduct.description"></div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getProductList, approveProduct, rejectProduct, imgUrl } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(false)
const auditing = ref(false)
const list = ref<any[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const statusTab = ref('0')

const auditModalOpen = ref(false)
const detailModalOpen = ref(false)
const currentProduct = ref<any>(null)
const auditForm = ref({
  status: 1,
  reason: ''
})

const currentUserId = computed(() => getCurrentUserId())

async function loadList() {
  loading.value = true
  try {
    const params: any = { 
      pageNo: page.value, 
      pageSize,
      auditStatus: statusTab.value === '0' ? 0 : statusTab.value === '1' ? 1 : 2
    }
    const res = await getProductList(params)
    list.value = res?.records || []
    total.value = res?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openApprove(record: any) {
  currentProduct.value = record
  auditForm.value = {
    status: 1,
    reason: ''
  }
  auditModalOpen.value = true
}

function viewDetail(record: any) {
  currentProduct.value = record
  detailModalOpen.value = true
}

async function handleAudit() {
  if (!currentProduct.value) return
  
  if (auditForm.value.status === 2 && !auditForm.value.reason.trim()) {
    message.error('请输入拒绝原因')
    return
  }

  auditing.value = true
  try {
    if (auditForm.value.status === 1) {
      await approveProduct(currentProduct.value.id, currentUserId.value)
      message.success('审核通过')
    } else {
      await rejectProduct(currentProduct.value.id, auditForm.value.reason, currentUserId.value)
      message.success('已拒绝审核')
    }
    auditModalOpen.value = false
    loadList()
  } catch {
    message.error('操作失败')
  } finally {
    auditing.value = false
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.product-audit-page {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
</style>