<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose title="佣金记录详情" :showOkBtn="false" width="700px">
    <a-spin :spinning="loading">
      <a-descriptions title="佣金信息" :column="2" bordered size="small">
        <a-descriptions-item label="订单ID">{{ detail.orderId }}</a-descriptions-item>
        <a-descriptions-item label="分销商ID">{{ detail.distributorId }}</a-descriptions-item>
        <a-descriptions-item label="佣金金额">{{ detail.commissionAmount }}</a-descriptions-item>
        <a-descriptions-item label="佣金比例">{{ detail.commissionRate != null ? (detail.commissionRate * 100).toFixed(0) + '%' : '-' }}</a-descriptions-item>
        <a-descriptions-item label="佣金类型">
          <a-tag :color="detail.commissionType === 1 ? 'red' : 'blue'">{{ detail.commissionType === 1 ? '一级佣金' : '二级佣金' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="结算状态">
          <a-tag :color="settleColor(detail.settleStatus)">{{ settleLabel(detail.settleStatus) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="结算时间">{{ detail.settleTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ detail.createTime }}</a-descriptions-item>
      </a-descriptions>
    </a-spin>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { queryById } from '../commission.api';

  const emit = defineEmits(['register', 'success']);
  const loading = ref(false);
  const detail = reactive<any>({});

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    loading.value = true;
    try {
      if (data?.record?.id) {
        const res = await queryById({ id: data.record.id });
        Object.assign(detail, res || {});
      }
    } finally {
      loading.value = false;
    }
  });

  function settleColor(status: number): string {
    const map: Record<number, string> = { 0: 'orange', 1: 'green', 2: 'gray' };
    return map[status] || 'default';
  }

  function settleLabel(status: number): string {
    const map: Record<number, string> = { 0: '待结算', 1: '已结算', 2: '已取消' };
    return map[status] || '未知';
  }
</script>
