<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls">导出</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <OrderDetailModal ref="orderDetailModalRef" />
    <a-modal v-model:open="shipVisible" title="发货" @ok="confirmShip" okText="确认发货" cancelText="取消" :confirmLoading="shipLoading">
      <a-form layout="vertical">
        <a-form-item label="快递公司" required>
          <a-auto-complete v-model:value="shipForm.expressCompany" placeholder="选择或输入快递公司" :options="courierOptions" />
        </a-form-item>
        <a-form-item label="快递单号" required>
          <a-input v-model:value="shipForm.expressNo" placeholder="请输入快递单号" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" name="mall-order" setup>
  import { ref, reactive } from 'vue';
  import { BasicTable, useTable, TableAction } from '/src/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import OrderDetailModal from './components/Modal.vue';
  import { columns, searchFormSchema } from './order.data';
  import { getOrderList, shipOrder, getExportUrl } from './order.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const { createMessage } = useMessage();
  const orderDetailModalRef = ref();
  const { prefixCls, tableContext, onExportXls } = useListPage({
    designScope: 'mall-order',
    tableProps: {
      title: '订单管理',
      api: getOrderList,
      columns: columns,
      actionColumn: {
        width: 180,
        fixed: 'right',
      },
      formConfig: {
        schemas: searchFormSchema,
      },
    },
    exportConfig: {
      name: '订单列表',
      url: getExportUrl,
    },
  });

  const [registerTable, { reload }] = tableContext;

  const couriers = ['顺丰速运', '中通快递', '圆通速递', '韵达快递', '申通快递', '京东物流', '极兔速递', '邮政快递', '德邦物流'];
  const courierOptions = couriers.map(c => ({ value: c }));
  const shipVisible = ref(false);
  const shipLoading = ref(false);
  const shipForm = reactive({ orderId: '', expressCompany: '', expressNo: '' });

  function handleDetail(record) {
    orderDetailModalRef.value?.loadDetail(record);
  }

  function handleShip(record) {
    shipForm.orderId = record.id;
    shipForm.expressCompany = '';
    shipForm.expressNo = '';
    shipVisible.value = true;
  }

  async function confirmShip() {
    if (!shipForm.expressCompany || !shipForm.expressNo) {
      createMessage.warning('请填写快递公司和单号');
      return;
    }
    shipLoading.value = true;
    try {
      await shipOrder({ orderId: shipForm.orderId, expressCompany: shipForm.expressCompany, expressNo: shipForm.expressNo });
      shipVisible.value = false;
      reload();
    } catch {
      createMessage.error('发货失败');
    } finally {
      shipLoading.value = false;
    }
  }

  function getTableAction(record) {
    const actions: any[] = [
      {
        label: '查看详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
    if (record.orderStatus === 1) {
      actions.push({
        label: '发货',
        onClick: handleShip.bind(null, record),
      });
    }
    return actions;
  }
</script>
