import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/spu/list',
  save = '/mall/spu/add',
  edit = '/mall/spu/edit',
  delete = '/mall/spu/delete',
  deleteBatch = '/mall/spu/deleteBatch',
  queryById = '/mall/spu/queryById',
  shelf = '/mall/spu/shelf',
  unshelf = '/mall/spu/unshelf',
  approve = '/mall/spu/approve',
  reject = '/mall/spu/reject',
}

/**
 * 商品列表
 * @param params
 */
export const getSpuList = (params) => defHttp.get({ url: Api.list, params });

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
 * 删除商品
 * @param params
 * @param handleSuccess
 */
export const deleteSpu = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除商品
 * @param params
 */
export const batchDeleteSpu = (params) =>
  defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true });

/**
 * 根据ID查询商品详情
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params }, { joinParamsToUrl: true });

/**
 * 上架
 * @param params
 */
export const shelfSpu = (params) => defHttp.put({ url: Api.shelf, params }, { joinParamsToUrl: true });

/**
 * 下架
 * @param params
 */
export const unshelfSpu = (params) => defHttp.put({ url: Api.unshelf, params }, { joinParamsToUrl: true });
export const approveSpu = (params) => defHttp.put({ url: Api.approve, params }, { joinParamsToUrl: true });
export const rejectSpu = (params) => defHttp.put({ url: Api.reject, params }, { joinParamsToUrl: true });
