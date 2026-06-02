import { BasicColumn, FormSchema } from '/@/components/Table';

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
    title: '签到日期',
    dataIndex: 'signDate',
    width: 130,
  },
  {
    title: '连续签到天数',
    dataIndex: 'continuousDays',
    width: 130,
  },
  {
    title: '获得积分',
    dataIndex: 'pointsEarned',
    width: 100,
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
    componentProps: { placeholder: '请输入用户ID' },
  },
  {
    label: '签到日期',
    field: 'signDate',
    component: 'DatePicker',
    componentProps: { placeholder: '请选择签到日期' },
  },
];

export const formSchema: FormSchema[] = [
  { label: 'ID', field: 'id', component: 'Input', show: false },
  { label: '用户ID', field: 'userId', component: 'Input', required: true },
  {
    label: '签到日期', field: 'signDate', component: 'DatePicker', required: true,
    componentProps: { valueFormat: 'YYYY-MM-DD' },
  },
  { label: '连续天数', field: 'continuousDays', component: 'InputNumber', required: true },
  { label: '获得积分', field: 'pointsEarned', component: 'InputNumber', required: true },
];
