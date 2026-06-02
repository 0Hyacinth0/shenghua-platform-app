<template>
  <section class="free-course-section">
    <div class="section-header">
      <h2 class="section-title">免费公开课</h2>
      <span class="section-badge">限时免费</span>
      <span class="section-more" @click="$emit('viewAll')">全部 <ArrowRightOutlined /></span>
    </div>
    <div class="free-course-list">
      <div
        v-for="item in courses"
        :key="item.id"
        class="free-course-item"
        @click="$router.push(item.route || '/')"
      >
        <div class="fc-cover" :style="{ background: item.coverColor }">
          <PlayCircleOutlined class="fc-cover-icon" />
        </div>
        <div class="fc-info">
          <h4 class="fc-title">{{ item.title }}</h4>
          <div class="fc-meta">
            <span class="fc-tag">{{ item.level }}</span>
            <span class="fc-duration">{{ item.duration }}</span>
            <span class="fc-students">{{ fmtStudents(item.students) }}人在学</span>
          </div>
        </div>
        <RightOutlined class="fc-arrow" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { PlayCircleOutlined, ArrowRightOutlined, RightOutlined } from '@ant-design/icons-vue'

export interface FreeCourseData {
  id: string
  title: string
  coverColor: string
  duration: string
  level: string
  students: number
  route?: string
}

defineProps<{
  courses: FreeCourseData[]
}>()

defineEmits<{
  viewAll: []
}>()

function fmtStudents(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>

<style scoped>
.free-course-section { background: #D8F0E8; border-radius: 20px; padding: 20px 16px; margin-top: 8px; }
.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.section-title { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0; letter-spacing: -0.02em; }
.section-badge { font-size: 11px; background: rgba(0,0,0,0.08); color: #1a1a1a; padding: 2px 10px; border-radius: 50px; font-weight: 480; letter-spacing: 0.03em; }
.section-more { font-size: 13px; color: #666; cursor: pointer; margin-left: auto; font-weight: 340; display: inline-flex; align-items: center; gap: 2px; }
.free-course-list { display: flex; flex-direction: column; gap: 10px; }
.free-course-item { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.7); border-radius: 14px; padding: 12px; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform 0.15s; }
.free-course-item:active { transform: scale(0.98); }
.fc-cover { width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.fc-cover-icon { font-size: 24px; color: rgba(0,0,0,0.15); }
.fc-info { flex: 1; min-width: 0; }
.fc-title { font-size: 14px; font-weight: 540; color: #1a1a1a; margin: 0 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fc-meta { display: flex; gap: 8px; align-items: center; }
.fc-tag { font-size: 10px; color: #666; background: rgba(0,0,0,0.06); padding: 1px 6px; border-radius: 4px; }
.fc-duration, .fc-students { font-size: 11px; color: #999; font-weight: 340; }
.fc-arrow { font-size: 14px; color: #bbb; flex-shrink: 0; }
</style>
