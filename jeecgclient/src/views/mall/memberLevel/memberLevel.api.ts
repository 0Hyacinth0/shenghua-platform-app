import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/mall/memberLevel/list',
  save = '/mall/memberLevel/add',
  edit = '/mall/memberLevel/edit',
  delete = '/mall/memberLevel/delete',
  deleteBatch = '/mall/memberLevel/deleteBatch',
}

/**
 * 会员等级列表
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
 * 删除会员等级
 * @param params
 * @param handleSuccess
 */
export const deleteMemberLevel = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除会员等级
 * @param params
 * @param handleSuccess
 */
export const batchDeleteMemberLevel = (params, handleSuccess) => {
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
