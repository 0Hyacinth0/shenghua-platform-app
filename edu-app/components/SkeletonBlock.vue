<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '32rpx',
  },
  radius: {
    type: String,
    default: '16rpx',
  },
  dark: {
    type: Boolean,
    default: false,
  },
  customClass: {
    type: String,
    default: '',
  },
})

const classes = computed(() => [
  'skeleton-block',
  { dark: props.dark },
  props.customClass,
])

const styles = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.radius,
}))
</script>

<template>
  <view :class="classes" :style="styles" />
</template>
