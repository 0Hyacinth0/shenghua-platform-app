import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/category/tree',
  save = '/mall/category/add',
  edit = '/mall/category/edit',
  delete = '/mall/category/delete',
  deleteBatch = '/mall/category/deleteBatch',
}

/**
 * 获取分类树
 * @param params
 */
export const getCategoryTree = (params) => defHttp.get({ url: Api.list, params });

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
 * 删除分类
 * @param params
 * @param handleSuccess
 */
export const deleteCategory = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除分类
 * @param params
 */
export const batchDeleteCategory = (params) =>
  defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true });
