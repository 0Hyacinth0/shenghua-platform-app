<template>
  <div class="address-page">
    <header class="page-header">
      <button class="page-back" @click="$router.back()"><LeftOutlined /></button>
      <span class="page-title">收货地址</span>
      <button class="header-add" @click="openAdd"><PlusOutlined /></button>
    </header>

    <a-spin :spinning="loading">
      <div v-if="addressList.length === 0 && !loading" class="empty-wrap">
        <EnvironmentOutlined class="empty-icon" />
        <div class="empty-text">暂无收货地址</div>
        <button class="btn btn-primary" style="margin-top:16px" @click="openAdd">添加地址</button>
      </div>

      <div v-else class="addr-list">
        <div v-for="addr in addressList" :key="addr.id" class="addr-card">
          <div class="addr-body" @click="openEdit(addr)">
            <div class="addr-top">
              <span class="addr-name">{{ addr.consignee }}</span>
              <span class="addr-phone">{{ addr.phone }}</span>
              <span v-if="addr.isDefault" class="addr-default">默认</span>
            </div>
            <div class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detailAddress }}</div>
          </div>
          <div class="addr-actions">
            <button v-if="!addr.isDefault" class="action-link" @click="handleSetDefault(addr)">设为默认</button>
            <button class="action-link" @click="openEdit(addr)">编辑</button>
            <button class="action-link danger" @click="handleDelete(addr)">删除</button>
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
      <a-form ref="formRef" :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
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
import { LeftOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons-vue'
import { getAddressList, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const currentUserId = getCurrentUserId()
const addressList = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const editing = ref(false)
const formRef = ref()

const defaultForm = { consignee: '', phone: '', province: '', city: '', district: '', detailAddress: '', isDefault: false }
const form = reactive({ ...defaultForm })
let editingId = ''

async function fetchAddresses() {
  loading.value = true
  try { addressList.value = (await getAddressList(currentUserId))?.records || [] }
  catch { addressList.value = [] }
  finally { loading.value = false }
}

function openAdd() { editing.value = false; editingId = ''; Object.assign(form, { ...defaultForm }); modalVisible.value = true }
function openEdit(addr: any) {
  editing.value = true; editingId = addr.id
  Object.assign(form, { consignee: addr.consignee, phone: addr.phone, province: addr.province, city: addr.city, district: addr.district, detailAddress: addr.detailAddress, isDefault: addr.isDefault || false })
  modalVisible.value = true
}
function closeModal() { modalVisible.value = false; Object.assign(form, { ...defaultForm }); editingId = ''; editing.value = false }

async function handleSave() {
  if (!form.consignee || !form.phone || !form.province || !form.city || !form.district || !form.detailAddress) { message.warning('请填写完整信息'); return }
  saving.value = true
  try {
    const data = { userId: currentUserId, consignee: form.consignee, phone: form.phone, province: form.province, city: form.city, district: form.district, detailAddress: form.detailAddress, isDefault: form.isDefault ? 1 : 0 }
    if (editing.value) { await updateAddress({ id: editingId, ...data }); message.success('已更新') }
    else { await addAddress(data); message.success('已添加') }
    closeModal(); await fetchAddresses()
  } catch { message.error('操作失败') }
  finally { saving.value = false }
}

async function handleDelete(addr: any) {
  Modal.confirm({ title: '删除地址', content: `确定删除 ${addr.consignee} 的地址吗？`, okText: '确定', cancelText: '取消', okButtonProps: { danger: true },
    onOk: async () => { try { await deleteAddress(addr.id); message.success('已删除'); await fetchAddresses() } catch { message.error('删除失败') } },
  })
}

async function handleSetDefault(addr: any) {
  try { await setDefaultAddress(addr.id); message.success('已设为默认'); await fetchAddresses() } catch { message.error('操作失败') }
}

onMounted(fetchAddresses)
</script>

<style scoped>
.address-page {
  min-height: 100vh;
  background: var(--color-bg-page, #F7F7F8);
  padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px);
}

.page-header {
  position: sticky; top: 0; z-index: 100;
  background: var(--color-card, #fff);
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; min-height: 48px;
}

.page-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--color-text, #1a1a1a); background: transparent; }
.page-title { font-size: 17px; font-weight: 600; color: var(--color-text, #1a1a1a); }
.header-add { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--color-primary, #FF4D4F); background: transparent; }

.addr-list { padding: 12px 16px; }

.addr-card {
  background: var(--color-card, #fff);
  border-radius: 12px;
  margin-bottom: 10px;
  overflow: hidden;
}

.addr-body {
  padding: 14px 16px;
  cursor: pointer;
}

.addr-body:active { background: var(--color-bg, #f5f5f5); }

.addr-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.addr-name { font-size: 15px; font-weight: 600; color: var(--color-text, #1a1a1a); }
.addr-phone { font-size: 14px; color: var(--color-text-secondary, #666); }
.addr-default { font-size: 10px; background: var(--color-primary-light, #FFF1F0); color: var(--color-primary, #FF4D4F); padding: 1px 6px; border-radius: 3px; font-weight: 500; }
.addr-detail { font-size: 13px; color: var(--color-text-secondary, #666); line-height: 1.4; }

.addr-actions {
  display: flex;
  border-top: 0.5px solid var(--color-divider, #f0f0f0);
}

.action-link {
  flex: 1;
  padding: 10px;
  font-size: 13px;
  color: var(--color-text-secondary, #666);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: center;
}

.action-link + .action-link { border-left: 0.5px solid var(--color-divider, #f0f0f0); }
.action-link.danger { color: var(--color-primary, #FF4D4F); }
.action-link:active { background: var(--color-bg, #f5f5f5); }
</style>
