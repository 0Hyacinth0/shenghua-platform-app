<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { BasicForm, useForm } from '/src/components/Form/index';
  import { formSchema } from '../category.data';
  import { saveOrUpdate, getCategoryTree } from '../category.api';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const treeData = ref<any[]>([]);

  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelWidth: 100,
    baseRowStyle: { marginTop: '10px' },
    baseColProps: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    // 加载父级分类树
    const res = await getCategoryTree({});
    treeData.value = res || [];
    updateSchema({
      field: 'parentId',
      componentProps: { treeData: unref(treeData) },
    });

    if (unref(isUpdate) && data?.record) {
      await setFieldsValue({ ...data.record });
    } else if (data?.record) {
      // 新增子分类时预设parentId
      await setFieldsValue({ ...data.record });
    }
  });

  const getTitle = computed(() => (!unref(isUpdate) ? '新增分类' : '编辑分类'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      await saveOrUpdate(values, unref(isUpdate));
      closeModal();
      emit('success', { isUpdate: unref(isUpdate), values });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
