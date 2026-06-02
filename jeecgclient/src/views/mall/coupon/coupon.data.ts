import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '券名',
    dataIndex: 'couponName',
    width: 150,
    align: 'left',
  },
  {
    title: '类型',
    dataIndex: 'couponType',
    width: 100,
    customRender: ({ text }) => {
      if (text === 1) {
        return h(Tag, { color: 'blue' }, () => '满减');
      } else if (text === 2) {
        return h(Tag, { color: 'purple' }, () => '折扣');
      } else if (text === 3) {
        return h(Tag, { color: 'orange' }, () => '运费');
      }
      return '-';
    },
  },
  {
    title: '优惠值',
    dataIndex: 'discountValue',
    width: 100,
  },
  {
    title: '最低消费',
    dataIndex: 'minPurchaseAmount',
    width: 100,
  },
  {
    title: '已发/总量',
    dataIndex: 'receivedCount',
    width: 140,
    customRender: ({ record }) => {
      const issued = record.receivedCount || 0;
      const total = record.totalCount || 0;
      const limit = record.limitPerUser || 1;
      return `已领 ${issued}/${total}  每人${limit}张`;
    },
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
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ text }) => {
      return text === 1
        ? h(Tag, { color: 'green' }, () => '启用')
        : h(Tag, { color: 'red' }, () => '停用');
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
    label: '券名',
    field: 'couponName',
    component: 'Input',
  },
  {
    label: '类型',
    field: 'couponType',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '满减', value: 1 },
        { label: '折扣', value: 2 },
        { label: '运费', value: 3 },
      ],
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 1 },
        { label: '停用', value: 0 },
      ],
    },
  },
];

const couponTypeOptions = [
  { label: '满减', value: 1 },
  { label: '折扣', value: 2 },
  { label: '运费', value: 3 },
];

export const formSchema: FormSchema[] = [
  {
    label: 'ID',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '优惠券名称',
    field: 'couponName',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入优惠券名称',
    },
  },
  {
    label: '优惠券类型',
    field: 'couponType',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options: couponTypeOptions,
    },
    defaultValue: 1,
  },
  {
    label: '优惠值',
    field: 'discountValue',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '满减填金额，折扣填0.9(9折)，运费填0',
      min: 0,
      step: 0.01,
      precision: 2,
    },
  },
  {
    label: '最低消费金额',
    field: 'minPurchaseAmount',
    component: 'InputNumber',
    defaultValue: 0,
    componentProps: {
      placeholder: '订单满多少可用',
      min: 0,
    },
  },
  {
    label: '最大优惠金额',
    field: 'maxDiscountAmount',
    component: 'InputNumber',
    componentProps: {
      placeholder: '折扣券上限金额',
      min: 0,
    },
  },
  {
    label: '发放总量',
    field: 'totalCount',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '可领取总数',
      min: 1,
    },
  },
  {
    label: '每人限领',
    field: 'limitPerUser',
    component: 'InputNumber',
    defaultValue: 1,
    componentProps: {
      min: 1,
      max: 3,
      placeholder: '1-3张',
    },
  },
  {
    label: '有效期开始',
    field: 'startTime',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      placeholder: '开始时间',
    },
  },
  {
    label: '有效期结束',
    field: 'endTime',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      placeholder: '结束时间',
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Switch',
    defaultValue: 1,
    componentProps: {
      checkedChildren: '启用',
      unCheckedChildren: '停用',
      checkedValue: 1,
      unCheckedValue: 0,
    },
  },
];
