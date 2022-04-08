// import { DaoPaaS } from '../../../client/dist/DaoPaaS';
import { DaoPaaS } from '../../dist/DaoPaaS';

import create from 'zustand';

export const daoStore = create<{
  dao: DaoPaaS | null;
  createDao: (dao: DaoPaaS) => void;
}>((set) => {
  const dao: DaoPaaS | null = null;
  return {
    dao,
    createDao: (dao: DaoPaaS) => {
      set({ dao });
    },
  };
});
