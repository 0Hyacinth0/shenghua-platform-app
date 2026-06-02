import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '订单ID',
    dataIndex: 'orderId',
    width: 200,
    align: 'left',
  },
  {
    title: '分销商ID',
    dataIndex: 'distributorId',
    width: 200,
  },
  {
    title: '佣金金额',
    dataIndex: 'commissionAmount',
    width: 120,
  },
  {
    title: '佣金比例',
    dataIndex: 'commissionRate',
    width: 100,
    customRender: ({ text }) => {
      if (text != null) {
        return (text * 100).toFixed(0) + '%';
      }
      return '-';
    },
  },
  {
    title: '类型',
    dataIndex: 'commissionType',
    width: 80,
    customRender: ({ text }) => {
      return text === 1
        ? h(Tag, { color: 'red' }, () => '一级')
        : h(Tag, { color: 'blue' }, () => '二级');
    },
  },
  {
    title: '结算状态',
    dataIndex: 'settleStatus',
    width: 100,
    customRender: ({ text }) => {
      const map: Record<number, { label: string; color: string }> = {
        0: { label: '待结算', color: 'orange' },
        1: { label: '已结算', color: 'green' },
        2: { label: '已取消', color: 'gray' },
      };
      const item = map[text] || { label: '未知', color: 'default' };
      return h(Tag, { color: item.color }, () => item.label);
    },
  },
  {
    title: '结算时间',
    dataIndex: 'settleTime',
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
    label: '订单ID',
    field: 'orderId',
    component: 'Input',
  },
  {
    label: '结算状态',
    field: 'settleStatus',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '待结算', value: 0 },
        { label: '已结算', value: 1 },
        { label: '已取消', value: 2 },
      ],
    },
  },
  {
    label: '佣金类型',
    field: 'commissionType',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '一级', value: 1 },
        { label: '二级', value: 2 },
      ],
    },
  },
];
