import { CRDT } from './crdt';

export type FileExtraType =
  | 'Add'
  | 'Get'
  | 'Update'
  | 'Edit'
  | 'Expand'
  | 'Collapse';

export type ModuleType = 'Tree' | 'Editor' | 'Terminal' | 'Console' | 'Browser';

export type EvtType = 'File' | 'Editor' | 'Selection' | 'Position';

export type PlaygroundStatus = 'EMPTY' | 'ACTIVE' | 'INACTIVE';

export type DockerStatus = 'RUNNING' | 'STOP';

// [浏览器用户行为状态数据]： 顶层数据结构
export interface DaoStore {
  // 当前应用的版本 1.0.1  [1.0.x兼容， 1.x.x不兼容] 0.5.0
  version: string;

  // 当前应用的实例用户
  userInfo: UserInfo;

  // 当前应用票据
  ticket: string;

  // 用于同步 IDE Server 的版本数据
  CRDTInfo: CRDT;

  enabledComponents: Dao_FrontType.ModuleType[];

  // 左侧 tab
  // 当前应用的状态 toFixed: diff
  // debug 待补充
  amDoing:
    | 'coding'
    | 'replaying'
    | 'replayPaused'
    | 'recording'
    | 'following'
    | 'debugging'
    | 'diff';

  // 跟随视角同步模块 to:Fixed
  followingModuleType: Dao_FrontType.ModuleType;

  // 当前应用的 playground 信息
  playgroundInfo: PlaygroundInfo;

  // 当前应用的 playground 运行信息
  playgroundStatus: PlaygroundInfo['status'];

  // 当前应用的 docker 信息
  dockerInfo: DockerInfo;

  // 当前应用的 docker 运行信息
  dockerStatus: DockerInfo['status'];

  // socket: SocketIOClient.Socket;
  // 心跳信息 toFixed
}

// [运行时环境数据]
interface PlaygroundInfo {
  dockerInfos: Map<string, DockerInfo>;
  status?: PlaygroundStatus;
  playgroundId?: string;
  result?: string;
  ticket?: string;
  activeDockerId?: string;
}

interface DockerInfo {
  dockerId: string;
  fileTree: FileTree;
  status: DockerStatus;
  terminalHistory: string;
  consoleHistory: string;
  language: string;
  languageVersion: string;
  framework: string;
  frameworkVersion: null;
  //   needRunButton: boolean;
  //   needConsole: boolean;
  //   needBrowser: boolean;

  // 改名
  url?: string;
  lspUrl?: string;
  lspRoot?: string;
}

interface FileTree {
  children: FileTree[];
  expanded?: boolean;
  type: string;
  name: string;
  uri: string;
}

export interface FileData {
  action?: FileExtraType;
  path: string;
  redisKey?: string;
  value?: string;
  revision?: number;
}

export interface UserInfo {
  // 不是真正的 ID
  userId: string;
  // userId?: string;
  tenantId: string;
  username: string;
  avatarUrl?: string;
}

// export type UserInfo = {
//   avatar?: string;
//   name?: string;
//   uuid?: string;
//   role?: string;
// };

// daoStoreDB 的数据结构 toFixed. { name } []
export interface daoStoreDB {
  // 文件树状态
  FileTree: FileTree;

  // 初始文件状态
  originFiles: {
    // '/path': { content: 'hello world', version: 0 }
    [key: string]: {
      content: string;
      revision: number;
    };
  };

  // 当前文件状态
  targetFiles: {
    // '/path': { content: 'hello world, Dao paas', version: 5 }
    [key: string]: {
      content: string;
      revision: number;
    };
  };

  // 回放列表
  replayList: {
    [key: string]: CRDT[];
  };
}
