<template>
  <div class="property-panel">
    <div class="panel-title">属性配置</div>

    <div v-if="!component" class="empty">
      <a-empty description="请选择组件" />
    </div>

    <a-form v-else layout="vertical" size="small">
      <!-- 组件名 -->
      <a-form-item label="组件名">
        <a-input :value="compName" disabled />
      </a-form-item>

      <!-- 动态属性字段 -->
      <template v-for="(v, k) in component.props" :key="k">
        <a-form-item :label="fieldLabel(k)" v-if="showableField(k)">
          <!-- 文本输入 -->
          <a-input
            v-if="isInput(k)"
            :value="v"
            @change="(e: any) => emitUpdate(k, e.target.value)"
          />

          <!-- 数字输入 -->
          <a-input-number
            v-else-if="isNumber(k)"
            :value="v"
            @change="(val: number | null) => emitUpdate(k, val ?? 0)"
            :min="0"
            :step="k === 'height' ? 10 : 1"
            style="width: 100%"
          />

          <!-- 下拉选择 -->
          <a-select
            v-else-if="isSelect(k)"
            :value="v"
            @change="(val: any) => emitUpdate(k, val)"
            style="width: 100%"
            :options="selectOptions(k)"
          />

          <!-- 多行文本 -->
          <a-textarea
            v-else-if="isTextarea(k)"
            :value="k === 'images' ? arrayToText(v) : v"
            @change="(e: any) => emitUpdate(k, k === 'images' ? textToArray(e.target.value) : e.target.value)"
            :rows="4"
          />

          <!-- 颜色选择 -->
          <div v-else-if="isColor(k)" class="color-picker-row">
            <a-input
              :value="v"
              @change="(e: any) => emitUpdate(k, e.target.value)"
              style="flex: 1"
            />
            <input
              type="color"
              :value="v"
              @input="(e: any) => emitUpdate(k, e.target.value)"
              class="native-color"
            />
          </div>
        </a-form-item>
      </template>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DesignerComponent } from './designerTypes'
import { COMPONENT_DEFINITIONS } from './designerTypes'

const props = defineProps<{ component: DesignerComponent | null }>()
const emit = defineEmits<{ update: [props: Record<string, any>] }>()

const compName = computed(() => {
  if (!props.component) return ''
  return COMPONENT_DEFINITIONS[props.component.type]?.name || props.component.type
})

// ========== 字段标签映射 ==========
const labelMap: Record<string, string> = {
  imageUrl: '图片地址',
  link: '跳转链接',
  height: '高度(px)',
  borderRadius: '圆角(px)',
  padding: '内边距(px)',
  margin: '外边距(px)',
  text: '文本内容',
  content: '富文本内容',
  title: '标题',
  subtitle: '副标题',
  placeholder: '占位文字',
  images: '图片列表',
  backgroundColor: '背景色',
  textColor: '文字颜色',
  color: '文字颜色',
  displayCount: '显示数量',
  columns: '每行列数',
  align: '对齐方式',
  textAlign: '文字对齐',
  shape: '形状',
  layout: '排列方式',
  sortBy: '排序方式',
  fontSize: '字体大小(px)',
  categoryId: '分类ID',
}

function fieldLabel(key: string): string {
  return labelMap[key] || key
}

// ========== 字段类型判断 ==========
const inputFields = new Set(['placeholder', 'link', 'imageUrl', 'categoryId'])
const numberFields = new Set(['height', 'borderRadius', 'padding', 'margin', 'displayCount', 'columns', 'fontSize'])
const selectFields = new Set(['shape', 'layout', 'sortBy', 'align', 'textAlign'])
const textareaFields = new Set(['text', 'content', 'images'])
const colorFields = new Set(['backgroundColor', 'textColor', 'color'])
const hiddenFields = new Set(['autoplay', 'interval', 'scrollable', 'showMore', 'showPrice', 'moreLink', 'items'])

function showableField(key: string): boolean {
  return !hiddenFields.has(key)
}

function isInput(key: string): boolean {
  return inputFields.has(key)
}

function isNumber(key: string): boolean {
  return numberFields.has(key)
}

function isSelect(key: string): boolean {
  return selectFields.has(key)
}

function isTextarea(key: string): boolean {
  return textareaFields.has(key)
}

function isColor(key: string): boolean {
  return colorFields.has(key)
}

// ========== 下拉选项 ==========
function selectOptions(key: string): { label: string; value: any }[] {
  const opts: Record<string, { label: string; value: any }[]> = {
    shape: [
      { label: '圆角', value: 'round' },
      { label: '方形', value: 'square' },
    ],
    layout: [
      { label: '两列', value: 'grid2' },
      { label: '三列', value: 'grid3' },
      { label: '列表', value: 'list' },
    ],
    sortBy: [
      { label: '销量', value: 'sales' },
      { label: '价格', value: 'price' },
      { label: '最新', value: 'newest' },
    ],
    align: [
      { label: '左对齐', value: 'left' },
      { label: '居中', value: 'center' },
      { label: '右对齐', value: 'right' },
    ],
    textAlign: [
      { label: '左对齐', value: 'left' },
      { label: '居中', value: 'center' },
      { label: '右对齐', value: 'right' },
    ],
  }
  return opts[key] || []
}

// ========== 数组与文本互转（images字段） ==========
function arrayToText(val: any): string {
  if (Array.isArray(val)) return val.join('\n')
  return val || ''
}

function textToArray(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// ========== 发出更新 ==========
function emitUpdate(key: string, value: any) {
  emit('update', { [key]: value })
}
</script>

<style lang="less" scoped>
.property-panel {
  width: 260px;
  background: #fff;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  .panel-title {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #f0f0f0;
  }

  .empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  :deep(.ant-form) {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .color-picker-row {
    display: flex;
    align-items: center;
    gap: 4px;

    .native-color {
      width: 36px;
      height: 32px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      padding: 2px;
      cursor: pointer;
      flex-shrink: 0;
    }
  }
}
</style>
