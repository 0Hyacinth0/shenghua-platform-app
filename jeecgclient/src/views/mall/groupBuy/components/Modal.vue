<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { BasicForm, useForm } from '/src/components/Form/index';
  import { formSchema } from '../groupBuy.data';
  import { saveOrUpdate } from '../groupBuy.api';

  const emit = defineEmits(['register', 'success']);
  const editId = ref('');
  const isUpdate = ref(true);

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelWidth: 140,
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

  const getTitle = computed(() => (!unref(isUpdate) ? '新增拼团活动' : '编辑拼团活动'));

  async function handleSubmit() {
    try {
      const values = await validate();
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
