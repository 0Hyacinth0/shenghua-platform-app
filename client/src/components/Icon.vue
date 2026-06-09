<template>
  <text class="icon" :style="iconStyle">{{ iconChar }}</text>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 通用图标组件
 * 使用 Unicode 字符渲染图标，跨端兼容
 * 后续可替换为 iconfont 字体图标方案
 */

const props = defineProps<{
  name: string
  size?: number | string
  color?: string
}>()

// 常用图标映射（Unicode 符号占位，后续替换为 iconfont）
const iconMap: Record<string, string> = {
  // 导航
  home: '⌂',
  category: '☷',
  eye: '◉',
  cart: 'Ὥ2',
  user: '☺',
  back: '←',
  arrowRight: '→',
  arrowLeft: '←',
  arrowDown: '↓',
  // 操作
  search: '⌕',
  bell: '♪',
  plus: '+',
  minus: '−',
  close: '✕',
  check: '✓',
  edit: '✎',
  delete: '✖',
  share: '⇧',
  // 内容
  star: '★',
  starOutline: '☆',
  heart: '♥',
  heartOutline: '♡',
  fire: '♨',
  gift: '☘',
  clock: '⌚',
  location: '⌖',
  phone: '☎',
  image: '▣',
  camera: '△',
  play: '▶',
  // 状态
  warning: '⚠',
  info: 'ℹ',
  success: '✔',
  loading: '↻',
  // 商城
  shop: '⌂',
  wallet: '♈',
  car: '⚡',
  coupon: '☘',
  team: '☻',
  setting: '⚙',
  message: '✉',
  like: '♥',
  comment: '❚',
  file: '☰',
  link: '⚭',
}

const iconChar = computed(() => iconMap[props.name] || props.name)

const iconStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.size) {
    style.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size
  }
  if (props.color) {
    style.color = props.color
  }
  return style
})
</script>

<style scoped>
.icon {
  font-style: normal;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
