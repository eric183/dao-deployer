/* eslint-disable */
// @ts-nocheck

import { DaoPaaS } from '../../../client/dist/DaoPaaS';
import { noSSR } from 'next/dynamic';

export const paasImporter = async () => {
  return (await noSSR(
    (async () => (await import('../../../client/dist/DaoPaaS.es.js')).DaoPaaS) as any,
    {
      ssr: false,
    },
  )) as unknown as typeof DaoPaaS;
};
