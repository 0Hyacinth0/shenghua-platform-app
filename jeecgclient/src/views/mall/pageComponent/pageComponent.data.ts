import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '组件名称',
    dataIndex: 'componentName',
    width: 150,
    align: 'left',
  },
  {
    title: '组件类型',
    dataIndex: 'componentType',
    width: 130,
    customRender: ({ text }) => {
      return h(Tag, { color: 'blue' }, () => text || '-');
    },
  },
  {
    title: '组件图标',
    dataIndex: 'componentIcon',
    width: 100,
    customRender: ({ text }) => {
      return text || '-';
    },
  },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ text }) => {
      return text === 1
        ? h(Tag, { color: 'green' }, () => '启用')
        : h(Tag, { color: 'red' }, () => '禁用');
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 170,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '组件名称',
    field: 'componentName',
    component: 'Input',
  },
  {
    label: '组件类型',
    field: 'componentType',
    component: 'Input',
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    label: 'ID',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '组件名称',
    field: 'componentName',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入组件名称',
    },
  },
  {
    label: '组件类型',
    field: 'componentType',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '轮播图', value: 'carousel' },
        { label: '商品列表', value: 'productList' },
        { label: '分类导航', value: 'categoryNav' },
        { label: '搜索栏', value: 'searchBar' },
        { label: '优惠券', value: 'coupon' },
        { label: '秒杀', value: 'seckill' },
        { label: '图文导航', value: 'imageNav' },
        { label: '公告栏', value: 'notice' },
        { label: '其他', value: 'other' },
      ],
      placeholder: '请选择组件类型',
    },
  },
  {
    label: '组件图标',
    field: 'componentIcon',
    component: 'Input',
    componentProps: {
      placeholder: '请输入图标名称或URL',
    },
  },
  {
    label: '组件Schema',
    field: 'componentSchema',
    component: 'Textarea',
    componentProps: {
      placeholder: '请输入组件配置Schema JSON',
      rows: 8,
    },
  },
  {
    label: '排序',
    field: 'sortOrder',
    component: 'InputNumber',
    defaultValue: 0,
  },
  {
    label: '状态',
    field: 'status',
    component: 'Switch',
    defaultValue: 1,
    componentProps: {
      checkedChildren: '启用',
      unCheckedChildren: '禁用',
      checkedValue: 1,
      unCheckedValue: 0,
    },
  },
];
