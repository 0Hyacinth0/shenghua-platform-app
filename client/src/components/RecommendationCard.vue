<template>
  <div class="recommendation-card" @click="$router.push(route || '/')">
    <div class="card-cover" :style="{ background: coverColor }">
      <span v-if="tag" class="card-badge" :style="{ background: tagColor }">{{ tag }}</span>
      <ReadOutlined v-if="type === 'course'" class="cover-icon" />
      <ShoppingOutlined v-else-if="type === 'product'" class="cover-icon" />
      <PlayCircleOutlined v-else class="cover-icon" />
    </div>
    <div class="card-body">
      <h4 class="card-title">{{ title }}</h4>
      <div class="card-meta">
        <span class="card-author">{{ author }}</span>
        <span v-if="rating" class="card-rating">
          <StarFilled class="star-icon" /> {{ rating }}
        </span>
      </div>
      <div class="card-footer">
        <span class="card-price" :class="{ free: price === 0 }">
          {{ price === 0 ? '免费' : '¥' + price }}
        </span>
        <span v-if="originalPrice && originalPrice > price" class="card-original">
          ¥{{ originalPrice }}
        </span>
        <span v-if="students" class="card-students">{{ fmtStudents(students) }}人学</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ReadOutlined, ShoppingOutlined, PlayCircleOutlined, StarFilled } from '@ant-design/icons-vue'

const props = defineProps<{
  title: string
  coverColor: string
  type: 'course' | 'product' | 'live'
  author: string
  price: number
  originalPrice?: number
  tag?: string
  tagColor?: string
  rating?: number
  students?: number
  route?: string
}>()

function fmtStudents(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>

<style scoped>
.recommendation-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s, box-shadow 0.15s;
}
.recommendation-card:active {
  transform: scale(0.97);
}
.card-cover {
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.cover-icon {
  font-size: 36px;
  color: rgba(0,0,0,0.12);
}
.card-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 10px;
  color: #fff;
  padding: 2px 8px;
  border-radius: 50px;
  font-weight: 540;
  letter-spacing: 0.03em;
}
.card-body {
  padding: 10px 12px 12px;
}
.card-title {
  font-size: 14px;
  font-weight: 540;
  color: #1a1a1a;
  margin: 0 0 6px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.card-author {
  font-size: 11px;
  color: #666;
  font-weight: 340;
}
.card-rating {
  font-size: 11px;
  color: #f5a623;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.star-icon {
  font-size: 10px;
}
.card-footer {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.card-price {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}
.card-price.free {
  color: #4CAF50;
  font-size: 14px;
}
.card-original {
  font-size: 11px;
  color: #bbb;
  text-decoration: line-through;
}
.card-students {
  font-size: 10px;
  color: #bbb;
  margin-left: auto;
}
</style>
