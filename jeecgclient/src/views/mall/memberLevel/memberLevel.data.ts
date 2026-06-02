import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '等级名称',
    dataIndex: 'levelName',
    width: 150,
    align: 'left',
  },
  {
    title: '等级编码',
    dataIndex: 'levelCode',
    width: 120,
  },
  {
    title: '最低积分',
    dataIndex: 'minPoints',
    width: 100,
  },
  {
    title: '最高积分',
    dataIndex: 'maxPoints',
    width: 100,
  },
  {
    title: '折扣率',
    dataIndex: 'discountRate',
    width: 100,
    customRender: ({ text }) => {
      if (text != null) {
        return (text * 100).toFixed(0) + '%';
      }
      return '-';
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
    title: '排序',
    dataIndex: 'sortOrder',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 170,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '等级名称',
    field: 'levelName',
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
    label: '等级名称',
    field: 'levelName',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入等级名称',
    },
  },
  {
    label: '等级编码',
    field: 'levelCode',
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入等级编码',
    },
  },
  {
    label: '最低积分',
    field: 'minPoints',
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入最低积分',
      min: 0,
    },
  },
  {
    label: '最高积分',
    field: 'maxPoints',
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入最高积分',
      min: 0,
    },
  },
  {
    label: '折扣率',
    field: 'discountRate',
    component: 'InputNumber',
    componentProps: {
      placeholder: '如0.95表示95折',
      min: 0,
      max: 1,
      step: 0.01,
    },
    helpMessage: '取值范围0-1，如0.95表示95折',
  },
  {
    label: '等级权益',
    field: 'benefits',
    component: 'Textarea',
    componentProps: {
      placeholder: '请输入等级权益说明',
      rows: 3,
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
    label: '排序',
    field: 'sortOrder',
    component: 'InputNumber',
    defaultValue: 0,
  },
];
