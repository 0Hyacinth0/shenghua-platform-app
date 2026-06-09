<template>
  <div class="top-search-header">
    <div class="search-bar" @click="$emit('focusSearch')">
      <SearchOutlined class="search-icon" />
      <span class="search-placeholder">{{ placeholder }}</span>
    </div>
    <div class="header-actions">
      <button class="action-btn signin-btn" @click="$emit('openSignIn')" aria-label="签到">
        <CheckCircleOutlined class="action-icon signin-icon" />
        <span class="signin-text">签到</span>
      </button>
      <button class="action-btn" @click="$emit('openMessages')" aria-label="消息">
        <BellOutlined class="action-icon" />
        <span v-if="msgBadge" class="badge">{{ msgBadge > 99 ? '99+' : msgBadge }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchOutlined, BellOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'

const props = withDefaults(defineProps<{
  placeholder?: string
  msgBadge?: number
}>(), {
  placeholder: '搜索课程、商品、老师',
  msgBadge: 0,
})

defineEmits<{
  focusSearch: []
  openMessages: []
  openSignIn: []
}>()
</script>

<style scoped>
.top-search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg, #f5f5f5);
  border-radius: 50px;
  padding: 10px 18px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s;
}
.search-bar:active {
  background: var(--color-divider, #eee);
}
.search-icon {
  font-size: 16px;
  color: var(--color-text-hint, #bbb);
}
.search-placeholder {
  font-size: 14px;
  color: var(--color-text-hint, #bbb);
  font-weight: 340;
}
.header-actions {
  display: flex;
  gap: 4px;
}
.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--color-bg, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}
.action-icon {
  font-size: 18px;
  color: var(--color-text-secondary, #666);
}
.signin-icon {
  color: var(--color-warning, #fa8c16);
}
.signin-btn {
  width: auto;
  padding: 0 10px;
  border-radius: 50px;
  gap: 3px;
}
.signin-text {
  font-size: 11px;
  color: var(--color-warning, #fa8c16);
  font-weight: 480;
}
.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  border-radius: 50px;
  background: var(--color-primary, #FF4D4F);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}
</style>
