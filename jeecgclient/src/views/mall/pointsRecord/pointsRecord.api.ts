import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/pointsRecord/list',
  edit = '/mall/pointsRecord/edit',
  delete = '/mall/pointsRecord/delete',
}

export const list = (params: any) => defHttp.get({ url: Api.list, params });

export const saveOrUpdate = (params: any, isUpdate: boolean) => {
  if (isUpdate) {
    return defHttp.post({ url: Api.edit, params });
  }
  return defHttp.post({ url: Api.edit, params });
};

export const deletePointsRecord = (id: string, handleSuccess: () => void) => {
  return defHttp.delete({ url: `${Api.delete}/${id}` }).then(() => {
    handleSuccess();
  });
};
