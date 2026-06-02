import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/userCoupon/list',
  queryById = '/mall/userCoupon/queryById',
}

/**
 * 用户优惠券列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 通过ID查询
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params });
