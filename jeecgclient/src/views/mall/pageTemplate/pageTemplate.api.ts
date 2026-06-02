import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/mall/pageTemplate/list',
  save = '/mall/pageTemplate/add',
  edit = '/mall/pageTemplate/edit',
  delete = '/mall/pageTemplate/delete',
  deleteBatch = '/mall/pageTemplate/deleteBatch',
  queryById = '/mall/pageTemplate/queryById',
}

/**
 * 页面模板列表
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
 * 查询详情
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params });

/**
 * 删除页面模板
 * @param params
 * @param handleSuccess
 */
export const deleteTemplate = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除页面模板
 * @param params
 * @param handleSuccess
 */
export const batchDeleteTemplate = (params, handleSuccess) => {
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
