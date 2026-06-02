import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '订单号',
    dataIndex: 'orderNo',
    width: 200,
    align: 'left',
  },
  {
    title: '订单状态',
    dataIndex: 'orderStatus',
    width: 100,
    customRender: ({ text }) => {
      const statusMap: Record<number, { label: string; color: string }> = {
        0: { label: '待付款', color: 'orange' },
        1: { label: '待发货', color: 'blue' },
        2: { label: '已发货', color: 'cyan' },
        3: { label: '已完成', color: 'green' },
        4: { label: '已取消', color: 'default' },
        5: { label: '退款中', color: 'purple' },
        6: { label: '已退款', color: 'red' },
      };
      const item = statusMap[text] || { label: '未知', color: 'default' };
      return h(Tag, { color: item.color }, () => item.label);
    },
  },
  {
    title: '实付金额',
    dataIndex: 'payAmount',
    width: 120,
    customRender: ({ text }) => {
      return text != null ? '￥' + text : '-';
    },
  },
  {
    title: '收货人',
    dataIndex: 'receiverName',
    width: 100,
  },
  {
    title: '收货人电话',
    dataIndex: 'receiverPhone',
    width: 130,
  },
  {
    title: '支付方式',
    dataIndex: 'payType',
    width: 100,
    customRender: ({ text }) => {
      const map: Record<number, string> = { 1: '微信', 2: '支付宝', 3: '银联' };
      return map[text] || '未知';
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '订单号',
    field: 'orderNo',
    component: 'Input',
  },
  {
    label: '订单状态',
    field: 'orderStatus',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '待付款', value: 0 },
        { label: '待发货', value: 1 },
        { label: '已发货', value: 2 },
        { label: '已完成', value: 3 },
        { label: '已取消', value: 4 },
        { label: '退款中', value: 5 },
        { label: '已退款', value: 6 },
      ],
    },
  },
];

export const formSchema: FormSchema[] = [];
