import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/mall/platformCommission/list',
  save = '/mall/platformCommission/add',
  edit = '/mall/platformCommission/edit',
  delete = '/mall/platformCommission/delete',
  deleteBatch = '/mall/platformCommission/deleteBatch',
}

/**
 * 平台抽成列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 保存或更新
 * @param params
 * @param isUpdate
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url, params });
};

/**
 * 删除平台抽成
 * @param params
 * @param handleSuccess
 */
export const deletePlatformCommission = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除平台抽成
 * @param params
 * @param handleSuccess
 */
export const batchDeletePlatformCommission = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};
