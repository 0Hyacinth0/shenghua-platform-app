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
    title: '开始时间',
    dataIndex: 'startTime',
    width: 180,
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    width: 180,
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
    label: '开始时间',
    field: 'startTime',
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: true,
      placeholder: '请选择开始时间',
    },
  },
  {
    label: '结束时间',
    field: 'endTime',
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: true,
      placeholder: '请选择结束时间',
    },
  },
];
