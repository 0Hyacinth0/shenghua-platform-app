import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';

// 加载商品列表供下拉选择
const loadSpuList = () => defHttp.get({ url: '/mall/spu/list', params: { pageNo: 1, pageSize: 1000 } }).then((res: any) => {
  return (res?.records || []).map((item: any) => ({ label: item.spuName, value: item.id }));
});

export const columns: BasicColumn[] = [
  {
    title: '活动名称',
    dataIndex: 'activityName',
    width: 180,
    align: 'left',
  },
  {
    title: '商品名称',
    dataIndex: 'spuName',
    width: 160,
    ellipsis: true,
  },
  {
    title: '商品SPU ID',
    dataIndex: 'spuId',
    width: 180,
    ellipsis: true,
  },
  {
    title: '成团人数',
    dataIndex: 'groupSize',
    width: 100,
  },
  {
    title: '已成团数',
    dataIndex: 'successCount',
    width: 90,
    customRender: ({ text }) => {
      return text != null && text > 0 ? h(Tag, { color: 'green' }, () => String(text)) : '0';
    },
  },
  {
    title: '拼团价格',
    dataIndex: 'groupPrice',
    width: 120,
    customRender: ({ text }) => {
      return text != null ? '￥' + text : '-';
    },
  },
  {
    title: '有效时长(小时)',
    dataIndex: 'validHours',
    width: 120,
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    width: 170,
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    width: 170,
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
    label: '选择商品',
    field: 'spuId',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      placeholder: '请搜索并选择商品，选择后该商品所有规格均可拼团',
      api: loadSpuList,
      labelField: 'label',
      valueField: 'value',
      showSearch: true,
      filterOption: 'label',
    },
  },
  {
    label: '成团人数',
    field: 'groupSize',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '请输入成团人数',
      min: 2,
    },
    defaultValue: 2,
  },
  {
    label: '拼团价格',
    field: 'groupPrice',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '请输入拼团价格',
      min: 0,
      step: 0.01,
      precision: 2,
    },
  },
  {
    label: '有效时长(小时)',
    field: 'validHours',
    component: 'InputNumber',
    required: true,
    componentProps: {
      placeholder: '请输入有效时长',
      min: 1,
    },
    defaultValue: 24,
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
  {
    label: '过期自动成团',
    field: 'autoSuccess',
    component: 'RadioGroup',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '是（自动成团）', value: 1 },
        { label: '否（自动退款）', value: 0 },
      ],
    },
    helpMessage: '拼团过期未满员时，是否自动设为成团',
  },
];
