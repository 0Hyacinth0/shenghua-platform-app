<template>
  <Icon :icon="icon" :width="size" :height="size" :color="color" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps({
  icon: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: 'currentColor' },
})
</script>
