import { SerializedTextOperation } from 'ot';
import { CRDT, EvtType, FileExtraType, UserInfo } from 'types';

export class CreateReplaySourceDto implements CRDT {
  createTime: number;
  timestamp: number;
  userInfo: Pick<UserInfo, 'uuid' | 'role'>;
  editor?: {
    operation?: SerializedTextOperation;
    selection?: any;
    revision?: number;
    evtType?: EvtType;
    extraInfo?: any;
  };
  file?: {
    action?: FileExtraType;
    path?: string;
    redisKey?: string;
    value?: string;
    revision?: number;
  };
  position?: any;
  cursor?: any;
  selection?: number[][];
  terminal?: {
    doc?: { action: FileExtraType; value?: string };
    extraInfo?: any;
  };
  console?: {
    doc?: { action: FileExtraType; value?: string };
    extraInfo?: any;
  };
  media?: { extraInfo?: { segmentId: string } };
  extend?: any;
  event?: string;

  readonly dockerId: string;
}
