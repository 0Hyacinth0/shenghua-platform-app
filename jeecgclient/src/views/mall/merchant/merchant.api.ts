import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/merchant/list',
  queryById = '/mall/merchant/queryById',
  audit = '/mall/merchant/audit',
  close = '/mall/merchant/close',
  open = '/mall/merchant/open',
}

/**
 * 商家列表
 * @param params
 */
export const getMerchantList = (params) => defHttp.get({ url: Api.list, params });

/**
 * 根据ID查询商家详情
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params }, { joinParamsToUrl: true });

/**
 * 审核商家
 * @param params
 */
export const auditMerchant = (params) => defHttp.put({ url: Api.audit, params }, { joinParamsToUrl: true });

/**
 * 关闭店铺
 * @param params
 */
export const closeMerchant = (params) => defHttp.put({ url: Api.close, params }, { joinParamsToUrl: true });

/**
 * 开启店铺
 * @param params
 */
export const openMerchant = (params) => defHttp.put({ url: Api.open, params }, { joinParamsToUrl: true });
