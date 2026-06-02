import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/mall/distributorLevel/list',
  save = '/mall/distributorLevel/add',
  edit = '/mall/distributorLevel/edit',
  delete = '/mall/distributorLevel/delete',
  deleteBatch = '/mall/distributorLevel/deleteBatch',
}

/**
 * 分销等级列表
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
 * 删除分销等级
 * @param params
 * @param handleSuccess
 */
export const deleteDistributorLevel = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除分销等级
 * @param params
 * @param handleSuccess
 */
export const batchDeleteDistributorLevel = (params, handleSuccess) => {
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
