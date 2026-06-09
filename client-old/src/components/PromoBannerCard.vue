<template>
  <div
    class="promo-banner-card"
    :style="{ background: bgColor, color: textColor }"
    @click="$router.push(route || '/')"
  >
    <div class="banner-content">
      <span v-if="tag" class="banner-tag">
        <FireOutlined v-if="tag.includes('热')" class="tag-icon" />
        <ClockCircleOutlined v-else class="tag-icon" />
        {{ tag }}
      </span>
      <h3 class="banner-title">{{ title }}</h3>
      <p class="banner-subtitle">{{ subtitle }}</p>
    </div>
    <div class="banner-decoration" aria-hidden="true">
      <span class="deco-circle deco-1"></span>
      <span class="deco-circle deco-2"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FireOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'

defineProps<{
  title: string
  subtitle: string
  bgColor: string
  textColor: string
  route?: string
  tag?: string
}>()
</script>

<style scoped>
.promo-banner-card {
  flex: 1;
  min-width: 0;
  border-radius: 16px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100px;
  transition: transform 0.15s;
}
.promo-banner-card:active {
  transform: scale(0.97);
}
.banner-content {
  position: relative;
  z-index: 1;
}
.banner-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 540;
  background: rgba(0,0,0,0.08);
  padding: 2px 10px;
  border-radius: 50px;
  margin-bottom: 8px;
  letter-spacing: 0.04em;
}
.tag-icon {
  font-size: 11px;
}
.banner-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 2px;
  line-height: 1.25;
  letter-spacing: -0.02em;
}
.banner-subtitle {
  font-size: 12px;
  margin: 0;
  opacity: 0.7;
  font-weight: 340;
}
.banner-decoration {
  position: absolute;
  right: -12px;
  bottom: -12px;
  z-index: 0;
}
.deco-circle {
  display: block;
  border-radius: 50%;
  position: absolute;
  background: rgba(255,255,255,0.35);
}
.deco-1 {
  width: 60px;
  height: 60px;
  right: 0;
  bottom: 0;
}
.deco-2 {
  width: 30px;
  height: 30px;
  right: 40px;
  bottom: 30px;
}
</style>
