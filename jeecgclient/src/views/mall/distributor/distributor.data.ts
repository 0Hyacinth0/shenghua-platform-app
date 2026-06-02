import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '分销商ID',
    dataIndex: 'id',
    width: 200,
    align: 'left',
  },
  {
    title: '邀请码',
    dataIndex: 'inviteCode',
  },
  {
    title: '用户',
    dataIndex: 'username',
    width: 120,
  },
  {
    title: '累计佣金',
    dataIndex: 'totalCommission',
    width: 120,
  },
  {
    title: '可提现',
    dataIndex: 'availableCommission',
    width: 120,
  },
  {
    title: '下级人数',
    dataIndex: 'subordinateCount',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ text }) => {
      return text === 1
        ? h(Tag, { color: 'green' }, () => '正常')
        : h(Tag, { color: 'red' }, () => '禁用');
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
    label: '邀请码',
    field: 'inviteCode',
    component: 'Input',
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '正常', value: 1 },
        { label: '禁用', value: 0 },
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
    label: '关联用户ID',
    field: 'userId',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入用户ID',
    },
  },
  {
    label: '分销等级ID',
    field: 'distributorLevelId',
    component: 'Input',
    componentProps: {
      placeholder: '请输入分销等级ID',
    },
  },
  {
    label: '上级分销商ID',
    field: 'parentDistributorId',
    component: 'Input',
    componentProps: {
      placeholder: '请输入上级分销商ID',
    },
  },
  {
    label: '邀请码',
    field: 'inviteCode',
    component: 'Input',
    componentProps: {
      placeholder: '留空自动生成',
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Switch',
    defaultValue: 1,
    componentProps: {
      checkedChildren: '正常',
      unCheckedChildren: '禁用',
      checkedValue: 1,
      unCheckedValue: 0,
    },
  },
];
