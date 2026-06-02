<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="getTitle" @ok="handleSubmit" :showOkBtn="isAuditMode" width="700px">
    <a-spin :spinning="loading">
      <a-descriptions title="提现信息" :column="2" bordered size="small">
        <a-descriptions-item label="提现单号">{{ detail.withdrawNo }}</a-descriptions-item>
        <a-descriptions-item label="提现金额">{{ detail.withdrawAmount }}</a-descriptions-item>
        <a-descriptions-item label="账户类型">
          <a-tag>{{ accountTypeLabel(detail.accountType) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="账户名">{{ detail.accountName }}</a-descriptions-item>
        <a-descriptions-item label="账号">{{ detail.accountNumber }}</a-descriptions-item>
        <a-descriptions-item label="审核状态">
          <a-tag :color="auditColor(detail.auditStatus)">{{ auditLabel(detail.auditStatus) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="审核时间">{{ detail.auditTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="转账时间">{{ detail.transferTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ detail.createTime }}</a-descriptions-item>
      </a-descriptions>

      <template v-if="isAuditMode">
        <a-divider>审核操作</a-divider>
        <a-form :model="auditForm" layout="vertical">
          <a-form-item label="审核结果" required>
            <a-radio-group v-model:value="auditForm.auditStatus">
              <a-radio :value="1">通过</a-radio>
              <a-radio :value="2">拒绝</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="审核备注">
            <a-textarea v-model:value="auditForm.auditRemark" :rows="3" placeholder="请输入审核备注" />
          </a-form-item>
        </a-form>
      </template>
    </a-spin>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { queryById, audit } from '../withdraw.api';

  const { createMessage } = useMessage();
  const emit = defineEmits(['register', 'success']);
  const loading = ref(false);
  const isAuditMode = ref(false);
  const detail = reactive<any>({});
  const auditForm = reactive({
    auditStatus: 1,
    auditRemark: '',
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    loading.value = true;
    isAuditMode.value = data?.mode === 'audit';
    auditForm.auditStatus = 1;
    auditForm.auditRemark = '';
    try {
      if (data?.record?.id) {
        const res = await queryById({ id: data.record.id });
        Object.assign(detail, res || {});
      }
    } finally {
      loading.value = false;
    }
  });

  const getTitle = computed(() => (isAuditMode.value ? '提现审核' : '提现详情'));

  function accountTypeLabel(type: number): string {
    const map: Record<number, string> = { 1: '银行卡', 2: '支付宝', 3: '微信' };
    return map[type] || '未知';
  }

  function auditColor(status: number): string {
    const map: Record<number, string> = { 0: 'orange', 1: 'green', 2: 'red' };
    return map[status] || 'default';
  }

  function auditLabel(status: number): string {
    const map: Record<number, string> = { 0: '待审核', 1: '通过', 2: '拒绝' };
    return map[status] || '未知';
  }

  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      await audit({
        id: detail.id,
        auditStatus: auditForm.auditStatus,
        auditRemark: auditForm.auditRemark,
      });
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
