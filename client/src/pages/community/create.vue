<template>
  <view class="page-container">
    <view class="page-header">
      <view class="header-back" @tap="goBack">
        <Icon icon="solar:alt-arrow-left-bold" width="22" color="var(--text-primary)" />
      </view>
      <text class="page-title">发帖</text>
      <view class="header-submit" :class="{ active: canSubmit }" @tap="submitPost">
        <text class="submit-text">发布</text>
      </view>
    </view>

    <!-- 话题选择 -->
    <view class="card topic-bar" @tap="showTopicPicker = true">
      <Icon icon="solar:chat-round-dots-bold" width="18" color="var(--color-accent)" />
      <text class="topic-label">话题</text>
      <view class="topic-value">
        <text v-if="selectedTopic" class="topic-selected">#{{ selectedTopic.name }}</text>
        <text v-else class="topic-placeholder">选择话题（可选）</text>
        <Icon icon="solar:alt-arrow-right-bold" width="16" color="var(--text-hint)" />
      </view>
    </view>

    <!-- 内容输入 -->
    <view class="content-area">
      <textarea
        v-model="content"
        class="content-input"
        placeholder="分享你的想法..."
        placeholder-class="content-placeholder"
        :maxlength="2000"
        auto-height
      />
      <text class="content-count">{{ content.length }}/2000</text>
    </view>

    <!-- 图片上传 -->
    <view class="image-section">
      <view class="section-title-row">
        <Icon icon="solar:gallery-bold" width="18" color="var(--color-accent)" />
        <text class="section-title">添加图片</text>
      </view>
      <view class="image-grid">
        <view v-for="(img, idx) in imageList" :key="idx" class="image-item">
          <image :src="img" class="uploaded-img" mode="aspectFill" />
          <view class="image-delete" @tap="removeImage(idx)">
            <Icon icon="solar:trash-bin-minimalistic-bold" width="14" color="#fff" />
          </view>
        </view>
        <view v-if="imageList.length < 9" class="image-add" @tap="chooseImage">
          <Icon icon="solar:gallery-add-bold" width="28" color="var(--text-hint)" />
          <text class="add-text">添加图片</text>
        </view>
      </view>
      <text class="image-hint">最多上传9张图片</text>
    </view>

    <!-- 话题选择弹窗 -->
    <view v-if="showTopicPicker" class="picker-mask" @tap="showTopicPicker = false">
      <view class="picker-content" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择话题</text>
          <view @tap="showTopicPicker = false">
            <Icon icon="solar:close-circle-bold" width="22" color="var(--text-hint)" />
          </view>
        </view>
        <scroll-view scroll-y class="picker-list">
          <view
            v-for="topic in topics"
            :key="topic.id"
            class="picker-item"
            :class="{ active: selectedTopic?.id === topic.id }"
            @tap="onSelectTopic(topic)"
          >
            <text class="picker-item-text">{{ topic.name }}</text>
            <Icon v-if="selectedTopic?.id === topic.id" icon="solar:check-circle-bold" width="18" color="var(--color-accent)" />
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Icon } from '@iconify/vue'
import { getTopicFrontList, createPost } from '@/api'
import { getCurrentUserId } from '@/utils/user'
import http from '@/utils/http'

const content = ref('')
const imageList = ref<string[]>([])
const topics = ref<any[]>([])
const selectedTopic = ref<any>(null)
const showTopicPicker = ref(false)
const submitting = ref(false)

const canSubmit = computed(() => content.value.trim().length > 0 && !submitting.value)

function goBack() {
  uni.navigateBack()
}

function removeImage(idx: number) {
  imageList.value.splice(idx, 1)
}

function onSelectTopic(topic: any) {
  selectedTopic.value = selectedTopic.value?.id === topic.id ? null : topic
  showTopicPicker.value = false
}

function chooseImage() {
  uni.chooseImage({
    count: 9 - imageList.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      imageList.value = [...imageList.value, ...res.tempFilePaths]
    },
  })
}

async function uploadImages(): Promise<string[]> {
  if (imageList.value.length === 0) return []
  const uploaded: string[] = []
  for (const filePath of imageList.value) {
    try {
      const res: any = await new Promise((resolve, reject) => {
        uni.uploadFile({
          url: '/jeecg-boot/sys/common/upload',
          filePath,
          name: 'file',
          success: (r) => {
            const data = JSON.parse(r.data)
            if (data.success) resolve(data)
            else reject(new Error(data.message))
          },
          fail: reject,
        })
      })
      uploaded.push(res.result || res.message || '')
    } catch {
      // skip failed upload
    }
  }
  return uploaded
}

async function submitPost() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const images = await uploadImages()
    await createPost({
      userId: getCurrentUserId(),
      content: content.value.trim(),
      images,
      topicId: selectedTopic.value?.id || undefined,
    })
    uni.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '发布失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

async function loadTopics() {
  try {
    const res = await getTopicFrontList()
    topics.value = Array.isArray(res) ? res : (res?.records || [])
  } catch {
    topics.value = []
  }
}

onLoad(() => {
  loadTopics()
})
</script>

<style scoped>
@import url('@/styles/tokens.css');

.page-container {
  min-height: 100vh;
  background: var(--bg-page);
}

/* ---- 导航栏 ---- */
.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-card);
  padding: 44px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-back {
  padding: var(--space-xs) var(--space-sm);
  display: flex;
  align-items: center;
}

.page-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.header-submit {
  padding: 6px 18px;
  border-radius: var(--radius-full);
  background: var(--bg-gray);
}

.header-submit.active {
  background: var(--color-accent);
}

.submit-text {
  font-size: var(--font-base);
  color: var(--text-hint);
  font-weight: var(--weight-medium);
}

.header-submit.active .submit-text {
  color: var(--text-white);
}

/* ---- 话题栏 ---- */
.topic-bar {
  display: flex;
  align-items: center;
  padding: 14px var(--space-lg);
  margin: 12px var(--space-lg) 0;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  gap: 6px;
}

.topic-label {
  font-size: var(--font-base);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
  margin-right: var(--space-sm);
}

.topic-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-xs);
}

.topic-selected {
  font-size: var(--font-base);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

.topic-placeholder {
  font-size: var(--font-base);
  color: var(--text-hint);
}

/* ---- 内容输入 ---- */
.content-area {
  padding: var(--space-lg);
}

.content-input {
  width: 100%;
  min-height: 200px;
  font-size: var(--font-md);
  color: var(--text-primary);
  line-height: 1.7;
}

.content-placeholder {
  color: var(--text-hint);
  font-size: var(--font-md);
}

.content-count {
  display: block;
  text-align: right;
  font-size: var(--font-sm);
  color: var(--text-hint);
  margin-top: var(--space-sm);
}

/* ---- 图片上传 ---- */
.image-section {
  padding: 0 var(--space-lg) var(--space-lg);
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.section-title {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.image-item {
  position: relative;
  width: calc(33.33% - 6px);
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.uploaded-img {
  width: 100%;
  height: 100%;
}

.image-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-circle);
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-add {
  width: calc(33.33% - 6px);
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  border: 1.5px dashed var(--text-hint);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  background: var(--bg-gray);
}

.image-add:active {
  background: var(--bg-page);
}

.add-text {
  font-size: 10px;
  color: var(--text-hint);
}

.image-hint {
  font-size: var(--font-sm);
  color: var(--text-hint);
  margin-top: var(--space-sm);
}

/* ---- 弹窗 ---- */
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.picker-content {
  width: 100%;
  max-height: 60vh;
  background: var(--bg-card);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  overflow: hidden;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--bg-gray);
}

.picker-title {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.picker-list {
  max-height: 50vh;
  padding: var(--space-sm) 0;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px var(--space-lg);
}

.picker-item:active {
  background: var(--bg-gray);
}

.picker-item.active {
  background: var(--color-accent-light);
}

.picker-item-text {
  font-size: var(--font-base);
  color: var(--text-primary);
}
</style>
