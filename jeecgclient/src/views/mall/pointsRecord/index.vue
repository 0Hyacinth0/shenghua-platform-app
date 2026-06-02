<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <PointsRecordModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="mall-pointsRecord" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import PointsRecordModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './pointsRecord.data';
  import { list, deletePointsRecord } from './pointsRecord.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const [registerModal, { openModal }] = useModal();
  const { tableContext } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: { schemas: searchFormSchema },
      actionColumn: { width: 160 },
    },
  });
  const [registerTable, { reload }] = tableContext;

  function handleEdit(record: any) { openModal(true, { ...record }); }
  function handleDelete(record: any) { deletePointsRecord(record.id, reload); }
  function handleSuccess() { reload(); }

  function getTableAction(record: any) {
    return [
      { label: '编辑', onClick: handleEdit.bind(null, record) },
      { label: '删除', popConfirm: { title: '确认删除?', confirm: handleDelete.bind(null, record) } },
    ];
  }
</script>
