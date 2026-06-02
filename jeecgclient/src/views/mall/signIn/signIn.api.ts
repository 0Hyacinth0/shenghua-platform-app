import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/mall/signIn/list',
  edit = '/mall/signIn/edit',
  delete = '/mall/signIn/delete',
}

export const list = (params: any) => defHttp.get({ url: Api.list, params });

export const saveOrUpdate = (params: any, isUpdate: boolean) => {
  return defHttp.post({ url: Api.edit, params });
};

export const deleteSignIn = (id: string, handleSuccess: () => void) => {
  return defHttp.delete({ url: `${Api.delete}/${id}` }).then(() => {
    handleSuccess();
  });
};
