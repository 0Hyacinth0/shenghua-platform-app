<template>
  <nav class="tab-bar">
    <div class="tab-bar-inner">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: modelValue === tab.key }"
        @click="$emit('update:modelValue', tab.key)"
      >
        <div class="tab-icon-wrap">
          <component :is="tab.iconComponent" class="tab-icon" />
          <span v-if="getBadge(tab.key)" class="tab-badge">
            {{ getBadge(tab.key) > 99 ? '99+' : getBadge(tab.key) }}
          </span>
        </div>
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

const props = withDefaults(defineProps<{
  tabs: TabItem[]
  modelValue: string
  badge?: number
}>(), {
  badge: 0,
})

defineEmits<{
  'update:modelValue': [key: string]
}>()

function getBadge(tabKey: string): number {
  if (tabKey === 'cart') return props.badge
  return 0
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--color-card, #fff);
  border-top: 0.5px solid var(--color-border, #eee);
  padding-bottom: var(--safe-bottom, 0px);
}

.tab-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: var(--tab-bar-height, 56px);
  max-width: 480px;
  margin: 0 auto;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex: 1;
  padding: 6px 0;
  color: var(--color-text-hint, #999);
  transition: color var(--duration-fast, 150ms) var(--ease-out, ease);
  position: relative;
}

.tab-item.active {
  color: var(--color-primary, #FF4D4F);
}

.tab-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon {
  font-size: 22px;
  line-height: 1;
  transition: transform var(--duration-fast, 150ms) var(--ease-out, ease);
}

.tab-item.active .tab-icon {
  transform: scale(1.08);
}

.tab-badge {
  position: absolute;
  top: -4px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: var(--color-primary, #FF4D4F);
  color: white;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
}

.tab-label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.tab-item.active .tab-label {
  font-weight: 600;
}
</style>
