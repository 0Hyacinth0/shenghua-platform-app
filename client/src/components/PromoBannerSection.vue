<template>
  <div class="promo-banner-section">
    <PromoBannerCard
      v-for="banner in banners"
      :key="banner.id"
      :title="banner.title"
      :subtitle="banner.subtitle"
      :bg-color="banner.bgColor"
      :text-color="banner.textColor"
      :route="banner.route"
      :tag="banner.tag"
    />
  </div>
</template>

<script setup lang="ts">
import type { PromoBanner } from '@/mock/home'
import PromoBannerCard from './PromoBannerCard.vue'

defineProps<{
  banners: PromoBanner[]
}>()
</script>

<style scoped>
.promo-banner-section {
  display: flex;
  gap: 12px;
}
</style>
