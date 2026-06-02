<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="getTitle" @ok="handleSubmit" width="900px">
    <BasicForm @register="registerForm" />
    <a-divider>SKU管理</a-divider>
    <a-table :data-source="skuList" :pagination="false" size="small" bordered>
      <template #title>
        <a-button type="dashed" size="small" preIcon="ant-design:plus-outlined" @click="addSku">添加SKU</a-button>
      </template>
      <a-table-column title="规格名称" dataIndex="specText">
        <template #default="{ text, record, index }">
          <a-input v-model:value="skuList[index].specText" placeholder="如: 红色-大号" />
        </template>
      </a-table-column>
      <a-table-column title="价格(元)" dataIndex="price" width="140">
        <template #default="{ text, record, index }">
          <a-input-number v-model:value="skuList[index].price" :min="0" :precision="2" style="width: 100%" placeholder="价格" />
        </template>
      </a-table-column>
      <a-table-column title="库存" dataIndex="stock" width="120">
        <template #default="{ text, record, index }">
          <a-input-number v-model:value="skuList[index].stock" :min="0" style="width: 100%" placeholder="库存" />
        </template>
      </a-table-column>
      <a-table-column title="操作" width="80">
        <template #default="{ index }">
          <a-button type="link" danger @click="removeSku(index)">删除</a-button>
        </template>
      </a-table-column>
    </a-table>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { BasicForm, useForm } from '/src/components/Form/index';
  import { formSchema } from '../spu.data';
  import { saveOrUpdate, queryById } from '../spu.api';
  import { getCategoryTree } from '../../category/category.api';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const skuList = reactive<any[]>([]);
  const treeData = ref<any[]>([]);

  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelWidth: 100,
    baseRowStyle: { marginTop: '10px' },
    baseColProps: { xs: 24, sm: 12, md: 12, lg: 12, xl: 12, xxl: 12 },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    skuList.splice(0, skuList.length);
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    // 加载分类树
    const res = await getCategoryTree({});
    treeData.value = res || [];
    updateSchema({
      field: 'categoryId',
      componentProps: { treeData: unref(treeData) },
    });

    if (unref(isUpdate) && data?.record) {
      // 查询详情填充表单
      const detail = await queryById({ id: data.record.id });
      if (detail) {
        await setFieldsValue({ ...detail });
        if (detail.skuList && detail.skuList.length > 0) {
          skuList.push(...detail.skuList);
        }
      }
    }
  });

  const getTitle = computed(() => (!unref(isUpdate) ? '新增商品' : '编辑商品'));

  function addSku() {
    skuList.push({ specText: '', price: 0, stock: 0 });
  }

  function removeSku(index: number) {
    skuList.splice(index, 1);
  }

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      const params = {
        ...values,
        skuList: [...skuList],
      };
      await saveOrUpdate(params, unref(isUpdate));
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
