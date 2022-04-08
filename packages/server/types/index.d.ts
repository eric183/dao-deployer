type FileExtraType = 'Add' | 'Get' | 'Update' | 'Edit';
type EvtType = 'File' | 'Editor' | 'Selection' | 'Position';

export interface CRDT {
  timestamp: number;
  userId?: UserInfo['userId'];
  cursor?: any;
  selection?: any;
  editor?: {
    operation?: SerializedTextOperation;
    revision?: number;
  };
  file?: FileData;
  terminal?: {
    operation?: SerializedTextOperation;
    revision?: number;
    action?: FileExtraType;
    value?: string;
  };
  console?: {
    operation?: SerializedTextOperation;
    revision?: number;
    action?: FileExtraType;
    value?: string;
  };

  // 其他同步数据
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extendInfo?: any;
}
// export interface CRDT {
//   timestamp: number;
//   userInfo: Pick<UserInfo, 'userId' | 'role'>;
//   editor?: {
//     operation?: SerializedTextOperation;
//     selection?: any;
//     revision?: number;
//     evtType?: EvtType;
//     extraInfo?: any;
//   };
//   file?: {
//     action?: FileExtraType;
//     path?: string;
//     redisKey?: string;
//     value?: string;
//     revision?: number;
//   };
//   position?: any;
//   cursor?: any;
//   selection?: number[][];
//   terminal?: {
//     doc?: {
//       action: FileExtraType;
//       value?: string;
//     };
//     extraInfo?: any;
//   };
//   console?: {
//     doc?: {
//       action: FileExtraType;
//       value?: string;
//     };
//     extraInfo?: any;
//   };
//   media?: {
//     extraInfo?: {
//       segmentId: string;
//     };
//   };
//   extend?: any;
// }

// interface ReplaySource {
//   timestamp: string | number;
//   userInfo: Pick<UserInfo, 'uuid' | 'role'>;
//   editor?: {
//     operation?: SerializedTextOperation;
//     // selection?: TextSelection;
//     selection?: any;
//     revision?: number;
//     evtType?: EvtType;
//     doc?: {
//       action: FileExtraType;
//       path: string | number;
//       redisKey?: string;
//       value?: string;
//     };
//     extraInfo?: any;
//   };
//   terminal?: {
//     [key: string]: {
//       doc?: {
//         action: FileExtraType;
//         value?: string;
//       };
//       extraInfo?: any;
//     };
//   };
//   file?: {
//     [key: string]: {
//       action: FileExtraType;
//       path: string | number;
//       redisKey?: string;
//       value?: string;
//     };
//   };
//   console?: {
//     [key: string]: {
//       doc?: {
//         action: FileExtraType;
//         value?: string;
//       };
//       extraInfo?: any;
//     };
//   };
//   selection?: {
//     [key: string]: {
//       position: any;
//       secondaryPositions: any;
//     };
//   };
//   media?: {
//     [key: string]: {
//       extraInfo?: {
//         segmentId: string;
//       };
//     };
//   };
// }

export type UserInfo = {
  avatar?: string;
  name?: string;
  username?: string;
  uuid?: string;
  userId?: string;
  role?: string;
  cursor?: any;
  selection?: any;
  onlineCount?: number;
  ticket: string;
};

export interface PlaygroundInfoType {
  activeDockerId?: string;
  playgroundId: string;
  messageId: string;
  timestamp: number;
  replyMessageId: string;
  status: string;
  dockerId: string;
  language: string;
  languageVersion: string;
  framework: string;
  frameworkVersion: string;
  needRunButton: boolean;
  needConsole: boolean;
  needBrowser: boolean;
  url?: string;
  // dockerInfos: dockerInfo[];
  dockerInfos: Map<string, DockerInfoType>;
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

export interface FileTree {
  children: FileTree[];
  type: string;
  name: string;
  uri: string;
}
