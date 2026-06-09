<template>
  <view
    class="skeleton"
    :class="[`skeleton-${variant}`, { animated }]"
    :style="customStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'text' | 'avatar' | 'image' | 'card' | 'rect'
  width?: string
  height?: string
  radius?: string
  animated?: boolean
}>(), {
  variant: 'text',
  animated: true,
})

const customStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) style.width = props.width
  if (props.height) style.height = props.height
  if (props.radius) style.borderRadius = props.radius
  return style
})
</script>

<style scoped>
.skeleton {
  background: #E8E8E8;
  border-radius: 6px;
  flex-shrink: 0;
}

.skeleton.animated {
  background: linear-gradient(
    90deg,
    #E8E8E8 25%,
    #F2F2F2 50%,
    #E8E8E8 75%
  );
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
}

.skeleton-text {
  height: 14px;
  width: 100%;
  border-radius: 4px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
}

.skeleton-card {
  width: 100%;
  height: 120px;
  border-radius: 12px;
}

.skeleton-rect {
  width: 100%;
  height: 16px;
  border-radius: 4px;
}

@keyframes skeletonShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
