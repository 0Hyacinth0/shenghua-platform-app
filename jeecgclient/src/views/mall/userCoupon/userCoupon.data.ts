import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '券码',
    dataIndex: 'couponCode',
    width: 180,
    align: 'left',
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    width: 200,
  },
  {
    title: '模板ID',
    dataIndex: 'templateId',
    width: 200,
  },
  {
    title: '状态',
    dataIndex: 'couponStatus',
    width: 100,
    customRender: ({ text }) => {
      if (text === 0) {
        return h(Tag, { color: 'blue' }, () => '未使用');
      } else if (text === 1) {
        return h(Tag, { color: 'default' }, () => '已使用');
      } else if (text === 2) {
        return h(Tag, { color: 'red' }, () => '已过期');
      }
      return '-';
    },
  },
  {
    title: '使用时间',
    dataIndex: 'useTime',
    width: 170,
  },
  {
    title: '有效期',
    dataIndex: 'startTime',
    width: 220,
    customRender: ({ record }) => {
      return `${record.startTime || '-'} ~ ${record.endTime || '-'}`;
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
    label: '券码',
    field: 'couponCode',
    component: 'Input',
  },
  {
    label: '用户ID',
    field: 'userId',
    component: 'Input',
  },
  {
    label: '状态',
    field: 'couponStatus',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '未使用', value: 0 },
        { label: '已使用', value: 1 },
        { label: '已过期', value: 2 },
      ],
    },
  },
];

export const detailFormSchema: FormSchema[] = [
  {
    label: '券码',
    field: 'couponCode',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '用户ID',
    field: 'userId',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '模板ID',
    field: 'templateId',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '使用状态',
    field: 'couponStatus',
    component: 'Select',
    componentProps: {
      disabled: true,
      options: [
        { label: '未使用', value: 0 },
        { label: '已使用', value: 1 },
        { label: '已过期', value: 2 },
      ],
    },
  },
  {
    label: '使用时间',
    field: 'useTime',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '关联订单ID',
    field: 'orderId',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '有效期开始',
    field: 'startTime',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '有效期结束',
    field: 'endTime',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '创建时间',
    field: 'createTime',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
];
