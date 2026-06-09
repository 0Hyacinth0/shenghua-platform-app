<template>
  <div class="courses-page">
    <h2>我的课程</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="list.length === 0" class="empty">暂无课程</div>
    <div v-else>
      <div v-for="item in list" :key="item.id" class="course-item">
        <div class="item-info">
          <h4>{{ item.title }}</h4>
          <div class="item-meta">{{ item.totalLessons || 0 }}课时</div>
          <div class="item-meta">
            <span :class="'s-' + item.status">{{ item.status === 1 ? '上架' : '下架' }}</span>
            <span :class="'a-' + item.auditStatus" style="margin-left:8px">{{ auditLabel(item.auditStatus) }}</span>
          </div>
        </div>
        <div class="item-actions">
          <button @click="openEdit(item)">编辑</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-mask" @click.self="showModal = false">
      <div class="modal-card">
        <h3>{{ editingId ? '编辑课程' : '新建课程' }}</h3>
        <div class="form-group"><label>课程标题</label><input v-model="form.title" /></div>
        <div class="form-group"><label>封面图URL</label><input v-model="form.cover" /></div>
        <div class="form-group"><label>简介</label><textarea v-model="form.intro" rows="3"></textarea></div>
        <div class="btn-row">
          <button class="cancel-btn" @click="showModal = false">取消</button>
          <button class="save-btn" @click="saveCourse">保存</button>
        </div>
      </div>
    </div>
    <button class="add-btn" @click="openEdit()">+ 新建课程</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const userId = getCurrentUserId()
const auditLabel = (s) => ['', '待审', '已通过', '已拒绝'][s] || '未知'
const list = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref('')
const form = ref({ title: '', cover: '', intro: '' })

const loadList = async () => {
  loading.value = true
  try {
    const lecturers = await http.get('/course/lecturer/list', { params: { userId } })
    const records = lecturers?.records || lecturers || []
    if (records.length > 0) {
      const allCourses = await http.get('/course/list', { params: { pageSize: 200 } })
      const courses = (allCourses?.records || allCourses || [])
      list.value = courses.filter(c => c.lecturerId === records[0].id)
    }
  } catch (e) { /* */ }
  finally { loading.value = false }
}

const openEdit = (item) => {
  if (item) {
    editingId.value = item.id
    form.value = { title: item.title, cover: item.cover || '', intro: item.intro || '' }
  } else {
    editingId.value = ''
    form.value = { title: '', cover: '', intro: '' }
  }
  showModal.value = true
}

const saveCourse = async () => {
  if (!form.value.title) { alert('请输入标题'); return }
  try {
    const lecturers = await http.get('/course/lecturer/list', { params: { userId } })
    const records = lecturers?.records || lecturers || []
    if (records.length === 0) { alert('请先完成讲师入驻'); return }
    const lecturerId = records[0].id
    const params = { lecturerId, ...form.value, categoryId: '', price: 0 }
    if (editingId.value) {
      params.id = editingId.value
      await http.post('/course/edit', params)
    } else {
      await http.post('/course/add', params)
    }
    showModal.value = false
    loadList()
  } catch (e) { alert('保存失败') }
}

onMounted(() => loadList())
</script>

<style scoped>
.courses-page { padding: 20px 16px 100px; background: #f7f8fa; min-height: 100vh; }
.courses-page h2 { margin: 0 0 16px; font-size: 20px; }
.course-item { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 14px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.item-info h4 { margin: 0 0 4px; font-size: 14px; }
.item-meta { font-size: 11px; color: #999; }
.s-1 { color: #52c41a; }
.s-0 { color: #999; }
.a-1 { color: #fa8c16; }
.a-2 { color: #52c41a; }
.a-3 { color: var(--color-primary, #FF4D4F); }
.item-actions button { padding: 6px 14px; border: 1px solid var(--color-primary, #FF4D4F); background: #fff; color: var(--color-primary, #FF4D4F); border-radius: 14px; font-size: 12px; cursor: pointer; }
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-card { background: #fff; border-radius: 16px; padding: 24px; width: 90%; max-width: 400px; }
.modal-card h3 { margin: 0 0 16px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 13px; font-weight: bold; margin-bottom: 4px; }
.form-group input, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #e8e8e8; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.form-group textarea { resize: vertical; }
.btn-row { display: flex; gap: 12px; }
.cancel-btn { flex: 1; padding: 10px; border: 1px solid #e0e0e0; background: #fff; border-radius: 12px; cursor: pointer; }
.save-btn { flex: 1; padding: 10px; background: var(--color-primary, #FF4D4F); color: #fff; border: none; border-radius: 12px; cursor: pointer; }
.add-btn { width: 100%; padding: 14px; background: var(--color-primary, #FF4D4F); color: #fff; border: none; border-radius: 24px; font-size: 16px; cursor: pointer; position: fixed; bottom: 80px; left: 16px; right: 16px; max-width: 480px; margin: 0 auto; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
</style>
