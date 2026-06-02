<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增根分类</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>批量操作<Icon icon="ant-design:down-outlined"></Icon></a-button>
        </a-dropdown>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <CategoryModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="mall-category" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/src/components/Table';
  import { useModal } from '/src/components/Modal';
  import CategoryModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './category.data';
  import { getCategoryTree, deleteCategory, batchDeleteCategory } from './category.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const [registerModal, { openModal }] = useModal();
  const { prefixCls, tableContext, doRequest } = useListPage({
    designScope: 'mall-category',
    tableProps: {
      title: '商品分类管理',
      api: getCategoryTree,
      columns: columns,
      actionColumn: {
        width: 200,
      },
      formConfig: {
        schemas: searchFormSchema,
      },
      isTreeTable: true,
    },
  });

  const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRowKeys }] = tableContext;

  function handleCreate() {
    openModal(true, { isUpdate: false });
  }

  function handleEdit(record) {
    openModal(true, { record, isUpdate: true });
  }

  function handleAddSub(record) {
    openModal(true, { record: { parentId: record.id }, isUpdate: false });
  }

  async function handleDelete(record) {
    await deleteCategory({ id: record.id }, reload);
  }

  async function batchHandleDelete() {
    doRequest(() => batchDeleteCategory({ ids: selectedRowKeys.value }));
  }

  function handleSuccess({ isUpdate, values }) {
    if (isUpdate) {
      updateTableDataRecord(values.id, values);
    }
    reload();
  }

  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '确定删除吗?',
          confirm: handleDelete.bind(null, record),
        },
      },
      {
        label: '添加子分类',
        onClick: handleAddSub.bind(null, record),
      },
    ];
  }
</script>
