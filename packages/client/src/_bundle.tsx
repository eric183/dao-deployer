import { Suspense } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { useOT } from './hooks';
import {
  dockerState,
  ErrorMsgState,
  followingUserStore,
  daoStore,
  shadowUserStore,
  userListStore,
  userStore,
} from './stores/daoStore';
import { sockerIO, SocketType } from './hooks/collections/useOT';
import { PlaygroundInit } from './helpers/collections/playgroundInit';
import { lazy } from '@loadable/component';
import { Loading } from './components/loading';
import { replay } from './helpers/collections/replay';

import './styles/index.css';
import {
  Options,
  Mode,
  TreeProps,
  EditorProps,
  Component,
  ConsoleOrShellProps,
  BrowserProps,
  ComponentPropsType,
  ComponentType,
} from './types/DaoPaaS';
import { ignoreReplayerStore } from './stores/ignoreReplayerStore';
import { ReplaySourceType } from './types/crdt';
import { pick, omit } from 'lodash';
import { isDev } from './helpers/collections/util';

interface ComponentHash {
  [key: string]: string;
}

type DOMtype = string | HTMLElement;

const LazyTreeComponent = lazy(
  async () => (await import('./components/FileTree')).FileTree,
);

const LazyEditorComponent = lazy(
  async () => (await import('./components/Editor')).Editor,
);

const LazyConsoleComponent = lazy(
  async () => (await import('./components/Console')).default,
);

const LazyBrowserComponent = lazy(
  async () => (await import('./components/OutputBrowser')).default,
);

const LazyShellComponent = lazy(
  async () => (await import('./components/Terminal')).default,
);

const LazyPageComponent = lazy(async () => await import('./pages'));

export class DaoPaaS {
  // public variables
  public playgroundId: string;
  public serviceWorkerOrigin?: string;
  public onMessage?: ((message: any) => void) | undefined;
  public onError?: ((message: any) => void) | undefined;
  public avatarUrl: string | undefined;

  // private variables
  private ticket: string;
  private tenantId: string;
  private username: string;

  private components?: Component<ComponentPropsType>[];
  private componentHash: ComponentHash;
  private editorDOM: any;
  private debug?: boolean;

  constructor({
    debug,
    ticket,
    playgroundId,
    tenantId,
    avatarUrl,
    username,
    components,
  }: // serviceWorkerOrigin,
  // onMessage,
  // onError,
  Options) {
    this.ticket = ticket;
    this.playgroundId = playgroundId;
    this.tenantId = tenantId;
    this.avatarUrl = avatarUrl;
    this.username = username ? username : '';
    this.debug = debug;
    this.components = components;
    this.componentHash = {
      Page: '',
      Tree: '',
      Editor: '',
      Console: '',
      Browser: '',
      Shell: '',
    };
    // this.onMessage = onMessage;
    // this.onError = onError;

    // this.serviceWorkerOrigin = serviceWorkerOrigin;
    sessionStorage.setItem('playgroundId', playgroundId);

    this.init();

    this.on = this.on.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  /** Start public methods **/

  // [ instance getter ]: 获取当前 playground 运行状态
  public get playgroundStatus() {
    return this.daoStore.playgroundStatus;
  }

  // [ feature getter ]: 获取当前 docker 运行状态
  public get dockerStatus() {
    return this.daoStore.dockerStatus;
  }

  // [ feature getter ]: 获取当前
  public get ignoreReplayers() {
    return ignoreReplayerStore.getState().ignoreReplayers;
  }

  // [ feature getter ]: 获取用户列表
  public get userList() {
    return userListStore.getState().userList;
  }

  // [ instance lifecycle ]: 实例销毁
  public async dispose() {
    for (const i in this.componentHash) {
      if (this.componentHash[i as keyof ComponentHash]) {
        unmountComponentAtNode(document.querySelector(this.componentHash[i])!);
      }
    }
    useOT.getState().socket?.disconnect();
    return new Promise((resolve) => {
      resolve('instance has disposed');
    });
  }

  // [ feature methods ]: 用户跟随
  public followUser(userId: string, callback?: (user: any) => void) {
    const { switchShadowUser } = shadowUserStore.getState();
    switchShadowUser(userId);
    callback && callback(this.userList.find((u) => u.userId === userId));
  }

  // [ feature methods ]: 取消用户跟随
  public unFollowUser(userInfo: any, callback?: () => void) {
    const { switchShadowUser } = shadowUserStore.getState();
    switchShadowUser();
    callback && callback();
  }

  // [ feature methods ]: 实例回放
  public replay(arg: Required<ReplaySourceType>) {
    if (arg) {
      replay(arg);
    }
  }

  public setIgnoreReplayers(arg: Dao_FrontType.ModuleType[]) {
    ignoreReplayerStore.getState().setIgnoreReplayer(arg);
  }

  // [ feature methods ]: playground 激活方法
  public activePlayground() {
    useOT.getState().socket?.emit('active');
  }

  // [ feature methods ]: playground 运行方法
  public runPlayground() {
    useOT.getState().socket?.emit('run');
  }

  // [ feature methods ]: playground 停止方法
  public stopPlayground() {
    useOT.getState().socket?.emit('stop');
  }

  // [ feature methods ]: 上传文件
  public onUploadFile(payload: string) {
    useOT.getState().socket?.emit('upload', payload);
  }

  // [ feature methods ]: 全局录制同步
  public record(setBoolean: string) {
    const { socket } = useOT.getState();
    if (setBoolean === 'undefined') {
      this.daoStore.setGlobalData({
        isRecording: !!setBoolean,
      });
      socket?.emit('globalData', {
        isRecording: !!setBoolean,
      });
      return;
    }
    this.daoStore.setGlobalData({
      isRecording: !!setBoolean,
    });
    socket?.emit('globalData', {
      isRecording: !!setBoolean,
    });
  }

  /**
   *
   * @memberof DaoPaaS
   * @desc 组件绑定 void
   */

  public Page<A extends DOMtype, T>({
    container,
    props,
  }: {
    container: A;
    props: T;
  }) {
    this.editorDOM = container ? this.isHTMLElement(container) : this.editorDOM;

    render(
      <Suspense fallback={<Loading />}>
        <LazyPageComponent
          {...props}
          serviceWorkerOrigin={this.serviceWorkerOrigin}
        />
      </Suspense>,
      this.editorDOM,
    );
  }

  public Editor<A extends DOMtype, T>({
    container,
    props,
  }: {
    container: A;
    props: T;
  }) {
    this.editorDOM = container
      ? this.isHTMLElement(container, 'Editor')
      : this.editorDOM;
    // render(<Editor {...props} />, this.editorDOM);

    render(
      <Suspense fallback={<Loading />}>
        <LazyEditorComponent
          {...props}
          serviceWorkerOrigin={this.serviceWorkerOrigin}
        />
      </Suspense>,
      this.editorDOM,
    );
  }

  public Shell<A extends DOMtype, T>({
    container,
    props,
  }: {
    container: A;
    props: T;
  }) {
    this.editorDOM = container
      ? this.isHTMLElement(container, 'Shell')
      : this.editorDOM;
    // render(<Editor {...storeProps} />, this.editorDOM);
    render(
      <Suspense fallback={<Loading />}>
        <LazyShellComponent {...props} />
      </Suspense>,
      this.editorDOM,
    );
  }

  public Tree<A extends DOMtype, T>({
    container,
    props,
  }: {
    container: A;
    props: T;
  }) {
    this.editorDOM = container
      ? this.isHTMLElement(container, 'Tree')
      : this.editorDOM;

    render(
      <Suspense fallback={<Loading />}>
        <LazyTreeComponent {...props} />
      </Suspense>,
      this.editorDOM,
    );
  }

  public Console<A extends DOMtype, T>({
    container,
    props,
  }: {
    container: A;
    props: T;
  }) {
    this.editorDOM = container
      ? this.isHTMLElement(container, 'Console')
      : this.editorDOM;
    render(
      <Suspense fallback={<Loading />}>
        <LazyConsoleComponent {...props} />
      </Suspense>,
      this.editorDOM,
    );
  }

  public Browser<A extends DOMtype, T>({
    container,
    props,
  }: {
    container: A;
    props: T;
  }) {
    this.editorDOM = container
      ? this.isHTMLElement(container, 'Browser')
      : this.editorDOM;
    render(
      <Suspense fallback={<Loading />}>
        <LazyBrowserComponent {...props} />
      </Suspense>,
      this.editorDOM,
    );
  }

  /** End Public Methods **/

  /** Start Private Methods **/
  private get daoStore() {
    return daoStore.getState();
  }

  // [ instance lifecycle ]: 实例化初始化
  private async init() {
    const { setSocket } = useOT.getState();

    const initClassDIV = document.createElement('div');
    initClassDIV.className = 'init-class';
    document.body.appendChild(initClassDIV);

    const { setUserInfo, userInfo } = userStore.getState();
    const args = {
      debug: this.debug,
      ticket: this.ticket,
      playgroundId: this.playgroundId,
      avatarUrl: this.avatarUrl ? this.avatarUrl : undefined,
      username: this.username,
      tenantId: this.tenantId,
    };

    // const paasDomain = location.hostname.includes('develop')
    //   ? 'develop'
    //   : 'staging';
    const ticketEnv = `develop`;

    const paasDomain = `${ticketEnv}.1024paas.com`;

    if (isDev()) {
      setSocket(
        new sockerIO({
          ...args,
          paasDomain,
          ioPath: `ws://localhost:3030`,
        }) as SocketType,
      );
    } else {
      try {
        const response = await fetch(
          'https://' + paasDomain + '/jssdk/ticket',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticket: this.ticket }),
          },
        );

        const data = await response.json();

        setSocket(
          new sockerIO({
            ...args,
            paasDomain,
            ioPath: `wss://${data.data}`,
          }) as SocketType,
        );
      } catch (err) {
        console.log(err);
      }
    }

    if (!args.playgroundId) throw '缺少playgroundId';
    if (!args.ticket) throw '缺少ticket';

    setUserInfo({
      ...userInfo,
      username: args.username,
      tenantId: args.tenantId,
    });

    PlaygroundInit<{
      ticket?: string;
      playgroundId?: string;
      userId?: string;
      socket: any;
      callback: any;
    }>({
      ...userInfo,
      ...args,
      socket: useOT.getState().socket,
      callback: () => {
        if (this.components) {
          this.mapRender(this.components);
        }
      },
    });

    if (this.components) {
      this.mapRender(this.components);
    }

    // render(<GuiComponent />, document.querySelector('.init-class'));

    this.messageAndErrorInjection();
  }

  private messageAndErrorInjection() {
    /* docker 状态 */
    dockerState.subscribe(
      (state) => state,
      (next, pre) => {
        this.trigger(
          pick(next, ['dockerStatus']),
          pick(next, ['dockerStatus']),
        );
        this.trigger(pick(next, ['lan']), pick(next, ['dockerStatus']));
      },
    );

    daoStore.subscribe(
      (state) => state,
      (next, pre) => {
        this.trigger(
          pick(next, ['playgroundStatus']),
          pick(next, ['playgroundStatus']),
        );

        this.trigger(
          pick(next.dockerInfo, ['language']),
          pick(next.dockerInfo, ['language']),
        );
      },
    );

    ErrorMsgState.subscribe(
      (state) => state,
      (next, pre) => {
        this.trigger('error', pick(next, 'message'));
      },
    );

    /* 用户状态 */
    userListStore.subscribe((next, pre) => {
      this.trigger(pick(next, ['userList']), pick(next, ['userList']));
    });

    shadowUserStore.subscribe((next, pre) => {
      this.trigger(
        {
          followingUser: next.shadowUser,
        },
        {
          followingUser: next.shadowUser,
        },
      );
    });

    followingUserStore.subscribe((next, pre) => {
      this.trigger(
        {
          usersFollowYou: next.followingUsers,
        },
        {
          usersFollowYou: next.followingUsers,
        },
      );
    });
  }

  private trigger(_d: any, data: any) {
    if (_d === 'error') {
      this.on(data, _d);
      return;
    }
    this.on(data);
  }

  private on(data: any, type?: 'error') {
    if (type === 'error') {
      this.onError && this.onError(data);
    } else {
      this.onMessage && this.onMessage(data);
    }
  }

  public mapRender(components: any[]): void {
    components?.forEach((arg, _index) => {
      const omitObj = omit({ ...arg }, ['item', 'container']);
      switch (arg.item) {
        // case 'Page':
        //   this.Page({
        //     container: arg.container,
        //     props: arg.props || omitObj,
        //   });
        //   break;

        case 'Tree':
          this.Tree<DOMtype, TreeProps>({
            container: arg.container as DOMtype,
            props: arg.props || omitObj,
          });
          break;

        case 'Editor':
          this.Editor<DOMtype, EditorProps>({
            container: arg.container,
            props: {
              ...arg.props,
              serviceWorkerOrigin: this.serviceWorkerOrigin,
            } || {
              ...omitObj,
              serviceWorkerOrigin: this.serviceWorkerOrigin,
            },
          });
          break;

        case 'Console':
          this.Console<DOMtype, ConsoleOrShellProps>({
            container: arg.container,
            props: arg.props || omitObj,
          });
          break;

        case 'Shell':
          this.Shell<DOMtype, ConsoleOrShellProps>({
            container: arg.container,
            props: arg.props || omitObj,
          });
          break;

        case 'Browser':
          this.Browser<DOMtype, BrowserProps>({
            container: arg.container,
            props: arg.props || omitObj,
          });
          break;
      }
    });
  }

  private isHTMLElement(arg: DOMtype, componentKey?: ComponentType): DOMtype {
    const isHTMLElement = /HTMLDivElement|HTMLElement/.test(
      Object.prototype.toString.call(arg),
    );

    if (!isHTMLElement && componentKey) {
      this.componentHash[componentKey] = arg as string;
    }
    return (
      !isHTMLElement ? document.querySelector(arg as string)! : arg
    ) as DOMtype;
  }

  /** End Private Methods **/
}
