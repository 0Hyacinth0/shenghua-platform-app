<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增商品</a-button>
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
    <SpuModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="mall-spu" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/src/components/Table';
  import { useModal } from '/src/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import SpuModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './spu.data';
  import { getSpuList, deleteSpu, batchDeleteSpu, shelfSpu, unshelfSpu, approveSpu, rejectSpu } from './spu.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { defHttp } from '/@/utils/http/axios';
  import { onMounted } from 'vue';

  onMounted(async () => {
    try {
      const res: any = await defHttp.get({ url: '/mall/merchant/list', params: { pageSize: 999 } });
      const map: Record<string, string> = {};
      (res?.records || []).forEach((m: any) => { map[m.id] = m.shopName; (window as any).__merchantTypes = (window as any).__merchantTypes || {}; (window as any).__merchantTypes[m.id] = m.storeType });
      (window as any).__merchantNames = map;
    } catch {}
  });

  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const { prefixCls, tableContext, doRequest } = useListPage({
    designScope: 'mall-spu',
    tableProps: {
      title: '商品SPU管理',
      api: getSpuList,
      columns: columns,
      actionColumn: {
        width: 240,
      },
      formConfig: {
        schemas: searchFormSchema,
      },
    },
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  function handleCreate() {
    openModal(true, { isUpdate: false });
  }

  function handleEdit(record) {
    openModal(true, { record, isUpdate: true });
  }

  async function handleDelete(record) {
    await deleteSpu({ id: record.id }, reload);
  }

  async function batchHandleDelete() {
    doRequest(() => batchDeleteSpu({ ids: selectedRowKeys.value }));
  }

  async function handleApprove(record: any) { await approveSpu({ id: record.id }); reload(); }
  async function handleReject(record: any) { const reason = prompt('拒绝原因(可选):'); await rejectSpu({ id: record.id, reason: reason || '' }); reload(); }
  async function handleShelf(record) {
    await shelfSpu({ id: record.id });
    createMessage.success('上架成功');
    reload();
  }

  async function handleUnshelf(record) {
    await unshelfSpu({ id: record.id });
    createMessage.success('下架成功');
    reload();
  }

  function handleSuccess() {
    reload();
  }

  function getTableAction(record) {
    const actions = [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '确定删除该商品吗?',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
    if (record.auditStatus === 0) {
      actions.push({ label: '审核通过', color: 'green', onClick: handleApprove.bind(null, record) });
      actions.push({ label: '审核拒绝', color: 'red', onClick: handleReject.bind(null, record) });
    }
    if (record.shelfStatus === 1) {
      actions.push({
        label: '下架',
        popConfirm: {
          title: '确定下架该商品吗?',
          confirm: handleUnshelf.bind(null, record),
        },
      });
    } else if (record.auditStatus === 1) {
      actions.push({
        label: '上架',
        popConfirm: {
          title: '确定上架该商品吗?',
          confirm: handleShelf.bind(null, record),
        },
      });
    }
    return actions;
  }
</script>
