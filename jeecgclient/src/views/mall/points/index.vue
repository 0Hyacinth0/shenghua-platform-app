<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <PointsModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="mall-points" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import PointsModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './points.data';
  import { list, deletePointsRule } from './points.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const [registerModal, { openModal }] = useModal();
  const { tableContext } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: { schemas: searchFormSchema },
      actionColumn: { width: 200 },
    },
  });
  const [registerTable, { reload }] = tableContext;

  function handleCreate() { openModal(true, {}); }
  function handleEdit(record: any) { openModal(true, { ...record }); }
  function handleDelete(record: any) { deletePointsRule({ id: record.id }, reload); }

  function handleSuccess() { reload(); }

  function getTableAction(record) {
    return [
      { label: '编辑', onClick: handleEdit.bind(null, record) },
      { label: '删除', popConfirm: { title: '确认删除?', confirm: handleDelete.bind(null, record) } },
    ];
  }
</script>
