<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <CommissionDetailModal @register="registerModal" />
  </div>
</template>

<script lang="ts" name="mall-commissionRecord" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/src/components/Table';
  import { useModal } from '/src/components/Modal';
  import CommissionDetailModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './commission.data';
  import { list } from './commission.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const [registerModal, { openModal }] = useModal();
  const { prefixCls, tableContext } = useListPage({
    designScope: 'mall-commissionRecord',
    tableProps: {
      title: '佣金记录',
      api: list,
      columns: columns,
      actionColumn: {
        width: 100,
        fixed: 'right',
      },
      formConfig: {
        schemas: searchFormSchema,
      },
    },
  });

  const [registerTable, { reload }] = tableContext;

  function handleDetail(record) {
    openModal(true, { record, mode: 'detail' });
  }

  function getTableAction(record) {
    return [
      {
        label: '查看详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }
</script>
