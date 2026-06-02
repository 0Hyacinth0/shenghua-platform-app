import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/mall/pageConfig/list',
  save = '/mall/pageConfig/add',
  edit = '/mall/pageConfig/edit',
  delete = '/mall/pageConfig/delete',
  deleteBatch = '/mall/pageConfig/deleteBatch',
  queryById = '/mall/pageConfig/queryById',
  publish = '/mall/pageConfig/publish',
  unpublish = '/mall/pageConfig/unpublish',
}

/**
 * 页面配置列表
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
 * 发布页面
 * @param params
 */
export const publish = (params) => defHttp.put({ url: Api.publish, params });

/**
 * 取消发布
 * @param params
 */
export const unpublish = (params) => defHttp.put({ url: Api.unpublish, params });

/**
 * 删除页面配置
 * @param params
 * @param handleSuccess
 */
export const deleteConfig = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除页面配置
 * @param params
 * @param handleSuccess
 */
export const batchDeleteConfig = (params, handleSuccess) => {
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
