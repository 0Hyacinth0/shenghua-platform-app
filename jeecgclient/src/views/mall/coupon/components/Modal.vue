<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  const editId = ref("");
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { BasicForm, useForm } from '/src/components/Form/index';
  import { formSchema } from '../coupon.data';
  import { saveOrUpdate } from '../coupon.api';

  const emit = defineEmits(['register', 'success']);
  const editId = ref('');
  const isUpdate = ref(true);

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelWidth: 120,
    baseRowStyle: { marginTop: '10px' },
    baseColProps: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    setModalProps({ confirmLoading: false });
    if (data && Object.keys(data).length > 0 && data.id) {
      isUpdate.value = true;
      editId.value = data.id;
      await setFieldsValue({ ...data });
    } else {
      isUpdate.value = false;
    }
  });

  const getTitle = computed(() => (!unref(isUpdate) ? '新增优惠券' : '编辑优惠券'));

  async function handleSubmit() {
    try {
      const values = await validate();
      if (values.couponType === 2 && values.discountValue != null && Number(values.discountValue) > 1) {
        message.warning('折扣券优惠值不能大于1，请填写0-1之间的小数(如0.9=9折)');
        return;
      }
      setModalProps({ confirmLoading: true });
      if (isUpdate.value) values.id = editId.value;
      await saveOrUpdate(values, unref(isUpdate));
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
