/**
 * Mock 数据 + UI 配置
 * 当 USE_MOCK = true 时使用 mockData，否则从后端 API 获取
 */
import type { Component } from 'vue'
import {
  CodeOutlined, BgColorsOutlined, GlobalOutlined, TrophyOutlined,
  ShoppingOutlined, PlayCircleOutlined, RobotOutlined, AppstoreOutlined,
} from '@ant-design/icons-vue'

// ==================== 分类宫格图标映射 ====================
export const categoryIconMap: Record<string, { icon: Component; color: string }> = {
  '编程':   { icon: CodeOutlined,        color: '#E8F4FD' },
  '设计':   { icon: BgColorsOutlined,    color: '#FDE8F4' },
  '语言':   { icon: GlobalOutlined,      color: '#E8FDEC' },
  '英语':   { icon: GlobalOutlined,      color: '#E8FDEC' },
  '考证':   { icon: TrophyOutlined,      color: '#FDF3E8' },
  '考试':   { icon: TrophyOutlined,      color: '#FDF3E8' },
  '商城':   { icon: ShoppingOutlined,    color: '#EEE8FD' },
  '直播':   { icon: PlayCircleOutlined,  color: '#FDE8E8' },
  'AI':     { icon: RobotOutlined,       color: '#E8FDF5' },
  '人工智能': { icon: RobotOutlined,     color: '#E8FDF5' },
}
export const defaultCategoryIcon = { icon: AppstoreOutlined, color: '#F5F5F5' }

export function getCategoryIcon(name: string): { icon: Component; color: string } {
  for (const [key, val] of Object.entries(categoryIconMap)) {
    if (name.includes(key)) return val
  }
  return defaultCategoryIcon
}

// ==================== 频道切换（纯 UI） ====================
export interface Channel { key: string; label: string }
export const channels: Channel[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'course', label: '课程' },
  { key: 'live', label: '直播' },
  { key: 'mall', label: '商城' },
]

// ==================== Mock 数据 ====================

export const mockCategories = [
  { id: '1', name: '编程开发', icon: CodeOutlined,        color: '#E8F4FD', route: '/learn?cat=dev' },
  { id: '2', name: '设计创意', icon: BgColorsOutlined,    color: '#FDE8F4', route: '/learn?cat=design' },
  { id: '3', name: '语言学习', icon: GlobalOutlined,      color: '#E8FDEC', route: '/learn?cat=lang' },
  { id: '4', name: '考证考级', icon: TrophyOutlined,      color: '#FDF3E8', route: '/learn?cat=exam' },
  { id: '5', name: '精品商城', icon: ShoppingOutlined,    color: '#EEE8FD', route: '/learn?tab=mall' },
  { id: '6', name: '直播课堂', icon: PlayCircleOutlined,  color: '#FDE8E8', route: '/learn?cat=live' },
  { id: '7', name: 'AI 技能', icon: RobotOutlined,       color: '#E8FDF5', route: '/learn?cat=ai' },
  { id: '8', name: '全部课程', icon: AppstoreOutlined,    color: '#F5F5F5', route: '/learn' },
]

export const mockBanners = [
  { id: '1', title: '暑期训练营', subtitle: '零基础到就业', bgColor: '#D8F0E8', textColor: '#1a1a1a', route: '/learn?cat=camp', tag: '热门' },
  { id: '2', title: '限时秒杀', subtitle: '好课低至1折', bgColor: '#FDE2E2', textColor: '#1a1a1a', route: '/seckill', tag: '限时' },
]

export const mockRecommendations = [
  { id: '1', type: 'course' as const, title: 'Vue 3 + TypeScript 实战教程', coverColor: '#D8F0E8', author: '张老师', price: 199, originalPrice: 599, tag: '新课', tagColor: '#1a1a1a', rating: 4.9, students: 2341, route: '/learn' },
  { id: '2', type: 'course' as const, title: 'Python 数据分析从入门到精通', coverColor: '#E8E0F8', author: '李老师', price: 0, tag: '免费', tagColor: '#4CAF50', rating: 4.8, students: 5621, route: '/learn' },
  { id: '3', type: 'product' as const, title: '《设计师的配色指南》实体书', coverColor: '#FDE8D8', author: '盛桦书店', price: 68, originalPrice: 128, tag: '热卖', tagColor: '#FF5722', route: '/product/some-id' },
  { id: '4', type: 'course' as const, title: 'React Native 跨平台移动开发', coverColor: '#D8E8FD', author: '王老师', price: 299, originalPrice: 799, tag: '更新中', tagColor: '#2196F3', rating: 4.7, students: 1892, route: '/learn' },
  { id: '5', type: 'live' as const, title: 'UI/UX 设计思维直播课', coverColor: '#FDE8F0', author: '陈老师', price: 0, tag: '直播', tagColor: '#E91E63', rating: 4.9, students: 892, route: '/learn' },
  { id: '6', type: 'course' as const, title: '算法与数据结构精讲', coverColor: '#E8F0D8', author: '刘老师', price: 149, originalPrice: 399, tag: '爆款', tagColor: '#FF9800', rating: 4.6, students: 4503, route: '/learn' },
]

export const mockFreeCourses = [
  { id: '1', title: 'HTML & CSS 网页基础入门', coverColor: '#D8F0E8', duration: '8课时', level: '入门', students: 12034 },
  { id: '2', title: 'Git 版本控制快速上手', coverColor: '#E8E0F8', duration: '4课时', level: '入门', students: 8921 },
  { id: '3', title: 'SQL 数据库查询基础', coverColor: '#FDE8D8', duration: '10课时', level: '初级', students: 6543 },
  { id: '4', title: 'Adobe Illustrator 基础教程', coverColor: '#D8E8FD', duration: '6课时', level: '入门', students: 10234 },
  { id: '5', title: '职场英语口语速成', coverColor: '#FDE8F0', duration: '15课时', level: '初级', students: 7892 },
]

export const mockLearnCourses = [
  { id: 'c1', title: 'Vue 3 + TypeScript 实战教程', coverColor: '#D8F0E8', author: '张老师', duration: '32课时', price: 199, progress: 45 },
  { id: 'c2', title: 'Python 数据分析从入门到精通', coverColor: '#E8E0F8', author: '李老师', duration: '48课时', price: 0, progress: 78 },
  { id: 'c3', title: 'React Native 跨平台开发', coverColor: '#D8E8FD', author: '王老师', duration: '24课时', price: 299, progress: 12 },
  { id: 'c4', title: 'UI/UX 设计思维', coverColor: '#FDE8F0', author: '陈老师', duration: '16课时', price: 149, progress: 0 },
]

export const mockLearnStats = { orderCount: 12, cartCount: 3, couponCount: 5, userPoints: 850, signDays: 7 }

export const mockCommunityPosts = [
  { id: 'p1', author: '前端小学生', avatarColor: '#D8F0E8', tag: '求助', tagColor: '#2196F3', time: '2小时前', title: 'Vue 3 的 watchEffect 和 watch 到底什么时候用哪个？', excerpt: '最近在学习 Composition API，watchEffect 自动收集依赖这个概念有点绕...', likes: 23, comments: 15, views: 342 },
  { id: 'p2', author: '设计师小王', avatarColor: '#FDE8F0', tag: '分享', tagColor: '#4CAF50', time: '3小时前', title: '分享一套自用的 Figma 设计系统模板', excerpt: '包含完整的 color token、typography、spacing...', likes: 56, comments: 8, views: 1203 },
  { id: 'p3', author: 'Pythonista', avatarColor: '#E8E0F8', tag: '讨论', tagColor: '#FF9800', time: '5小时前', title: 'FastAPI vs Django REST — 2026年选哪个？', likes: 89, comments: 42, views: 2356 },
  { id: 'p4', author: '考证达人', avatarColor: '#FDE8D8', tag: '经验', tagColor: '#9C27B0', time: '8小时前', title: '软考中级一次通过经验分享，附备考资料', likes: 134, comments: 67, views: 4567 },
  { id: 'p5', author: 'AI 探索者', avatarColor: '#D8E8FD', tag: '讨论', tagColor: '#FF9800', time: '12小时前', title: 'Claude Code 实战：用 AI 一周搞定毕设项目', excerpt: '记录一下我用 AI 辅助开发的完整流程...', likes: 210, comments: 89, views: 7801 },
]
