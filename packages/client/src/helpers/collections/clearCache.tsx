import { useOT } from '~/hooks';

export const clearCache = () => {
  localStorage.clear();
  indexedDB.deleteDatabase('daopaas').onsuccess = () => {
    // console.log('daopaas Deleted !');
  };
  useOT.getState()?.socket?.emit('clearCache');
};

export const adminClearCache = () => {
  localStorage.clear();
  indexedDB.deleteDatabase('daopaas').onsuccess = () => {
    // console.log('daopaas Deleted !');
  };
  useOT.getState()?.socket?.emit('adminClearCache');
};
