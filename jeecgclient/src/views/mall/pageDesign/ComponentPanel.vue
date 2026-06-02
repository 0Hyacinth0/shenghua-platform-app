<template>
  <div class="component-panel">
    <div class="panel-title">组件库</div>
    <div class="panel-content">
      <div v-for="group in groups" :key="group.title" class="category-section">
        <div class="category-title">{{ group.title }}</div>
        <div class="component-grid">
          <div
            v-for="item in group.items"
            :key="item"
            class="component-item"
            @click="$emit('add', item)"
          >
            <span class="comp-icon">{{ getIcon(item) }}</span>
            <span class="comp-name">{{ getName(item) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { COMPONENT_DEFINITIONS } from './designerTypes'

defineEmits<{ add: [type: string] }>()

const groups = [
  {
    title: '基础组件',
    items: ['carousel', 'notice', 'searchBar', 'navBar', 'imageAd', 'titleBar', 'spacer', 'richText'],
  },
  {
    title: '商品组件',
    items: ['productList', 'categoryNav'],
  },
  {
    title: '营销组件',
    items: ['couponSection', 'seckillSection'],
  },
]

const iconMap: Record<string, string> = {
  carousel: '\u{1F5BC}',
  notice: '\u{1F4E2}',
  searchBar: '\u{1F50D}',
  navBar: '\u{1F4F1}',
  imageAd: '\u{1F5BC}',
  titleBar: '\u{1F4DD}',
  spacer: '\u{2B1C}',
  richText: '\u{1F4C4}',
  productList: '\u{1F6D2}',
  categoryNav: '\u{1F4C2}',
  couponSection: '\u{1F3AB}',
  seckillSection: '\u{26A1}',
}

function getIcon(type: string): string {
  return iconMap[type] || '\u{1F4E6}'
}

function getName(type: string): string {
  return COMPONENT_DEFINITIONS[type]?.name || type
}
</script>

<style lang="less" scoped>
.component-panel {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  .panel-title {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #f0f0f0;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .category-section {
    margin-bottom: 16px;

    .category-title {
      font-size: 12px;
      color: #999;
      padding: 4px 8px;
      margin-bottom: 6px;
    }
  }

  .component-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .component-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 4px 10px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    user-select: none;
    background: #fff;

    &:hover {
      border-color: #1677ff;
      background: #e6f4ff;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(22, 119, 255, 0.15);
    }

    .comp-icon {
      font-size: 22px;
      margin-bottom: 4px;
    }

    .comp-name {
      font-size: 12px;
      color: #333;
      white-space: nowrap;
    }
  }
}
</style>
