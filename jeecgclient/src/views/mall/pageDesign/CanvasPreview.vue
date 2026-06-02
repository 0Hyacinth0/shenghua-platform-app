<template>
  <div class="canvas-preview">
    <div class="preview-phone">
      <!-- 状态栏 -->
      <div class="preview-status-bar">
        <span>9:41</span>
        <div class="status-icons">
          <span>&#9679;&#9679;&#9679;&#9679;</span>
          <span>&#9646;&#9646;&#9646;</span>
        </div>
      </div>

      <!-- 内容区域：只读渲染每个组件 -->
      <div class="preview-content">
        <template v-for="comp in components" :key="comp.id">
          <ComponentRenderer :component="comp" />
        </template>
        <div v-if="components.length === 0" class="preview-empty">
          暂无组件
        </div>
      </div>

      <!-- Home Indicator -->
      <div class="preview-home-bar">
        <div class="home-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ComponentRenderer from './ComponentRenderer.vue'
import type { DesignerComponent } from './designerTypes'

defineProps<{
  components: DesignerComponent[]
}>()
</script>

<style lang="less" scoped>
.canvas-preview {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.preview-phone {
  width: 375px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-status-bar {
  height: 32px;
  padding: 0 20px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;

  .status-icons {
    display: flex;
    gap: 4px;
    font-size: 10px;
  }
}

.preview-content {
  flex: 1;
  min-height: 300px;
  background: #f5f5f5;
}

.preview-empty {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}

.preview-home-bar {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .home-indicator {
    width: 134px;
    height: 5px;
    background: #000;
    border-radius: 100px;
    opacity: 0.15;
  }
}
</style>
