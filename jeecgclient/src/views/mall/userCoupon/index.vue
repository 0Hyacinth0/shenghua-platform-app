<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <UserCouponModal @register="registerModal" />
  </div>
</template>

<script lang="ts" name="mall-userCoupon" setup>
  import { BasicTable, useTable, TableAction } from '/src/components/Table';
  import { useModal } from '/src/components/Modal';
  import UserCouponModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './userCoupon.data';
  import { list } from './userCoupon.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const [registerModal, { openModal }] = useModal();
  const { prefixCls, tableContext } = useListPage({
    designScope: 'mall-userCoupon',
    tableProps: {
      title: '用户优惠券',
      api: list,
      columns: columns,
      actionColumn: {
        width: 120,
      },
      formConfig: {
        schemas: searchFormSchema,
      },
    },
  });

  const [registerTable, { reload }] = tableContext;

  function handleView(record) {
    openModal(true, { ...record });
  }

  function getTableAction(record) {
    return [
      {
        label: '查看详情',
        onClick: handleView.bind(null, record),
      },
    ];
  }
</script>
