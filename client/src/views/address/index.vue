<template>
  <div class="address-page">
    <div class="page-header">
      <h2 class="page-title">收货地址</h2>
      <a-button type="primary" @click="openAdd">新增地址</a-button>
    </div>

    <a-spin :spinning="loading">
      <div v-if="addressList.length === 0 && !loading" class="empty">
        <a-empty description="暂无收货地址" />
      </div>

      <div v-else class="address-list">
        <div v-for="addr in addressList" :key="addr.id" class="address-card">
          <div class="addr-header">
            <div class="addr-contact">
              <strong>{{ addr.consignee }}</strong>
              <span class="addr-phone">{{ addr.phone }}</span>
              <a-tag v-if="addr.isDefault" color="red" size="small">默认</a-tag>
            </div>
            <div class="addr-detail">
              {{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detailAddress }}
            </div>
          </div>
          <div class="addr-actions">
            <a-button type="link" size="small" @click="openEdit(addr)">编辑</a-button>
            <a-button type="link" size="small" danger @click="handleDelete(addr)">删除</a-button>
            <a-button
              v-if="!addr.isDefault"
              type="link"
              size="small"
              @click="handleSetDefault(addr)"
            >设为默认</a-button>
          </div>
        </div>
      </div>
    </a-spin>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="editing ? '编辑地址' : '新增地址'"
      @ok="handleSave"
      @cancel="closeModal"
      :confirm-loading="saving"
      destroyOnClose
    >
      <a-form
        ref="formRef"
        :model="form"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="收货人" name="consignee" :rules="[{ required: true, message: '请输入收货人' }]">
          <a-input v-model:value="form.consignee" placeholder="请输入收货人姓名" />
        </a-form-item>
        <a-form-item label="联系电话" name="phone" :rules="[{ required: true, message: '请输入联系电话' }]">
          <a-input v-model:value="form.phone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="省" name="province" :rules="[{ required: true, message: '请输入省' }]">
          <a-input v-model:value="form.province" placeholder="省" />
        </a-form-item>
        <a-form-item label="市" name="city" :rules="[{ required: true, message: '请输入市' }]">
          <a-input v-model:value="form.city" placeholder="市" />
        </a-form-item>
        <a-form-item label="区/县" name="district" :rules="[{ required: true, message: '请输入区/县' }]">
          <a-input v-model:value="form.district" placeholder="区/县" />
        </a-form-item>
        <a-form-item label="详细地址" name="detailAddress" :rules="[{ required: true, message: '请输入详细地址' }]">
          <a-input v-model:value="form.detailAddress" placeholder="请输入详细地址" />
        </a-form-item>
        <a-form-item label="设为默认" name="isDefault">
          <a-switch v-model:checked="form.isDefault" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  getAddressList,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/api'
import { getCurrentUserId } from '@/utils/user'

// 当前用户ID（从登录状态获取）
const currentUserId = getCurrentUserId()

const addressList = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const editing = ref(false)
const formRef = ref()

const defaultForm = {
  consignee: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false,
}

const form = reactive({ ...defaultForm })
let editingId = ''

async function fetchAddresses() {
  loading.value = true
  try {
    const res = await getAddressList(currentUserId)
    addressList.value = res?.records || []
  } catch {
    addressList.value = []
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editing.value = false
  editingId = ''
  Object.assign(form, { ...defaultForm })
  modalVisible.value = true
}

function openEdit(addr: any) {
  editing.value = true
  editingId = addr.id
  form.consignee = addr.consignee
  form.phone = addr.phone
  form.province = addr.province
  form.city = addr.city
  form.district = addr.district
  form.detailAddress = addr.detailAddress
  form.isDefault = addr.isDefault || false
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  Object.assign(form, { ...defaultForm })
  editingId = ''
  editing.value = false
}

async function handleSave() {
  // 简单校验
  if (!form.consignee || !form.phone || !form.province || !form.city || !form.district || !form.detailAddress) {
    message.warning('请填写完整信息')
    return
  }
  saving.value = true
  try {
    const data = {
      userId: currentUserId,
      consignee: form.consignee,
      phone: form.phone,
      province: form.province,
      city: form.city,
      district: form.district,
      detailAddress: form.detailAddress,
      isDefault: form.isDefault ? 1 : 0,
    }
    if (editing.value) {
      await updateAddress({ id: editingId, ...data })
      message.success('地址已更新')
    } else {
      await addAddress(data)
      message.success('地址已添加')
    }
    closeModal()
    await fetchAddresses()
  } catch {
    message.error('操作失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(addr: any) {
  Modal.confirm({
    title: '删除地址',
    content: `确定删除 ${addr.consignee} 的收货地址吗？`,
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await deleteAddress(addr.id)
        message.success('已删除')
        await fetchAddresses()
      } catch {
        message.error('删除失败')
      }
    },
  })
}

async function handleSetDefault(addr: any) {
  try {
    await setDefaultAddress(addr.id)
    message.success('已设为默认')
    await fetchAddresses()
  } catch {
    message.error('操作失败')
  }
}

onMounted(fetchAddresses)
</script>

<style scoped>
.address-page {
  background: #f8f8f8;
  padding: 16px;
  padding-bottom: 100px;
  max-width: 480px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.empty {
  padding: 80px 0;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-card {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.addr-header {
  flex: 1;
}

.addr-contact {
  margin-bottom: 4px;
}

.addr-contact strong {
  margin-right: 8px;
  font-size: 15px;
}

.addr-phone {
  color: #666;
  margin-right: 8px;
}

.addr-detail {
  font-size: 13px;
  color: #666;
}

.addr-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 16px;
}
</style>