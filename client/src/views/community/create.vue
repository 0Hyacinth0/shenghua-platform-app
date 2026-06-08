<template>
  <div class="create-post-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <span class="header-title">发帖</span>
    </header>

    <!-- 帖子类型选择 -->
    <section class="form-section">
      <label class="form-label">帖子类型</label>
      <div class="type-chips">
        <button
          v-for="t in postTypes"
          :key="t.value"
          class="type-chip"
          :class="{ active: form.postType === t.value }"
          :style="form.postType === t.value ? { background: t.color, borderColor: t.color, color: '#fff' } : { color: t.color, borderColor: t.color }"
          @click="form.postType = t.value"
        >{{ t.label }}</button>
      </div>
    </section>

    <!-- 话题选择 -->
    <section class="form-section">
      <label class="form-label">话题</label>
      <div class="topic-select" @click="showTopicPicker = true">
        <span :class="{ placeholder: !selectedTopicName }">
          {{ selectedTopicName || '请选择话题' }}
        </span>
        <DownOutlined class="select-arrow" />
      </div>
    </section>

    <!-- 标题 -->
    <section class="form-section">
      <label class="form-label">标题</label>
      <input
        v-model="form.title"
        class="title-input"
        placeholder="请输入帖子标题"
        maxlength="200"
      />
    </section>

    <!-- 正文 -->
    <section class="form-section">
      <label class="form-label">正文</label>
      <textarea
        v-model="form.content"
        class="content-textarea"
        placeholder="分享你的想法..."
        rows="6"
      ></textarea>
    </section>

    <!-- 图片上传 -->
    <section class="form-section">
      <label class="form-label">图片 <span class="label-hint">(选填，最多9张)</span></label>
      <a-upload
        :custom-request="handleUpload"
        :show-upload-list="false"
        accept="image/*"
      >
        <div v-if="uploadedImages.length > 0" class="img-preview-grid">
          <div v-for="(img, i) in uploadedImages" :key="i" class="img-preview-item">
            <img :src="imgUrl(img)" class="preview-thumb" />
            <span class="preview-remove" @click.stop="removeImage(i)">×</span>
          </div>
          <div v-if="uploadedImages.length < 9" class="add-more-btn">
            <PlusOutlined />
            <span>继续上传</span>
          </div>
        </div>
        <div v-else class="upload-placeholder">
          <PlusOutlined />
          <span>上传图片</span>
        </div>
      </a-upload>
    </section>

    <!-- 发布按钮 -->
    <div class="submit-section">
      <button class="submit-btn" :disabled="!canSubmit" @click="handleSubmit">
        发布
      </button>
    </div>

    <div class="bottom-spacer" />

    <!-- 话题选择弹窗 -->
    <Teleport to="body">
      <div v-if="showTopicPicker" class="picker-overlay" @click.self="showTopicPicker = false">
        <div class="picker-panel">
          <h4 class="picker-title">选择话题</h4>
          <div
            v-for="t in topics"
            :key="t.id"
            class="picker-item"
            :class="{ selected: form.topicId === t.id }"
            @click="selectTopic(t)"
          >{{ t.name }}</div>
          <!-- 自定义话题 -->
          <div class="picker-custom">
            <div v-if="!showCustomInput" class="picker-item custom-trigger" @click="showCustomInput = true">
              + 自定义话题
            </div>
            <div v-else class="custom-input-row">
              <input
                ref="customInput"
                v-model="customTopicName"
                class="custom-input"
                placeholder="输入话题名称"
                maxlength="20"
                @keyup.enter="confirmCustomTopic"
              />
              <button class="custom-confirm" @click="confirmCustomTopic">确定</button>
            </div>
          </div>
          <button class="picker-cancel" @click="showTopicPicker = false">取消</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { DownOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getTopicFrontList, createPost, imgUrl } from '@/api/index'
import { getCurrentUserId, getCurrentUser } from '@/utils/user'
import http from '@/utils/http'

const router = useRouter()
const userId = getCurrentUserId()
const currentUser = getCurrentUser()
const userName = currentUser?.nickname || currentUser?.username || currentUser?.id || ''

const postTypes = [
  { label: '分享', value: 'share', color: '#4CAF50' },
  { label: '讨论', value: 'discussion', color: '#FF9800' },
  { label: '经验', value: 'experience', color: '#9C27B0' },
  { label: '求助', value: 'help', color: '#2196F3' },
]

const form = ref({
  postType: '',
  topicId: '',
  title: '',
  content: '',
})

const topics = ref<any[]>([])
const selectedTopicName = ref('')
const showTopicPicker = ref(false)
const showCustomInput = ref(false)
const customTopicName = ref('')
const customInput = ref<any>(null)
const uploadedImages = ref<string[]>([])

const canSubmit = computed(() => {
  return form.value.postType && form.value.title.trim() && form.value.content.trim()
})

function selectTopic(t: any) {
  form.value.topicId = t.id
  selectedTopicName.value = t.name
  showTopicPicker.value = false
  showCustomInput.value = false
}

async function confirmCustomTopic() {
  const name = customTopicName.value.trim()
  if (!name) return
  selectedTopicName.value = name
  form.value.topicId = ''  // 清空，用 topicName 字段传
  showTopicPicker.value = false
  showCustomInput.value = false
}

// a-upload customRequest
async function handleUpload({ file, onSuccess, onError }: any) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('dir', 'community')
  try {
    const res = await http.post('/mall/file/upload', fd)
    const url = res || ''
    if (url) {
      uploadedImages.value.push(url)
    }
    onSuccess(url)
  } catch {
    message.error('图片上传失败')
    onError(new Error('上传失败'))
  }
}

function removeImage(index: number) {
  uploadedImages.value.splice(index, 1)
}

async function handleSubmit() {
  if (!canSubmit.value) return
  if (!userId) { message.info('请先登录'); return }

  try {
    const data: any = {
      postType: form.value.postType,
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      contentText: form.value.content.trim(),
      userId,
      userName: userName || '匿名用户',
      cover: uploadedImages.value.join(','),
    }
    if (form.value.topicId) {
      data.topicId = form.value.topicId
    } else if (selectedTopicName.value) {
      data.topicName = selectedTopicName.value
    }
    const postId = await createPost(data)
    if (typeof postId === 'string') {
      message.success('发布成功！')
      router.replace('/community/post/' + postId)
    } else {
      message.success('发布成功！')
      router.back()
    }
  } catch {
    message.error('发布失败，请重试')
  }
}

async function loadTopics() {
  try {
    const res = await getTopicFrontList()
    topics.value = (res || []).filter((t: any) => t.id !== 'topic_all')
  } catch {}
}

onMounted(loadTopics)
</script>

<style scoped>
.create-post-page {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #fff;
}

/* 顶部导航 */
.page-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
  margin-bottom: 8px;
}
.back-btn {
  border: none;
  background: none;
  font-size: 15px;
  color: #1a1a1a;
  cursor: pointer;
  padding: 4px 8px 4px 0;
  font-weight: 480;
}
.header-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-right: 56px;
}

.form-section {
  padding: 0 16px;
  margin-bottom: 20px;
}
.form-label {
  display: block;
  font-size: 14px; font-weight: 540;
  color: #1a1a1a;
  margin-bottom: 10px;
}
.label-hint {
  font-size: 12px; font-weight: 340; color: #bbb;
}

/* 类型选择 */
.type-chips {
  display: flex; gap: 10px; flex-wrap: wrap;
}
.type-chip {
  padding: 8px 20px;
  border-radius: 50px;
  border: 0.5px solid;
  background: #fff;
  font-size: 14px; font-weight: 480;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

/* 话题选择 */
.topic-select {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px;
  border: 0.5px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  font-size: 14px; color: #333;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.topic-select .placeholder { color: #bbb; }
.select-arrow { font-size: 12px; color: #999; }

/* 标题输入 */
.title-input {
  width: 100%;
  border: none;
  border-bottom: 0.5px solid rgba(0,0,0,0.08);
  padding: 10px 0;
  font-size: 18px; font-weight: 540;
  color: #1a1a1a;
  outline: none;
  font-family: inherit;
  letter-spacing: -0.01em;
}
.title-input::placeholder { color: #bbb; }

/* 正文 */
.content-textarea {
  width: 100%;
  border: none;
  padding: 8px 0;
  font-size: 15px; line-height: 1.7;
  color: #333; font-weight: 380;
  outline: none;
  resize: none;
  font-family: inherit;
  min-height: 160px;
}
.content-textarea::placeholder { color: #bbb; }

/* 图片上传 */
.upload-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  padding: 24px 16px;
  border: 1px dashed #d9d9d9;
  border-radius: 10px;
  color: #999;
  font-size: 14px; font-weight: 380;
  cursor: pointer;
  transition: border-color 0.3s;
}
.upload-placeholder:hover { border-color: #bbb; }
.img-preview-grid {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-start;
}
.img-preview-item {
  width: 80px; height: 80px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}
.preview-thumb {
  width: 100%; height: 100%;
  object-fit: cover;
}
.preview-remove {
  position: absolute;
  top: 2px; right: 4px;
  font-size: 18px; color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  cursor: pointer;
  line-height: 1;
  z-index: 2;
}
.add-more-btn {
  width: 80px; height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.3s;
}
.add-more-btn:hover { border-color: #bbb; }

/* 提交 */
.submit-section {
  padding: 20px 16px;
}
.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  border-radius: 14px;
  font-size: 16px; font-weight: 580;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.2s;
}
.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.bottom-spacer { height: 60px; }

/* 话题选择弹窗 */
.picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.picker-panel {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 20px 16px calc(20px + env(safe-area-inset-bottom, 0));
}
.picker-title {
  font-size: 16px; font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin: 0 0 16px;
}
.picker-item {
  padding: 14px;
  font-size: 15px; color: #333; font-weight: 480;
  text-align: center;
  border-radius: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.picker-item.selected {
  background: #f0f0f0;
  font-weight: 580;
}
.picker-custom {
  border-top: 0.5px solid #eee;
  margin-top: 8px;
  padding-top: 8px;
}
.custom-trigger {
  color: #2196F3;
  font-weight: 540;
}
.custom-input-row {
  display: flex; gap: 8px;
  padding: 8px 4px;
}
.custom-input {
  flex: 1;
  border: 0.5px solid #d9d9d9;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px; outline: none;
  font-family: inherit;
}
.custom-confirm {
  border: none;
  background: #1a1a1a;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px; font-weight: 540;
  cursor: pointer;
}
.picker-cancel {
  width: 100%;
  padding: 14px;
  margin-top: 12px;
  border: none;
  background: #f5f5f5;
  color: #666;
  font-size: 15px;
  border-radius: 12px;
  cursor: pointer;
}
</style>
