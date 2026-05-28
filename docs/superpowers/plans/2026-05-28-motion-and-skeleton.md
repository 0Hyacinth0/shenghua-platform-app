# Motion and Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable Animate.css-based motion foundation and skeleton loading states for tab, course list, course detail, and playback transitions.

**Architecture:** Use `animate.css` as the external library, but expose it through local components and CSS tokens. Add static contract tests because the current UniApp project has no test runner, then wire the components into existing pages without changing routing or API contracts.

**Tech Stack:** UniApp, Vue 3 `<script setup>`, CSS variables, Animate.css, Node.js static contract test.

---

## File Structure

- Create `edu-app/package.json`: declares the app package and `animate.css` dependency, plus a `test:motion` script.
- Create `edu-app/tests/motion-contract.test.mjs`: static tests that fail until the motion foundation and page integrations exist.
- Create `edu-app/components/MotionView.vue`: single wrapper for Animate.css class composition.
- Create `edu-app/components/SkeletonBlock.vue`: reusable shimmer skeleton primitive.
- Modify `edu-app/App.vue`: import Animate.css globally.
- Modify `edu-app/styles/variables.css`: add motion and skeleton tokens/keyframes.
- Modify `edu-app/components/CustomTabBar.vue`: add tab press and selected-state motion.
- Modify `edu-app/pages/index/index.vue`: wrap placeholder content in page enter animation.
- Modify `edu-app/pages/message/index.vue`: wrap placeholder content in page enter animation.
- Modify `edu-app/pages/mine/index.vue`: wrap placeholder content in page enter animation.
- Modify `edu-app/pages/course/index.vue`: add course-list skeletons and card enter animation.
- Modify `edu-app/pages/course/detail.vue`: add detail skeleton and content enter animation.
- Modify `edu-app/pages/course/play.vue`: add dark player skeleton and info enter animation.

## Task 1: Motion Contract Tests

**Files:**
- Create: `edu-app/package.json`
- Create: `edu-app/tests/motion-contract.test.mjs`

- [ ] **Step 1: Create the dependency/test entry**

Create `edu-app/package.json` with:

```json
{
  "name": "edu-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test:motion": "node tests/motion-contract.test.mjs"
  },
  "dependencies": {
    "animate.css": "^4.1.1"
  }
}
```

- [ ] **Step 2: Write the failing contract test**

Create `edu-app/tests/motion-contract.test.mjs` with:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

function read(path) {
  return readFileSync(join(root, path), 'utf8')
}

function assertIncludes(file, expected, message) {
  assert.ok(read(file).includes(expected), message)
}

assertIncludes('App.vue', "@import 'animate.css/animate.min.css';", 'App.vue imports Animate.css globally')
assertIncludes('styles/variables.css', '--motion-duration-base', 'motion duration token exists')
assertIncludes('styles/variables.css', '@keyframes skeleton-shimmer', 'skeleton shimmer keyframes exist')

const motionView = read('components/MotionView.vue')
assert.ok(motionView.includes("default: 'fadeInUp'"), 'MotionView exposes fadeInUp as the default animation')
assert.ok(motionView.includes('animate__animated'), 'MotionView applies Animate.css base class')
assert.ok(motionView.includes('animate__'), 'MotionView composes Animate.css animation classes')

const skeleton = read('components/SkeletonBlock.vue')
assert.ok(skeleton.includes('skeleton-block'), 'SkeletonBlock renders the skeleton-block class')
assert.ok(skeleton.includes('dark'), 'SkeletonBlock supports dark mode')

for (const page of [
  'pages/index/index.vue',
  'pages/message/index.vue',
  'pages/mine/index.vue',
  'pages/course/index.vue',
  'pages/course/detail.vue',
  'pages/course/play.vue',
]) {
  assertIncludes(page, 'MotionView', `${page} uses MotionView`)
}

assertIncludes('pages/course/index.vue', 'course-skeleton-card', 'course list renders course skeleton cards')
assertIncludes('pages/course/detail.vue', 'detail-skeleton', 'course detail renders a detail skeleton')
assertIncludes('pages/course/play.vue', 'player-skeleton', 'play page renders a player skeleton')
assertIncludes('components/CustomTabBar.vue', 'tab-item-press', 'tab bar includes press feedback class')
```

- [ ] **Step 3: Run the test to verify it fails**

Run:

```bash
cd edu-app && npm run test:motion
```

Expected: FAIL because Animate.css import, components, tokens, and page integrations do not exist yet.

## Task 2: Motion Foundation

**Files:**
- Create: `edu-app/components/MotionView.vue`
- Create: `edu-app/components/SkeletonBlock.vue`
- Modify: `edu-app/App.vue`
- Modify: `edu-app/styles/variables.css`

- [ ] **Step 1: Implement `MotionView.vue`**

Create `edu-app/components/MotionView.vue` with:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  animation: {
    type: String,
    default: 'fadeInUp',
  },
  duration: {
    type: String,
    default: 'var(--motion-duration-base)',
  },
  delay: {
    type: String,
    default: '0ms',
  },
  customClass: {
    type: String,
    default: '',
  },
})

const classes = computed(() => [
  'motion-view',
  'animate__animated',
  `animate__${props.animation}`,
  props.customClass,
])

const styles = computed(() => ({
  '--animate-duration': props.duration,
  '--animate-delay': props.delay,
  animationDelay: props.delay,
}))
</script>

<template>
  <view :class="classes" :style="styles">
    <slot />
  </view>
</template>

<style scoped>
.motion-view {
  animation-timing-function: var(--motion-ease-standard);
}
</style>
```

- [ ] **Step 2: Implement `SkeletonBlock.vue`**

Create `edu-app/components/SkeletonBlock.vue` with:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '32rpx',
  },
  radius: {
    type: String,
    default: '16rpx',
  },
  dark: {
    type: Boolean,
    default: false,
  },
  customClass: {
    type: String,
    default: '',
  },
})

const classes = computed(() => [
  'skeleton-block',
  { dark: props.dark },
  props.customClass,
])

const styles = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.radius,
}))
</script>

<template>
  <view :class="classes" :style="styles" />
</template>
```

- [ ] **Step 3: Add global imports and tokens**

Modify `edu-app/App.vue` style block to:

```vue
<style>
@import 'animate.css/animate.min.css';
@import '@/styles/variables.css';
</style>
```

Append to `edu-app/styles/variables.css` inside `:root`:

```css
  --motion-duration-fast: 180ms;
  --motion-duration-base: 320ms;
  --motion-duration-slow: 520ms;
  --motion-ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
  --skeleton-bg: #EEF0F4;
  --skeleton-highlight: #F8F9FC;
  --skeleton-dark-bg: #242424;
  --skeleton-dark-highlight: #343434;
```

Append after the global reset:

```css
.skeleton-block {
  position: relative;
  overflow: hidden;
  background: var(--skeleton-bg);
}

.skeleton-block::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, var(--skeleton-highlight), transparent);
  animation: skeleton-shimmer 1.2s infinite;
}

.skeleton-block.dark {
  background: var(--skeleton-dark-bg);
}

.skeleton-block.dark::after {
  background: linear-gradient(90deg, transparent, var(--skeleton-dark-highlight), transparent);
}

@keyframes skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

- [ ] **Step 4: Run the test and confirm remaining failures are page integration failures**

Run:

```bash
cd edu-app && npm run test:motion
```

Expected: FAIL only for page integrations and tab press feedback.

## Task 3: Tab Page And Tab Bar Motion

**Files:**
- Modify: `edu-app/components/CustomTabBar.vue`
- Modify: `edu-app/pages/index/index.vue`
- Modify: `edu-app/pages/message/index.vue`
- Modify: `edu-app/pages/mine/index.vue`

- [ ] **Step 1: Add tab press state**

In `CustomTabBar.vue`, import `ref`, track pressed tab index, and add `tab-item-press`.

Use:

```js
import { ref } from 'vue'

const pressedIndex = ref(-1)

function onPressStart(index) {
  pressedIndex.value = index
}

function onPressEnd() {
  pressedIndex.value = -1
}
```

Add the class binding and events:

```vue
:class="{ active: current === index, 'tab-item-press': pressedIndex === index }"
@touchstart="onPressStart(index)"
@touchend="onPressEnd"
@touchcancel="onPressEnd"
@tap="switchTab(index)"
```

Update CSS:

```css
.tab-item {
  transition: background var(--motion-duration-fast) var(--motion-ease-standard),
              transform var(--motion-duration-fast) var(--motion-ease-standard);
}

.tab-item.active {
  background: var(--nav-selected-bg);
  transform: scale(1.03);
}

.tab-item-press {
  transform: scale(0.96);
}

.icon-placeholder,
.tab-text {
  transition: color var(--motion-duration-fast) var(--motion-ease-standard),
              transform var(--motion-duration-fast) var(--motion-ease-standard);
}

.tab-item.active .icon-placeholder {
  color: var(--nav-selected-color);
  transform: translateY(-2rpx);
}
```

- [ ] **Step 2: Wrap placeholder tab pages**

For `pages/index/index.vue`, `pages/message/index.vue`, and `pages/mine/index.vue`:

Import `MotionView`:

```js
import MotionView from '@/components/MotionView.vue'
```

Wrap the placeholder:

```vue
<MotionView custom-class="page-content">
  <view class="page-placeholder">首页</view>
</MotionView>
```

Use the page's existing text for each page.

- [ ] **Step 3: Run the test and confirm tab page checks pass**

Run:

```bash
cd edu-app && npm run test:motion
```

Expected: FAIL only for course list, detail, and play page integration if those are not implemented yet.

## Task 4: Course List Skeleton And Card Motion

**Files:**
- Modify: `edu-app/pages/course/index.vue`

- [ ] **Step 1: Import components**

Add:

```js
import MotionView from '@/components/MotionView.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
```

- [ ] **Step 2: Replace loading gap with skeleton cards**

Replace the list template with a stable skeleton branch:

```vue
<scroll-view scroll-y class="course-list">
  <template v-if="loading">
    <view v-for="n in 4" :key="n" class="course-card course-skeleton-card">
      <SkeletonBlock width="240rpx" height="160rpx" radius="var(--radius-cover)" />
      <view class="card-info">
        <SkeletonBlock width="88%" height="34rpx" radius="12rpx" />
        <SkeletonBlock width="58%" height="24rpx" radius="10rpx" />
        <view class="skeleton-row">
          <SkeletonBlock width="120rpx" height="28rpx" radius="8rpx" />
          <SkeletonBlock width="150rpx" height="24rpx" radius="10rpx" />
        </view>
      </view>
    </view>
  </template>

  <template v-else>
    <MotionView
      v-for="(course, index) in courses"
      :key="course.id"
      animation="fadeInUp"
      :delay="`${Math.min(index * 45, 180)}ms`"
      custom-class="course-motion-item"
    >
      <view class="course-card" @tap="onCourseTap(course)">
        <view class="card-cover">
          <view class="cover-placeholder"></view>
        </view>
        <view class="card-info">
          <view class="card-title">{{ course.title }}</view>
          <view class="card-meta">
            <text class="card-teacher">{{ course.teacherName }}</text>
            <text class="card-lessons">{{ course.lessonCount }}课时</text>
          </view>
          <view class="card-bottom">
            <view class="card-tags" v-if="course.tags">
              <text v-for="tag in course.tags" :key="tag" class="card-tag">{{ tag }}</text>
            </view>
            <text class="card-students">{{ formatCount(course.studentCount) }}人学习</text>
          </view>
        </view>
      </view>
    </MotionView>
    <view v-if="courses.length === 0" class="empty-state">暂无课程</view>
  </template>
</scroll-view>
```

- [ ] **Step 3: Add skeleton styles**

Add:

```css
.course-skeleton-card {
  pointer-events: none;
}

.skeleton-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-motion-item {
  display: block;
}
```

- [ ] **Step 4: Run the test and confirm course list checks pass**

Run:

```bash
cd edu-app && npm run test:motion
```

Expected: FAIL only for detail and play page integration if those are not implemented yet.

## Task 5: Detail And Playback Skeletons

**Files:**
- Modify: `edu-app/pages/course/detail.vue`
- Modify: `edu-app/pages/course/play.vue`

- [ ] **Step 1: Add detail imports**

In `detail.vue`, add:

```js
import MotionView from '@/components/MotionView.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
```

- [ ] **Step 2: Add detail skeleton branch**

Change the root template to render:

```vue
<view class="page">
  <view v-if="loading" class="detail-skeleton">
    <SkeletonBlock height="400rpx" radius="0" />
    <view class="detail-section">
      <SkeletonBlock width="88%" height="44rpx" radius="12rpx" />
      <SkeletonBlock width="64%" height="28rpx" radius="10rpx" custom-class="skeleton-gap" />
      <SkeletonBlock width="52%" height="24rpx" radius="10rpx" custom-class="skeleton-gap" />
    </view>
    <view class="detail-section">
      <SkeletonBlock width="160rpx" height="34rpx" radius="10rpx" />
      <view class="teacher-card skeleton-gap">
        <SkeletonBlock width="96rpx" height="96rpx" radius="50%" />
        <view class="teacher-info">
          <SkeletonBlock width="160rpx" height="28rpx" radius="10rpx" />
          <SkeletonBlock width="240rpx" height="24rpx" radius="10rpx" />
        </view>
      </view>
    </view>
    <view class="detail-section">
      <SkeletonBlock width="220rpx" height="34rpx" radius="10rpx" />
      <view v-for="n in 3" :key="n" class="lesson-item">
        <view class="lesson-left">
          <SkeletonBlock width="48rpx" height="48rpx" radius="50%" />
          <view class="lesson-text">
            <SkeletonBlock width="86%" height="30rpx" radius="10rpx" />
            <SkeletonBlock width="36%" height="22rpx" radius="8rpx" custom-class="skeleton-gap-small" />
          </view>
        </view>
      </view>
    </view>
  </view>

  <MotionView v-else-if="course" animation="fadeInUp" custom-class="detail-content">
    <!-- existing real detail content -->
  </MotionView>
</view>
```

Move the existing real detail content inside `MotionView`, excluding only the outer `.page` wrapper.

- [ ] **Step 3: Add detail skeleton spacing**

Add:

```css
.detail-skeleton {
  min-height: 100vh;
}

.detail-content {
  display: block;
}

.skeleton-gap {
  margin-top: 20rpx;
}

.skeleton-gap-small {
  margin-top: 12rpx;
}
```

- [ ] **Step 4: Add playback imports**

In `play.vue`, add:

```js
import MotionView from '@/components/MotionView.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
```

- [ ] **Step 5: Replace player loading text with skeleton**

Replace:

```vue
<view v-if="loading" class="player-loading">加载中...</view>
```

With:

```vue
<view v-if="loading" class="player-skeleton">
  <SkeletonBlock width="120rpx" height="120rpx" radius="50%" dark />
  <SkeletonBlock width="260rpx" height="28rpx" radius="10rpx" dark />
</view>
```

Wrap the info bar:

```vue
<MotionView v-if="lessonInfo" animation="fadeInUp" custom-class="info-bar">
  <text class="info-text">正在播放：{{ lessonInfo.title }}</text>
  <text class="info-text" v-if="lessonInfo.lastPosition > 0">
    上次播放到 {{ Math.floor(lessonInfo.lastPosition / 60) }}:{{ String(lessonInfo.lastPosition % 60).padStart(2, '0') }}
  </text>
</MotionView>
```

- [ ] **Step 6: Add player skeleton styles**

Add:

```css
.player-skeleton {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}
```

- [ ] **Step 7: Run the motion contract test**

Run:

```bash
cd edu-app && npm run test:motion
```

Expected: PASS.

## Task 6: Dependency Install And Final Verification

**Files:**
- Update generated lockfile if `npm install` creates one.

- [ ] **Step 1: Install dependencies**

Run:

```bash
cd edu-app && npm install
```

Expected: `animate.css` installed and `package-lock.json` created or updated.

- [ ] **Step 2: Run contract test**

Run:

```bash
cd edu-app && npm run test:motion
```

Expected: PASS.

- [ ] **Step 3: Inspect git diff**

Run:

```bash
git diff -- edu-app docs/superpowers/specs/2026-05-28-motion-and-skeleton-design.md docs/superpowers/plans/2026-05-28-motion-and-skeleton.md
```

Expected: Diff only contains the motion foundation, skeleton states, package metadata, and docs.
