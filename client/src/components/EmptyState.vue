<template>
  <view class="empty-wrap">
    <text class="empty-icon">{{ icon }}</text>
    <text class="empty-text">{{ text }}</text>
    <view v-if="showAction" class="empty-action" @tap="$emit('action')">
      <text class="empty-action-text">{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  text?: string
  icon?: string
  showAction?: boolean
  actionText?: string
}>(), {
  text: '暂无数据',
  icon: '○',
  showAction: false,
  actionText: '去看看',
})

defineEmits<{
  action: []
}>()
</script>

<style scoped>
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-disabled, #ccc);
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-hint, #999);
}

.empty-action {
  margin-top: 20px;
  padding: 8px 24px;
  border-radius: 999px;
  background: var(--color-primary, #FF4D4F);
}

.empty-action-text {
  color: #fff;
  font-size: 14px;
}
</style>
