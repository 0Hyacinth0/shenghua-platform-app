<template>
  <div class="canvas-wrapper">
    <div class="phone-frame">
      <!-- 状态栏 -->
      <div class="phone-status-bar">
        <span>9:41</span>
        <div class="status-icons">
          <span class="signal">&#9679;&#9679;&#9679;&#9679;</span>
          <span class="battery">&#9646;&#9646;&#9646;</span>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="phone-content">
        <a-empty
          v-if="components.length === 0"
          description="从左侧点击添加组件"
          style="margin-top: 60px"
        />

        <div v-else class="component-list">
          <div
            v-for="comp in components"
            :key="comp.id"
            :class="['comp-wrapper', { 'comp-selected': selectedId === comp.id }]"
            @click.stop="$emit('select', comp.id)"
          >
            <!-- 操作按钮 -->
            <div class="comp-actions" @click.stop>
              <a-button size="small" type="text" title="上移" @click="$emit('moveUp', comp.id)">
                <template #icon><UpOutlined /></template>
              </a-button>
              <a-button size="small" type="text" title="下移" @click="$emit('moveDown', comp.id)">
                <template #icon><DownOutlined /></template>
              </a-button>
              <a-button size="small" type="text" danger title="删除" @click="$emit('remove', comp.id)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </div>

            <!-- 组件渲染 -->
            <div class="comp-body">
              <ComponentRenderer :component="comp" />
            </div>
          </div>
        </div>
      </div>

      <!-- Home Indicator -->
      <div class="phone-home-bar">
        <div class="home-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue'
import ComponentRenderer from './ComponentRenderer.vue'
import type { DesignerComponent } from './designerTypes'

defineProps<{
  components: DesignerComponent[]
  selectedId: string | null
}>()

defineEmits<{
  select: [id: string]
  remove: [id: string]
  moveUp: [id: string]
  moveDown: [id: string]
}>()

/** 图片路径辅助 */
function imgSrc(src: string): string {
  if (!src) return ''
  if (src.startsWith('http') || src.startsWith('data:')) return src
  return '/jeecgboot/sys/common/static/' + (src.startsWith('/') ? src.slice(1) : src)
}
</script>

<style lang="less" scoped>
.canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8e8e8;
  overflow: auto;
  padding: 20px;
}

.phone-frame {
  width: 375px;
  min-height: 700px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.phone-status-bar {
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

.phone-content {
  flex: 1;
  overflow-y: auto;
  min-height: 560px;
  background: #f5f5f5;
}

.phone-home-bar {
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

.component-list {
  padding-bottom: 8px;
}

.comp-wrapper {
  position: relative;
  transition: box-shadow 0.2s;
  cursor: pointer;

  &.comp-selected {
    box-shadow: 0 0 0 2px #1677ff;
    z-index: 1;
  }

  .comp-actions {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 0;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 0 0 0 8px;
    padding: 2px 2px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .comp-actions,
  &.comp-selected .comp-actions {
    opacity: 1;
  }
}
</style>
