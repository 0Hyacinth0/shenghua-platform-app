import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '提现单号',
    dataIndex: 'withdrawNo',
    width: 200,
    align: 'left',
  },
  {
    title: '提现金额',
    dataIndex: 'withdrawAmount',
    width: 120,
  },
  {
    title: '账户类型',
    dataIndex: 'accountType',
    width: 100,
    customRender: ({ text }) => {
      const map: Record<number, string> = { 1: '银行卡', 2: '支付宝', 3: '微信' };
      return map[text] || '未知';
    },
  },
  {
    title: '账户名',
    dataIndex: 'accountName',
    width: 120,
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
    title: '审核时间',
    dataIndex: 'auditTime',
    width: 170,
  },
  {
    title: '转账时间',
    dataIndex: 'transferTime',
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
    label: '提现单号',
    field: 'withdrawNo',
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
