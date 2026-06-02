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
    <GroupBuyModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="mall-groupBuy" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import GroupBuyModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './groupBuy.data';
  import { list, deleteGroupBuy, startActivity, endActivity } from './groupBuy.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { Modal } from 'ant-design-vue';

  const [registerModal, { openModal }] = useModal();
  const { tableContext } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: { schemas: searchFormSchema },
      actionColumn: { width: 260 },
    },
  });
  const [registerTable, { reload }] = tableContext;

  function handleCreate() { openModal(true, {}); }
  function handleEdit(record: any) { openModal(true, { ...record }); }
  function handleDelete(record: any) { deleteGroupBuy({ id: record.id }, reload); }
  function handleStart(record: any) {
    Modal.confirm({
      title: '确认开始', content: '确定要开始该拼团活动吗？',
      onOk: () => startActivity({ id: record.id }).then(() => reload()),
    });
  }
  function handleEnd(record: any) {
    Modal.confirm({
      title: '确认结束', content: '确定要结束该拼团活动吗？',
      onOk: () => endActivity({ id: record.id }).then(() => reload()),
    });
  }

  function handleSuccess() { reload(); }

  function getTableAction(record) {
    const actions = [
      { label: '编辑', onClick: handleEdit.bind(null, record) },
      { label: '删除', popConfirm: { title: '确认删除?', confirm: handleDelete.bind(null, record) } },
    ];
    if (record.status === 0) {
      actions.push({ label: '开始', onClick: handleStart.bind(null, record) });
    }
    if (record.status === 1) {
      actions.push({ label: '结束', onClick: handleEnd.bind(null, record) });
    }
    return actions;
  }
</script>
