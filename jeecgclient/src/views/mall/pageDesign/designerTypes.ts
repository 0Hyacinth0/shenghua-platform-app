/** 页面组件实例 */
export interface DesignerComponent {
  id: string
  type: string
  props: Record<string, any>
  /** 组件排序序号 */
  sort: number
}

/** 页面配置数据 */
export interface PageDesignData {
  pageStyle: {
    backgroundColor: string
    backgroundImage: string
  }
  components: DesignerComponent[]
}

/** 组件定义 */
export interface ComponentDefinition {
  type: string
  name: string
  icon: string
  category: 'basic' | 'product' | 'marketing'
  defaultProps: Record<string, any>
}

/** 属性配置项 */
export interface PropField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'number' | 'switch' | 'select' | 'color' | 'upload' | 'array' | 'richtext' | 'slider'
  defaultValue?: any
  options?: { label: string; value: any }[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

/** 组件配置Schema */
export interface ComponentConfigSchema {
  type: string
  name: string
  fields: PropField[]
}

/** 组件定义Map */
export const COMPONENT_DEFINITIONS: Record<string, ComponentDefinition> = {
  carousel: {
    type: 'carousel',
    name: '轮播图',
    icon: 'PictureOutlined',
    category: 'basic',
    defaultProps: { images: [], autoplay: true, interval: 3000, height: 200, borderRadius: 0 },
  },
  notice: {
    type: 'notice',
    name: '公告栏',
    icon: 'NotificationOutlined',
    category: 'basic',
    defaultProps: { text: '请输入公告内容', scrollable: true, backgroundColor: '#fff7e6', textColor: '#333' },
  },
  searchBar: {
    type: 'searchBar',
    name: '搜索框',
    icon: 'SearchOutlined',
    category: 'basic',
    defaultProps: { placeholder: '搜索商品', shape: 'round', backgroundColor: '#ffffff' },
  },
  navBar: {
    type: 'navBar',
    name: '导航栏',
    icon: 'AppstoreOutlined',
    category: 'basic',
    defaultProps: {
      items: [
        { icon: 'appstore', text: '分类', link: '' },
        { icon: 'star', text: '热卖', link: '' },
        { icon: 'gift', text: '优惠', link: '' },
        { icon: 'user', text: '我的', link: '' },
      ],
      columns: 4,
      backgroundColor: '#ffffff',
    },
  },
  imageAd: {
    type: 'imageAd',
    name: '图片广告',
    icon: 'FileImageOutlined',
    category: 'basic',
    defaultProps: { imageUrl: '', link: '', height: 150, borderRadius: 0 },
  },
  titleBar: {
    type: 'titleBar',
    name: '标题栏',
    icon: 'FontSizeOutlined',
    category: 'basic',
    defaultProps: { title: '标题文本', subtitle: '', align: 'left', showMore: false, moreLink: '' },
  },
  spacer: {
    type: 'spacer',
    name: '空白占位',
    icon: 'ColumnHeightOutlined',
    category: 'basic',
    defaultProps: { height: 20, backgroundColor: '#f5f5f5' },
  },
  richText: {
    type: 'richText',
    name: '富文本',
    icon: 'FileTextOutlined',
    category: 'basic',
    defaultProps: { content: '<p style="text-align:center;">请输入内容</p>', padding: 12 },
  },
  productList: {
    type: 'productList',
    name: '商品列表',
    icon: 'ShopOutlined',
    category: 'product',
    defaultProps: { title: '商品推荐', displayCount: 6, categoryId: '', sortBy: 'sales', layout: 'grid2', showPrice: true },
  },
  categoryNav: {
    type: 'categoryNav',
    name: '分类导航',
    icon: 'MenuOutlined',
    category: 'product',
    defaultProps: { title: '商品分类', displayCount: 8, columns: 4 },
  },
  couponSection: {
    type: 'couponSection',
    name: '优惠券区',
    icon: 'GiftOutlined',
    category: 'marketing',
    defaultProps: { title: '领券中心', displayCount: 4 },
  },
  seckillSection: {
    type: 'seckillSection',
    name: '秒杀区',
    icon: 'ThunderboltOutlined',
    category: 'marketing',
    defaultProps: { title: '限时秒杀', displayCount: 4 },
  },
}

/** 组件属性配置Schema */
export const COMPONENT_CONFIG_SCHEMAS: Record<string, ComponentConfigSchema> = {
  carousel: {
    type: 'carousel',
    name: '轮播图配置',
    fields: [
      { key: 'height', label: '高度(px)', type: 'number', defaultValue: 200, min: 100, max: 500 },
      { key: 'autoplay', label: '自动播放', type: 'switch', defaultValue: true },
      { key: 'interval', label: '间隔(ms)', type: 'number', defaultValue: 3000, min: 1000, max: 10000, step: 500 },
      { key: 'borderRadius', label: '圆角(px)', type: 'number', defaultValue: 0, min: 0, max: 50 },
      { key: 'images', label: '轮播图片', type: 'array' },
    ],
  },
  notice: {
    type: 'notice',
    name: '公告栏配置',
    fields: [
      { key: 'text', label: '公告内容', type: 'textarea', defaultValue: '请输入公告内容' },
      { key: 'scrollable', label: '滚动显示', type: 'switch', defaultValue: true },
      { key: 'backgroundColor', label: '背景色', type: 'color', defaultValue: '#fff7e6' },
      { key: 'textColor', label: '字体颜色', type: 'color', defaultValue: '#333' },
    ],
  },
  searchBar: {
    type: 'searchBar',
    name: '搜索框配置',
    fields: [
      { key: 'placeholder', label: '占位文字', type: 'input', defaultValue: '搜索商品' },
      { key: 'shape', label: '形状', type: 'select', defaultValue: 'round', options: [{ label: '圆角', value: 'round' }, { label: '方形', value: 'square' }] },
      { key: 'backgroundColor', label: '背景色', type: 'color', defaultValue: '#ffffff' },
    ],
  },
  navBar: {
    type: 'navBar',
    name: '导航栏配置',
    fields: [
      { key: 'columns', label: '每行列数', type: 'select', defaultValue: 4, options: [{ label: '3列', value: 3 }, { label: '4列', value: 4 }, { label: '5列', value: 5 }] },
      { key: 'backgroundColor', label: '背景色', type: 'color', defaultValue: '#ffffff' },
      { key: 'items', label: '导航项', type: 'array' },
    ],
  },
  imageAd: {
    type: 'imageAd',
    name: '图片广告配置',
    fields: [
      { key: 'imageUrl', label: '图片地址', type: 'upload', defaultValue: '' },
      { key: 'link', label: '跳转链接', type: 'input', defaultValue: '' },
      { key: 'height', label: '高度(px)', type: 'number', defaultValue: 150, min: 50, max: 500 },
      { key: 'borderRadius', label: '圆角(px)', type: 'number', defaultValue: 0, min: 0, max: 50 },
    ],
  },
  titleBar: {
    type: 'titleBar',
    name: '标题栏配置',
    fields: [
      { key: 'title', label: '标题', type: 'input', defaultValue: '标题文本' },
      { key: 'subtitle', label: '副标题', type: 'input', defaultValue: '' },
      { key: 'align', label: '对齐', type: 'select', defaultValue: 'left', options: [{ label: '左对齐', value: 'left' }, { label: '居中', value: 'center' }, { label: '右对齐', value: 'right' }] },
      { key: 'showMore', label: '显示更多', type: 'switch', defaultValue: false },
      { key: 'moreLink', label: '更多链接', type: 'input', defaultValue: '' },
    ],
  },
  spacer: {
    type: 'spacer',
    name: '空白占位配置',
    fields: [
      { key: 'height', label: '高度(px)', type: 'slider', defaultValue: 20, min: 5, max: 100 },
      { key: 'backgroundColor', label: '背景色', type: 'color', defaultValue: '#f5f5f5' },
    ],
  },
  richText: {
    type: 'richText',
    name: '富文本配置',
    fields: [
      { key: 'content', label: '内容', type: 'richtext', defaultValue: '<p>请输入内容</p>' },
      { key: 'padding', label: '内边距(px)', type: 'number', defaultValue: 12, min: 0, max: 50 },
    ],
  },
  productList: {
    type: 'productList',
    name: '商品列表配置',
    fields: [
      { key: 'title', label: '标题', type: 'input', defaultValue: '商品推荐' },
      { key: 'displayCount', label: '显示数量', type: 'number', defaultValue: 6, min: 2, max: 20 },
      { key: 'layout', label: '排列方式', type: 'select', defaultValue: 'grid2', options: [{ label: '两列', value: 'grid2' }, { label: '三列', value: 'grid3' }, { label: '列表', value: 'list' }] },
      { key: 'sortBy', label: '排序方式', type: 'select', defaultValue: 'sales', options: [{ label: '销量', value: 'sales' }, { label: '价格', value: 'price' }, { label: '最新', value: 'newest' }] },
      { key: 'showPrice', label: '显示价格', type: 'switch', defaultValue: true },
    ],
  },
  categoryNav: {
    type: 'categoryNav',
    name: '分类导航配置',
    fields: [
      { key: 'title', label: '标题', type: 'input', defaultValue: '商品分类' },
      { key: 'displayCount', label: '显示数量', type: 'number', defaultValue: 8, min: 2, max: 20 },
      { key: 'columns', label: '每行列数', type: 'select', defaultValue: 4, options: [{ label: '3列', value: 3 }, { label: '4列', value: 4 }, { label: '5列', value: 5 }] },
    ],
  },
  couponSection: {
    type: 'couponSection',
    name: '优惠券区配置',
    fields: [
      { key: 'title', label: '标题', type: 'input', defaultValue: '领券中心' },
      { key: 'displayCount', label: '显示数量', type: 'number', defaultValue: 4, min: 1, max: 10 },
    ],
  },
  seckillSection: {
    type: 'seckillSection',
    name: '秒杀区配置',
    fields: [
      { key: 'title', label: '标题', type: 'input', defaultValue: '限时秒杀' },
      { key: 'displayCount', label: '显示数量', type: 'number', defaultValue: 4, min: 1, max: 10 },
    ],
  },
}
