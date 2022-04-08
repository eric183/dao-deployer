import { daoStore } from '~/stores';
import { StateType, userListStore } from '~/stores/daoStore';

export const clearUserList = () => {
  userListStore.getState().setUserList([]);
};

export const setAmDoingTo = (status: StateType['amDoing'] = 'coding') => {
  daoStore.getState().setAmDoing(status);
};

export const ResetPlayground = () => {
  setAmDoingTo('coding');
  clearUserList();
};

export const resetDB = () => {
  indexedDB.deleteDatabase('daopaas').onsuccess = () => {
    console.log('daopaasDB has Deleted');
  };
};

export const ResetAll = () => {
  // indexedDB.deleteDatabase('daopaas').onsuccess = () => {};
};
