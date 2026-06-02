import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/mall/presale/list',
  save = '/mall/presale/add',
  edit = '/mall/presale/edit',
  delete = '/mall/presale/delete',
  deleteBatch = '/mall/presale/deleteBatch',
  start = '/mall/presale/start',
  end = '/mall/presale/end',
}

/**
 * 预售活动列表
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
 * 删除预售活动
 * @param params
 * @param handleSuccess
 */
export const deletePresale = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除预售活动
 * @param params
 * @param handleSuccess
 */
export const batchDeletePresale = (params, handleSuccess) => {
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

/**
 * 开始活动
 * @param params
 */
export const startActivity = (params) => {
  return defHttp.put({ url: Api.start, params }, { joinParamsToUrl: true });
};

/**
 * 结束活动
 * @param params
 */
export const endActivity = (params) => {
  return defHttp.put({ url: Api.end, params }, { joinParamsToUrl: true });
};
