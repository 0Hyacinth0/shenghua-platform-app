<template>
  <div class="category-grid">
    <CategoryItem
      v-for="cat in categories"
      :key="cat.id"
      :name="cat.name"
      :icon-component="getIcon(cat.icon)"
      :color="cat.color"
      :route="cat.route"
    />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { CategoryItem as CategoryItemType } from '@/mock/home'
import CategoryItem from './CategoryItem.vue'
import {
  CodeOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  TrophyOutlined,
  ShoppingOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  AppstoreOutlined,
} from '@ant-design/icons-vue'

defineProps<{
  categories: CategoryItemType[]
}>()

const iconMap: Record<string, Component> = {
  CodeOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  TrophyOutlined,
  ShoppingOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  AppstoreOutlined,
}

function getIcon(name: string): Component {
  return iconMap[name] || AppstoreOutlined
}
</script>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 0;
  padding: 8px 0;
}
</style>
