import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '品牌名称',
    dataIndex: 'brandName',
    width: 150,
    align: 'left',
  },
  {
    title: 'Logo',
    dataIndex: 'brandLogo',
    width: 80,
    customRender: ({ text }) => {
      if (text) {
        return h('img', { src: text, style: { width: '40px', height: '40px', objectFit: 'contain' } });
      }
      return '-';
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
    label: '品牌名称',
    field: 'brandName',
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
    label: '品牌名称',
    field: 'brandName',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入品牌名称',
    },
  },
  {
    label: '品牌Logo',
    field: 'brandLogo',
    component: 'Input',
    componentProps: {
      placeholder: '请输入Logo图片URL',
    },
    helpMessage: '输入品牌Logo图片的URL地址',
  },
  {
    label: '品牌故事',
    field: 'brandStory',
    component: 'Textarea',
    componentProps: {
      placeholder: '请输入品牌故事描述',
      rows: 4,
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
