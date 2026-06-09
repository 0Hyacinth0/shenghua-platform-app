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
import PromoBannerCard from './PromoBannerCard.vue'

export interface BannerData {
  id: string
  title: string
  subtitle: string
  bgColor: string
  textColor: string
  route: string
  tag: string
}

defineProps<{
  banners: BannerData[]
}>()
</script>

<style scoped>
.promo-banner-section {
  display: flex;
  gap: 12px;
}
</style>
