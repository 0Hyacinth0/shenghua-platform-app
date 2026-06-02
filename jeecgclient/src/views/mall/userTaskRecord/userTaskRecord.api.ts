import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/userTaskRecord/list',
}

/**
 * 用户任务记录列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
