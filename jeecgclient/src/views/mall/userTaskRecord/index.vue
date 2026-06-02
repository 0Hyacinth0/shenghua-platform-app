<template>
  <div>
    <BasicTable @register="registerTable">
    </BasicTable>
  </div>
</template>

<script lang="ts" name="mall-userTaskRecord" setup>
  import { BasicTable } from '/@/components/Table';
  import { columns, searchFormSchema } from './userTaskRecord.data';
  import { list } from './userTaskRecord.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  const { tableContext } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: { schemas: searchFormSchema },
    },
  });
  const [registerTable] = tableContext;
</script>
