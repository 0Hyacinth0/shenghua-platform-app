import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/order/list',
  queryById = '/mall/order/queryById',
  ship = '/mall/order/ship',
  export = '/mall/order/exportXls',
}

/**
 * 导出url
 */
export const getExportUrl = Api.export;

/**
 * 订单列表
 * @param params
 */
export const getOrderList = (params) => defHttp.get({ url: Api.list, params });

/**
 * 根据ID查询订单详情
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params }, { joinParamsToUrl: true });

/**
 * 发货
 * @param params
 */
export const shipOrder = (params) => defHttp.put({ url: Api.ship, params }, { joinParamsToUrl: true });
