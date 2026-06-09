<template>
  <view class="page-container">
    <view class="nav-bar">
      <text class="nav-back" @tap="goBack">‹</text>
      <text class="nav-title">讲师申请</text>
      <view style="width:36px" />
    </view>

    <view class="form-card">
      <view class="form-item">
        <text class="form-label">👤 真实姓名</text>
        <input v-model="form.name" class="form-input" placeholder="请输入真实姓名" placeholder-class="input-placeholder" />
      </view>
      <view class="form-item">
        <text class="form-label">📱 手机号</text>
        <input v-model="form.phone" class="form-input" placeholder="请输入手机号" placeholder-class="input-placeholder" type="number" :maxlength="11" />
      </view>
      <view class="form-item">
        <text class="form-label">🎯 专业领域</text>
        <input v-model="form.field" class="form-input" placeholder="如：前端开发、UI设计" placeholder-class="input-placeholder" />
      </view>
      <view class="form-item">
        <text class="form-label">📝 个人简介</text>
        <textarea v-model="form.intro" class="form-textarea" placeholder="请简要介绍您的教学经验和专业背景" placeholder-class="input-placeholder" :maxlength="500" />
      </view>
      <view class="form-item">
        <text class="form-label">📜 资质证书</text>
        <view class="upload-area" @tap="chooseImage">
          <image v-if="form.certificate" :src="form.certificate" class="uploaded-img" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">上传证书</text>
          </view>
        </view>
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
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const submitting = ref(false)
const form = reactive({
  name: '',
  phone: '',
  field: '',
  intro: '',
  certificate: '',
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
      form.certificate = res.tempFilePaths[0]
    },
  })
}

async function onSubmit() {
  if (!form.name) {
    uni.showToast({ title: '请输入姓名', icon: 'none' })
    return
  }
  if (!form.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await http.post('/course/lecturer/apply', {
      userId: getCurrentUserId(),
      name: form.name,
      phone: form.phone,
      field: form.field,
      intro: form.intro,
    })
    uni.showToast({ title: '申请已提交', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 500)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F5F6FA;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 44px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-back {
  font-size: 28px;
  font-weight: 300;
  color: #1a1a1a;
  padding: 4px 8px;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.form-card {
  background: #fff;
  margin: 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
  display: block;
}

.form-input {
  width: 100%;
  height: 44px;
  background: #F5F6FA;
  border-radius: 12px;
  padding: 0 12px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  min-height: 100px;
  background: #F5F6FA;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
}

.input-placeholder {
  color: #ccc;
  font-size: 14px;
}

.upload-area {
  width: 120px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px dashed #eee;
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
  gap: 4px;
}

.upload-icon {
  font-size: 24px;
}

.upload-text {
  font-size: 12px;
  color: #ccc;
}

.submit-area {
  padding: 24px 16px;
  padding-bottom: 24px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 20px;
  border: none;
  background: #FF7A45;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.submit-btn:active {
  opacity: 0.9;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
