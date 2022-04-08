import { daoStore } from '~/stores';
import { currentDoc, userStore } from '~/stores/daoStore';
import { UserInfo } from '~/types/dao';
export const IsMe = (userId: UserInfo['userId']) => {
  const _u = userStore.getState().userInfo;
  return _u.userId === userId;
};

export const IsSameFile = (file: { path?: string }) => {
  const _f = currentDoc.getState().doc;
  return _f?.path === file.path;
};
