<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { BasicForm, useForm } from '/src/components/Form/index';
  import { formSchema } from '../pageConfig.data';
  import { saveOrUpdate } from '../pageConfig.api';
  import { defHttp } from '/@/utils/http/axios';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelWidth: 100,
    baseRowStyle: { marginTop: '10px' },
    baseColProps: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 },
  });

  async function loadTemplateOptions() {
    try {
      const res: any = await defHttp.get({ url: '/mall/pageTemplate/list', params: { pageSize: 99 } });
      const opts = (res?.records || []).map((t: any) => ({ label: t.templateName, value: t.id }));
      updateSchema({ field: 'templateId', componentProps: { options: opts } });
    } catch {}
  }

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    loadTemplateOptions();
    setModalProps({ confirmLoading: false });
    if (data && Object.keys(data).length > 0 && data.id) {
      isUpdate.value = true;
      await setFieldsValue({ ...data });
    } else {
      isUpdate.value = false;
    }
  });

  const getTitle = computed(() => (!unref(isUpdate) ? '新增页面配置' : '编辑页面配置'));

  async function handleSubmit() {
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
</script>
