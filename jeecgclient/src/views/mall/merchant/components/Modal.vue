<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="getTitle" @ok="handleSubmit" :showOkBtn="isAuditMode || isEditMode" width="800px">
    <a-spin :spinning="loading">
      <template v-if="isEditMode">
        <a-form :model="editForm" layout="vertical">
          <a-form-item label="店铺名称"><a-input v-model:value="editForm.shopName" /></a-form-item>
          <a-form-item label="店铺性质"><a-radio-group v-model:value="editForm.storeNature"><a-radio :value="0">个人</a-radio><a-radio :value="1">企业</a-radio></a-radio-group></a-form-item>
          <a-form-item label="联系电话"><a-input v-model:value="editForm.contactPhone" /></a-form-item>
          <a-form-item label="营业执照号"><a-input v-model:value="editForm.businessLicenseNo" /></a-form-item>
          <a-form-item label="营业执照URL"><a-input v-model:value="editForm.businessLicense" /></a-form-item>
          <a-form-item label="法人姓名"><a-input v-model:value="editForm.legalPerson" /></a-form-item>
          <a-form-item label="身份证正面URL"><a-input v-model:value="editForm.idCardFront" /></a-form-item>
          <a-form-item label="身份证反面URL"><a-input v-model:value="editForm.idCardBack" /></a-form-item>
          <a-form-item label="店铺描述"><a-textarea v-model:value="editForm.shopDescription" :rows="3" /></a-form-item>
        </a-form>
      </template>
      <template v-else>
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="店铺名称">{{ detail.shopName }}</a-descriptions-item>
          <a-descriptions-item label="商家类型"><a-tag :color="detail.merchantType===1?'blue':'green'">{{ detail.merchantType===1?'B2C':'C2C' }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="店铺性质"><a-tag :color="detail.storeNature===1?'blue':'default'">{{ detail.storeNature===1?'企业':'个人' }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="店铺类型"><a-tag :color="detail.storeType===0?'orange':'blue'">{{ detail.storeType===0?'系统店铺':'入驻商家' }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="审核状态"><a-tag :color="auditColor(detail.auditStatus)">{{ auditLabel(detail.auditStatus) }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="运营状态"><a-tag :color="detail.status===1?'green':'red'">{{ detail.status===1?'营业':'关闭' }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ detail.contactPhone }}</a-descriptions-item>
          <a-descriptions-item label="营业执照号" :span="2">{{ detail.businessLicenseNo || '-' }}</a-descriptions-item>
          <a-descriptions-item label="法人姓名">{{ detail.legalPerson || '-' }}</a-descriptions-item>
          <a-descriptions-item label="营业执照" :span="2"><a-image v-if="detail.businessLicense" :src="detail.businessLicense" :width="200" /><span v-else>-</span></a-descriptions-item>
          <a-descriptions-item label="身份证正面" :span="2"><a-image v-if="detail.idCardFront" :src="detail.idCardFront" :width="200" /><span v-else>-</span></a-descriptions-item>
          <a-descriptions-item label="身份证反面" :span="2"><a-image v-if="detail.idCardBack" :src="detail.idCardBack" :width="200" /><span v-else>-</span></a-descriptions-item>
          <a-descriptions-item label="累计收益">¥{{ (detail.totalEarnings||0).toFixed(2) }}</a-descriptions-item>
          <a-descriptions-item label="可提现余额">¥{{ (detail.balance||0).toFixed(2) }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ detail.createTime }}</a-descriptions-item>
        </a-descriptions>
        <template v-if="isAuditMode">
          <a-divider>审核</a-divider>
          <a-form :model="auditForm" layout="vertical">
            <a-form-item label="结果"><a-radio-group v-model:value="auditForm.auditStatus"><a-radio :value="1">通过</a-radio><a-radio :value="2">拒绝</a-radio></a-radio-group></a-form-item>
            <a-form-item label="备注"><a-textarea v-model:value="auditForm.remark" :rows="3" /></a-form-item>
          </a-form>
        </template>
      </template>
    </a-spin>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { queryById, auditMerchant } from '../merchant.api';
  import { defHttp } from '/@/utils/http/axios';

  const emit = defineEmits(['register', 'success']);
  const loading = ref(false); const isAuditMode = ref(false); const isEditMode = ref(false);
  const detail = reactive<any>({});
  const auditForm = reactive({ auditStatus: 1, remark: '' });
  const editForm = reactive({ shopName: '', contactPhone: '', shopDescription: '', merchantType: 1, businessLicense: '', businessLicenseNo: '', legalPerson: '', idCardFront: '', idCardBack: '', storeNature: 1 });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    loading.value = true; isAuditMode.value = data?.mode === 'audit'; isEditMode.value = data?.mode === 'edit';
    auditForm.auditStatus = 1; auditForm.remark = '';
    try {
      if (data?.record?.id) {
        const res: any = await queryById({ id: data.record.id });
        Object.assign(detail, res || {});
        if (isEditMode.value) {
          editForm.shopName = detail.shopName||''; editForm.contactPhone = detail.contactPhone||'';
          editForm.shopDescription = detail.shopDescription||''; editForm.merchantType = detail.merchantType||1;
          editForm.businessLicense = detail.businessLicense||''; editForm.businessLicenseNo = detail.businessLicenseNo||'';
          editForm.legalPerson = detail.legalPerson||''; editForm.idCardFront = detail.idCardFront||'';
          editForm.idCardBack = detail.idCardBack||'';
          editForm.storeNature = detail.storeNature != null ? detail.storeNature : 1;
        }
      }
    } finally { loading.value = false; }
  });

  const getTitle = computed(() => isAuditMode.value ? '商家审核' : isEditMode.value ? '编辑商家' : '商家详情');
  function auditColor(s: number): string { return ({0:'orange',1:'green',2:'red'} as any)[s] || 'default' }
  function auditLabel(s: number): string { return ({0:'待审核',1:'通过',2:'拒绝'} as any)[s] || '未知' }

  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      if (isAuditMode.value) {
        await auditMerchant({ id: detail.id, auditStatus: auditForm.auditStatus, remark: auditForm.remark });
      } else if (isEditMode.value) {
        await defHttp.post({ url: '/mall/merchant/edit', params: { id: detail.id, ...editForm } });
      }
      closeModal(); emit('success');
    } finally { setModalProps({ confirmLoading: false }); }
  }
</script>
