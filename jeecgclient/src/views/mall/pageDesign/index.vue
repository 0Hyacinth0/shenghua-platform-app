<template>
  <div class="page-designer">
    <!-- 顶部栏 -->
    <div class="toolbar">
      <a-button @click="goBack">&#8592; 返回</a-button>
      <span class="title">{{ pageName || '新页面' }}</span>
      <a-space>
        <a-button @click="showPreview = true">预览</a-button>
        <a-button type="primary" @click="handleSave" :loading="saving">保存草稿</a-button>
        <a-button type="primary" danger @click="handlePublish" :loading="publishing">保存并发布</a-button>
      </a-space>
    </div>

    <!-- 三栏布局 -->
    <div class="body">
      <ComponentPanel @add="onAdd" />
      <Canvas
        :components="components"
        :selectedId="selectedId"
        @select="onSelect"
        @remove="onRemove"
        @moveUp="onMoveUp"
        @moveDown="onMoveDown"
      />
      <PropertyPanel :component="selected" @update="onUpdate" />
    </div>

    <!-- 预览弹窗 -->
    <a-modal v-model:open="showPreview" title="手机预览" width="400px" :footer="null">
      <CanvasPreview :components="components" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { defHttp } from '/@/utils/http/axios'
import ComponentPanel from './ComponentPanel.vue'
import Canvas from './Canvas.vue'
import CanvasPreview from './CanvasPreview.vue'
import PropertyPanel from './PropertyPanel.vue'
import { COMPONENT_DEFINITIONS } from './designerTypes'
import type { DesignerComponent, PageDesignData } from './designerTypes'

const props = defineProps<{ configId?: string }>()
const emit = defineEmits<{ close: [] }>()

const pageId = ref(props.configId || '')
const pageName = ref('新页面')
const components = ref<DesignerComponent[]>([])
const selectedId = ref<string | null>(null)
const saving = ref(false)
const publishing = ref(false)
const showPreview = ref(false)

const selected = computed(() =>
  components.value.find((c) => c.id === selectedId.value) || null
)

watch(
  () => props.configId,
  (v) => {
    if (v) {
      pageId.value = v
      loadData()
    }
  }
)

onMounted(() => {
  if (pageId.value) loadData()
})

async function loadData() {
  try {
    const res = await defHttp.get({
      url: '/mall/pageConfig/queryById',
      params: { id: pageId.value },
    })
    if (res) {
      pageName.value = res.pageName || '新页面'
      if (res.pageData) {
        try {
          const data: PageDesignData = JSON.parse(res.pageData)
          components.value = data.components || []
        } catch {
          components.value = []
        }
      }
    }
  } catch {
    components.value = []
  }
}

function onAdd(type: string) {
  const def = COMPONENT_DEFINITIONS[type]
  if (!def) return
  const c: DesignerComponent = {
    id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    type,
    props: JSON.parse(JSON.stringify(def.defaultProps)),
    sort: components.value.length,
  }
  components.value.push(c)
  selectedId.value = c.id
}

function onSelect(id: string) {
  selectedId.value = id
}

function onRemove(id: string) {
  components.value = components.value.filter((c) => c.id !== id)
  if (selectedId.value === id) selectedId.value = null
}

function onMoveUp(id: string) {
  const i = components.value.findIndex((c) => c.id === id)
  if (i > 0) {
    const arr = [...components.value]
    ;[arr[i], arr[i - 1]] = [arr[i - 1], arr[i]]
    components.value = arr.map((c, idx) => ({ ...c, sort: idx }))
  }
}

function onMoveDown(id: string) {
  const i = components.value.findIndex((c) => c.id === id)
  if (i < components.value.length - 1) {
    const arr = [...components.value]
    ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
    components.value = arr.map((c, idx) => ({ ...c, sort: idx }))
  }
}

function onUpdate(props: Record<string, any>) {
  const c = components.value.find((c) => c.id === selectedId.value)
  if (c) {
    c.props = { ...c.props, ...props }
    components.value = [...components.value]
  }
}

async function handleSave() {
  saving.value = true
  try {
    const pageData = JSON.stringify({ components: components.value })
    await defHttp.post({
      url: '/mall/pageConfig/edit',
      params: { id: pageId.value, pageData },
    })
    message.success('已保存')
  } catch {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

async function handlePublish() {
  publishing.value = true
  try {
    const pageData = JSON.stringify({ components: components.value })
    await defHttp.post({
      url: '/mall/pageConfig/edit',
      params: { id: pageId.value, pageData },
    })
    await defHttp.put(
      { url: '/mall/pageConfig/publish', params: { id: pageId.value } },
      { joinParamsToUrl: true }
    )
    message.success('已发布')
  } catch {
    message.error('发布失败')
  } finally {
    publishing.value = false
  }
}

function goBack() {
  if (props.configId) {
    emit('close')
  } else {
    history.back()
  }
}
</script>

<style lang="less" scoped>
.page-designer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;

  .toolbar {
    height: 48px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    flex-shrink: 0;

    .title {
      font-size: 15px;
      font-weight: 500;
      color: #333;
    }
  }

  .body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
}
</style>
