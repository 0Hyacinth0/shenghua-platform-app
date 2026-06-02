<template>
  <div
    class="category-item"
    :style="{ '--bg': color }"
    @click="$router.push(route || '/')"
  >
    <div class="category-icon-wrap">
      <component :is="iconComponent" class="category-icon" />
    </div>
    <span class="category-name">{{ name }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  name: string
  iconComponent: Component
  color: string
  route?: string
}>()
</script>

<style scoped>
.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.category-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}
.category-item:active .category-icon-wrap {
  transform: scale(0.93);
}
.category-icon {
  font-size: 26px;
  color: #555;
}
.category-name {
  font-size: 12px;
  color: #333;
  font-weight: 450;
  letter-spacing: 0.01em;
  text-align: center;
}
</style>
