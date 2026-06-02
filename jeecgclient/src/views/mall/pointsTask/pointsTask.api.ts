import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/mall/pointsTask/list',
  save = '/mall/pointsTask/add',
  edit = '/mall/pointsTask/edit',
  delete = '/mall/pointsTask/delete',
  deleteBatch = '/mall/pointsTask/deleteBatch',
}

/**
 * 积分任务列表
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
 * 删除积分任务
 * @param params
 * @param handleSuccess
 */
export const deletePointsTask = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除积分任务
 * @param params
 * @param handleSuccess
 */
export const batchDeletePointsTask = (params, handleSuccess) => {
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
