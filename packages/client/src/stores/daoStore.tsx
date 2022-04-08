import create, { GetState, Mutate, SetState, StoreApi } from 'zustand';
import { daopaasDB, SetDB } from '~/helpers/collections/idb';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useOT } from '~/hooks';
import { setAmDoingTo } from '~/helpers/collections/resetter';
import { DaoStore, ModuleType, UserInfo } from '~/types/dao';
// import { ModuleType } from '~/types/crdt';

type CRDT = Required<Dao_FrontType.CRDT>;
type TFile = CRDT['file'];
export type T_PlaygroundStatus = 'EMPTY' | 'ACTIVE' | 'INACTIVE';
export type T_DockerStatus = 'RUNNING' | 'STOP';
// type bearType = Omit<StateType, 'userInfo' | 'setUserInfo'>;

interface FileTree {
  children: FileTree[];
  type: string;
  name: string;
  uri: string;
}

interface ErrorMsgType {
  message: any;
  setMessage: (arg: any) => void;
}

export interface DiffPatternInfo {
  value: string;
  type: string;
}

export interface Github0Auth {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: null;
  blog: string;
  location: string;
  email: null;
  hireable: boolean;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface DaoUserInfo {
  github0auth?: Github0Auth;
  operation?: any;
  uuid?: string;
  userId?: string;
  paasUserId?: string;
  color?: string;
  name?: string;
  username?: string;
  role?: string;
  avatarUrl?: string;
  onlineCount?: number;
  coUsers?: any[];
  tenantId?: string;
  // [x: string]:
  //   | string
  //   | number
  //   | qs.ParsedQs
  //   | string[]
  //   | number[]
  //   | qs.ParsedQs[];
  // [x: string]: string | qs.ParsedQs | string[] | qs.ParsedQs[];
}

export interface T_File {
  valueAndPos?: string;
  path?: string;
  value?: string;
}

export interface T_Query {
  playgroundId?: string;
}

export interface T_PlaygroundInfo {
  activeDockerId?: string;
  dockerId?: string;
  fileTree?: unknown;
  framework?: string;
  frameworkVersion?: string;
  language?: string;
  languageVersion?: string;
  needBrowser?: boolean;
  needConsole?: boolean;
  needRunButton?: boolean;
  url?: string;
  version?: string;
  frameWork?: string;
  frameWorkVersion?: string;
  status?: string;
  runStatus?: string;
  terminalHistory?: string;
  messageId?: string;
  playgroundId?: string;
  result?: string;
  lspUrl?: string;
  ticket?: string;
  dockerInfos?: Map<string, DockerInfoType>;
}

export interface DockerInfoType {
  messageId: string;
  timestamp: number;
  replyMessageId: string;
  dockerId: string;
  playgroundId: string;
  fileTree: FileTree;
  runStatus: string;
  terminalHistory: string;
  consoleHistory: string;
  language: string;
  languageVersion: string;
  framework: string;
  frameworkVersion: null;
  needRunButton: boolean;
  needConsole: boolean;
  needBrowser: boolean;
  url?: string;
  lspUrl?: string;
  lspRoot?: string;
}

export interface DocType {
  doc: TFile;
  switchDoc: (arg: TFile) => void;
}

export interface StateType extends DaoStore {
  userInfo: UserInfo;

  // dockerInfo: any;
  globalData: {
    [key: string]: any;
  };
  asyncType?: 'editor' | 'file' | 'terminal' | 'console' | 'media' | 'extend';
  // asyncType: any;

  // playgroundInfo: T_PlaygroundInfo;
  playgroundStatus: T_PlaygroundStatus;
  dockerStatus: T_DockerStatus;
  setAmDoing: (arg: StateType['amDoing']) => void;
  setGlobalData: (arg: { [key: string]: any }) => void;
  setUserInfo: (arg: UserInfo) => void;
  setCRDTInfo: (arg: Dao_FrontType.CRDT) => void;
  setPlaygroundInfo: (arg: T_PlaygroundInfo) => void;
  setDockerInfo: (arg: unknown) => void;
  setPlaygroundStatus: (arg: T_PlaygroundStatus) => void;
  setDockerStatus: (arg: T_DockerStatus) => void;
  setAsyncType: (arg: StateType['asyncType']) => void;
  // setIsRecording: (arg: boolean) => void;
  // setSenders: (arg: T_UserInfo[]) => void;
  // switchLspServer: (arg: boolean) => void;
  // setFileSaved: (arg: boolean) => void;
  // setServerAck: () => void;
  // setVersion: (arg: number) => void;
  // setPlaygroundInfo: (arg: Pick<Omit<StateType, "userInfo" | "setUserInfo">, "playgroundInfo">) => void;
  // setQueryObject: (arg: any) => void;
}

interface DockerStatus {
  dockerStatus: T_DockerStatus;
  setDockerStatus: (arg: T_DockerStatus) => void;
}

// type bearType = Omit<StateType, 'userInfo' | 'setUserInfo'>;
export const daoStore = create<
  StateType,
  SetState<StateType>,
  GetState<StateType>,
  Mutate<StoreApi<StateType>, [['zustand/subscribeWithSelector', never]]>
>(
  subscribeWithSelector(
    (set) =>
      ({
        asyncType: undefined,
        amDoing: 'code',
        setAmDoing: (arg: any) => set(() => ({ amDoing: arg })),

        CRDTInfo: {
          userId: '',
        } as unknown as Dao_FrontType.CRDT,

        dockerInfo: {},
        playgroundInfo: {
          data: {
            fileTree: {},
            framework: '',
            frameworkVersion: null,
            language: '',
            languageVersion: null,
            needBrowser: true,
            needConsole: true,
            needRunButton: true,
            url: '',
            version: '',
            terminalHistory: '',
          },
          messageId: '',
          playgroundId: '',
          result: '',
          dockerInfos: new Map([]),
        },
        playgroundStatus: 'EMPTY',
        dockerStatus: 'STOP',
        globalData: {
          isRecording: false,
          syncCursor: false,
          useLsp: true,
          loading: false,
          disableEditor: false,
          showMarkdown: false,
        },

        setCRDTInfo: (arg: Dao_FrontType.CRDT) =>
          set(() => ({ CRDTInfo: { ...arg, userId: arg.userId! } })),
        // switchLspServer: (arg) => set(() => ({ lspServerDisabled: arg })),
        // setIsRecording: (arg) => set(() => ({ isRecording: arg })),
        // setFileSaved: (arg) => set(() => ({ fileSaved: arg })),
        // setSenders: (arg) => set(() => ({ senders: arg })),
        // setVersion: (arg) => set(() => ({ revision: arg })),
        // setQueryObject: (arg) => set(() => ({ queryObject: arg })),
        setGlobalData: (arg: { [x: string]: any; isRecording?: boolean }) =>
          set(({ amDoing, globalData }) => {
            if (
              'isRecording' in arg &&
              arg.isRecording &&
              (amDoing === 'replaying' || amDoing === 'replayPaused')
            ) {
              throw 'dError: 回放中无法录制！';
              // throw '录制过程中无法回放！';
            }
            return {
              globalData: { ...globalData, ...arg },
            };
          }),
        setPlaygroundInfo: (arg: any) => set(() => ({ playgroundInfo: arg })),
        setDockerInfo: (arg: any) => set(() => ({ dockerInfo: arg })),
        setPlaygroundStatus: (arg: any) =>
          set(() => ({ playgroundStatus: arg })),
        setDockerStatus: (arg: any) => set(() => ({ dockerStatus: arg })),
        setAsyncType: (arg: any) => set(() => ({ asyncType: arg })),
      } as unknown as StateType),
  ),
);

export const dockerState = create<
  DockerStatus,
  SetState<DockerStatus>,
  GetState<DockerStatus>,
  Mutate<StoreApi<DockerStatus>, [['zustand/subscribeWithSelector', never]]>
>(
  subscribeWithSelector(
    (set) =>
      ({
        dockerStatus: 'STOP',
        setDockerStatus: (arg) => set({ dockerStatus: arg }),
      } as DockerStatus),
  ),
);

export const ErrorMsgState = create<
  ErrorMsgType,
  SetState<ErrorMsgType>,
  GetState<ErrorMsgType>,
  Mutate<StoreApi<ErrorMsgType>, [['zustand/subscribeWithSelector', never]]>
>(
  subscribeWithSelector(
    (set) =>
      ({
        message: {},
        setMessage: (arg) => set({ message: arg }),
      } as ErrorMsgType),
  ),
);

export const currentDoc = create<
  DocType,
  SetState<DocType>,
  GetState<DocType>,
  Mutate<StoreApi<DocType>, [['zustand/subscribeWithSelector', never]]>
>(
  subscribeWithSelector(
    (set) =>
      ({
        doc: {},
        switchDoc: (arg) => set({ doc: arg }),
      } as DocType),
  ),
);

export const fileTreeStore = create<{
  fileTree: any;
  switchFileTree: (arg: any) => void;
}>(
  // persist(
  (set) => ({
    fileTree: {},
    switchFileTree: (arg) => set(() => ({ fileTree: arg })),
  }),
  //   {
  //     name: 'fileTree',
  //     getStorage: () => localStorage,
  //   },
  // ),
);

export const ackStore = create<{
  customAck: number;
  setCustomAck: () => void;
}>((set) => ({
  customAck: 0,
  setCustomAck: () => set(({ customAck }) => ({ customAck: customAck + 1 })),
}));

export const userStore = create<{
  userInfo: DaoUserInfo;
  setUserInfo: (arg: DaoUserInfo) => void;
}>(
  persist(
    (set) => ({
      userInfo: null as unknown as DaoUserInfo,
      setUserInfo: (arg: DaoUserInfo) => set(() => ({ userInfo: arg })),
    }),
    {
      name: 'userInfo',
      getStorage: () => localStorage,
    },
  ),
);

export const syncCursorStore = create<{
  syncCursor: boolean;
  setSyncCursor: (arg: boolean) => void;
}>((set) => ({
  syncCursor: true,
  setSyncCursor: (arg: boolean) => set(() => ({ syncCursor: arg })),
}));

export const followingUserStore = create<{
  followingUsers: DaoUserInfo[];
  setFollowingUsers: (arg: DaoUserInfo[]) => void;
}>((set) => ({
  followingUsers: [] as DaoUserInfo[],
  setFollowingUsers: (arg: DaoUserInfo[]) =>
    set(() => ({ followingUsers: arg })),
}));

export const shadowUserStore = create<{
  shadowUser: Partial<DaoUserInfo>;
  switchShadowUser: (id?: string) => void;
}>(
  persist(
    (set) => ({
      shadowUser: {},
      switchShadowUser: (id?: string) =>
        set(() => {
          const followingUser = userStore.getState().userInfo;
          const io = useOT.getState().socket;
          let user;
          if (id !== undefined) {
            user = userListStore
              .getState()
              .userList.find((user) => user.userId === id)!;

            console.log(`已切换至【${user.username}】视角`);
            io?.emit('following', {
              user,
              followingUser,
            });
          } else {
            io?.emit('unFollowing', { followingUser });
            console.log(`已退出跟随视角`);
          }

          // if (user.uuid || user.userId) {
          //   console.log(`已切换至【${user.username}】视角`);
          // } else {
          // }

          // const user = userListStore
          //   .getState()
          //   .userList.find((x) => x.userId === arg.userId?.toString())!;
          return { shadowUser: user ? user : {} };
        }),
    }),
    {
      name: 'shadowUser',
      getStorage: () => localStorage,
    },
  ),
);

export const userListStore = create<{
  userList: DaoUserInfo[];
  setUserList: (arg: DaoUserInfo[]) => void;
}>(
  persist(
    (set) => ({
      userList: [] as DaoUserInfo[],
      setUserList: (arg: DaoUserInfo[]) => set(() => ({ userList: arg })),
    }),
    {
      name: 'userList',
      getStorage: () => ({
        getItem: async (name: string): Promise<string | null> => {
          // Exit early on server
          if (typeof indexedDB === 'undefined') {
            return null;
          }

          const response = await (await daopaasDB()).getAll('users');
          // debugger;
          return JSON.stringify(response[0]) || null;
        },
        setItem: async (name: string, value: string): Promise<void> => {
          const d = await daopaasDB();
          d.put('users', JSON.parse(value).state[name], 'userList');
        },
        removeItem: async () => {
          // console.log();
        },
      }),
    },
  ),
);

export const diffStore = create<{
  diffPattern: DiffPatternInfo[];
  setDiffPattern: (arg: DiffPatternInfo[]) => void;
}>((set) => ({
  diffPattern: [],
  setDiffPattern: (arg: DiffPatternInfo[]) =>
    set(() => {
      if (arg.length > 0) {
        setAmDoingTo('diff');
      } else {
        setAmDoingTo('coding');
      }
      return { diffPattern: arg };
    }),
}));

export const loadingStore = create<{
  moduleLoading: {
    [K in ModuleType]?: boolean;
  };
  setModuleLoading: (arg: { [K in ModuleType]?: boolean }) => void;
}>((set) => ({
  moduleLoading: {
    Editor: false,
    Tree: false,
    Browser: false,
    Console: false,
    Terminal: false,
  },
  setModuleLoading: (arg) =>
    set(({ moduleLoading }) => {
      return {
        moduleLoading: {
          ...moduleLoading,
          ...arg,
        },
      };
    }),
}));
