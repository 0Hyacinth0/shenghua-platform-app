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
