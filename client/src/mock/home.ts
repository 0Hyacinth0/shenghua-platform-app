/**
 * 首页 Mock 数据 — 所有文案和配置集中在此，方便后期替换为 API
 */

// ==================== 分类宫格 ====================
// icon 字段使用 @ant-design/icons-vue 的图标组件名
export interface CategoryItem {
  id: string
  name: string
  icon: string        // Ant Design icon name (e.g. 'CodeOutlined')
  color: string       // 背景色
  route?: string
}

export const mockCategories: CategoryItem[] = [
  { id: '1', name: '编程开发', icon: 'CodeOutlined', color: '#E8F4FD', route: '/learn?cat=dev' },
  { id: '2', name: '设计创意', icon: 'BgColorsOutlined', color: '#FDE8F4', route: '/learn?cat=design' },
  { id: '3', name: '语言学习', icon: 'GlobalOutlined', color: '#E8FDEC', route: '/learn?cat=lang' },
  { id: '4', name: '考证考级', icon: 'TrophyOutlined', color: '#FDF3E8', route: '/learn?cat=exam' },
  { id: '5', name: '精品商城', icon: 'ShoppingOutlined', color: '#EEE8FD', route: '/learn?tab=mall' },
  { id: '6', name: '直播课堂', icon: 'PlayCircleOutlined', color: '#FDE8E8', route: '/learn?cat=live' },
  { id: '7', name: 'AI 技能', icon: 'RobotOutlined', color: '#E8FDF5', route: '/learn?cat=ai' },
  { id: '8', name: '全部课程', icon: 'AppstoreOutlined', color: '#F5F5F5', route: '/learn' },
]

// ==================== 双 Banner ====================
export interface PromoBanner {
  id: string
  title: string
  subtitle: string
  bgColor: string
  textColor: string
  route?: string
  tag?: string
}

export const mockPromoBanners: PromoBanner[] = [
  {
    id: '1',
    title: '暑期训练营',
    subtitle: '零基础到就业',
    bgColor: '#D8F0E8',
    textColor: '#1a1a1a',
    route: '/learn?cat=camp',
    tag: '热门',
  },
  {
    id: '2',
    title: '限时秒杀',
    subtitle: '好课低至1折',
    bgColor: '#FDE2E2',
    textColor: '#1a1a1a',
    route: '/seckill',
    tag: '限时',
  },
]

// ==================== 频道切换 ====================
export interface Channel {
  key: string
  label: string
}

export const mockChannels: Channel[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'course', label: '课程' },
  { key: 'live', label: '直播' },
  { key: 'mall', label: '商城' },
]

// ==================== 推荐内容卡片 ====================
export interface RecommendationItem {
  id: string
  type: 'course' | 'product' | 'live'
  title: string
  cover: string
  coverColor: string    // 占位背景色
  author: string
  price: number
  originalPrice?: number
  tag?: string
  tagColor?: string
  rating?: number
  students?: number
  route?: string
}

export const mockRecommendations: RecommendationItem[] = [
  {
    id: '1', type: 'course', title: 'Vue 3 + TypeScript 实战教程',
    cover: '', coverColor: '#D8F0E8', author: '张老师',
    price: 199, originalPrice: 599, tag: '新课', tagColor: '#1a1a1a',
    rating: 4.9, students: 2341, route: '/learn',
  },
  {
    id: '2', type: 'course', title: 'Python 数据分析从入门到精通',
    cover: '', coverColor: '#E8E0F8', author: '李老师',
    price: 0, tag: '免费', tagColor: '#4CAF50',
    rating: 4.8, students: 5621, route: '/learn',
  },
  {
    id: '3', type: 'product', title: '《设计师的配色指南》实体书',
    cover: '', coverColor: '#FDE8D8', author: '盛桦书店',
    price: 68, originalPrice: 128, tag: '热卖', tagColor: '#FF5722',
    route: '/product/some-id',
  },
  {
    id: '4', type: 'course', title: 'React Native 跨平台移动开发',
    cover: '', coverColor: '#D8E8FD', author: '王老师',
    price: 299, originalPrice: 799, tag: '更新中', tagColor: '#2196F3',
    rating: 4.7, students: 1892, route: '/learn',
  },
  {
    id: '5', type: 'live', title: 'UI/UX 设计思维直播课',
    cover: '', coverColor: '#FDE8F0', author: '陈老师',
    price: 0, tag: '直播', tagColor: '#E91E63',
    rating: 4.9, students: 892, route: '/learn',
  },
  {
    id: '6', type: 'course', title: '算法与数据结构精讲',
    cover: '', coverColor: '#E8F0D8', author: '刘老师',
    price: 149, originalPrice: 399, tag: '爆款', tagColor: '#FF9800',
    rating: 4.6, students: 4503, route: '/learn',
  },
]

// ==================== 免费公开课 ====================
export interface FreeCourseItem {
  id: string
  title: string
  coverColor: string
  duration: string
  level: string
  students: number
  route?: string
}

export const mockFreeCourses: FreeCourseItem[] = [
  { id: '1', title: 'HTML & CSS 网页基础入门', coverColor: '#D8F0E8', duration: '8课时', level: '入门', students: 12034 },
  { id: '2', title: 'Git 版本控制快速上手', coverColor: '#E8E0F8', duration: '4课时', level: '入门', students: 8921 },
  { id: '3', title: 'SQL 数据库查询基础', coverColor: '#FDE8D8', duration: '10课时', level: '初级', students: 6543 },
  { id: '4', title: 'Adobe Illustrator 基础教程', coverColor: '#D8E8FD', duration: '6课时', level: '入门', students: 10234 },
  { id: '5', title: '职场英语口语速成', coverColor: '#FDE8F0', duration: '15课时', level: '初级', students: 7892 },
]
