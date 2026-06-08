<template>
  <div class="detail-page" v-if="course.id">
    <div class="cover-section">
      <img v-if="course.cover" :src="imgUrl(course.cover)" alt="" />
      <div v-else class="cover-bg"><span class="cover-icon">📚</span></div>
      <div class="cover-overlay">
        <h1>{{ course.title }}</h1>
        <div class="cover-meta">{{ course.totalLessons || 0 }}课时 · {{ course.studentCount || 0 }}次播放</div>
      </div>
    </div>

    <div class="content">
      <div class="lecturer-card" v-if="course.lecturerName">
        <div class="lecturer-avatar">👨‍🏫</div>
        <div class="lecturer-info"><div class="name">{{ course.lecturerName }}</div><div class="label">讲师</div></div>
      </div>

      <!-- 整课价格 -->
      <div class="price-area">
        <div class="price-label">{{ purchasedCourse && course.price > 0 ? '已解锁' : '课程价格' }}</div>
        <div class="price-value">
          <span v-if="purchasedCourse && course.price > 0" class="num purchased">已购买</span>
          <span v-else-if="course.price > 0" class="num">&yen;{{ course.price }}</span>
          <span v-else class="num free">免费</span>
        </div>
        <button v-if="course.price > 0 && !purchasedCourse" class="buy-btn" @click="buyCourse">购买整课</button>
        <button v-else class="buy-btn started" @click="startLearn">开始学习</button>
      </div>

      <div class="intro-section" v-if="course.intro">
        <h3>课程简介</h3>
        <p>{{ course.intro }}</p>
      </div>

      <!-- 章节 -->
      <div class="chapter-section">
        <h3>课程目录（{{ course.totalChapters || 0 }}章）</h3>
        <div v-for="chapter in course.chapters" :key="chapter.id" class="chapter-item">
          <div class="chapter-header">
            <span class="chapter-title">{{ chapter.title }}</span>
            <span v-if="chapter.isFree === 1" class="free-badge">免费</span>
            <span v-if="purchasedCourse && chapter.price != null" class="ch-bought">已解锁</span>
            <span v-else-if="chapter.price != null && !purchasedChapter(chapter.id)" class="ch-price">单章¥{{ chapter.price }}</span>
            <span v-else-if="purchasedChapter(chapter.id)" class="ch-bought">已购</span>
            <button v-if="chapter.price != null && !purchasedChapter(chapter.id) && !purchasedCourse" class="ch-buy" @click="buyChapter(chapter)">购买</button>
          </div>
          <div v-for="lesson in chapter.lessons" :key="lesson.id" class="lesson-item" @click="playLesson(lesson, chapter)">
            <span class="lesson-icon">{{ canAccess(lesson, chapter) ? '▶️' : '🔒' }}</span>
            <span class="lesson-title">{{ lesson.title }}</span>
            <span class="lesson-duration">{{ fmt(lesson.duration) }}</span>
            <span v-if="isTrial(lesson, chapter)" class="trial-tag">试看</span>
          </div>
        </div>
      </div>
      <div v-if="!course.chapters || course.chapters.length === 0" class="no-chapter">暂无章节内容</div>
    </div>
  </div>
  <div v-else class="loading-page">加载中...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/utils/http'
import { imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'

const route = useRoute()
const router = useRouter()
const course = ref({ chapters: [] })
const purchasedCourse = ref(false)
const purchasedChapterIds = ref([])
const userId = getCurrentUserId()

const loadDetail = async () => {
  try {
    const id = route.params.id
    const res = await http.get('/course/detail/' + id)
    course.value = res || {}
    if (course.value.price === 0 || course.value.price == null) {
      purchasedCourse.value = true
    }
    if (userId) {
      try {
        const dash = await http.get('/course/progress/dashboard', { params: { userId } })
        const cIds = dash?.purchasedCourseIds || []
        purchasedCourse.value = cIds.includes(id)
        purchasedChapterIds.value = dash?.purchasedChapterIds || []
      } catch (e) { /* */ }
    }
  } catch (e) { /* */ }
}

const purchasedChapter = (chId) => purchasedChapterIds.value.includes(chId)
// 能否播放
const canAccess = (lesson, chapter) => {
  if (purchasedCourse.value) return true
  if (course.value.price === 0 || course.value.price == null) return true
  if (lesson.isFree === 1) return true
  if (chapter && chapter.isFree === 1) return true
  if (chapter && purchasedChapter(chapter.id)) return true
  return false
}
const isTrial = (lesson, chapter) => {
  if (purchasedCourse.value) return false
  if (course.value.price <= 0) return false
  return (lesson.isFree === 1) || (chapter && chapter.isFree === 1)
}

const buyCourse = () => {
  localStorage.setItem('checkoutData', JSON.stringify({
    type: 'course', courseId: course.value.id, chapterId: null,
    title: course.value.title, price: course.value.price
  }))
  router.push('/course/checkout')
}
const buyChapter = (ch) => {
  localStorage.setItem('checkoutData', JSON.stringify({
    type: 'chapter', courseId: course.value.id, chapterId: ch.id,
    title: course.value.title + ' - ' + ch.title, price: ch.price
  }))
  router.push('/course/checkout')
}
const startLearn = async () => {
  if ((course.value.price === 0 || course.value.price == null) && userId) {
    try { await http.post('/course/order/create', { userId, buyType: 1, courseId: course.value.id }) } catch (e) { /* */ }
  }
  const ch = course.value.chapters
  if (ch?.[0]?.lessons?.[0]) router.push('/course/watch/' + ch[0].lessons[0].id)
}
const playLesson = (lesson, chapter) => {
  if (!canAccess(lesson, chapter)) {
    // 付费章节 → 买章节，否则买整课
    if (chapter && chapter.price != null) buyChapter(chapter)
    else buyCourse()
    return
  }
  router.push('/course/watch/' + lesson.id)
}
const fmt = (s) => { if (!s) return ''; const m = Math.floor(s / 60); return m + ':' + String(s % 60).padStart(2, '0') }

onMounted(() => loadDetail())
</script>

<style scoped>
.detail-page { padding-bottom:20px; background:#f7f8fa; min-height:100vh; }
.loading-page { text-align:center; padding:80px; color:#999; }
.cover-section { position:relative; height:200px; overflow:hidden; }
.cover-section img { width:100%; height:100%; object-fit:cover; }
.cover-bg { width:100%; height:100%; background:linear-gradient(135deg,#2b85e4,#1a6dd4); display:flex; align-items:center; justify-content:center; }
.cover-icon { font-size:60px; }
.cover-overlay { position:absolute; bottom:0; left:0; right:0; padding:30px 16px 16px; background:linear-gradient(transparent,rgba(0,0,0,.7)); color:#fff; }
.cover-overlay h1 { margin:0; font-size:20px; }
.cover-meta { font-size:12px; opacity:.8; margin-top:4px; }
.content { padding:0 16px; position:relative; }
.lecturer-card { display:flex; align-items:center; gap:12px; background:#fff; padding:14px; border-radius:12px; margin-top:-20px; position:relative; z-index:1; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.lecturer-avatar { font-size:36px; }
.lecturer-info .name { font-size:15px; font-weight:bold; }
.lecturer-info .label { font-size:12px; color:#999; }
.price-area { display:flex; align-items:center; gap:12px; margin:16px 0; padding:16px; background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.price-label { font-size:13px; color:#666; }
.price-value { flex:1; }
.num { font-size:24px; font-weight:bold; color:#f5222d; }
.num.free { color:#52c41a; }
.num.purchased { color:#2b85e4; font-size:16px; }
.buy-btn { padding:10px 20px; border:none; border-radius:20px; font-size:14px; font-weight:bold; color:#fff; background:linear-gradient(135deg,#f5222d,#fa541c); cursor:pointer; white-space:nowrap; }
.buy-btn.started { background:linear-gradient(135deg,#2b85e4,#1a6dd4); }
.intro-section { background:#fff; padding:16px; border-radius:12px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.intro-section h3 { margin:0 0 8px; font-size:16px; }
.intro-section p { margin:0; font-size:13px; color:#555; line-height:1.7; white-space:pre-line; }
.chapter-section { background:#fff; padding:16px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.chapter-section h3 { margin:0 0 12px; font-size:16px; }
.chapter-item { margin-bottom:12px; }
.chapter-header { display:flex; align-items:center; gap:6px; padding:8px 0; border-bottom:1px solid #f0f0f0; flex-wrap:wrap; }
.chapter-title { font-weight:bold; font-size:14px; }
.free-badge { font-size:10px; color:#52c41a; background:#f6ffed; padding:1px 6px; border-radius:6px; }
.ch-price { font-size:11px; color:#f5222d; }
.ch-bought { font-size:11px; color:#2b85e4; }
.ch-buy { padding:2px 10px; border:1px solid #f5222d; background:#fff; color:#f5222d; border-radius:10px; font-size:11px; cursor:pointer; }
.lesson-item { display:flex; align-items:center; gap:8px; padding:10px 4px; cursor:pointer; border-bottom:1px solid #fafafa; }
.lesson-item:active { background:#f0f5ff; }
.lesson-icon { font-size:14px; }
.lesson-title { flex:1; font-size:13px; color:#333; }
.lesson-duration { font-size:11px; color:#999; }
.trial-tag { font-size:10px; background:#e6fffb; color:#13c2c2; padding:1px 6px; border-radius:6px; }
.no-chapter { text-align:center; padding:20px; color:#999; font-size:13px; }
</style>
