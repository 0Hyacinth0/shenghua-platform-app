<template>
  <section class="recommendation-section">
    <div class="section-header">
      <h2 class="section-title">今日推荐</h2>
      <span class="section-more" @click="$emit('viewAll')">查看全部 <ArrowRightOutlined /></span>
    </div>
    <div class="rec-grid">
      <RecommendationCard
        v-for="item in items"
        :key="item.id"
        :title="item.title"
        :cover-color="item.coverColor"
        :type="item.type || 'product'"
        :author="item.author"
        :price="item.price"
        :original-price="item.originalPrice"
        :tag="item.tag"
        :tag-color="item.tagColor"
        :rating="item.rating"
        :students="item.students"
        :students-label="item.studentsLabel || '人学'"
        :route="item.route"
        :image="item.image"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRightOutlined } from '@ant-design/icons-vue'
import RecommendationCard from './RecommendationCard.vue'

export interface RecItemData {
  id: string
  type?: 'course' | 'product' | 'live'
  title: string
  coverColor: string
  author: string
  price: number
  originalPrice?: number
  tag?: string
  tagColor?: string
  rating?: number
  students?: number
  route: string
}

defineProps<{
  items: RecItemData[]
}>()

defineEmits<{
  viewAll: []
}>()
</script>

<style scoped>
.recommendation-section { padding: 0 0 8px; }
.section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
.section-title { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0; letter-spacing: -0.02em; }
.section-more { font-size: 13px; color: #999; cursor: pointer; font-weight: 340; display: inline-flex; align-items: center; gap: 2px; }
.rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
</style>
