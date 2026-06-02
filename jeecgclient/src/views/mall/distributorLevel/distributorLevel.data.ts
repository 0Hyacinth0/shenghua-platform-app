import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  { title: '等级名称', dataIndex: 'levelName', width: 150 },
  { title: '排序', dataIndex: 'levelSort', width: 80, sorter: true, defaultSortOrder: 'ascend' },
  { title: '一级佣金(%)', dataIndex: 'commissionRate1', width: 120 },
  { title: '二级佣金(%)', dataIndex: 'commissionRate2', width: 120 },
  { title: '升级条件', dataIndex: 'upgradeCondition', width: 200, ellipsis: true },
  { title: '创建时间', dataIndex: 'createTime', width: 170 },
];

export const searchFormSchema: FormSchema[] = [
  { label: '等级名称', field: 'levelName', component: 'Input' },
];

export const formSchema: FormSchema[] = [
  {
    label: '等级名称', field: 'levelName', component: 'Input', required: true,
    componentProps: { placeholder: '如：金牌分销商' },
  },
  {
    label: '排序', field: 'levelSort', component: 'InputNumber',
    componentProps: { min: 0 },
  },
  {
    label: '一级佣金比例(%)', field: 'commissionRate1', component: 'InputNumber', required: true,
    componentProps: { min: 0, max: 100, step: 0.01, placeholder: '如10表示10%' },
  },
  {
    label: '二级佣金比例(%)', field: 'commissionRate2', component: 'InputNumber', required: true,
    componentProps: { min: 0, max: 100, step: 0.01, placeholder: '如5表示5%' },
  },
  {
    label: '升级条件', field: 'upgradeCondition', component: 'Textarea',
    componentProps: { placeholder: '如：累计佣金满1000元', rows: 2 },
  },
  {
    label: '图标', field: 'icon', component: 'Input',
    componentProps: { placeholder: '图标URL' },
  },
  {
    label: '说明', field: 'description', component: 'Textarea',
    componentProps: { placeholder: '等级说明', rows: 3 },
  },
];
