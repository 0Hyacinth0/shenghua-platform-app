import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/mall/freightTemplate/list',
  save = '/mall/freightTemplate/add',
  edit = '/mall/freightTemplate/edit',
  delete = '/mall/freightTemplate/delete',
  deleteBatch = '/mall/freightTemplate/deleteBatch',
}

/**
 * 运费模板列表
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
 * 删除运费模板
 * @param params
 * @param handleSuccess
 */
export const deleteFreightTemplate = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除运费模板
 * @param params
 * @param handleSuccess
 */
export const batchDeleteFreightTemplate = (params, handleSuccess) => {
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
