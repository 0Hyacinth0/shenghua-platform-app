import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '分类名称',
    dataIndex: 'categoryName',
    width: 200,
    align: 'left',
  },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ text }) => {
      const label = text === 1 ? '启用' : '禁用';
      const color = text === 1 ? 'green' : 'red';
      return h(Tag, { color }, () => label);
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '分类名称',
    field: 'categoryName',
    component: 'Input',
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 1 },
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
    label: '分类名称',
    field: 'categoryName',
    component: 'Input',
    required: true,
  },
  {
    label: '父级分类',
    field: 'parentId',
    component: 'TreeSelect',
    componentProps: {
      fieldNames: {
        label: 'categoryName',
        value: 'id',
        children: 'children',
      },
      dropdownStyle: {
        maxHeight: '50vh',
      },
      placeholder: '请选择父级分类（留空则为根节点）',
      allowClear: true,
      treeDefaultExpandAll: false,
    },
  },
  {
    label: '分类图标',
    field: 'categoryIcon',
    component: 'Input',
  },
  {
    label: '排序',
    field: 'sortOrder',
    component: 'InputNumber',
    defaultValue: 0,
  },
  {
    label: '状态',
    field: 'status',
    component: 'Switch',
    defaultValue: 1,
    componentProps: {
      checkedChildren: '启用',
      unCheckedChildren: '禁用',
      checkedValue: 1,
      unCheckedValue: 0,
    },
  },
];
