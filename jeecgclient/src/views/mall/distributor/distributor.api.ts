import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/mall/distributor/list',
  save = '/mall/distributor/add',
  edit = '/mall/distributor/edit',
  delete = '/mall/distributor/delete',
  deleteBatch = '/mall/distributor/deleteBatch',
  queryById = '/mall/distributor/queryById',
  audit = '/mall/distributor/audit',
}

/**
 * 分销商列表
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
 * 查询分销商详情
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params }, { joinParamsToUrl: true });

/**
 * 审核分销商
 * @param params
 */
export const audit = (params) => defHttp.put({ url: Api.audit, params }, { joinParamsToUrl: true });

/**
 * 删除分销商
 * @param params
 * @param handleSuccess
 */
export const deleteDistributor = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除分销商
 * @param params
 * @param handleSuccess
 */
export const batchDeleteDistributor = (params, handleSuccess) => {
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
