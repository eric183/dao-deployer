import '../styles/globals.css';
// import '@dao42/d42paas-front/style.css';
import '../dist/style.css';

import { Client } from '@notionhq/client';
import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints';
import type { AppProps } from 'next/app';
// import { DaoPaaS } from '@dao42/d42paas-front';
import { daoStore } from '../lib/stores/daoStore';
import { noSSR } from 'next/dynamic';
import { useEffect } from 'react';
import getConfig from 'next/config';
import { paasImporter } from '../lib/utils/paasImporter';
import { ChakraProvider } from '@chakra-ui/react';
import { Alert } from '../components/Alert';
import { LoginModal } from '../components/LoginModal';
import { modalStore } from '../lib/stores/modelStore';
import { useRouter } from 'next/router';
import { checkToken } from '../lib/utils/checkToken';
import { PageLoading } from '~/packages/d42paas-official/components/PageLoading';
import { loadingStore } from '~/packages/d42paas-official/lib/stores/loadingStore';

// import { getTicket } from '../lib/utils/request';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

// const MyApp = ({ Component, pageProps, notionData }: AppProps) => {
const MyApp = ({ Component, pageProps }: AppProps<DaoShow.AppInitProps>) => {
  const { dao, createDao } = daoStore((state) => state);
  const isOpen = modalStore((state) => state.isOpen);
  const router = useRouter();
  // const init = async () => {};
  const isLoading = loadingStore((state) => state.isLoading);

  useEffect(() => {
    const handleRouteChange = () => {
      checkToken();
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    // if(dao) {
    //   dao.onMessage = (d) => {
    //       console.log(d)
    //   }
    //   dao.onError = (d) => {
    //       debugger;
    //   }
    // }
    // console.log(isOpen);
  }, [isOpen]);

  return (
    <ChakraProvider>
      <PageLoading isLoading={isLoading}>
        {/* <Alert status={'error'} desc={} /> */}
        <LoginModal isOpen={isOpen} setIsOpen={modalStore.getState().setOpen} />

        <Component {...pageProps} />
      </PageLoading>
    </ChakraProvider>
  );
};

// MyApp.getInitialProps = async () => {
//   const notion = new Client({
//     auth: process.env.NOTION_KEY,
//   });

//   const data = await notion.blocks.children.list({
//     block_id: process.env.PAGE_ID!,
//   });
//   return {
//     pageProps: {
//       notionData: data,
//     },
//   };
// };

export default MyApp;
