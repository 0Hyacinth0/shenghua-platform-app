<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="20" />
      </view>
      <text class="nav-title">收货地址</text>
      <view style="width: 36px;" />
    </view>

    <view v-if="loading" class="loading-wrap">
      <view class="loading-spinner" />
    </view>

    <scroll-view v-else scroll-y class="address-list">
      <view v-if="addresses.length > 0" class="address-items">
        <view v-for="addr in addresses" :key="addr.id" class="address-card" @tap="onSelect(addr)">
          <view class="address-main">
            <view class="address-top">
              <text class="address-name">{{ addr.name }}</text>
              <text class="address-phone">{{ addr.phone }}</text>
              <view v-if="addr.defaultFlag" class="default-badge">
                <text class="default-text">默认</text>
              </view>
            </view>
            <text class="address-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</text>
          </view>
          <view class="address-actions">
            <view class="action-item" @tap.stop="onSetDefault(addr)">
              <Icon :icon="addr.defaultFlag ? 'solar:check-circle-bold' : 'solar:circle-bold'" width="16" :color="addr.defaultFlag ? 'var(--color-accent)' : 'var(--text-hint)'" />
              <text class="action-label">默认</text>
            </view>
            <view class="action-item" @tap.stop="onEdit(addr)">
              <Icon icon="solar:pen-bold" width="16" color="var(--text-hint)" />
              <text class="action-label">编辑</text>
            </view>
            <view class="action-item" @tap.stop="onDelete(addr)">
              <Icon icon="solar:trash-bin-minimalistic-bold" width="16" color="var(--text-hint)" />
              <text class="action-label">删除</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <Icon icon="solar:map-point-bold" width="48" color="var(--text-hint)" />
        <text class="empty-text">还没有收货地址</text>
        <text class="empty-sub">添加地址后可以更快收到商品</text>
      </view>
    </scroll-view>

    <!-- 新增按钮 -->
    <view class="add-bar">
      <button class="add-btn" @tap="onAdd">
        <Icon icon="solar:add-circle-bold" width="18" color="#fff" />
        <text class="add-text">新增收货地址</text>
      </button>
    </view>

    <!-- 编辑弹窗 -->
    <view v-if="showEditor" class="editor-mask" @tap="showEditor = false">
      <view class="editor-content" @tap.stop>
        <view class="editor-header">
          <text class="editor-title">{{ editingId ? '编辑地址' : '新增地址' }}</text>
          <view class="editor-close" @tap="showEditor = false">
            <Icon icon="solar:close-circle-bold" width="20" color="var(--text-hint)" />
          </view>
        </view>
        <scroll-view scroll-y class="editor-form">
          <view class="form-item">
            <text class="form-label">收货人</text>
            <input v-model="editForm.name" class="form-input" placeholder="请输入收货人姓名" placeholder-class="input-placeholder" />
          </view>
          <view class="form-item">
            <text class="form-label">手机号</text>
            <input v-model="editForm.phone" class="form-input" placeholder="请输入手机号" placeholder-class="input-placeholder" type="number" :maxlength="11" />
          </view>
          <view class="form-item">
            <text class="form-label">所在地区</text>
            <view class="form-input region-input" @tap="onPickRegion">
              <text :class="{ placeholder: !editForm.region }">{{ editForm.region || '请选择省/市/区' }}</text>
              <Icon icon="solar:alt-arrow-right-bold" width="16" color="var(--text-hint)" />
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">详细地址</text>
            <input v-model="editForm.detail" class="form-input" placeholder="街道、楼栋、门牌号" placeholder-class="input-placeholder" />
          </view>
          <view class="form-item row" @tap="editForm.defaultFlag = !editForm.defaultFlag">
            <view class="checkbox" :class="{ checked: editForm.defaultFlag }">
              <Icon v-if="editForm.defaultFlag" icon="solar:check-bold" width="12" color="#fff" />
            </view>
            <text class="checkbox-label">设为默认地址</text>
          </view>
          <button class="save-btn" @tap="onSave">
            <text class="save-btn-text">保存</text>
          </button>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getAddressList, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const loading = ref(true)
const addresses = ref<any[]>([])
const showEditor = ref(false)
const editingId = ref('')
const editForm = reactive({
  name: '',
  phone: '',
  region: '',
  detail: '',
  defaultFlag: false,
})

function goBack() {
  uni.navigateBack()
}

function onSelect(addr: any) {
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2]
  if (prevPage) {
    uni.$emit('addressSelected', addr)
  }
  uni.navigateBack()
}

function onAdd() {
  editingId.value = ''
  editForm.name = ''
  editForm.phone = ''
  editForm.region = ''
  editForm.detail = ''
  editForm.defaultFlag = false
  showEditor.value = true
}

function onEdit(addr: any) {
  editingId.value = addr.id
  editForm.name = addr.name || ''
  editForm.phone = addr.phone || ''
  editForm.region = (addr.province || '') + (addr.city || '') + (addr.district || '')
  editForm.detail = addr.detail || ''
  editForm.defaultFlag = !!addr.defaultFlag
  showEditor.value = true
}

function onPickRegion() {
  // #ifdef MP-WEIXIN
  // 微信小程序使用内置的地区选择器
  uni.chooseLocation({
    success: (res: any) => {
      editForm.region = res.name || res.address || ''
    },
  })
  // #endif
  // #ifndef MP-WEIXIN
  // H5 / App 使用手动输入
  uni.showModal({
    title: '请输入所在地区',
    editable: true,
    placeholderText: '如：广东省深圳市南山区',
    success: (res) => {
      if (res.confirm && res.content) {
        editForm.region = res.content
      }
    },
  })
  // #endif
}

async function loadAddresses() {
  loading.value = true
  try {
    const res = await getAddressList(getCurrentUserId())
    addresses.value = Array.isArray(res) ? res : (res?.records || [])
  } catch {
    addresses.value = []
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (!editForm.name) {
    uni.showToast({ title: '请输入收货人', icon: 'none' })
    return
  }
  if (!editForm.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!editForm.detail) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return
  }

  try {
    const data: any = {
      userId: getCurrentUserId(),
      name: editForm.name,
      phone: editForm.phone,
      detail: editForm.detail,
      defaultFlag: editForm.defaultFlag ? 1 : 0,
    }
    if (editingId.value) {
      data.id = editingId.value
      await updateAddress(data)
    } else {
      await addAddress(data)
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    showEditor.value = false
    loadAddresses()
  } catch (e: any) {
    uni.showToast({ title: e?.message || '保存失败', icon: 'none' })
  }
}

async function onSetDefault(addr: any) {
  if (addr.defaultFlag) return
  try {
    await setDefaultAddress(addr.id)
    uni.showToast({ title: '已设为默认', icon: 'success' })
    loadAddresses()
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

async function onDelete(addr: any) {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteAddress(addr.id)
          uni.showToast({ title: '已删除', icon: 'success' })
          loadAddresses()
        } catch (e: any) {
          uni.showToast({ title: e?.message || '删除失败', icon: 'none' })
        }
      }
    },
  })
}

onLoad(() => {
  loadAddresses()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.nav-bar {
  display: none;
}

.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.nav-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

/* 地址列表 */
.address-list {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
}

.address-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.address-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.address-card:active {
  transform: scale(0.99);
}

.address-main {
  padding: var(--space-lg);
}

.address-top {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.address-name {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.address-phone {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.default-badge {
  background: var(--color-accent-light);
  padding: 2px var(--space-sm);
  border-radius: 4px;
}

.default-text {
  font-size: var(--font-xs);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

.address-detail {
  font-size: var(--font-base);
  color: var(--text-secondary);
  line-height: 1.5;
}

.address-actions {
  display: flex;
  border-top: 1px solid var(--color-divider);
}

.action-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--space-md) 0;
}

.action-item:active {
  background: var(--bg-gray);
}

.action-label {
  font-size: var(--font-sm);
  color: var(--text-hint);
}

/* 新增按钮 */
.add-bar {
  padding: var(--space-md) var(--space-lg);
  padding-bottom: calc(10px + var(--safe-area-bottom));
  background: var(--bg-card);
  border-top: 1px solid var(--color-divider);
}

.add-btn {
  width: 100%;
  height: 48px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.add-btn:active {
  opacity: 0.9;
}

.add-text {
  font-size: var(--font-lg);
  color: var(--text-white);
  font-weight: var(--weight-semibold);
}

/* 编辑弹窗 */
.editor-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.editor-content {
  width: 100%;
  max-height: 80vh;
  background: var(--bg-card);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-divider);
}

.editor-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.editor-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-form {
  flex: 1;
  padding: var(--space-lg);
}

.form-item {
  margin-bottom: var(--space-lg);
}

.form-item.row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.form-label {
  font-size: var(--font-base);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
  margin-bottom: var(--space-sm);
  display: block;
}

.form-item.row .form-label {
  display: none;
}

.form-input {
  width: 100%;
  height: 48px;
  background: var(--bg-gray);
  border-radius: var(--radius-sm);
  padding: 0 14px;
  font-size: var(--font-base);
  color: var(--text-primary);
}

.region-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.region-input .placeholder {
  color: var(--text-hint);
}

.input-placeholder {
  color: var(--text-hint);
  font-size: var(--font-base);
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-circle);
  border: 1.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.checkbox-label {
  font-size: var(--font-base);
  color: var(--text-primary);
}

.save-btn {
  width: 100%;
  height: 48px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-sm);
}

.save-btn:active {
  opacity: 0.9;
}

.save-btn-text {
  font-size: var(--font-lg);
  color: var(--text-white);
  font-weight: var(--weight-semibold);
}

/* 加载状态 */
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-gray);
  border-top-color: var(--color-accent);
  border-radius: var(--radius-circle);
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
  gap: var(--space-xs);
}

.empty-text {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-top: var(--space-md);
}

.empty-sub {
  font-size: var(--font-base);
  color: var(--text-hint);
}
</style>
