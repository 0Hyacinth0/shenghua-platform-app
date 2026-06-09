<template>
  <div class="category-grid">
    <CategoryItem
      v-for="cat in categories"
      :key="cat.id"
      :name="cat.name"
      :icon-component="cat.iconComponent"
      :color="cat.color"
      :route="cat.route"
    />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import CategoryItem from './CategoryItem.vue'

export interface CategoryData {
  id: string
  name: string
  iconComponent: Component
  color: string
  route: string
}

defineProps<{
  categories: CategoryData[]
}>()
</script>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 0;
  padding: 8px 0;
}
</style>
