import { SerializedTextOperation } from 'ot';
import { CRDT, EvtType, FileExtraType, UserInfo } from 'types';

export class CreateReplayfilesDto {
  readonly dockerId: string;
  readonly value: string;
  readonly revision: number;
  readonly path: string;
}
