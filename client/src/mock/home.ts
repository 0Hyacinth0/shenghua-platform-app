/**
 * 首页 UI 配置（纯配置，不含业务数据）
 * 所有业务数据从后端 API 实时获取
 */
import type { Component } from 'vue'
import {
  CodeOutlined, BgColorsOutlined, GlobalOutlined, TrophyOutlined,
  ShoppingOutlined, PlayCircleOutlined, RobotOutlined, AppstoreOutlined,
} from '@ant-design/icons-vue'

// ==================== 分类宫格图标映射 ====================
// key 匹配后端 category.name 关键字
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

/** 根据分类名匹配图标 */
export function getCategoryIcon(name: string): { icon: Component; color: string } {
  for (const [key, val] of Object.entries(categoryIconMap)) {
    if (name.includes(key)) return val
  }
  return defaultCategoryIcon
}

// ==================== 频道切换（纯 UI） ====================
export interface Channel {
  key: string
  label: string
}
export const channels: Channel[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'course', label: '课程' },
  { key: 'live', label: '直播' },
  { key: 'mall', label: '商城' },
]
