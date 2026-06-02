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
    <SeckillProductModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="mall-seckillProduct" setup>
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import SeckillProductModal from './components/Modal.vue';
  import { columns, searchFormSchema, setNameMap } from './seckillProduct.data';
  import { list, deleteSeckillProduct, batchDeleteSeckillProduct } from './seckillProduct.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { defHttp } from '/@/utils/http/axios';
  import { onMounted } from 'vue';

  onMounted(async () => {
    const map: Record<string, string> = {}
    try { const r: any = await defHttp.get({ url: '/mall/seckill/list', params: { pageSize: 99 } }); (r?.records||[]).forEach((a:any)=>{ map['a_'+a.id]=a.activityName }) } catch {}
    try { const r: any = await defHttp.get({ url: '/mall/spu/list', params: { pageSize: 999 } }); (r?.records||[]).forEach((s:any)=>{ map['s_'+s.id]=s.spuName; (s.skuList||[]).forEach((k:any)=>{ map['k_'+k.id]=k.specText||k.id }) }) } catch {}
    setNameMap(map)
  })

  const [registerModal, { openModal }] = useModal();
  const { prefixCls, tableContext } = useListPage({
    designScope: 'mall-seckillProduct',
    tableProps: {
      title: '秒杀商品管理',
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
    deleteSeckillProduct({ id: record.id }, reload);
  }

  function batchHandleDelete() {
    batchDeleteSeckillProduct({ ids: selectedRowKeys.value.join(',') }, reload);
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
