import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '用户ID',
    dataIndex: 'userId',
    width: 200,
    align: 'left',
  },
  {
    title: '任务ID',
    dataIndex: 'taskId',
    width: 200,
    align: 'left',
  },
  {
    title: '任务名称',
    dataIndex: 'taskName',
    width: 200,
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
    title: '获得积分',
    dataIndex: 'pointsEarned',
    width: 100,
  },
  {
    title: '完成时间',
    dataIndex: 'completeTime',
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
    label: '用户ID',
    field: 'userId',
    component: 'Input',
    componentProps: {
      placeholder: '请输入用户ID',
    },
  },
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
];

export const formSchema: FormSchema[] = [];
