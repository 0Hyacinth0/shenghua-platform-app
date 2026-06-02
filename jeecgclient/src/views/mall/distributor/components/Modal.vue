<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="getTitle" @ok="handleSubmit" :showOkBtn="!isAuditMode" width="800px">
    <template v-if="isAuditMode">
      <a-spin :spinning="loading">
        <a-descriptions title="分销商信息" :column="2" bordered size="small">
          <a-descriptions-item label="分销商ID">{{ detail.id }}</a-descriptions-item>
          <a-descriptions-item label="邀请码">{{ detail.inviteCode }}</a-descriptions-item>
          <a-descriptions-item label="累计佣金">{{ detail.totalCommission }}</a-descriptions-item>
          <a-descriptions-item label="可提现">{{ detail.availableCommission }}</a-descriptions-item>
          <a-descriptions-item label="下级人数">{{ detail.subordinateCount }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="detail.status === 1 ? 'green' : 'red'">{{ detail.status === 1 ? '正常' : '禁用' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ detail.createTime }}</a-descriptions-item>
        </a-descriptions>
        <a-divider>审核操作</a-divider>
        <a-form :model="auditForm" layout="vertical">
          <a-form-item label="审核结果" required>
            <a-radio-group v-model:value="auditForm.status">
              <a-radio :value="1">通过(正常)</a-radio>
              <a-radio :value="0">禁用</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="备注">
            <a-textarea v-model:value="auditForm.remark" :rows="3" placeholder="请输入审核备注" />
          </a-form-item>
        </a-form>
      </a-spin>
    </template>
    <template v-else>
      <BasicForm @register="registerForm" />
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { BasicForm, useForm } from '/src/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { formSchema } from '../distributor.data';
  import { saveOrUpdate, queryById, audit } from '../distributor.api';

  const { createMessage } = useMessage();
  const emit = defineEmits(['register', 'success']);
  const loading = ref(false);
  const isUpdate = ref(true);
  const isAuditMode = ref(false);
  const detail = reactive<any>({});
  const auditForm = reactive({
    status: 1,
    remark: '',
  });

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelWidth: 100,
    baseRowStyle: { marginTop: '10px' },
    baseColProps: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    loading.value = true;
    isAuditMode.value = data?.mode === 'audit';
    auditForm.status = 1;
    auditForm.remark = '';
    try {
      if (isAuditMode.value) {
        if (data?.record?.id) {
          const res = await queryById({ id: data.record.id });
          Object.assign(detail, res || {});
        }
      } else {
        await resetFields();
        setModalProps({ confirmLoading: false });
        if (data && Object.keys(data).length > 0 && data.id) {
          isUpdate.value = true;
          await setFieldsValue({ ...data });
        } else {
          isUpdate.value = false;
        }
      }
    } finally {
      loading.value = false;
    }
  });

  const getTitle = computed(() => {
    if (isAuditMode.value) return '审核分销商';
    return !unref(isUpdate) ? '新增分销商' : '编辑分销商';
  });

  async function handleSubmit() {
    if (isAuditMode.value) {
      try {
        setModalProps({ confirmLoading: true });
        await audit({
          id: detail.id,
          status: auditForm.status,
          remark: auditForm.remark,
        });
        closeModal();
        emit('success');
      } finally {
        setModalProps({ confirmLoading: false });
      }
    } else {
      try {
        const values = await validate();
        setModalProps({ confirmLoading: true });
        await saveOrUpdate(values, unref(isUpdate));
        closeModal();
        emit('success');
      } finally {
        setModalProps({ confirmLoading: false });
      }
    }
  }
</script>
