<template>
  <nav class="floating-bottom-tab-bar">
    <div class="tab-bar-inner">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: modelValue === tab.key }"
        @click="$emit('update:modelValue', tab.key)"
      >
        <component :is="tab.iconComponent" class="tab-icon" />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

export interface TabItem {
  key: string
  label: string
  iconComponent: Component
}

defineProps<{
  tabs: TabItem[]
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [key: string]
}>()
</script>

<style scoped>
.floating-bottom-tab-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
}
.tab-bar-inner {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 50px;
  padding: 4px 8px;
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0, 0, 0, 0.06);
  pointer-events: auto;
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 56px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 50px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease;
  color: #999;
}
.tab-item.active {
  background: #1a1a1a;
  color: #fff;
}
.tab-icon {
  font-size: 20px;
  line-height: 1;
  transition: transform 0.2s;
}
.tab-item.active .tab-icon {
  transform: scale(1.1);
}
.tab-label {
  font-size: 10px;
  font-weight: 480;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
</style>
