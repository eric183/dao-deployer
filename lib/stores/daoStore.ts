// import { DaoPaaS } from '../../../client/dist/DaoPaaS';
import { DaoPaaS } from '@dao42/d42paas-front';

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
