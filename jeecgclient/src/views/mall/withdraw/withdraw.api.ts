import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/commissionWithdraw/list',
  queryById = '/mall/commissionWithdraw/queryById',
  audit = '/mall/commissionWithdraw/audit',
}

/**
 * 提现列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 查询提现详情
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params }, { joinParamsToUrl: true });

/**
 * 审核提现
 * @param params
 */
export const audit = (params) => defHttp.put({ url: Api.audit, params }, { joinParamsToUrl: true });
