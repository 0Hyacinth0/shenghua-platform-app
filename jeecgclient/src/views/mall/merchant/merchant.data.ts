import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '店铺名称',
    dataIndex: 'shopName',
    width: 200,
    align: 'left',
  },
  {
    title: '商家类型',
    dataIndex: 'merchantType',
    width: 100,
    customRender: ({ text }) => {
      const label = text === 1 ? 'B2C' : text === 2 ? 'C2C' : '未知';
      const color = text === 1 ? 'blue' : 'green';
      return h(Tag, { color }, () => label);
    },
  },
  {
    title: '店铺性质',
    dataIndex: 'storeNature',
    width: 100,
    customRender: ({ text }) => {
      const label = text === 1 ? '企业' : text === 0 ? '个人' : '-';
      return h(Tag, { color: text === 1 ? 'blue' : 'default' }, () => label);
    },
  },
  {
    title: '店铺类型',
    dataIndex: 'storeType',
    width: 100,
    customRender: ({ text }) => {
      const label = text === 0 ? '系统' : '入驻';
      const color = text === 0 ? 'orange' : 'blue';
      return h(Tag, { color }, () => label);
    },
  },
  {
    title: '审核状态',
    dataIndex: 'auditStatus',
    width: 100,
    customRender: ({ text }) => {
      const map: Record<number, { label: string; color: string }> = {
        0: { label: '待审核', color: 'orange' },
        1: { label: '通过', color: 'green' },
        2: { label: '拒绝', color: 'red' },
      };
      const item = map[text] || { label: '未知', color: 'default' };
      return h(Tag, { color: item.color }, () => item.label);
    },
  },
  {
    title: '店铺状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => {
      const label = text === 1 ? '营业' : '关闭';
      const color = text === 1 ? 'green' : 'red';
      return h(Tag, { color }, () => label);
    },
  },
  {
    title: '联系电话',
    dataIndex: 'contactPhone',
    width: 130,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '店铺名称',
    field: 'shopName',
    component: 'Input',
  },
  {
    label: '审核状态',
    field: 'auditStatus',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '待审核', value: 0 },
        { label: '通过', value: 1 },
        { label: '拒绝', value: 2 },
      ],
    },
  },
];

export const formSchema: FormSchema[] = [];
