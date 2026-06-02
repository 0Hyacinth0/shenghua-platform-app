import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/mall/pageComponent/list',
  save = '/mall/pageComponent/add',
  edit = '/mall/pageComponent/edit',
  delete = '/mall/pageComponent/delete',
  deleteBatch = '/mall/pageComponent/deleteBatch',
  queryById = '/mall/pageComponent/queryById',
}

/**
 * 组件库列表
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
 * 删除组件
 * @param params
 * @param handleSuccess
 */
export const deleteComponent = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除组件
 * @param params
 * @param handleSuccess
 */
export const batchDeleteComponent = (params, handleSuccess) => {
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
