<template>
  <div class="channel-tabs">
    <button
      v-for="ch in channels"
      :key="ch.key"
      class="channel-btn"
      :class="{ active: modelValue === ch.key }"
      @click="$emit('update:modelValue', ch.key)"
    >
      {{ ch.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export interface ChannelData {
  key: string
  label: string
}

defineProps<{
  channels: ChannelData[]
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [key: string]
}>()
</script>

<style scoped>
.channel-tabs { display: flex; gap: 4px; }
.channel-btn { padding: 8px 20px; border-radius: 50px; border: none; background: transparent; color: #666; font-size: 14px; font-weight: 480; cursor: pointer; transition: all 0.2s; -webkit-tap-highlight-color: transparent; letter-spacing: 0.01em; white-space: nowrap; }
.channel-btn:active { transform: scale(0.95); }
.channel-btn.active { background: #1a1a1a; color: #fff; }
</style>
