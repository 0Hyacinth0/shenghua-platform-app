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
    <PageConfigModal @register="registerModal" @success="handleSuccess" />

    <!-- 可视化页面设计器（全屏覆盖） -->
    <PageDesigner
      v-if="designerConfigId"
      :configId="designerConfigId"
      @close="designerConfigId = ''"
    />
  </div>
</template>

<script lang="ts" name="mall-pageConfig" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/src/components/Table';
  import { useModal } from '/src/components/Modal';
  import { Modal } from 'ant-design-vue';
  import PageConfigModal from './components/Modal.vue';
  import PageDesigner from '../pageDesign/index.vue';
  import { columns, searchFormSchema } from './pageConfig.data';
  import { list, deleteConfig, batchDeleteConfig, publish, unpublish } from './pageConfig.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const [registerModal, { openModal }] = useModal();
  const { prefixCls, tableContext } = useListPage({
    designScope: 'mall-pageConfig',
    tableProps: {
      title: '页面配置管理',
      api: list,
      columns: columns,
      actionColumn: {
        width: 320,
      },
      formConfig: {
        schemas: searchFormSchema,
      },
    },
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  // 设计器状态
  const designerConfigId = ref('');

  function handleCreate() {
    openModal(true, {});
  }

  function handleEdit(record) {
    openModal(true, { ...record });
  }

  function handleDesign(record) {
    designerConfigId.value = record.id;
  }

  function handleDelete(record) {
    deleteConfig({ id: record.id }, reload);
  }

  function batchHandleDelete() {
    batchDeleteConfig({ ids: selectedRowKeys.value.join(',') }, reload);
  }

  async function handlePublish(record) {
    Modal.confirm({
      title: '确认发布',
      content: '确定要发布该页面吗？发布后将在终端生效。',
      okText: '确认发布',
      cancelText: '取消',
      onOk: async () => {
        await publish({ id: record.id });
        reload();
      },
    });
  }

  async function handleUnpublish(record) {
    Modal.confirm({
      title: '确认取消发布',
      content: '确定要取消发布该页面吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await unpublish({ id: record.id });
        reload();
      },
    });
  }

  function handleSuccess() {
    reload();
  }

  function getTableAction(record) {
    const actions: any[] = [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '设计',
        color: 'primary',
        onClick: handleDesign.bind(null, record),
      },
    ];

    if (record.publishStatus === 1) {
      actions.push({
        label: '取消发布',
        popConfirm: {
          title: '确认取消发布?',
          confirm: handleUnpublish.bind(null, record),
        },
      });
    } else {
      actions.push({
        label: '发布',
        popConfirm: {
          title: '确认发布?',
          confirm: handlePublish.bind(null, record),
        },
      });
    }

    actions.push({
      label: '删除',
      popConfirm: {
        title: '确认删除?',
        confirm: handleDelete.bind(null, record),
      },
    });

    return actions;
  }
</script>
