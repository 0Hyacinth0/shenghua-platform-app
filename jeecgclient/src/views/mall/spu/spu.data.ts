import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  { title: '商品名称', dataIndex: 'spuName', width: 200, align: 'left' },
  { title: '主图', dataIndex: 'mainImage', width: 80, customRender: render.renderImage },
  { title: '最低价', dataIndex: 'minPrice', width: 100, customRender: ({ text }) => text != null ? '￥' + text : '-' },
  { title: '最高价', dataIndex: 'maxPrice', width: 100, customRender: ({ text }) => text != null ? '￥' + text : '-' },
  { title: '总库存', dataIndex: 'stock', width: 80 },
  { title: '销量', dataIndex: 'sales', width: 80 },
  {
    title: '发布商家', dataIndex: 'merchantId', width: 130,
    customRender: ({ text }) => {
      if (!text) return '系统发布'
      const map = (window as any).__merchantNames || {}
      const type = (window as any).__merchantTypes || {}
      const name = map[text] || text
      const storeType = type[text]
      const tag = storeType === 1 ? h(Tag, { color: 'blue', size: 'small' }, () => '入驻') : ''
      return h('span', {}, [name, tag])
    },
  },
  {
    title: '审核', dataIndex: 'auditStatus', width: 90,
    customRender: ({ text }) => {
      if (text === 0) return h(Tag, { color: 'orange' }, () => '待审核');
      if (text === 1) return h(Tag, { color: 'green' }, () => '已通过');
      if (text === 2) return h(Tag, { color: 'red' }, () => '已拒绝');
      return '-';
    },
  },
  {
    title: '上架状态', dataIndex: 'shelfStatus', width: 100,
    customRender: ({ text }) => {
      const label = text === 1 ? '上架' : '下架';
      const color = text === 1 ? 'green' : 'red';
      return h(Tag, { color }, () => label);
    },
  },
  {
    title: '商品类型', dataIndex: 'productType', width: 100,
    customRender: ({ text }) => {
      const label = text === 1 ? '实物' : text === 2 ? '虚拟' : '未知';
      const color = text === 1 ? 'blue' : 'orange';
      return h(Tag, { color }, () => label);
    },
  },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
];

export const searchFormSchema: FormSchema[] = [
  { label: '商品名称', field: 'spuName', component: 'Input' },
  { label: '上架状态', field: 'shelfStatus', component: 'Select',
    componentProps: { options: [{ label: '全部', value: '' }, { label: '上架', value: 1 }, { label: '下架', value: 0 }] },
  },
];

export const formSchema: FormSchema[] = [
  { label: 'ID', field: 'id', component: 'Input', show: false },
  { label: '商品名称', field: 'spuName', component: 'Input', required: true },
  { label: '所属分类', field: 'categoryId', component: 'TreeSelect',
    componentProps: { fieldNames: { label: 'categoryName', value: 'id', children: 'children' }, placeholder: '请选择分类', dropdownStyle: { maxHeight: '50vh' } },
  },
  { label: '商品主图', field: 'mainImage', component: 'JUpload', componentProps: { text: '上传主图', maxCount: 1, accept: 'image/*' } },
  { label: '商品描述', field: 'description', component: 'Input', colProps: { span: 24 }, render: render.renderTinymce },
  { label: '商品类型', field: 'productType', component: 'Select',
    componentProps: { options: [{ label: '实物', value: 1 }, { label: '虚拟', value: 2 }] },
  },
  { label: '虚拟商品链接', field: 'virtualUrl', component: 'Input',
    ifShow: ({ model }) => model.productType === 2,
    componentProps: { placeholder: '虚拟商品付款后自动发送的链接' },
  },
  { label: '规格模板', field: 'specTemplate', component: 'InputTextArea',
    colProps: { span: 24 },
    componentProps: { placeholder: 'JSON格式，如: [{"name":"颜色","values":["红","蓝"]},{"name":"尺寸","values":["M","L"]}]', rows: 3 },
    helpMessage: '定义可选规格维度，C端商品详情页会根据此模板显示规格选项',
  },
];
