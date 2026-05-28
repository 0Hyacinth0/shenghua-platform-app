<script setup>
import { computed } from 'vue'

const props = defineProps({
  animation: {
    type: String,
    default: 'fadeInUp',
  },
  duration: {
    type: String,
    default: 'var(--motion-duration-base)',
  },
  delay: {
    type: String,
    default: '0ms',
  },
  customClass: {
    type: String,
    default: '',
  },
})

const classes = computed(() => [
  'motion-view',
  'animate__animated',
  `animate__${props.animation}`,
  props.customClass,
])

const styles = computed(() => ({
  '--animate-duration': props.duration,
  '--animate-delay': props.delay,
  animationDelay: props.delay,
}))
</script>

<template>
  <view :class="classes" :style="styles">
    <slot />
  </view>
</template>

<style scoped>
.motion-view {
  animation-timing-function: var(--motion-ease-standard);
}
</style>
