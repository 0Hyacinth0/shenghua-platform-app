<template>
  <div class="apply-page">
    <h2>讲师入驻申请</h2>
    <div v-if="status === 'loading'" class="status-card loading">加载中...</div>
    <div v-else-if="status === 'approved'" class="status-card success">
      <div class="status-icon">✅</div>
      <p>您的讲师申请已通过</p>
      <button @click="$router.push('/course/lecturer/courses')">管理我的课程</button>
    </div>
    <div v-else-if="status === 'pending'" class="status-card pending">
      <div class="status-icon">⏳</div>
      <p>申请审核中，请耐心等待</p>
    </div>
    <div v-else-if="status === 'rejected'" class="status-card rejected">
      <div class="status-icon">❌</div>
      <p>申请被拒绝：{{ reason }}</p>
      <button @click="status = 'apply'">重新申请</button>
    </div>
    <div v-else class="form-card">
      <div class="form-group">
        <label>讲师名称</label>
        <input v-model="form.name" placeholder="请输入讲师名称" />
      </div>
      <div class="form-group">
        <label>个人简介</label>
        <textarea v-model="form.intro" placeholder="介绍您的专业背景、擅长领域..." rows="4"></textarea>
      </div>
      <div class="form-group">
        <label>资质证明</label>
        <a-upload :custom-request="handleUpload" :show-upload-list="false" accept="image/*">
          <div v-if="form.qualification" class="img-preview-wrap">
            <img v-for="(url, i) in form.qualification.split(',')" :key="i" :src="imgUrl(url)" class="qual-img" />
            <a-button size="small" style="display:block;margin-top:4px">继续上传</a-button>
          </div>
          <div v-else class="upload-placeholder">
            <plus-outlined /><div>上传资质图片</div>
          </div>
        </a-upload>
        <div v-if="form.qualification" style="margin-top:4px">
          <a-button size="small" danger @click="clearQual">清空图片</a-button>
        </div>
      </div>
      <button class="submit-btn" @click="submitApply" :disabled="submitting">{{ submitting ? '提交中...' : '提交申请' }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import http from '@/utils/http'
import { imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const userId = getCurrentUserId()
const status = ref('apply')
const reason = ref('')
const submitting = ref(false)
const form = ref({ name: '', intro: '', qualification: '' })

async function handleUpload({ file, onSuccess, onError }: any) {
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await http.post('/mall/file/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    const url = res || ''
    if (url) {
      const existing = form.value.qualification ? form.value.qualification.split(',') : []
      existing.push(url)
      form.value.qualification = existing.join(',')
    }
    onSuccess(url)
  } catch {
    onError(new Error('上传失败'))
  }
}

function clearQual() { form.value.qualification = '' }

const checkStatus = async () => {
  if (!userId) return
  try {
    const list = await http.get('/course/lecturer/list', { params: { userId } })
    const records = list?.records || list || []
    if (records.length > 0) {
      const lecturer = records[records.length - 1]
      const st = lecturer.auditStatus
      if (st === 2) status.value = 'approved'
      else if (st === 3) { status.value = 'rejected'; reason.value = lecturer.auditReason || '' }
      else status.value = 'pending'
    }
  } catch (e) { status.value = 'loading'; setTimeout(() => checkStatus(), 2000) }
}

const submitApply = async () => {
  if (!form.value.name) { alert('请填写讲师名称'); return }
  if (!userId) { alert('请先登录'); return }
  submitting.value = true
  try {
    // 查已有记录，有则更新无则新建
    const list = await http.get('/course/lecturer/list', { params: { userId } })
    const records = list?.records || list || []
    const existing = records.length > 0 ? records[0] : null
    if (existing) {
      await http.post('/course/lecturer/edit', {
        id: existing.id, userId, name: form.value.name,
        intro: form.value.intro, qualification: form.value.qualification,
        type: 2, auditStatus: 1
      })
    } else {
      await http.post('/course/lecturer/add', {
        userId, name: form.value.name,
        intro: form.value.intro, qualification: form.value.qualification,
        type: 2, auditStatus: 1
      })
    }
    status.value = 'pending'
  } catch (e) { alert('提交失败：' + (e.message || '')) }
  finally { submitting.value = false }
}

onMounted(() => checkStatus())
</script>

<style scoped>
.apply-page { padding:20px 16px; background:#f7f8fa; min-height:100vh; }
.apply-page h2 { margin:0 0 16px; font-size:20px; }
.status-card { background:#fff; border-radius:12px; padding:40px 20px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.status-icon { font-size:48px; margin-bottom:12px; }
.status-card p { font-size:15px; color:#333; margin-bottom:16px; }
.status-card button { padding:10px 24px; background:var(--color-primary, #FF4D4F); color:#fff; border:none; border-radius:20px; font-size:14px; cursor:pointer; }
.form-card { background:#fff; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.form-group { margin-bottom:16px; }
.form-group label { display:block; font-size:14px; font-weight:bold; margin-bottom:6px; color:#333; }
.form-group input, .form-group textarea { width:100%; padding:10px 12px; border:1px solid #e8e8e8; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box; }
.form-group textarea { resize:vertical; }
.submit-btn { width:100%; padding:14px; background:linear-gradient(135deg,var(--color-primary, #FF4D4F),#E8383A); color:#fff; border:none; border-radius:24px; font-size:16px; font-weight:bold; cursor:pointer; }
.submit-btn:disabled { opacity:.6; }
.img-preview-wrap { display:flex; flex-wrap:wrap; gap:8px; align-items:flex-start; }
.qual-img { width:80px; height:80px; border-radius:8px; object-fit:cover; }
.upload-placeholder { width:100%; padding:20px; border:1px dashed #d9d9d9; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; color:#999; transition:border-color 0.3s; }
.upload-placeholder:hover { border-color: var(--color-info, #1890FF) }
</style>
