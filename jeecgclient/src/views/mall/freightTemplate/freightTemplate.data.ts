import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '模板名称',
    dataIndex: 'templateName',
    width: 200,
    align: 'left',
  },
  {
    title: '计费方式',
    dataIndex: 'chargingType',
    width: 100,
    customRender: ({ text }) => {
      const map: Record<number, string> = {
        1: '按件数',
        2: '按重量',
        3: '按体积',
      };
      return map[text] || '未知';
    },
  },
  {
    title: '是否包邮',
    dataIndex: 'isFreeShipping',
    width: 100,
    customRender: ({ text }) => {
      return text === 1
        ? h(Tag, { color: 'green' }, () => '包邮')
        : h(Tag, { color: 'red' }, () => '不包邮');
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
    label: '模板名称',
    field: 'templateName',
    component: 'Input',
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
    label: '模板名称',
    field: 'templateName',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入运费模板名称',
    },
  },
  {
    label: '计费方式',
    field: 'chargingType',
    component: 'RadioGroup',
    required: true,
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '按件数', value: 1 },
        { label: '按重量', value: 2 },
        { label: '按体积', value: 3 },
      ],
    },
  },
  {
    label: '是否包邮',
    field: 'isFreeShipping',
    component: 'Switch',
    defaultValue: 0,
    componentProps: {
      checkedChildren: '包邮',
      unCheckedChildren: '不包邮',
      checkedValue: 1,
      unCheckedValue: 0,
    },
  },
  {
    label: '包邮条件',
    field: 'freeCondition',
    component: 'Textarea',
    componentProps: {
      placeholder: 'JSON格式，如: {"type":"amount","value":99} 表示满99元包邮',
      rows: 3,
    },
    helpMessage: 'JSON格式的包邮条件配置',
  },
  {
    label: '运费规则',
    field: 'rules',
    component: 'Textarea',
    componentProps: {
      placeholder: 'JSON格式，如: [{"region":"华东","firstItem":1,"firstPrice":8,"additionalItem":1,"additionalPrice":2}]',
      rows: 5,
    },
    helpMessage: 'JSON格式的运费规则配置',
  },
];
