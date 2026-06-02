import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '用户名',
    dataIndex: 'userName',
    width: 120,
    align: 'left',
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    width: 200,
    align: 'left',
    ellipsis: true,
  },
  {
    title: '变动类型',
    dataIndex: 'pointsType',
    width: 100,
    customRender: ({ text }) => {
      const labels: Record<number, any> = {
        1: { l: '购物获得', c: 'green' },
        2: { l: '签到获得', c: 'green' },
        3: { l: '任务获得', c: 'green' },
        4: { l: '兑换消耗', c: 'red' },
        5: { l: '退款退回', c: 'orange' },
      };
      const item = labels[text];
      return item ? h(Tag, { color: item.c }, () => item.l) : '-';
    },
  },
  {
    title: '积分值',
    dataIndex: 'pointsValue',
    width: 100,
  },
  {
    title: '总积分',
    dataIndex: 'balanceAfter',
    width: 100,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 150,
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
    label: '用户ID',
    field: 'userId',
    component: 'Input',
    componentProps: {
      placeholder: '请输入用户ID',
    },
  },
  {
    label: '变动类型',
    field: 'pointsType',
    component: 'Select',
    componentProps: {
      placeholder: '请选择类型',
      options: [
        { label: '全部', value: '' },
        { label: '购物获得', value: 1 },
        { label: '签到获得', value: 2 },
        { label: '任务获得', value: 3 },
        { label: '兑换消耗', value: 4 },
        { label: '退款退回', value: 5 },
      ],
    },
  },
];

export const formSchema: FormSchema[] = [
  { label: 'ID', field: 'id', component: 'Input', show: false },
  { label: '用户ID', field: 'userId', component: 'Input', required: true },
  {
    label: '变动类型', field: 'pointsType', component: 'RadioGroup', required: true,
    componentProps: {
      options: [
        { label: '购物获得', value: 1 },
        { label: '签到获得', value: 2 },
        { label: '任务获得', value: 3 },
        { label: '兑换消耗', value: 4 },
        { label: '退款退回', value: 5 },
      ],
    },
  },
  { label: '积分值', field: 'pointsValue', component: 'InputNumber', required: true },
  { label: '总积分', field: 'balanceAfter', component: 'InputNumber', required: true },
  { label: '来源ID', field: 'sourceId', component: 'Input' },
  { label: '备注', field: 'remark', component: 'Textarea', componentProps: { rows: 2 } },
];
