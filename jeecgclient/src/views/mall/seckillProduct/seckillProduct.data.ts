import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

const nameMap: Record<string, string> = {}

export function setNameMap(map: Record<string, string>) { Object.assign(nameMap, map) }

export const columns: BasicColumn[] = [
  {
    title: '活动',
    dataIndex: 'activityId', width: 150,
    customRender: ({ text }) => nameMap['a_' + text] || text || '-',
  },
  {
    title: '商品名称',
    dataIndex: 'spuId', width: 180,
    customRender: ({ text }) => nameMap['s_' + text] || text || '-',
  },
  {
    title: 'SKU',
    dataIndex: 'skuId', width: 120,
    customRender: ({ text }) => nameMap['k_' + text] || text || '-',
  },
  {
    title: '秒杀价',
    dataIndex: 'seckillPrice',
    width: 120,
    customRender: ({ text }) => {
      return h('span', { style: { color: 'red', fontWeight: 'bold' } }, text);
    },
  },
  {
    title: '库存',
    dataIndex: 'stock',
    width: 80,
  },
  {
    title: '限购',
    dataIndex: 'limitPerUser',
    width: 80,
  },
  {
    title: '已售',
    dataIndex: 'soldCount',
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
    label: '活动ID',
    field: 'activityId',
    component: 'Input',
    componentProps: {
      placeholder: '请输入活动ID',
    },
  },
  {
    label: 'SPU ID',
    field: 'spuId',
    component: 'Input',
    componentProps: {
      placeholder: '请输入SPU ID',
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
    label: '活动ID',
    field: 'activityId',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入活动ID',
    },
  },
  {
    label: 'SPU ID',
    field: 'spuId',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入SPU ID',
    },
  },
  {
    label: 'SKU ID',
    field: 'skuId',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入SKU ID',
    },
  },
  {
    label: '秒杀价格',
    field: 'seckillPrice',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '请输入秒杀价格',
      min: 0,
    },
  },
  {
    label: '秒杀库存',
    field: 'stock',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '请输入库存数量',
      min: 0,
    },
  },
  {
    label: '限购数量',
    field: 'limitPerUser',
    component: 'InputNumber',
    defaultValue: 1,
    componentProps: {
      placeholder: '请输入限购数量',
      min: 1,
    },
  },
];
