import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '分类ID',
    dataIndex: 'categoryId',
    width: 120,
    customRender: ({ text }) => {
      return text || '全局';
    },
  },
  {
    title: '抽成比例',
    dataIndex: 'commissionRate',
    width: 120,
    customRender: ({ text }) => {
      if (text != null) {
        return (text * 100).toFixed(2) + '%';
      }
      return '-';
    },
  },
  {
    title: '最低抽成',
    dataIndex: 'minCommission',
    width: 100,
    customRender: ({ text }) => {
      return text != null ? '￥' + text : '-';
    },
  },
  {
    title: '最高抽成',
    dataIndex: 'maxCommission',
    width: 100,
    customRender: ({ text }) => {
      return text != null ? '￥' + text : '-';
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
    title: '备注',
    dataIndex: 'remark',
    width: 200,
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 170,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '分类ID',
    field: 'categoryId',
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
    label: '分类ID',
    field: 'categoryId',
    component: 'Input',
    componentProps: {
      placeholder: '留空表示全局抽成配置',
    },
    helpMessage: '关联的商品分类ID，留空则为全局默认抽成规则',
  },
  {
    label: '抽成比例',
    field: 'commissionRate',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '如0.05表示5%',
      min: 0,
      max: 1,
      step: 0.01,
    },
    helpMessage: '取值范围0-1，如0.05表示抽成5%',
  },
  {
    label: '最低抽成(元)',
    field: 'minCommission',
    component: 'InputNumber',
    componentProps: {
      placeholder: '单笔最低抽成金额',
      min: 0,
      step: 0.01,
    },
  },
  {
    label: '最高抽成(元)',
    field: 'maxCommission',
    component: 'InputNumber',
    componentProps: {
      placeholder: '单笔最高抽成金额',
      min: 0,
      step: 0.01,
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
  {
    label: '备注',
    field: 'remark',
    component: 'Textarea',
    componentProps: {
      placeholder: '请输入备注信息',
      rows: 3,
    },
  },
];
