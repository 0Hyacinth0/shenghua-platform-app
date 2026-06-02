import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '任务名称',
    dataIndex: 'taskName',
    width: 200,
    align: 'left',
  },
  {
    title: '任务类型',
    dataIndex: 'taskType',
    width: 120,
    customRender: ({ text }) => {
      if (text === 1) {
        return h(Tag, { color: 'blue' }, () => '每日任务');
      } else if (text === 2) {
        return h(Tag, { color: 'orange' }, () => '一次性任务');
      } else if (text === 3) {
        return h(Tag, { color: 'purple' }, () => '周期任务');
      }
      return '-';
    },
  },
  {
    title: '积分奖励',
    dataIndex: 'pointsReward',
    width: 100,
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
    label: '任务名称',
    field: 'taskName',
    component: 'Input',
    componentProps: {
      placeholder: '请输入任务名称',
    },
  },
  {
    label: '任务类型',
    field: 'taskType',
    component: 'Select',
    componentProps: {
      placeholder: '请选择任务类型',
      options: [
        { label: '全部', value: '' },
        { label: '每日任务', value: 1 },
        { label: '一次性任务', value: 2 },
        { label: '周期任务', value: 3 },
      ],
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
        { label: '启用', value: 1 },
        { label: '停用', value: 0 },
      ],
    },
  },
];

const taskTypeOptions = [
  { label: '每日任务', value: 1 },
  { label: '一次性任务', value: 2 },
  { label: '周期任务', value: 3 },
];

export const formSchema: FormSchema[] = [
  {
    label: 'ID',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '任务名称',
    field: 'taskName',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入任务名称',
    },
  },
  {
    label: '任务类型',
    field: 'taskType',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options: taskTypeOptions,
    },
    defaultValue: 1,
  },
  {
    label: '积分奖励',
    field: 'pointsReward',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '请输入奖励积分',
      min: 0,
    },
    defaultValue: 10,
  },
  {
    label: '任务配置',
    field: 'taskConfig',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入任务配置(JSON格式)',
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
      unCheckedChildren: '停用',
      checkedValue: 1,
      unCheckedValue: 0,
    },
  },
];
