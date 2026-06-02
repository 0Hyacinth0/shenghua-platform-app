<template>
  <div class="merchant-apply-page">
    <h2 class="page-title">商家入驻申请</h2>

    <!-- 已提交，显示审核状态 -->
    <a-spin :spinning="checking">
      <div v-if="myMerchant" class="status-card">
        <a-result
          :status="statusResult(myMerchant.auditStatus)"
          :title="statusTitle(myMerchant.auditStatus)"
          :sub-title="statusSubtitle(myMerchant.auditStatus, myMerchant.auditRemark)"
        >
          <template #extra>
            <a-descriptions bordered size="small" :column="2">
              <a-descriptions-item label="店铺名称">{{ myMerchant.shopName }}</a-descriptions-item>
              <a-descriptions-item label="商家类型">{{ myMerchant.merchantType === 1 ? 'B2C' : 'C2C' }} · {{ myMerchant.storeNature === 0 ? '个人' : '企业' }}</a-descriptions-item>
              <a-descriptions-item label="联系电话">{{ myMerchant.contactPhone || '-' }}</a-descriptions-item>
              <a-descriptions-item label="提交时间">{{ myMerchant.createTime || '-' }}</a-descriptions-item>
              <a-descriptions-item label="累计收益">¥{{ (myMerchant.totalEarnings || 0).toFixed(2) }}</a-descriptions-item>
              <a-descriptions-item label="可提现余额"><span style="color:#e4393c;font-weight:700">¥{{ (myMerchant.balance || 0).toFixed(2) }}</span></a-descriptions-item>
            </a-descriptions>
            <a-button v-if="myMerchant.auditStatus === 2" type="primary" @click="reApply" style="margin-top:16px">重新申请</a-button>
            <template v-if="myMerchant.auditStatus === 1">
              <a-button type="primary" @click="$router.push('/merchant/products')" style="margin-top:16px">管理商品</a-button>
              <a-button v-if="(myMerchant.balance || 0) > 0" style="margin-top:16px;margin-left:8px" @click="showWithdraw">申请提现</a-button>
            </template>
          </template>
        </a-result>

        <!-- 提现记录 -->
        <div v-if="myMerchant && withdrawList.length > 0" style="margin-top:16px">
          <h4>提现记录</h4>
          <a-table :data-source="withdrawList" :pagination="false" size="small" bordered rowKey="id">
            <a-table-column title="单号" dataIndex="withdrawNo" width="160" />
            <a-table-column title="金额" dataIndex="withdrawAmount" width="100" />
            <a-table-column title="状态" width="80">
              <template #default="{ record }">
                <a-tag :color="record.auditStatus===0?'orange':record.auditStatus===1?'green':'red'">
                  {{ record.auditStatus===0?'待审核':record.auditStatus===1?'已打款':'已拒绝' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="拒绝原因" dataIndex="auditRemark" />
            <a-table-column title="时间" dataIndex="createTime" width="160" />
          </a-table>
        </div>
      </div>

      <!-- 未申请，显示申请表单 -->
      <a-form v-else-if="!checking" ref="formRef" :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }" style="max-width: 700px">
        <a-form-item label="店铺名称" name="shopName" :rules="[{ required: true, message: '请输入店铺名称' }]">
          <a-input v-model:value="form.shopName" placeholder="请输入店铺名称" :maxlength="50" show-count />
        </a-form-item>

        <a-form-item label="店铺性质" name="storeNature" :rules="[{ required: true, message: '请选择店铺性质' }]">
          <a-radio-group v-model:value="form.storeNature">
            <a-radio :value="0">个人</a-radio>
            <a-radio :value="1">企业</a-radio>
          </a-radio-group>
        </a-form-item>

        <template v-if="form.storeNature === 1">
          <a-form-item label="营业执照号" name="businessLicenseNo" :rules="[{ required: true, message: '请输入营业执照号' }]">
            <a-input v-model:value="form.businessLicenseNo" placeholder="请输入营业执照号" />
          </a-form-item>
          <a-form-item label="营业执照图片" name="businessLicenseUrl">
            <a-input v-model:value="form.businessLicenseUrl" placeholder="请输入营业执照图片URL" />
          </a-form-item>
          <a-form-item label="法人姓名" name="legalPersonName" :rules="[{ required: true, message: '请输入法人姓名' }]">
            <a-input v-model:value="form.legalPersonName" placeholder="请输入法人姓名" />
          </a-form-item>
        </template>

        <template v-if="form.storeNature === 0">
          <a-form-item label="身份证正面" name="idCardFrontUrl">
            <a-input v-model:value="form.idCardFrontUrl" placeholder="请输入身份证正面图片URL" />
          </a-form-item>
          <a-form-item label="身份证反面" name="idCardBackUrl">
            <a-input v-model:value="form.idCardBackUrl" placeholder="请输入身份证反面图片URL" />
          </a-form-item>
        </template>

        <a-form-item label="联系电话" name="contactPhone" :rules="[{ required: true, message: '请输入联系电话' }]">
          <a-input v-model:value="form.contactPhone" placeholder="请输入联系电话" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 4, span: 14 }">
          <a-button type="primary" size="large" :loading="loading" @click="handleSubmit" style="width: 100%">提交申请</a-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { merchantApply, getMyMerchant } from '@/api'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
// 当前用户ID（从登录状态获取）
const currentUserId = getCurrentUserId()

const formRef = ref()
const loading = ref(false)
const checking = ref(true)
const myMerchant = ref<any>(null)

const form = reactive({
  shopName: '',
  merchantType: 1,
  storeNature: 0,
  businessLicenseNo: '',
  businessLicenseUrl: '',
  legalPersonName: '',
  idCardFrontUrl: '',
  idCardBackUrl: '',
  contactPhone: '',
})

function statusResult(status: number): string {
  if (status === 0) return 'info'
  if (status === 1) return 'success'
  return 'error'
}

function statusTitle(status: number): string {
  if (status === 0) return '审核中'
  if (status === 1) return '审核通过'
  return '审核拒绝'
}

function statusSubtitle(status: number, remark: string): string {
  if (status === 0) return '您的入驻申请正在审核中，请耐心等待'
  if (status === 1) return '恭喜，您的店铺已通过审核，可以上架商品了'
  return remark || '您的申请未通过审核'
}

const withdrawList = ref<any[]>([])

async function loadWithdrawList() {
  if (!myMerchant.value?.id) return
  try {
    const res = await http.get('/mall/commissionWithdraw/list', { params: { distributorId: myMerchant.value.id, pageSize: 99 } })
    withdrawList.value = res?.records || []
  } catch {}
}

function reApply() { myMerchant.value = null }

async function showWithdraw() {
  if (!myMerchant.value || !myMerchant.value.balance || myMerchant.value.balance <= 0) {
    message.warning('暂无可提现余额')
    return
  }
  Modal.confirm({
    title: '申请提现',
    content: `可提现余额：¥${(myMerchant.value.balance || 0).toFixed(2)}，确定申请提现全部余额吗？`,
    okText: '确定提现',
    onOk: async () => {
      try {
        await http.post('/mall/merchant/withdraw', null, {
          params: { merchantId: myMerchant.value.id, amount: myMerchant.value.balance, accountName: myMerchant.value.shopName, accountNumber: myMerchant.value.contactPhone || '' }
        })
        message.success('提现申请已提交，请等待审核')
        const res = await getMyMerchant(currentUserId)
        myMerchant.value = res
      } catch { message.error('提现失败') }
    }
  })
}

onMounted(async () => {
  try {
    const res = await getMyMerchant(currentUserId)
    if (res?.id) { myMerchant.value = res; loadWithdrawList() }
  } catch { /* ignore */ }
  finally { checking.value = false }
})

async function handleSubmit() {
  if (!form.shopName) { message.warning('请输入店铺名称'); return }
  if (!form.contactPhone) { message.warning('请输入联系电话'); return }
  if (form.storeNature === 1 && !form.businessLicenseNo) { message.warning('请输入营业执照号'); return }

  loading.value = true
  try {
    const data: any = {
      userId: currentUserId, shopName: form.shopName, merchantType: 2, storeNature: form.storeNature, contactPhone: form.contactPhone,
    }
    if (form.storeNature === 1) {
      data.businessLicenseNo = form.businessLicenseNo
      data.businessLicenseUrl = form.businessLicenseUrl
      data.legalPersonName = form.legalPersonName
    } else {
      data.idCardFrontUrl = form.idCardFrontUrl
      data.idCardBackUrl = form.idCardBackUrl
    }
    await merchantApply(data)
    message.success('申请已提交，请等待审核')
    const res = await getMyMerchant(currentUserId)
    myMerchant.value = res
  } catch { message.error('提交失败，请重试') }
  finally { loading.value = false }
}
</script>

<style scoped>
.merchant-apply-page { background: #fff; border-radius: 8px; padding: 24px; }
.page-title { font-size: 20px; font-weight: 600; margin: 0 0 24px; }
.status-card { padding: 40px 0; }
</style>