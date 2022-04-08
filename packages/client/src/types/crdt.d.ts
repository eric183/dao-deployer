/// <reference types="@emotion/react/types/css-prop" />
// / <reference types="socket.io-client" />
/// <reference types="vite/client" />

import { DefaultEventsMap } from '@socket.io/component-emitter';

import { Socket } from 'socket.io-client';

export * from 'monaco-editor';
import { SerializedTextOperation, TextOperation } from 'ot';
import {
  DockerInfo,
  FileData,
  FileExtraType,
  PlaygroundInfo,
  UserInfo,
} from './dao';
import { DaoUserInfo } from '~/stores/daoStore';

// type WindowType = typeof window;
declare global {
  namespace Dao_FrontType {
    type io = unknown;

    type SocketType = Socket<DefaultEventsMap, DefaultEventsMap>;

    type UserInfo = DaoUserInfo;
    type FileExtraType =
      | 'Add'
      | 'Get'
      | 'Update'
      | 'Edit'
      | 'Expand'
      | 'Collapse';
    type EvtType = 'File' | 'Editor' | 'Selection' | 'Position' | 'Cursor';
    type ModuleType = 'Tree' | 'Editor' | 'Terminal' | 'Console' | 'Browser';

    interface CRDT {
      timestamp: number;
      userId: UserInfo['userId'];
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
  }
}

export interface CRDT {
  timestamp: number;
  userId: UserInfo['userId'];
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
// interface CRDT {
//   timestamp: number;
//   userInfo: Pick<UserInfo, 'uuid' | 'role'>;
//   editor?: {
//     operation?: SerializedTextOperation;
//     // selection?: TextSelection;
//     selection?: any;
//     revision?: number;
//     evtType?: EvtType;
//     // doc?: {
//     //   action: FileExtraType;
//     //   path: string | number;
//     //   redisKey?: string;
//     //   value?: string;
//     // };
//     extraInfo?: any;
//   };
//   file?: {
//     action?: FileExtraType;
//     path?: string;
//     redisKey?: string;
//     value?: string;
//     revision?: number;
//   };
//   // selection?: [][] | number[][] | number[] | number;
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
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   extend?: any;
// }

export interface ReplaySourceType extends Partial<CRDT> {
  // invert(value: any): any;
  event: keyof CRDT;
}

export interface FileTreeType {
  playgroundInfo: PlaygroundInfo;
  dockerInfo: DockerInfo;
  crdt: {
    timestamp: number;
    userInfo: UserInfo;
    terminal: {
      doc: {
        action: string;
        value: string;
      };
    };
  };
}

// export interface DockerInfo {
//   messageId: string;
//   timestamp: number;
//   replyMessageId: string;
//   dockerId: string;
//   playgroundId: string;
//   fileTree: FileTree;
//   runStatus: string;
//   terminalHistory: string;
//   consoleHistory: string;
//   language: string;
//   languageVersion: string;
//   framework: string;
//   frameworkVersion: string;
//   needRunButton: boolean;
//   needConsole: boolean;
//   needBrowser: boolean;
//   url: string;
//   lspUrl: string;
//   lspRoot: string;
// }

// export interface FileTree {
//   children: FileTree[];
//   expanded?: boolean;
//   type: string;
//   name: string;
//   uri: string;
// }

// export interface PlaygroundInfo {
//   playgroundId: string;
//   messageId: string;
//   timestamp: number;
//   replyMessageId: string;
//   status: string;
//   dockerId: string;
//   language: string;
//   languageVersion: string;
//   framework: string;
//   frameworkVersion: string;
//   needRunButton: boolean;
//   needConsole: boolean;
//   needBrowser: boolean;
//   url: string;
//   activeDockerId: string;
// }
