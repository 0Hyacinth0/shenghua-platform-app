import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/commissionRecord/list',
  queryById = '/mall/commissionRecord/queryById',
}

/**
 * 佣金记录列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 查询佣金记录详情
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params }, { joinParamsToUrl: true });
