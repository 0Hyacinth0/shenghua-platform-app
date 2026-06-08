<template>
  <div class="watch-page">
    <div class="top-bar">
      <span class="back-btn" @click="$router.back()">← 返回</span>
      <span class="lesson-title">{{ lessonTitle }}</span>
    </div>

    <div class="player-area">
      <div v-if="!videoUrl && !errorMsg" class="player-loading">加载视频中...</div>
      <div v-if="errorMsg" class="player-error">
        <p>{{ errorMsg }}</p>
        <button v-if="errorMsg.includes('购买')" @click="goBuy" class="error-btn">去购买</button>
      </div>
      <video v-if="videoUrl" ref="videoRef" :src="videoUrl" controls autoplay class="player"
        @loadedmetadata="onLoaded" @ended="onEnded"></video>
    </div>

    <div v-if="lastPosition > 5" class="resume-bar">
      <span>上次看到 {{ formatTime(lastPosition) }}，是否继续？</span>
      <button @click="seekTo(lastPosition)">继续播放</button>
    </div>

    <div class="lesson-info">
      <h3>{{ lessonTitle }}</h3>
      <span>{{ formatTime(lessonDuration) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/utils/http'
import { getCurrentUserId } from '@/utils/user'

const route = useRoute()
const router = useRouter()
const videoRef = ref(null)
const videoUrl = ref('')
const errorMsg = ref('')
const lastPosition = ref(0)
const lessonTitle = ref('')
const lessonDuration = ref(0)
const currentLessonId = ref(route.params.lessonId)
const userId = getCurrentUserId()
let progressTimer = null

const loadPlayUrl = async () => {
  try {
    const params = {}
    if (userId) params.userId = userId
    const url = await http.get('/course/lesson/play/' + currentLessonId.value, { params })
    videoUrl.value = typeof url === 'string' ? url : (url?.videoUrl || url)
    if (userId) {
      http.post('/course/progress/report', { userId: userId, lessonId: currentLessonId.value, position: 0, duration: 0 }).catch(() => {})
    }
  } catch (e) {
    errorMsg.value = (e.message && e.message.includes('购买')) ? '请先购买课程后再观看' : (e.message || '视频加载失败')
  }
}

const loadLessonInfo = async () => {
  try {
    const detail = await http.get('/course/lesson/queryById?id=' + currentLessonId.value)
    if (detail) lessonTitle.value = detail.title || ''
  } catch (e) { /* */ }
}

const loadLastPosition = async () => {
  if (!userId) return
  try {
    const res = await http.get('/course/progress/lastPosition/' + currentLessonId.value, { params: { userId: userId } })
    if (res && res.position) lastPosition.value = res.position
  } catch (e) { /* */ }
}

const seekTo = (pos) => { if (videoRef.value) { videoRef.value.currentTime = pos; lastPosition.value = 0 } }
const goBuy = () => router.push('/course/checkout')
const onLoaded = () => { if (videoRef.value) lessonDuration.value = Math.round(videoRef.value.duration) }
const onEnded = () => {
  if (videoRef.value && userId) {
    http.post('/course/progress/report', {
      userId: userId, lessonId: currentLessonId.value,
      position: Math.round(videoRef.value.currentTime), duration: lessonDuration.value
    }).catch(() => {})
  }
}

const startProgressReport = () => {
  progressTimer = setInterval(() => {
    if (videoRef.value && userId && !videoRef.value.paused) {
      http.post('/course/progress/report', {
        userId: userId, lessonId: currentLessonId.value,
        position: Math.round(videoRef.value.currentTime), duration: lessonDuration.value
      }).catch(() => {})
    }
  }, 15000)
}

const formatTime = (s) => {
  if (!s) return ''
  const m = Math.floor(s / 60); const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

onMounted(() => {
  loadPlayUrl()
  loadLessonInfo()
  loadLastPosition()
  startProgressReport()
})
onBeforeUnmount(() => { if (progressTimer) clearInterval(progressTimer) })
</script>

<style scoped>
.watch-page { background:#000; min-height:100vh; }
.top-bar { display:flex; align-items:center; padding:12px 16px; background:#111; gap:12px; }
.back-btn { color:#69b1ff; font-size:14px; cursor:pointer; }
.lesson-title { color:#fff; font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }
.player-area { position:relative; background:#000; }
.player-loading { display:flex; align-items:center; justify-content:center; height:200px; color:#fff; font-size:14px; }
.player-error { display:flex; flex-direction:column; align-items:center; justify-content:center; height:200px; color:#fff; text-align:center; padding:20px; }
.player-error p { margin-bottom:12px; }
.error-btn { padding:8px 24px; background:#f5222d; color:#fff; border:none; border-radius:20px; font-size:14px; cursor:pointer; }
.player { width:100%; max-height:50vh; background:#000; }
.resume-bar { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:#fffbe6; color:#ad6800; font-size:13px; margin:8px; border-radius:8px; }
.resume-bar button { padding:4px 14px; background:#fa8c16; color:#fff; border:none; border-radius:12px; font-size:12px; cursor:pointer; }
.lesson-info { padding:12px 16px; display:flex; justify-content:space-between; align-items:center; }
.lesson-info h3 { color:#fff; font-size:15px; margin:0; flex:1; }
.lesson-info span { color:#888; font-size:13px; }
</style>
