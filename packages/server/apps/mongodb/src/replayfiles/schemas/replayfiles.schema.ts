import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SerializedTextOperation } from 'ot';
import { CRDT, EvtType, FileExtraType } from 'types';

export type ReplayfilesDocument = Replayfiles & Document;

@Schema()
export class Replayfiles {
  @Prop({ type: Number })
  createTime: number;

  @Prop()
  dockerId: string;

  @Prop()
  value: string;

  @Prop()
  revision: number;

  @Prop()
  path: string;
}

export const ReplayfilesSchema = SchemaFactory.createForClass(Replayfiles);
