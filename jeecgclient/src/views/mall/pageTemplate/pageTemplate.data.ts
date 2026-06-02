import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag, Image } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '模板名称',
    dataIndex: 'templateName',
    width: 150,
    align: 'left',
  },
  {
    title: '模板类型',
    dataIndex: 'templateType',
    width: 100,
    customRender: ({ text }) => {
      const map = { 1: '首页', 2: '分类页', 3: '活动页' };
      return h(Tag, { color: 'blue' }, () => map[text] || '未知');
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
    title: '预览图',
    dataIndex: 'previewImage',
    width: 100,
    customRender: ({ text }) => {
      if (text) {
        return h(Image, { src: text, width: 60, style: { borderRadius: '4px' } });
      }
      return '-';
    },
  },
  {
    title: '是否默认',
    dataIndex: 'isDefault',
    width: 80,
    customRender: ({ text }) => {
      return text === 1
        ? h(Tag, { color: 'green' }, () => '是')
        : h(Tag, { color: 'default' }, () => '否');
    },
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
    label: '模板名称',
    field: 'templateName',
    component: 'Input',
  },
  {
    label: '模板类型',
    field: 'templateType',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '首页', value: 1 },
        { label: '分类页', value: 2 },
        { label: '活动页', value: 3 },
      ],
    },
  },
  {
    label: '终端类型',
    field: 'terminalType',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '小程序', value: 1 },
        { label: 'H5', value: 2 },
        { label: 'APP', value: 3 },
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
    label: '模板名称',
    field: 'templateName',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入模板名称',
    },
  },
  {
    label: '模板类型',
    field: 'templateType',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '首页', value: 1 },
        { label: '分类页', value: 2 },
        { label: '活动页', value: 3 },
      ],
      placeholder: '请选择模板类型',
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
    label: '预览图片',
    field: 'previewImage',
    component: 'Input',
    componentProps: {
      placeholder: '请输入预览图片URL',
    },
  },
  {
    label: '模板数据',
    field: 'templateData',
    component: 'Textarea',
    componentProps: {
      placeholder: '请输入模板数据JSON',
      rows: 8,
    },
  },
  {
    label: '是否默认',
    field: 'isDefault',
    component: 'Switch',
    defaultValue: 0,
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
      checkedValue: 1,
      unCheckedValue: 0,
    },
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
