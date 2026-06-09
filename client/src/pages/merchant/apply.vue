<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="22" color="var(--text-primary)" />
      </view>
      <text class="nav-title">商家入驻</text>
      <view style="width:36px" />
    </view>

    <!-- 已有申请状态 -->
    <view v-if="existingStatus !== null" class="status-card" :class="'status-' + existingStatus">
      <view class="status-icon-wrap">
        <Icon :icon="existingStatus === 1 ? 'solar:check-circle-bold' : existingStatus === 2 ? 'solar:close-circle-bold' : 'solar:clock-circle-bold'" width="28" :color="existingStatus === 1 ? 'var(--color-success)' : existingStatus === 2 ? 'var(--color-danger)' : 'var(--color-warning)'" />
      </view>
      <text class="status-title">{{ existingStatus === 0 ? '审核中' : existingStatus === 1 ? '已通过' : '已拒绝' }}</text>
      <text class="status-desc">{{ existingStatus === 0 ? '您的入驻申请正在审核中，请耐心等待' : existingStatus === 1 ? '恭喜，您已成功入驻' : '很抱歉，您的申请未通过，可重新提交' }}</text>
      <view v-if="existingStatus === 1" class="status-action" @tap="goProducts">
        <text class="status-action-text">管理商品</text>
        <Icon icon="solar:alt-arrow-right-bold" width="14" color="var(--color-accent)" />
      </view>
    </view>

    <view v-if="existingStatus === null || existingStatus === 2" class="form-card">
      <view class="form-item">
        <view class="form-label-row">
          <Icon icon="solar:shop-bold" width="18" color="var(--color-accent)" />
          <text class="form-label">店铺名称</text>
        </view>
        <input v-model="form.shopName" class="form-input" placeholder="请输入店铺名称" placeholder-class="input-placeholder" />
      </view>
      <view class="form-item">
        <view class="form-label-row">
          <Icon icon="solar:user-bold" width="18" color="var(--color-accent)" />
          <text class="form-label">联系人</text>
        </view>
        <input v-model="form.contactName" class="form-input" placeholder="请输入联系人姓名" placeholder-class="input-placeholder" />
      </view>
      <view class="form-item">
        <view class="form-label-row">
          <Icon icon="solar:phone-bold" width="18" color="var(--color-accent)" />
          <text class="form-label">联系电话</text>
        </view>
        <input v-model="form.phone" class="form-input" placeholder="请输入联系电话" placeholder-class="input-placeholder" type="number" :maxlength="11" />
      </view>
      <view class="form-item">
        <view class="form-label-row">
          <Icon icon="solar:folder-bold" width="18" color="var(--color-accent)" />
          <text class="form-label">经营类目</text>
        </view>
        <input v-model="form.category" class="form-input" placeholder="如：服装、数码、食品" placeholder-class="input-placeholder" />
      </view>
      <view class="form-item">
        <view class="form-label-row">
          <Icon icon="solar:document-bold" width="18" color="var(--color-accent)" />
          <text class="form-label">营业执照</text>
        </view>
        <view class="upload-area" @tap="chooseImage">
          <image v-if="form.license" :src="form.license" class="uploaded-img" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <Icon icon="solar:camera-bold" width="28" color="var(--text-hint)" />
            <text class="upload-text">上传营业执照</text>
          </view>
        </view>
      </view>
      <view class="form-item">
        <view class="form-label-row">
          <Icon icon="solar:pen-new-square-bold" width="18" color="var(--color-accent)" />
          <text class="form-label">店铺简介</text>
        </view>
        <textarea v-model="form.description" class="form-textarea" placeholder="请简要描述您的店铺" placeholder-class="input-placeholder" :maxlength="300" />
      </view>
    </view>

    <view class="submit-area">
      <button class="submit-btn" :disabled="submitting" @tap="onSubmit">
        {{ submitting ? '提交中...' : '提交申请' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { merchantApply, getMyMerchant } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const submitting = ref(false)
const existingStatus = ref<number | null>(null)
const form = reactive({
  shopName: '',
  contactName: '',
  phone: '',
  category: '',
  license: '',
  description: '',
})

function goBack() {
  uni.navigateBack()
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.license = res.tempFilePaths[0]
    },
  })
}

async function onSubmit() {
  if (!form.shopName) {
    uni.showToast({ title: '请输入店铺名称', icon: 'none' })
    return
  }
  if (!form.contactName) {
    uni.showToast({ title: '请输入联系人', icon: 'none' })
    return
  }
  if (!form.phone) {
    uni.showToast({ title: '请输入联系电话', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await merchantApply({
      userId: getCurrentUserId(),
      shopName: form.shopName,
      contactName: form.contactName,
      phone: form.phone,
      category: form.category,
      description: form.description,
    })
    uni.showToast({ title: '申请已提交', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 500)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

function goProducts() {
  uni.navigateTo({ url: '/pages/merchant/products' })
}

onLoad(async () => {
  try {
    const existing: any = await getMyMerchant(getCurrentUserId())
    if (existing && existing.auditStatus !== undefined) {
      existingStatus.value = existing.auditStatus
      if (existing.shopName) form.shopName = existing.shopName
      if (existing.contactName) form.contactName = existing.contactName
      if (existing.phone) form.phone = existing.phone
    }
  } catch {
    existingStatus.value = null
  }
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page-container {
  min-height: 100vh;
  background: var(--bg-page);
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-card);
  padding: 44px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-back {
  padding: var(--space-xs) var(--space-sm);
  display: flex;
  align-items: center;
}

.nav-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.form-card {
  background: var(--bg-card);
  margin: var(--space-lg);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.status-card {
  background: var(--bg-card);
  margin: var(--space-lg);
  border-radius: var(--radius-lg);
  padding: 24px var(--space-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  text-align: center;
}

.status-icon-wrap {
  margin-bottom: var(--space-xs);
}

.status-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}

.status-desc {
  font-size: var(--font-base);
  color: var(--text-secondary);
  line-height: 1.5;
}

.status-action {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-accent-light);
  border-radius: var(--radius-full);
}

.status-action-text {
  font-size: var(--font-base);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--space-sm);
}

.form-label {
  font-size: var(--font-base);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  height: 44px;
  background: var(--bg-gray);
  border-radius: var(--radius-lg);
  padding: 0 12px;
  font-size: var(--font-base);
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  background: var(--bg-gray);
  border-radius: var(--radius-lg);
  padding: 12px;
  font-size: var(--font-base);
}

.input-placeholder {
  color: var(--text-hint);
  font-size: var(--font-base);
}

.upload-area {
  width: 160px;
  height: 100px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1.5px dashed var(--bg-gray);
}

.uploaded-img {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
}

.upload-text {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.submit-area {
  padding: 24px var(--space-lg);
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-accent);
  color: var(--text-white);
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
}

.submit-btn:active {
  opacity: 0.9;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
