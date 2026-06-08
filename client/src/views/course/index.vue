<template>
  <div class="course-page">
    <div class="header-bar">
      <div class="search-box">
        <input v-model="keyword" type="text" placeholder="搜索课程..." @keyup.enter="doLoad" />
        <span class="search-icon" @click="doLoad">🔍</span>
      </div>
    </div>

    <div class="main-area">
      <div class="sidebar">
        <div class="sidebar-title">课程分类</div>
        <div class="cate-list">
          <div :class="{ active: currentCategoryId === '' }" @click="selectCategory('')">全部</div>
          <div v-for="cat in treeCategories" :key="cat.id">
            <div class="cate-item" :class="{ active: currentCategoryId === cat.id }" @click="handleCateClick(cat)">
              <span class="cate-name">{{ cat.name }}</span>
              <span class="cate-arrow" v-if="cat.children && cat.children.length">{{ expanded[cat.id] ? '▼' : '▶' }}</span>
            </div>
            <div v-if="cat.children && expanded[cat.id]" class="sub-cate">
              <div v-for="sub in cat.children" :key="sub.id" class="cate-item sub" :class="{ active: currentCategoryId === sub.id }" @click="selectCategory(sub.id)">
                <span class="cate-name">{{ sub.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content">
        <div class="filter-row">
          <span :class="{ active: filterFree === '' }" @click="filterFree = ''; doLoad()">全部</span>
          <span :class="{ active: filterFree === '1' }" @click="filterFree = filterFree==='1'?'':'1'; doLoad()">免费</span>
          <span :class="{ active: filterFree === '2' }" @click="filterFree = filterFree==='2'?'':'2'; doLoad()">付费</span>
        </div>

        <div class="course-grid">
          <div v-for="item in list" :key="item.id" class="course-card" @click="$router.push('/course/' + item.id)">
            <div class="card-cover">
              <img v-if="item.cover" :src="imgUrl(item.cover)" alt="" />
              <div v-else class="cover-placeholder">📚</div>
              <span v-if="item.price === 0 || item.price === null" class="free-tag">免费</span>
            </div>
            <div class="card-body">
              <h3>{{ item.title }}</h3>
              <div class="card-meta">
                <span>{{ getCatName(item.categoryId) }}</span>
                <span>{{ item.totalLessons || 0 }}课时</span>
                <span>{{ item.studentCount || 0 }}次播放</span>
              </div>
              <div class="card-price">
                <span v-if="item.price > 0" class="price">&yen;{{ item.price }}</span>
                <span v-else class="price free">免费</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="list.length === 0 && !loading" class="empty">暂无课程</div>
        <div v-if="loading" class="loading">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import http from '@/utils/http'
import { imgUrl } from '@/api'

const treeCategories = ref([])
const list = ref([])
const loading = ref(false)
const keyword = ref('')
const currentCategoryId = ref('')
const filterFree = ref('')
const catMap = ref({})
const expanded = reactive({})

const childIdsMap = {}

const fillCatMap = (nodes) => {
  for (const n of nodes) {
    catMap.value[n.id] = n.name
    if (n.children && n.children.length) {
      const ids = []
      const collect = (children) => { for (const c of children) { ids.push(c.id); if (c.children) collect(c.children) } }
      collect(n.children)
      childIdsMap[n.id] = ids
      fillCatMap(n.children)
    }
  }
}

const loadCategories = async () => {
  try {
    const res = await http.get('/course/category/tree')
    treeCategories.value = res || []
    fillCatMap(res || [])
  } catch (e) { /* */ }
}
const handleCateClick = (cat) => {
  if (cat.children && cat.children.length) {
    expanded[cat.id] = !expanded[cat.id]
    selectCategory(cat.id)
  } else {
    selectCategory(cat.id)
  }
}
const getCatName = (id) => catMap.value[id] || ''

const doLoad = async () => {
  loading.value = true
  try {
    const params = { pageNo: 1, pageSize: 200 }
    if (keyword.value) params.keyword = keyword.value
    const res = await http.get('/course/list', { params })
    let all = res?.records || res || []
    // 筛选分类（父分类+所有子分类）
    if (currentCategoryId.value) {
      const ids = [currentCategoryId.value, ...(childIdsMap[currentCategoryId.value] || [])]
      all = all.filter(c => ids.includes(c.categoryId))
    }
    if (filterFree.value === '1') all = all.filter(c => c.price === 0 || c.price == null)
    if (filterFree.value === '2') all = all.filter(c => c.price > 0)
    list.value = all
  } catch (e) { /* */ } finally { loading.value = false }
}

const selectCategory = (id) => { currentCategoryId.value = id; doLoad() }

onMounted(() => { loadCategories(); doLoad() })
</script>

<style scoped>
.course-page { background:#f7f8fa; min-height:100vh; }
.header-bar { padding:10px 12px; background:#fff; position:sticky; top:0; z-index:10; }
.search-box { display:flex; align-items:center; background:#f5f5f5; border-radius:20px; padding:7px 14px; }
.search-box input { flex:1; border:none; outline:none; font-size:13px; background:transparent; }
.search-icon { font-size:16px; cursor:pointer; }
.main-area { display:flex; min-height:calc(100vh - 50px); }
.sidebar { width:110px; flex-shrink:0; background:#fff; border-right:1px solid #f0f0f0; overflow-y:auto; }
.sidebar-title { padding:12px 10px 8px; font-size:12px; font-weight:bold; color:#999; position:sticky; top:0; background:#fff; }
.cate-list > div { border-bottom:1px solid #f9f9f9; }
.cate-item { display:flex; align-items:center; padding:9px 8px; font-size:12px; color:#333; cursor:pointer; }
.cate-item.active { color:#2b85e4; background:#e6f4ff; font-weight:bold; }
.cate-item.sub { padding-left:18px; }
.cate-name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cate-arrow { font-size:10px; color:#bbb; flex-shrink:0; margin-left:2px; }
.content { flex:1; padding:8px 10px 80px; }
.filter-row { display:flex; gap:8px; margin-bottom:10px; }
.filter-row span { padding:4px 12px; border-radius:10px; font-size:11px; background:#fff; color:#888; cursor:pointer; }
.filter-row span.active { background:#e6f0ff; color:#2b85e4; font-weight:bold; }
.course-grid { display:flex; flex-direction:column; gap:10px; }
.course-card { background:#fff; border-radius:12px; overflow:hidden; display:flex; box-shadow:0 1px 4px rgba(0,0,0,.04); cursor:pointer; }
.course-card:active { background:#fafafa; }
.card-cover { width:120px; min-height:75px; flex-shrink:0; background:#e8ecf1; display:flex; align-items:center; justify-content:center; position:relative; }
.card-cover img { width:100%; height:100%; object-fit:cover; }
.cover-placeholder { font-size:28px; }
.free-tag { position:absolute; top:4px; right:4px; background:#52c41a; color:#fff; padding:1px 6px; border-radius:6px; font-size:10px; }
.card-body { flex:1; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; min-width:0; }
.card-body h3 { font-size:13px; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.4; }
.card-meta { font-size:10px; color:#999; display:flex; gap:8px; margin:2px 0; }
.price { font-size:15px; font-weight:bold; color:#f5222d; }
.price.free { color:#52c41a; font-size:13px; }
.empty, .loading { text-align:center; padding:40px; color:#999; font-size:13px; }
</style>
