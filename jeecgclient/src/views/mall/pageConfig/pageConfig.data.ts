import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '页面名称',
    dataIndex: 'pageName',
    width: 150,
    align: 'left',
  },
  {
    title: '页面类型',
    dataIndex: 'pageType',
    width: 100,
    customRender: ({ text }) => {
      const map = { 1: '首页', 2: '分类页', 3: '活动页', 4: '自定义页' };
      return map[text] || '未知';
    },
  },
  {
    title: '终端类型',
    dataIndex: 'terminalType',
    width: 100,
    customRender: ({ text }) => {
      const map = { 1: '小程序', 2: 'H5', 3: 'APP' };
      return map[text] || '未知';
    },
  },
  {
    title: '关联模板',
    dataIndex: 'templateId',
    width: 150,
    ellipsis: true,
  },
  {
    title: '发布状态',
    dataIndex: 'publishStatus',
    width: 100,
    customRender: ({ text }) => {
      return text === 1
        ? h(Tag, { color: 'green' }, () => '已发布')
        : h(Tag, { color: 'orange' }, () => '草稿');
    },
  },
  {
    title: '发布时间',
    dataIndex: 'publishTime',
    width: 170,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 170,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '页面名称',
    field: 'pageName',
    component: 'Input',
  },
  {
    label: '页面类型',
    field: 'pageType',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '首页', value: 1 },
        { label: '分类页', value: 2 },
        { label: '活动页', value: 3 },
        { label: '自定义页', value: 4 },
      ],
    },
  },
  {
    label: '发布状态',
    field: 'publishStatus',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '已发布', value: 1 },
        { label: '草稿', value: 0 },
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
    label: '页面名称',
    field: 'pageName',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入页面名称',
    },
  },
  {
    label: '页面类型',
    field: 'pageType',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '首页', value: 1 },
        { label: '分类页', value: 2 },
        { label: '活动页', value: 3 },
        { label: '自定义页', value: 4 },
      ],
      placeholder: '请选择页面类型',
    },
  },
  {
    label: '终端类型',
    field: 'terminalType',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '小程序', value: 1 },
        { label: 'H5', value: 2 },
        { label: 'APP', value: 3 },
      ],
      placeholder: '请选择终端类型',
    },
  },
  {
    label: '关联模板',
    field: 'templateId',
    component: 'Select',
    componentProps: {
      placeholder: '选择页面模板',
    },
  },
  {
    label: '页面配置JSON',
    field: 'pageData',
    component: 'InputTextArea',
    colProps: { span: 24 },
    componentProps: {
      placeholder: '编辑页面布局JSON',
      rows: 12,
    },
  },
  {
    label: '发布状态',
    field: 'publishStatus',
    component: 'Select',
    defaultValue: 0,
    componentProps: {
      options: [
        { label: '草稿', value: 0 },
        { label: '已发布', value: 1 },
      ],
      disabled: true,
    },
    helpMessage: '发布状态在列表页通过"发布/取消发布"按钮操作',
  },
];
