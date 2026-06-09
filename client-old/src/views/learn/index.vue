<template>
  <div class="learn-page">
    <TopSearchHeader
      placeholder="搜索课程、商品"
      @focus-search="showSearch = true"
      @open-sign-in="$router.push('/signIn')"
      @open-messages="$router.push('/messages')"
    />

    <!-- 统计数据卡片 -->
    <section class="learn-section">
      <div class="progress-card">
        <div class="progress-header">
          <h2 class="progress-title">我的进度</h2>
          <span class="progress-days" v-if="signDays > 0">连续签到 {{ signDays }} 天</span>
        </div>
        <div class="progress-stats">
          <div class="stat-item" @click="$router.push('/orders')">
            <span class="stat-value">{{ stats.orderCount }}</span>
            <span class="stat-label">订单数</span>
          </div>
          <div class="stat-item" @click="$router.push('/course/my')">
            <span class="stat-value">{{ stats.courseCount }}</span>
            <span class="stat-label">课程数</span>
          </div>
          <div class="stat-item" @click="$router.push('/coupon')">
            <span class="stat-value">{{ stats.couponCount }}</span>
            <span class="stat-label">优惠券</span>
          </div>
          <div class="stat-item" @click="$router.push('/signIn')">
            <span class="stat-value">{{ stats.userPoints }}</span>
            <span class="stat-label">总积分</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 子频道切换 -->
    <section class="learn-section">
      <div class="learn-tabs">
        <button
          v-for="t in subTabs" :key="t.key"
          class="learn-tab" :class="{ active: activeSubTab === t.key }"
          @click="activeSubTab = t.key"
        >
          <component :is="t.icon" class="tab-btn-icon" />
          {{ t.label }}
        </button>
      </div>
    </section>

    <!-- 内容列表 -->
    <section class="learn-section">
      <a-spin :spinning="loading">
        <!-- 课程模式：已购课程 -->
        <div v-if="activeSubTab === 'course'">
          <div v-if="myCourses.length === 0 && !loading" class="empty-state">
            <a-empty description="还没有购买的课程" />
            <a-button type="primary" @click="$router.push('/course')" style="margin-top:12px">去选课</a-button>
          </div>
          <div v-else class="course-list">
            <div v-for="c in myCourses" :key="c.id" class="course-card" @click="$router.push('/course/' + c.id)">
              <div class="card-cover">
                <img v-if="c.cover" :src="imgUrl(c.cover)" alt="" />
                <div v-else class="cover-ph">📚</div>
              </div>
              <div class="card-body">
                <h4>{{ c.title }}</h4>
                <div class="card-meta">{{ lecturerMap[c.lecturerId] || '' }} · {{ c.totalChapters || 0 }}章{{ c.totalLessons || 0 }}节</div>
                <div class="prog-bar">
                  <div class="prog-learned" :style="{ width: pct(c.id, c.totalLessons, 'learned') + '%' }"></div>
                  <div class="prog-unwatched" :style="{ width: pct(c.id, c.totalLessons, 'unwatched') + '%' }"></div>
                  <div class="prog-locked" :style="{ width: pct(c.id, c.totalLessons, 'locked') + '%' }"></div>
                </div>
                <div class="card-legend">
                  <span class="dot learned"></span>已学{{ courseProgress[c.id]?.lessonCount || 0 }}
                  <span class="dot unwatched"></span>未学{{ Math.max(0, (courseProgress[c.id]?.unlockedCount || 0) - (courseProgress[c.id]?.lessonCount || 0)) }}
                  <span class="dot locked"></span>未解锁{{ Math.max(0, (c.totalLessons || 0) - (courseProgress[c.id]?.unlockedCount || 0)) }}
                </div>
                <div class="card-row">
                  <span class="card-prog">已学{{ courseProgress[c.id]?.lessonCount || 0 }}/{{ c.totalLessons || 0 }}节</span>
                  <button v-if="courseProgress[c.id]?.lastLessonId" class="resume-btn" @click.stop="resumeLearn(c)">继续学习</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 商城模式 -->
        <div v-else>
          <div v-if="items.length === 0 && !loading" class="empty-state">
            <a-empty description="暂无商品" />
          </div>
          <div v-else class="product-grid">
            <div
              v-for="p in items" :key="p.id" class="product-card"
              @click="$router.push({ name: 'productDetail', params: { id: p.id } })"
            >
              <div class="product-cover">
                <a-image
                  :src="imgUrl(p.mainImage)" :preview="false"
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0iI2JiYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiI+5Zu+54mH5Yqg6L29PC90ZXh0Pjwvc3ZnPg=="
                  class="product-img"
                />
              </div>
              <div class="product-info">
                <h4 class="product-name">{{ p.spuName || p.title }}</h4>
                <span class="product-price">&yen;{{ p.minPrice || p.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </section>

    <div class="bottom-spacer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ReadOutlined, ShoppingOutlined } from '@ant-design/icons-vue'
import TopSearchHeader from '@/components/TopSearchHeader.vue'
import { getFrontProductList, getOrderList, getUserCoupons, getSignStatus, imgUrl } from '@/api'
import { getCurrentUserId } from '@/utils/user'
import http from '@/utils/http'

const route = useRoute()
const router = useRouter()
const userId = getCurrentUserId()
const showSearch = ref(false)
const activeSubTab = ref('course')
const loading = ref(false)

const subTabs = [
  { key: 'course', label: '课程', icon: ReadOutlined },
  { key: 'mall', label: '商城', icon: ShoppingOutlined },
]

// ===== 统计数据 =====
const stats = ref({ orderCount: 0, courseCount: 0, couponCount: 0, userPoints: 0 })
const signDays = ref(0)
const items = ref<any[]>([])
const myCourses = ref<any[]>([])
const courseProgress = ref<any>({})
const lecturerMap: Record<string, string> = {}

const fmtMin = (seconds: number) => {
  if (!seconds || seconds < 60) return (seconds || 0) + '秒'
  return Math.floor(seconds / 60) + '分钟'
}
const resumeLearn = (c: any) => {
  const cp = courseProgress.value[c.id]
  if (cp?.lastLessonId) router.push('/course/watch/' + cp.lastLessonId)
}
const pct = (courseId: string, total: number, type: string) => {
  const cp = courseProgress.value[courseId] || {}
  const learned = cp.lessonCount || 0
  const unlocked = cp.unlockedCount || 0
  if (!total) return 0
  if (type === 'learned') return Math.min(100, learned / total * 100)
  if (type === 'unwatched') return Math.max(0, Math.min(100, (unlocked - learned) / total * 100))
  return Math.max(0, (total - unlocked) / total * 100)
}

async function loadLecturers() {
  try {
    const res = await http.get('/course/lecturer/list', { params: { pageSize: 500 } })
    const list = (res as any)?.records || res || []
    list.forEach((l: any) => { lecturerMap[l.id] = l.name })
  } catch (e) { /* */ }
}

async function loadProducts() {
  try {
    const res = await getFrontProductList({ pageNo: 1, pageSize: 20 })
    items.value = res?.records || []
  } catch { items.value = [] }
}

async function loadMyCourses() {
  if (!userId) return
  try {
    const [dashboard, allRes] = await Promise.all([
      http.get('/course/progress/dashboard', { params: { userId } }),
      http.get('/course/list', { params: { pageSize: 200 } })
    ])
    const watchedIds = (dashboard as any)?.watchedCourseIds || []
    const purchasedIds = (dashboard as any)?.purchasedCourseIds || []
    const myIds = [...new Set([...watchedIds, ...purchasedIds])]
    const all = (allRes as any)?.records || allRes || []
    myCourses.value = (all as any[]).filter((c: any) => myIds.includes(c.id))
    stats.value.courseCount = (dashboard as any)?.courseCount || 0
    courseProgress.value = (dashboard as any)?.courseProgress || {}
  } catch { myCourses.value = [] }
}

async function loadStats() {
  try {
    const [orders, coupons, sign, userInfo] = await Promise.all([
      getOrderList({ userId, pageSize: 999 }),
      getUserCoupons(userId),
      getSignStatus(userId),
      http.get('/mall/user/queryByUserId', { params: { userId } })
    ])
    if (orders) { const r = orders as any; stats.value.orderCount = r?.total || r?.records?.length || 0 }
    if (coupons) { const cp = coupons as any; stats.value.couponCount = cp?.records?.length || 0 }
    if (sign) { const s = sign as any; signDays.value = s?.continuousDays || s?.signDays || 0 }
    if (userInfo) { const u = userInfo as any; stats.value.userPoints = u?.availablePoints || u?.totalPoints || 0 }
  } catch (e) { /* */ }
}

onMounted(() => {
  loadLecturers()
  loadStats()
  loadProducts()
  loadMyCourses()
})
onActivated(() => {
  loadMyCourses()
})
</script>

<style scoped>
.learn-page { padding: 0 16px; min-height: 100vh; background: var(--color-bg-page, #F7F7F8); padding-bottom: calc(var(--tab-bar-height, 56px) + var(--safe-bottom, 0px) + 12px); }
.learn-section { margin-bottom: 20px; }

.progress-card { background: linear-gradient(135deg, var(--color-primary-light, #FFF1F0) 0%, #FFE4E1 100%); border-radius: 20px; padding: 20px; }
.progress-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
.progress-title { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0; letter-spacing: -0.02em; }
.progress-days { font-size: 12px; color: #666; font-weight: 340; }
.progress-stats { display: flex; gap: 8px; }
.stat-item { flex: 1; text-align: center; background: rgba(255,255,255,0.6); border-radius: 14px; padding: 12px 4px; cursor: pointer; }
.stat-value { display: block; font-size: 20px; font-weight: 600; color: #1a1a1a; line-height: 1.2; }
.stat-label { display: block; font-size: 11px; color: #888; margin-top: 2px; font-weight: 340; }

.learn-tabs { display: flex; gap: 4px; }
.learn-tab { flex: 1; padding: 10px 0; border-radius: 50px; border: none; background: transparent; color: #666; font-size: 14px; font-weight: 480; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: all 0.2s; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.learn-tab.active { background: var(--color-primary, #FF4D4F); color: #fff; }
.tab-btn-icon { font-size: 16px; }

.product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.product-card { background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform 0.15s; }
.product-card:active { transform: scale(0.97); }
.product-cover { aspect-ratio: 1/1; overflow: hidden; background: #fafafa; }
.product-img { width: 100%; height: 100%; object-fit: cover; }
.product-info { padding: 8px 10px 10px; }
.product-name { font-size: 13px; font-weight: 480; color: #1a1a1a; margin: 0 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-price { font-size: 16px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.02em; }
.product-meta { font-size: 11px; color: #999; }
.product-cover-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:40px; background:#f0f0f0; }

.course-list { display:flex; flex-direction:column; gap:10px; }
.course-card { background:#fff; border-radius:12px; display:flex; box-shadow:0 1px 4px rgba(0,0,0,.04); cursor:pointer; overflow:hidden; }
.card-cover { width:110px; min-height:70px; flex-shrink:0; background:#e8ecf1; display:flex; align-items:center; justify-content:center; }
.card-cover img { width:100%; height:100%; object-fit:cover; }
.cover-ph { font-size:28px; }
.card-body { flex:1; padding:10px; display:flex; flex-direction:column; justify-content:center; min-width:0; }
.card-body h4 { font-size:13px; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.card-meta { font-size:11px; color:#999; margin-top:4px; }
.card-row { display:flex; justify-content:space-between; align-items:center; }
.card-prog { font-size:11px; color:var(--color-primary, #FF4D4F); }
.resume-btn { padding:3px 10px; background:var(--color-primary, #FF4D4F); color:#fff; border:none; border-radius:10px; font-size:11px; cursor:pointer; }
.prog-bar { height:4px; border-radius:2px; margin:6px 0 4px; overflow:hidden; display:flex; }
.prog-learned { height:100%; background:var(--color-primary, #FF4D4F); }
.prog-unwatched { height:100%; background:#52c41a; }
.prog-locked { height:100%; background:#ff4d4f; }
.card-legend { font-size:10px; color:#999; display:flex; gap:8px; margin-bottom:4px; align-items:center; }
.dot { width:6px; height:6px; border-radius:50%; display:inline-block; }
.dot.learned { background:var(--color-primary, #FF4D4F); }
.dot.unwatched { background:#52c41a; }
.dot.locked { background:#ff4d4f; }

.empty-state { padding: 40px 0; text-align: center; }
.bottom-spacer { height: 100px; }
</style>
