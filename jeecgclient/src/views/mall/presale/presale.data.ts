import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '活动名称',
    dataIndex: 'activityName',
    width: 200,
    align: 'left',
  },
  {
    title: '商品SPU ID',
    dataIndex: 'spuId',
    width: 200,
  },
  {
    title: '预售价格',
    dataIndex: 'presalePrice',
    width: 120,
    customRender: ({ text }) => {
      return text != null ? '￥' + text : '-';
    },
  },
  {
    title: '定金金额',
    dataIndex: 'depositAmount',
    width: 120,
    customRender: ({ text }) => {
      return text != null ? '￥' + text : '-';
    },
  },
  {
    title: '预售开始',
    dataIndex: 'presaleStartTime',
    width: 170,
  },
  {
    title: '预售结束',
    dataIndex: 'presaleEndTime',
    width: 170,
  },
  {
    title: '尾款支付开始',
    dataIndex: 'finalPaymentStartTime',
    width: 170,
  },
  {
    title: '尾款支付结束',
    dataIndex: 'finalPaymentEndTime',
    width: 170,
  },
  {
    title: '预计发货',
    dataIndex: 'shipTime',
    width: 170,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => {
      if (text === 0) {
        return h(Tag, { color: 'orange' }, () => '未开始');
      } else if (text === 1) {
        return h(Tag, { color: 'green' }, () => '进行中');
      } else if (text === 2) {
        return h(Tag, { color: 'default' }, () => '已结束');
      }
      return '-';
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
    label: '活动名称',
    field: 'activityName',
    component: 'Input',
    componentProps: {
      placeholder: '请输入活动名称',
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      options: [
        { label: '全部', value: '' },
        { label: '未开始', value: 0 },
        { label: '进行中', value: 1 },
        { label: '已结束', value: 2 },
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
    label: '活动名称',
    field: 'activityName',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入活动名称',
    },
  },
  {
    label: '商品SPU ID',
    field: 'spuId',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入商品SPU ID',
    },
  },
  {
    label: '预售价格',
    field: 'presalePrice',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '请输入预售价格',
      min: 0,
      step: 0.01,
      precision: 2,
    },
  },
  {
    label: '定金金额',
    field: 'depositAmount',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '请输入定金金额',
      min: 0,
      step: 0.01,
      precision: 2,
    },
  },
  {
    label: '预售开始时间',
    field: 'presaleStartTime',
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: true,
      placeholder: '请选择预售开始时间',
    },
  },
  {
    label: '预售结束时间',
    field: 'presaleEndTime',
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: true,
      placeholder: '请选择预售结束时间',
    },
  },
  {
    label: '尾款支付开始时间',
    field: 'finalPaymentStartTime',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      placeholder: '请选择尾款支付开始时间',
    },
  },
  {
    label: '尾款支付结束时间',
    field: 'finalPaymentEndTime',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      placeholder: '请选择尾款支付结束时间',
    },
  },
  {
    label: '预计发货时间',
    field: 'shipTime',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      placeholder: '请选择预计发货时间',
    },
  },
];
