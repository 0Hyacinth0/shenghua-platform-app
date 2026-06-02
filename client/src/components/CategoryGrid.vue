<template>
  <div class="category-grid">
    <CategoryItem
      v-for="cat in categories"
      :key="cat.id"
      :name="cat.name"
      :icon="cat.icon"
      :color="cat.color"
      :route="cat.route"
    />
  </div>
</template>

<script setup lang="ts">
import type { CategoryItem as CategoryItemType } from '@/mock/home'
import CategoryItem from './CategoryItem.vue'

defineProps<{
  categories: CategoryItemType[]
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
