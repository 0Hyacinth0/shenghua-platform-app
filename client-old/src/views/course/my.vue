<template>
  <div class="my-page">
    <div class="header">
      <h2>我的课程</h2>
      <div class="stats" v-if="progress.totalWatchSeconds">
        <span>已学 {{ formatDuration(progress.totalWatchSeconds) }}</span>
        <span>完成 {{ progress.finishedLessons || 0 }} 课时</span>
      </div>
    </div>

    <div v-if="courses.length > 0" class="course-list">
      <div v-for="item in courses" :key="item.id" class="course-card" @click="goDetail(item.id)">
        <div class="card-cover">
          <img v-if="item.cover" :src="imgUrl(item.cover)" alt="" />
          <div v-else class="cover-placeholder">📚</div>
        </div>
        <div class="card-info">
          <h4>{{ item.title }}</h4>
          <div class="card-meta">{{ lecturerMap[item.lecturerId] || '' }} · {{ item.totalLessons || 0 }}课时</div>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <div class="empty-icon">📖</div>
      <p>还没有购买的课程</p>
      <button class="go-btn" @click="$router.push('/course')">去看看</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/utils/http'
import { imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const router = useRouter()
const courses = ref([])
const progress = ref({})
const userId = getCurrentUserId()

const loadMyCourses = async () => {
  if (!userId) return
  try {
    const [list, dashboard] = await Promise.all([
      http.get('/course/list', { params: { pageSize: 200 } }),
      http.get('/course/progress/dashboard', { params: { userId } })
    ])
    const allCourses = list?.records || list || []
    progress.value = dashboard || {}
    const ids = [...new Set([...(dashboard?.purchasedCourseIds || []), ...(dashboard?.watchedCourseIds || [])])]
    courses.value = allCourses.filter(c => ids.includes(c.id))
  } catch (e) { /* */ }
}
const goDetail = (id) => router.push('/course/' + id)
const continueLearn = (item) => {
  // 跳转到课程详情，用户可以从第一个未完成的课时开始
  goDetail(item.id)
}
const formatDuration = (seconds) => {
  if (!seconds) return '0分钟'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}小时${m}分钟`
  return `${m}分钟`
}

const lecturerMap = {}

const loadLecturers = async () => {
  try {
    const res = await http.get('/course/lecturer/list', { params: { pageSize: 500 } })
    const list = res?.records || res || []
    list.forEach(l => { lecturerMap[l.id] = l.name })
  } catch (e) { /* */ }
}

onMounted(() => { loadLecturers(); loadMyCourses() })
onActivated(() => loadMyCourses())
</script>

<style scoped>
.my-page { padding:16px; background:var(--color-bg-page, #F7F7F8); min-height:100vh; padding-bottom:calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px); }
.header { margin-bottom:16px; }
.header h2 { margin:0; font-size:20px; }
.stats { display:flex; gap:16px; margin-top:6px; font-size:12px; color:#888; }
.course-list { display:flex; flex-direction:column; gap:12px; }
.course-card { display:flex; gap:12px; background:#fff; border-radius:12px; padding:12px; box-shadow:0 2px 8px rgba(0,0,0,.06); cursor:pointer; }
.card-cover { width:100px; height:68px; border-radius:8px; overflow:hidden; background:#e8ecf1; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.card-cover img { width:100%; height:100%; object-fit:cover; }
.cover-placeholder { font-size:28px; }
.card-info { flex:1; display:flex; flex-direction:column; }
.card-info h4 { margin:0; font-size:14px; }
.card-meta { font-size:11px; color:#999; margin:4px 0; }
.progress-bar { height:4px; background:#f0f0f0; border-radius:2px; margin:4px 0; overflow:hidden; }
.progress-fill { height:100%; background:var(--color-primary, #FF4D4F); border-radius:2px; transition:width .3s; }
.card-bottom { display:flex; justify-content:space-between; align-items:center; }
.progress-text { font-size:11px; color:var(--color-primary, #FF4D4F); }
.continue-btn { padding:4px 14px; background:var(--color-primary, #FF4D4F); color:#fff; border:none; border-radius:12px; font-size:12px; cursor:pointer; }
.empty { text-align:center; padding:60px 20px; }
.empty-icon { font-size:60px; }
.empty p { color:#999; margin:12px 0; }
.go-btn { padding:10px 32px; background:var(--color-primary, #FF4D4F); color:#fff; border:none; border-radius:20px; font-size:15px; cursor:pointer; }
</style>
