import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  { title: '规则名称', dataIndex: 'ruleName', width: 160 },
  {
    title: '类型', dataIndex: 'ruleType', width: 100,
    customRender: ({ text }) => {
      const m: Record<number,any> = {1:{l:'购物积分',c:'blue'},2:{l:'签到积分',c:'green'},3:{l:'任务积分',c:'orange'}}
      return h(Tag, { color: m[text]?.c }, () => m[text]?.l || '未知')
    }
  },
  {
    title: '积分值', dataIndex: 'pointsValue', key: 'colPointsValue', width: 90,
    customRender: ({ record }) => {
      if (record.ruleType === 2) return '—'
      if (record.ruleType === 3) return String(record.pointsValue || 0)
      return '—'
    },
  },
  {
    title: '消费基数(元)', dataIndex: 'amountBase', width: 110,
    customRender: ({ record }) => record.ruleType === 1 ? String(record.amountBase || 100) : '—',
  },
  {
    title: '每基数积分', dataIndex: 'pointsValue', key: 'colPointsPerBase', width: 100,
    customRender: ({ record }) => record.ruleType === 1 ? String(record.pointsValue || 0) : '—',
  },
  {
    title: '奖励间隔(天)', dataIndex: 'amountBase', key: 'colBonusInterval', width: 100,
    customRender: ({ record }) => record.ruleType === 2 ? String(record.amountBase || 7) : '—',
  },
  {
    title: '奖励积分', dataIndex: 'maxPoints', key: 'colBonusPoints', width: 80,
    customRender: ({ record }) => record.ruleType === 2 ? (record.maxPoints > 0 ? String(record.maxPoints) : '—') : '—',
  },
  {
    title: '累计达标(天)', dataIndex: 'cumulativeDays', key: 'colCumulativeDays', width: 100,
    customRender: ({ record }) => record.ruleType === 2 && record.cumulativeDays > 0 ? String(record.cumulativeDays) : '—',
  },
  {
    title: '累计奖励', dataIndex: 'cumulativePoints', key: 'colCumulativePoints', width: 80,
    customRender: ({ record }) => record.ruleType === 2 && record.cumulativePoints > 0 ? String(record.cumulativePoints) : '—',
  },
  {
    title: '积分上限', dataIndex: 'maxPoints', key: 'colMaxPoints', width: 90,
    customRender: ({ record }) => record.ruleType === 1 ? (record.maxPoints > 0 ? String(record.maxPoints) : '不限') : '—',
  },
  {
    title: '状态', dataIndex: 'status', width: 80,
    customRender: ({ text }) => h(Tag, { color: text === 1 ? 'green' : 'red' }, () => text === 1 ? '启用' : '停用')
  },
  { title: '创建时间', dataIndex: 'createTime', width: 170 },
];

export const searchFormSchema: FormSchema[] = [
  { label: '规则名称', field: 'ruleName', component: 'Input' },
  { label: '类型', field: 'ruleType', component: 'Select', componentProps: { options: [{label:'全部',value:''},{label:'购物积分',value:1},{label:'签到积分',value:2},{label:'任务积分',value:3}] } },
];

export const formSchema: FormSchema[] = [
  { label: 'ID', field: 'id', component: 'Input', show: false },
  { label: '规则名称', field: 'ruleName', component: 'Input', required: true, componentProps: { placeholder: '如：购物积分规则' } },
  {
    label: '规则类型', field: 'ruleType', component: 'RadioGroup', required: true, defaultValue: 1,
    componentProps: { options: [{label:'购物积分',value:1},{label:'签到积分',value:2},{label:'任务积分',value:3}] },
  },
  {
    label: '规则描述', field: 'description', component: 'Textarea',
    componentProps: { placeholder: '购物积分：每消费X元得Y积分\n签到积分：每日签到得X积分\n任务积分：完成任务得X积分', rows: 2 },
  },
  {
    label: '消费金额基数(元)', field: 'amountBase', component: 'InputNumber', defaultValue: 100,
    componentProps: { min: 0.01, step: 0.01, placeholder: '如：100表示每满100元' },
    ifShow: ({ model }) => model.ruleType === 1,
    helpMessage: '设定消费金额基数，如100表示每满100元给积分',
  },
  {
    label: '每基数积分', field: 'pointsValue', component: 'InputNumber', required: true, defaultValue: 1,
    componentProps: { min: 1, placeholder: '每满消费基数给多少积分' },
    ifShow: ({ model }) => model.ruleType === 1,
    helpMessage: '积分 = floor(实付金额 ÷ 基数) × 每基数积分。如基数100、积分1，消费250元=2积分',
  },
  {
    label: '每日签到积分', field: 'pointsValue', component: 'InputNumber', required: true, defaultValue: 10,
    componentProps: { min: 1, placeholder: '每次签到获得积分' },
    ifShow: ({ model }) => model.ruleType === 2,
  },
  {
    label: '连续奖励间隔(天)', field: 'amountBase', component: 'InputNumber',
    componentProps: { min: 0, step: 1, placeholder: '0=不启用连续奖励' },
    ifShow: ({ model }) => model.ruleType === 2,
    helpMessage: '每连续签到N天触发一次额外奖励，设为0不启用',
  },
  {
    label: '连续奖励积分', field: 'maxPoints', component: 'InputNumber',
    componentProps: { min: 0, placeholder: '0=不奖励' },
    ifShow: ({ model }) => model.ruleType === 2,
    helpMessage: '连续签到达到间隔天数后额外奖励的积分，设为0不奖励',
  },
  {
    label: '累计签到达标(天)', field: 'cumulativeDays', component: 'InputNumber', defaultValue: 0,
    componentProps: { min: 0, placeholder: '累计签到N天触发奖励，0不启用' },
    ifShow: ({ model }) => model.ruleType === 2,
    helpMessage: '累计签到总天数达到后一次性奖励，设为0不启用',
  },
  {
    label: '累计奖励积分', field: 'cumulativePoints', component: 'InputNumber', defaultValue: 0,
    componentProps: { min: 0, placeholder: '累计达标后奖励积分' },
    ifShow: ({ model }) => model.ruleType === 2,
    helpMessage: '累计签到达标后一次性奖励的积分',
  },
  {
    label: '任务积分值', field: 'pointsValue', component: 'InputNumber', required: true, defaultValue: 50,
    componentProps: { min: 1, placeholder: '完成任务获得积分' },
    ifShow: ({ model }) => model.ruleType === 3,
  },
  {
    label: '单笔积分上限', field: 'maxPoints', component: 'InputNumber', defaultValue: 0,
    componentProps: { min: 0, placeholder: '0表示不限制' },
    ifShow: ({ model }) => model.ruleType === 1,
    helpMessage: '单笔订单最多可得积分数，设0表示不设上限',
  },
  { label: '状态', field: 'status', component: 'Switch', defaultValue: 1, componentProps: { checkedChildren:'启用', unCheckedChildren:'停用', checkedValue:1, unCheckedValue:0 } },
];
