import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SerializedTextOperation } from 'ot';
import { CRDT, EvtType, FileExtraType } from 'types';

export type ReplaySourcesDocument = ReplaySources & Document;

@Schema()
export class ReplaySources {
  @Prop({ type: Number })
  createTime: number;

  @Prop({ type: Number })
  timestamp: number;

  @Prop({ type: Object })
  editor?: {
    operation?: SerializedTextOperation;
    selection?: any;
    revision?: number;
    evtType?: EvtType;
    extraInfo?: any;
  };

  @Prop({ type: Object })
  file?: {
    action?: FileExtraType;
    path?: string;
    redisKey?: string;
    value?: string;
    revision?: number;
  };

  @Prop({ type: Object })
  position?: any;

  @Prop({ type: Object })
  cursor?: any;

  @Prop({ type: Object })
  selection?: number[][];

  @Prop({ type: Object })
  terminal?: {
    doc?: { action: FileExtraType; value?: string };
    extraInfo?: any;
  };

  @Prop({ type: Object })
  console?: {
    doc?: { action: FileExtraType; value?: string };
    extraInfo?: any;
  };

  @Prop({ type: Object })
  media?: { extraInfo?: { segmentId: string } };

  @Prop({ type: Object })
  extend?: any;

  @Prop({ type: Object })
  userInfo: CRDT['userInfo'];

  @Prop()
  dockerId: string;

  @Prop()
  event: string;
}

export const ReplaySourcesSchema = SchemaFactory.createForClass(ReplaySources);
