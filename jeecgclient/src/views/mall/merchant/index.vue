<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <MerchantAuditModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="mall-merchant" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/src/components/Table';
  import { useModal } from '/src/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import MerchantAuditModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './merchant.data';
  import { getMerchantList, closeMerchant, openMerchant } from './merchant.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const { prefixCls, tableContext } = useListPage({
    designScope: 'mall-merchant',
    tableProps: {
      title: '商家管理',
      api: getMerchantList,
      columns: columns,
      actionColumn: {
        width: 240,
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

  function handleEdit(record) {
    openModal(true, { record, mode: 'edit' });
  }

  function handleAudit(record) {
    openModal(true, { record, mode: 'audit' });
  }

  async function handleClose(record) {
    await closeMerchant({ id: record.id });
    reload();
  }

  async function handleOpen(record) {
    await openMerchant({ id: record.id });
    reload();
  }

  function handleSuccess() {
    reload();
  }

  function getTableAction(record) {
    const actions: any[] = [
      { label: '查看详情', onClick: handleDetail.bind(null, record) },
      { label: '编辑', onClick: handleEdit.bind(null, record) },
    ];
    if (record.auditStatus === 0) {
      actions.push({
        label: '审核',
        onClick: handleAudit.bind(null, record),
      });
    }
    if (record.status === 1) {
      actions.push({
        label: '关店',
        popConfirm: {
          title: '确定关闭该店铺吗?',
          confirm: handleClose.bind(null, record),
        },
      });
    } else {
      actions.push({
        label: '开店',
        popConfirm: {
          title: '确定开启该店铺吗?',
          confirm: handleOpen.bind(null, record),
        },
      });
    }
    return actions;
  }
</script>
