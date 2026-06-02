<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <WithdrawAuditModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="mall-commissionWithdraw" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/src/components/Table';
  import { useModal } from '/src/components/Modal';
  import WithdrawAuditModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './withdraw.data';
  import { list } from './withdraw.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const [registerModal, { openModal }] = useModal();
  const { prefixCls, tableContext } = useListPage({
    designScope: 'mall-commissionWithdraw',
    tableProps: {
      title: '提现审核',
      api: list,
      columns: columns,
      actionColumn: {
        width: 200,
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

  function handleAudit(record) {
    openModal(true, { record, mode: 'audit' });
  }

  function handleSuccess() {
    reload();
  }

  function getTableAction(record) {
    const actions: any[] = [
      {
        label: '查看详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
    if (record.auditStatus === 0) {
      actions.push({
        label: '审核',
        onClick: handleAudit.bind(null, record),
      });
    }
    return actions;
  }
</script>
