<template>
  <a-modal
    v-model:open="visible"
    title="订单详情"
    :footer="null"
    width="900px"
    destroyOnClose
    @cancel="handleClose"
  >
    <a-spin :spinning="loading">
      <!-- 订单基本信息 -->
      <a-descriptions title="订单信息" :column="2" bordered size="small">
        <a-descriptions-item label="订单号">{{ detail.orderNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <Tag v-if="detail.orderStatus !== undefined && detail.orderStatus !== null" :color="statusColor(detail.orderStatus)">
            {{ statusLabel(detail.orderStatus) }}
          </Tag>
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="下单用户">{{ detail.userName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="实付金额">
          <span v-if="detail.payAmount != null" style="color: #f5222d; font-weight: bold;">￥{{ detail.payAmount }}</span>
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="支付方式">{{ payTypeLabel(detail.payType) }}</a-descriptions-item>
        <a-descriptions-item label="支付时间">{{ detail.payTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="收货人">{{ detail.receiverName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ detail.receiverPhone || '-' }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="2">{{ receiverAddress || '-' }}</a-descriptions-item>
        <a-descriptions-item v-if="detail.pointsEarned > 0" label="获得积分">
          <span style="color: #52c41a; font-weight: bold;">+{{ detail.pointsEarned }} 积分</span>
        </a-descriptions-item>
        <a-descriptions-item label="下单时间">{{ detail.createTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{ detail.remark || '无' }}</a-descriptions-item>
      </a-descriptions>

      <!-- 订单明细 -->
      <a-divider>订单明细</a-divider>
      <a-table
        :columns="itemColumns"
        :data-source="detail.items || []"
        :pagination="false"
        size="small"
        bordered
        rowKey="id"
        :scroll="{ x: 700 }"
      />

      <!-- 操作日志 -->
      <a-divider>操作日志</a-divider>
      <a-timeline v-if="(detail.logs || []).length > 0">
        <a-timeline-item
          v-for="(log, index) in detail.logs"
          :key="index"
          :color="logActionColor(log.actionType)"
        >
          <div class="log-item">
            <span class="log-time">{{ log.createTime }}</span>
            <Tag :color="logActionColor(log.actionType)" style="margin-left: 8px;">
              {{ log.actionDesc || log.actionType }}
            </Tag>
          </div>
        </a-timeline-item>
      </a-timeline>
      <a-empty v-else description="暂无操作日志" />
    </a-spin>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, computed, h } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { queryById } from '../order.api';

  function getImgSrc(path: string) {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
    return '/jeecgboot/sys/common/static/' + path
  }

  const itemColumns = [
    { title: '商品图片', dataIndex: 'productImage', width: 80,
      customRender: ({ text }: any) => text ? h('img', { src: getImgSrc(text), style: 'width:50px;height:50px;object-fit:cover' }) : '-' },
    { title: '商品名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'skuSpec', width: 120, customRender: ({ text }: any) => text || '-' },
    { title: '单价', dataIndex: 'salePrice', width: 100, align: 'right', customRender: ({ text }: any) => '￥' + text },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '小计', dataIndex: 'totalAmount', width: 100, align: 'right', customRender: ({ text }: any) => h('span', { style: 'color:#f5222d' }, '￥' + text) },
  ];

  const visible = ref(false);
  const loading = ref(false);
  const detail = ref<Record<string, any>>({});

  /**
   * 拼接完整收货地址
   */
  const receiverAddress = computed(() => {
    const d = detail.value;
    const province = d.receiverProvince || '';
    const city = d.receiverCity || '';
    const district = d.receiverDistrict || '';
    const address = d.receiverAddress || '';
    return `${province}${city}${district}${address}` || '-';
  });

  /**
   * 订单状态标签文字
   */
  function statusLabel(status: number): string {
    const map: Record<number, string> = {
      0: '待付款',
      1: '待发货',
      2: '已发货',
      3: '已完成',
      4: '已取消',
      5: '退款中',
      6: '已退款',
    };
    return map[status] || '未知';
  }

  /**
   * 订单状态标签颜色
   */
  function statusColor(status: number): string {
    const map: Record<number, string> = {
      0: 'orange',
      1: 'blue',
      2: 'cyan',
      3: 'green',
      4: 'default',
      5: 'red',
      6: 'purple',
    };
    return map[status] || 'default';
  }

  /**
   * 支付方式文字
   */
  function payTypeLabel(type: number): string {
    const map: Record<number, string> = {
      1: '微信',
      2: '支付宝',
      3: '银联',
    };
    return map[type] || '未知';
  }

  /**
   * 操作日志动作颜色
   */
  function logActionColor(actionType: string): string {
    if (!actionType) return 'gray';
    if (actionType.includes('创建') || actionType.includes('下单')) return 'blue';
    if (actionType.includes('支付')) return 'green';
    if (actionType.includes('发货')) return 'cyan';
    if (actionType.includes('完成') || actionType.includes('签收')) return 'green';
    if (actionType.includes('取消')) return 'gray';
    if (actionType.includes('退款')) return 'red';
    return 'blue';
  }

  /**
   * 关闭弹窗
   */
  function handleClose() {
    visible.value = false;
  }

  /**
   * 打开弹窗并加载订单详情（供父组件通过 ref 调用）
   * @param record 订单记录，需包含 id 字段
   */
  async function loadDetail(record: Record<string, any>) {
    visible.value = true;
    loading.value = true;
    try {
      if (record?.id) {
        const res = await queryById({ id: record.id });
        // defHttp 已解包 result，res 直接就是详情对象
        detail.value = res || {};
      }
    } finally {
      loading.value = false;
    }
  }

  defineExpose({ loadDetail });
</script>

<style lang="less" scoped>
  .log-item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  .log-time {
    color: #999;
    font-size: 13px;
    min-width: 160px;
  }
</style>
