import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/groupBuyRecord/list',
  delete = '/mall/groupBuyRecord/delete',
}

export const list = (params: any) => defHttp.get({ url: Api.list, params });

export const deleteRecord = (id: string, handleSuccess: () => void) => {
  return defHttp.delete({ url: `${Api.delete}/${id}` }).then(() => handleSuccess());
};
