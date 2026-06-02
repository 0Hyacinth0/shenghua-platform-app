<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                批量删除
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
    <PageComponentModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="mall-pageComponent" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/src/components/Table';
  import { useModal } from '/src/components/Modal';
  import PageComponentModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './pageComponent.data';
  import { list, deleteComponent, batchDeleteComponent } from './pageComponent.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const [registerModal, { openModal }] = useModal();
  const { prefixCls, tableContext } = useListPage({
    designScope: 'mall-pageComponent',
    tableProps: {
      title: '组件库管理',
      api: list,
      columns: columns,
      actionColumn: {
        width: 200,
      },
      formConfig: {
        schemas: searchFormSchema,
      },
    },
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  function handleCreate() {
    openModal(true, {});
  }

  function handleEdit(record) {
    openModal(true, { ...record });
  }

  function handleDelete(record) {
    deleteComponent({ id: record.id }, reload);
  }

  function batchHandleDelete() {
    batchDeleteComponent({ ids: selectedRowKeys.value.join(',') }, reload);
  }

  function handleSuccess() {
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
          title: '确认删除?',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }
</script>
