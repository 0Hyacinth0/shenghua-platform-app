import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '活动名称',
    dataIndex: 'activityName',
    width: 150,
    ellipsis: true,
  },
  {
    title: '团长',
    dataIndex: 'userName',
    width: 100,
  },
  {
    title: '团长ID',
    dataIndex: 'leaderUserId',
    width: 180,
    ellipsis: true,
  },
  {
    title: '当前参团人数',
    dataIndex: 'currentCount',
    width: 120,
  },
  {
    title: '拼团状态',
    dataIndex: 'groupStatus',
    width: 100,
    customRender: ({ text }) => {
      if (text === 0) {
        return h(Tag, { color: 'blue' }, () => '进行中');
      } else if (text === 1) {
        return h(Tag, { color: 'green' }, () => '已成团');
      } else if (text === 2) {
        return h(Tag, { color: 'red' }, () => '已失败');
      }
      return '-';
    },
  },
  {
    title: '过期时间',
    dataIndex: 'expireTime',
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
    label: '活动ID',
    field: 'activityId',
    component: 'Input',
    componentProps: {
      placeholder: '请输入活动ID',
    },
  },
  {
    label: '团长用户ID',
    field: 'leaderUserId',
    component: 'Input',
    componentProps: {
      placeholder: '请输入团长用户ID',
    },
  },
  {
    label: '拼团状态',
    field: 'groupStatus',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      options: [
        { label: '全部', value: '' },
        { label: '进行中', value: 0 },
        { label: '已成团', value: 1 },
        { label: '已失败', value: 2 },
      ],
    },
  },
];

export const formSchema: FormSchema[] = [];
