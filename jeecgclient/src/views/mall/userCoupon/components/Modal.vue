<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose title="用户优惠券详情" :showOkBtn="false" @cancel="handleCancel">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { BasicForm, useForm } from '/src/components/Form/index';
  import { detailFormSchema } from '../userCoupon.data';

  const emit = defineEmits(['register']);
  const isUpdate = ref(true);

  const [registerForm, { resetFields, setFieldsValue }] = useForm({
    schemas: detailFormSchema,
    showActionButtonGroup: false,
    labelWidth: 120,
    baseRowStyle: { marginTop: '10px' },
    baseColProps: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    setModalProps({ confirmLoading: false });
    if (data && Object.keys(data).length > 0) {
      await setFieldsValue({ ...data });
    }
  });

  function handleCancel() {
    closeModal();
  }
</script>
