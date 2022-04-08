import React, { Suspense, useEffect, useState } from 'react';
import { lazy } from '@loadable/component';
import { useOT } from '~/hooks';
// import * as ot from 'ot';
import styled from '@emotion/styled';
// import { animated, useSpring } from 'react-spring';
import Terminal from '~/components/Terminal';
import Tabs from '~/components/Tabs';
import create from 'zustand';
import { css } from '@emotion/css';
import { Avatar } from '~/components';
import Skeleton from '~/components/Skeleton';
import { daoStore } from '~/stores';
// import { FileTree } from '~/components/FileTree';
import Console from '~/components/Console';
import ToolBar from '~/components/ToolBar';
// import { TreeItemIndex } from 'react-complex-tree/lib/esm/types';
import OutputBrowser from '~/components/OutputBrowser';
import { ITerminalOptions } from 'xterm';
import {
  dockerState,
  ErrorMsgState,
  shadowUserStore,
  userListStore,
  userStore,
} from '~/stores/daoStore';
import 'devicon/devicon.min.css';
import SplitPane from 'react-split-pane';

export enum LanguageIcon {
  js = 'javascript',
  ts = 'typescript',
  typescript = 'typescript',
  tsx = 'typescript',
  python = 'python',
  json = 'json',
  ruby = 'ruby',
  rb = 'ruby',
  java = 'java',
  md = 'markdown',
  erb = 'erb',
  css = 'css',
  ru = 'ruby',
  ejs = 'html',
  html = 'html',
}
const useIndexState = create<{
  isFolded: boolean;
  setFold: (arg: boolean) => void;
}>((set) => ({
  isFolded: false,
  setFold: (arg) => set({ isFolded: arg }),
}));

// import { Editor as LazyEditorComponent } from '../components/Editor';
const LazyEditorComponent = lazy(
  async () => (await import('../components/Editor')).Editor,
);
import { FileTree as LazyTreeComponent } from '../components/FileTree';
import { Toast } from '~/helpers/collections/toast';
import { theme } from '~/theme';
import { login } from '~/helpers/collections/github0auth';

const MainLayout = styled.div`
  width: 100vw;
  height: 100vh;
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

const PreviewWrapper = styled.div`
  color: #333333;
  overflow: hidden;
`;

const TermWrapper = styled.div`
  height: calc(100% - 46vh);
`;

const HeaderLayout = styled.header`
  width: 100%;
`;

const ContainerLayout = styled.div`
  // height: calc(100% - 4.625rem);
  height: calc(100% - 64px - 12px);
`;

// const IDELayout = styled.div`
//   height: 100%;
// `;

const RunnerLayout = styled.section`
  background: #202327;
`;

const Index: React.FC<{
  replay?: () => void;
  playgroundId?: string;
  serviceWorkerOrigin?: string;
}> = (props) => {
  const tabItems = [
    {
      eventKey: 'console',
      itemName: 'Console',
    },
    {
      eventKey: 'shell',
      itemName: 'Shell',
    },
  ];
  const defaultOptions: ITerminalOptions = {
    convertEol: true,
    fontSize: 12,
    fontFamily: 'Monaco, Menlo, monospace',
    lineHeight: 1,
    cursorBlink: true,
    cursorWidth: 1,
    cursorStyle: 'block',
    rightClickSelectsWord: true,
    theme: {
      background: '#1E1E1E',
    },
  };

  // console.log(props);
  const userInfo = userStore((state) => state.userInfo);
  const isFolded = useIndexState.getState().isFolded;
  const playgroundInfo = daoStore((state) => state.playgroundInfo);
  const dockerInfo = daoStore((state) => state.dockerInfo);

  const [active, setActive] = useState('shell');
  const [url, setUrl] = useState(dockerInfo.url);
  const { socket } = useOT.getState();
  const [consoleComp, setConsoleComp] = useState(<></>);

  let terminalTabsTimer = 1;

  useEffect(() => {
    if (terminalTabsTimer && active === 'console') {
      terminalTabsTimer--;
      setConsoleComp(<Console options={defaultOptions} fitHook={isFolded} />);
    }
  }, [active]);

  useEffect(() => {
    props.replay && props.replay();
  }, [props.replay]);

  useEffect(() => {
    setUrl(dockerInfo.url);
  }, [dockerInfo]);

  dockerState.subscribe(
    (state) => state,
    (pre, next) => {
      // this.trigger(pick(pre, ['dockerStatus']), pick(next, ['dockerStatus']));
    },
  );

  daoStore.subscribe(
    (state) => state,
    (pre, next) => {
      // this.trigger(
      //   pick(pre, ['playgroundStatus']),
      //   pick(next, ['playgroundStatus']),
      // );
    },
  );

  ErrorMsgState.subscribe(
    (state) => state,
    (next, pre) => {
      Toast.message({
        type: 'error',
        content: next.message.content,
        placement: 'topCenter',
      });
    },
  );

  /* 用户状态 */
  userListStore.subscribe((next, pre) => {
    // this.trigger(pick(pre, ['userList']), pick(next, ['userList']));
  });

  shadowUserStore.subscribe((next, pre) => {
    // debugger;
    if (next.shadowUser.userId) {
      Toast.message({
        type: 'success',
        content: `正在跟随${next.shadowUser.username}`,
        placement: 'topCenter',
      });
    } else {
      Toast.message({
        type: 'success',
        content: `已退出跟随模式`,
        placement: 'topCenter',
      });
    }
    // this.trigger(
    //   {
    //     followingUser: pre.shadowUser,
    //   },
    //   {
    //     followingUser: pre.shadowUser,
    //   },
    // );
    // this.trigger(pick(pre, ['shadowUser']), pick(next, ['shadowUser']));
  });

  useEffect(() => {
    props.playgroundId &&
      socket?.emit(
        'playgroundInfo',
        JSON.stringify({
          messageId: '1',
          playgroundId: props.playgroundId,
        }),
      );
    // temp code
  }, [props.playgroundId]);

  useEffect(() => {
    useOT.getState().socket?.emit('active');

    return () => {
      console.log('page down');
    };
  }, []);
  return userInfo ? (
    <>
      <MainLayout className="flex flex-col">
        {/* <MultiPlayerCursor /> */}

        {/* 头部 */}
        <HeaderComponent />
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
              defaultSize={
                '18%'
                // parseInt(localStorage.getItem('splitPos')!, 10) || '18%'
              }
              onChange={(size) =>
                localStorage.setItem('splitPos', size.toString())
              }
              onDragFinished={() => {
                console.log('dragged');
                // window.editor.layout();
              }}
            >
              <section className="flex flex-row tree w-full h-full">
                {/* <SliderComponent /> */}
                <TreeComponent
                  onClick={(d) => {
                    console.log(d);
                  }}
                />
                {/* 文件树 */}
              </section>
              {/* 编辑器与终端 */}
              {/* <section className="w-full h-full bg-slate-200">
                <LazyEditorComponent
                  serviceWorkerOrigin={props.serviceWorkerOrigin}
                  useLsp
                />
              </section> */}
              {/* <section className="bg-codezone-black rounded-sm mx-3.5 w-full h-full flex-1 flex flex-col editor"> */}
              <section className="bg-codezone-black rounded-sm w-full h-full flex-1 flex flex-col editor">
                {dockerInfo.dockerId ? (
                  <Suspense fallback={<Skeleton count={10} type={'Tree'} />}>
                    <LazyEditorComponent
                      serviceWorkerOrigin={props.serviceWorkerOrigin}
                      useLsp
                    />
                  </Suspense>
                ) : null}
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
                  parseInt(localStorage.getItem('splitPosBrowser')!, 10) ||
                  '60%'
                }
                onChange={(size) =>
                  localStorage.setItem('splitPosBrowser', size.toString())
                }
              >
                <PreviewWrapper className="mb-2.5 relative w-full h-full">
                  <OutputBrowser url={url!} showURL />
                </PreviewWrapper>

                <div className="h-full flex flex-col">
                  <Tabs
                    className="mt-5"
                    appearance="tabs"
                    activeKey={active}
                    onSelect={setActive}
                    tabItems={tabItems}
                  />
                  <Suspense fallback={<Skeleton type={'Tree'} />}>
                    <TermWrapper className="w-full flex-1">
                      <div
                        key="console"
                        className="h-full w-full"
                        style={{
                          display: active === 'console' ? 'block' : 'none',
                        }}
                      >
                        {consoleComp}
                      </div>
                      <div
                        key="terminal"
                        className="w-full h-full"
                        style={{
                          display: active === 'console' ? 'none' : 'block',
                        }}
                      >
                        <Terminal options={defaultOptions} fitHook={isFolded} />
                      </div>
                    </TermWrapper>
                  </Suspense>
                </div>
              </SplitPane>
            </RunnerLayout>
          </SplitPane>
        </ContainerLayout>
      </MainLayout>
    </>
  ) : null;
};
const HeaderComponent = () => {
  // const { userList } = userListStore.getState();
  const userList = userListStore((state) => state.userList);
  const amDoing = daoStore((state) => state.amDoing);
  const globalData = daoStore((state) => state.globalData);
  // const { setAmDoing } = daoStore.getState();
  const user = userStore.getState().userInfo;
  // const [isRecording, setIsRecording] = useState<boolean>(false);
  // console.log(userList);
  return userList ? (
    <HeaderLayout className="relative bg-codezone-black h-16 flex px-9 flex-shrink-0 justify-between">
      <div className="flex">
        <Avatar
          user={user}
          onClick={() => {
            login('a1b78d72310581f840a5');
          }}
        />
        {/* playgroundInfo */}
        <div className="flex text-white" style={{ marginLeft: 20 }}>
          {/* <span className="self-center">{user?.username}</span> */}
          <i className="self-center" style={{ margin: '0 10px' }} />
          <i
            className={`self-center

              devicon-${daoStore
                .getState()
                .dockerInfo?.language?.toLowerCase()}-plain
            lan-iconfont
            colored`}
          />
        </div>
      </div>
      {/* <LiveContent /> */}
      <ToolBar />

      <div className="items-center flex relative">
        {userListStore.getState().userList.map((item, index) => {
          return (
            <div
              key={index}
              onClick={() => {
                shadowUserStore.getState().switchShadowUser(item.userId);
                console.log(shadowUserStore.getState().shadowUser);
              }}
              className="-ml-2.5 z-0 avatar-hover"
            >
              <Avatar user={item} />
            </div>
          );
        })}
      </div>
    </HeaderLayout>
  ) : null;
};

const SliderComponent = () => {
  const setFold = useIndexState((state) => state.setFold);
  const isFolded = useIndexState((state) => state.isFolded);

  return (
    <section className="bg-codezone-black rounded-sm w-14 ml-2.5 flex flex-col pt-5 flex-shrink-0">
      <i
        onClick={() => setFold(!isFolded)}
        className="cursor-pointer text-2xl text-gray-50 self-center mb-6 flex-center d42 snippets"
      />
      {/* <i className="cursor-pointer text-2xl text-gray-50 self-center mb-6 flex-center d42 Field-time"></i>
      <i className="cursor-pointer text-2xl text-gray-50 self-center mb-6 flex-center d42 CodeSandbox"></i>
      <i className="cursor-pointer text-2xl text-gray-50 self-center mb-6 flex-center d42 database"></i>
      <i className="cursor-pointer text-2xl text-gray-50 self-center mb-6 flex-center d42 cloud-upload"></i>
      <i className="cursor-pointer text-2xl text-gray-50 self-center mb-6 flex-center d42 setting"></i> */}
    </section>
  );
};

// console.log(theme.extend.colors['codezone-black']);
const TreeComponent = (props: {
  onClick: ((arg: { uri: string; path: string }) => void) | undefined;
}) => {
  const isFolded = useIndexState.getState().isFolded;
  return (
    <section className="bg-codezone-black rounded-sm transition-all flex-shrink-0 w-full tree-container">
      <header>文件</header>
      <div className="tree-content w-full">
        <Suspense fallback={<Skeleton count={5} type={'Tree'} />}>
          <LazyTreeComponent
            onClick={props.onClick}
            bgColor={theme.extend.colors['codezone-black']}
          />
        </Suspense>
      </div>
    </section>
  );
};
export default Index;
