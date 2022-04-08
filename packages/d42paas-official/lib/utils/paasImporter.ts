/* eslint-disable */
// @ts-nocheck

import { DaoPaaS } from '@dao42/d42paas-front';
import { noSSR } from 'next/dynamic';

export const paasImporter = async () => {
  return (await noSSR(
    (async () => (await import('@dao42/d42paas-front')).DaoPaaS) as any,
    {
      ssr: false,
    },
  )) as unknown as typeof DaoPaaS;
};
