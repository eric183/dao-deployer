import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import Head from 'next/head';
import Image from 'next/image';
import qs from 'qs';
import dynamic, { noSSR } from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import SplitPane from 'react-split-pane';
import styled from '@emotion/styled';
import { daoStore } from '../lib/stores/daoStore';
import { getTicket } from '../lib/utils/request';

// import { daoStore } from '../../lib/stores/daoStore';

// import { getTicket } from '../../lib/utils/request';

const MainLayout = styled.div`
  /* width: 100vw;
  height: 100vh; */
  overflow: hidden;
  background: #202327;
  .lan-iconfont {
    font-size: 40px;
  }
  .replay-button {
    margin-left: 20px;
    box-shadow: 0 0 5px aliceblue;
    padding: 7px;
    border-radius: 5px;
    font-size: 12px;
    background: #fff;
    color: #000;
    transition: 0.2s all;
    &:active {
      box-shadow: 0 0 0 aliceblue;
      margin-right: 8px;
      margin-top: 5px;
    }
  }
  .tree-container {
    header {
      margin: 15px;
      font-size: 16px;
      color: #6b6d6c;
    }
  }

  .tree-content {
    height: calc(100% - 52px);
  }
`;

const RunnerLayout = styled.section`
  background: #202327;
`;

const PreviewWrapper = styled.div`
  color: #333333;
  overflow: hidden;
`;

const TermWrapper = styled.div`
  height: calc(100% - 46vh);
`;

const ContainerLayout = styled.div`
  height: calc(100% - 64px - 12px);
`;

const IDE = () => {
  const { dao, createDao } = daoStore((state) => state);
  const [splitPos, setSplitPos] = useState<number | string>('18%');
  useEffect(() => {
    // console.log(JSON.stringify(props, null, 2));

    if (dao) {
      // dao.Editor({ container: '.editor-section' });
      dao.mapRender([
        {
          container: '.tree-section',
          item: 'Tree',
        },
        {
          container: '.editor-section',
          item: 'Editor',
        },
        {
          container: '.browser-section',
          item: 'Browser',
        },
        {
          container: '.terminal-section',
          item: 'Shell',
        },
      ]);

      dao?.activePlayground();

      dao.onMessage = (d) => {
        // debugger;
      };
      dao.onError = (d) => {
        // debugger;
      };
    }
    setTimeout(() => {
      // dao?.dispose();
      setTimeout(() => {
        // createDao(
        //   new DaoPaaS({
        //     debug: true,
        //     userId: '1',
        //     username: 'kuangkuang',
        //     tenantId: '1',
        //     playgroundId: '370288265829416960',
        //     ticket:
        //       'MXwzNzAyODgyNjU4Mjk0MTY5NjB8MzgxMjE5NTU4NTY2MDAyNjg4fHwxNzExODczODQ0MDAw',
        //   }),
        // );
      }, 1000);
    }, 2000);
  }, [dao]);
  useEffect(() => {
    // createDao(
    //   new DaoPaaS({
    //     debug: true,
    //     userId: '1',
    //     username: 'kuangkuang',
    //     tenantId: '1',
    //     playgroundId: '370288265829416960',
    //     ticket:
    //       'MXwzNzAyODgyNjU4Mjk0MTY5NjB8MzgxMjE5NTU4NTY2MDAyNjg4fHwxNzExODczODQ0MDAw',
    //   }),
    // );
    setSplitPos(parseInt(window.localStorage.getItem('splitPos')!, 10));
  }, []);

  // typeof window !== 'undefined'
  //   ? parseInt(window.localStorage.getItem('splitPos')!, 10)
  //   : '18%';
  // '18%';

  // (typeof window !== 'undefined' &&
  //   parseInt(window.localStorage.getItem('splitPos')!, 10)) ||
  // '18%';
  return (
    <>
      <MainLayout className="flex flex-col w-full h-full">
        {/* 头部 */}
        {/* <HeaderComponent /> */}
        {/* 内容区 */}
        <ContainerLayout className="flex flex-1 mt-2.5 flex-row relative">
          {/* 左侧栏 */}
          <SplitPane
            split="vertical"
            defaultSize="60%"
            pane2Style={{
              width: '100%',
            }}
          >
            <SplitPane
              split="vertical"
              pane2Style={{
                width: '80%',
              }}
              defaultSize={splitPos || '18%'}
              onChange={(size) => {
                // if (window !== 'undefined') {
                window.localStorage.setItem('splitPos', size.toString());
                // }
              }}
              onDragFinished={() => {
                console.log('dragged');
              }}
            >
              <section className="tree-section flex flex-row w-full h-full">
                {/* 文件树 */}
              </section>

              <section className="editor-section bg-codezone-black rounded-sm w-full h-full flex-1 flex flex-col">
                {/* {dockerInfo.dockerId ? (
                  <Suspense fallback={<Skeleton count={10} type={'Tree'} />}>
                    <LazyEditorComponent
                      serviceWorkerOrigin={props.serviceWorkerOrigin}
                      useLsp
                    />
                  </Suspense>
                ) : null} */}
              </section>
            </SplitPane>
            {/* 运行框 */}
            <RunnerLayout className={`rounded-sm mr-2.5 shell-runner w-full`}>
              <SplitPane
                split="horizontal"
                pane2Style={{
                  width: '100%',
                  height: '40%',
                }}
                defaultSize={
                  (typeof window !== 'undefined' &&
                    parseInt(
                      window.localStorage.getItem('splitPosBrowser')!,
                      10,
                    )) ||
                  '60%'
                }
                onChange={(size) =>
                  typeof window !== 'undefined' &&
                  window.localStorage.setItem(
                    'splitPosBrowser',
                    size.toString(),
                  )
                }
              >
                <PreviewWrapper className="browser-section mb-2.5 relative w-full h-full">
                  {/* <OutputBrowser url={url!} showURL /> */}
                </PreviewWrapper>

                <div className="h-full flex flex-col">
                  {/* <Tabs
                    className="mt-5"
                    appearance="tabs"
                    activeKey={active}
                    onSelect={setActive}
                    tabItems={tabItems}
                  /> */}
                  <TermWrapper className="w-full flex-1">
                    {/* <div
                      key="console"
                      className=""
                      style={{
                        display: active === 'console' ? 'block' : 'none',
                        height: '100%',
                        width: '100%',
                      }}
                    >
                      {consoleComp}
                    </div> */}
                    <div
                      className="terminal-section h-full w-full"
                      key="terminal"
                    >
                      {/* <Terminal options={defaultOptions} fitHook={isFolded} /> */}
                    </div>
                  </TermWrapper>
                </div>
              </SplitPane>
            </RunnerLayout>
          </SplitPane>
        </ContainerLayout>
      </MainLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  // const { req } = ;
  const res = await getTicket();
  console.log(res);
  // const data = await res.json();
  const data = { hi: 'good' };
  return {
    props: {
      data,
    },
  };
};

export default IDE;
