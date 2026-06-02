<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" name="mall-groupBuyRecord" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { columns, searchFormSchema } from './groupBuyRecord.data';
  import { list, deleteRecord } from './groupBuyRecord.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const { tableContext } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: { schemas: searchFormSchema },
      actionColumn: { width: 100 },
    },
  });
  const [registerTable, { reload }] = tableContext;

  function handleDelete(record: any) { deleteRecord(record.id, reload); }

  function getTableAction(record: any) {
    return [
      { label: '删除', popConfirm: { title: '确认删除? 会同步删除关联成员', confirm: handleDelete.bind(null, record) } },
    ];
  }
</script>
