import { Inject, Injectable } from '@nestjs/common';
import { omit, pick } from 'lodash';
import { CRDT } from 'types';
import { AppService } from '../entry.service';

interface ReplaySourceType extends CRDT {
  // invert(value: any): any;
  event: keyof CRDT;
  dockerId: string;
}

@Injectable()
export class ReplayService {
  //   @Injectable()

  @Inject(AppService)
  appService: AppService;

  public replayData: Map<number, CRDT> = new Map([]);

  //   public async getReplayData(revision: number): Promise<CRDT> {}

  //   setCRDT(revision: number, crdt: CRDT) {}

  async setReplaySource(
    path: string,
    val:
      | ReplaySourceType
      | {
          dockerId: string;
          value: string;
          revision: number;
          path: string;
        },
    type?: 'CREATE' | 'UPDATE' | 'DELETE',
  ) {
    // const { CRDTInfo, amDoing, globalData } = daoStore.getState();

    // if (amDoing === 'replaying') return;

    // if (val.event === 'editor') {
    //   (val.editor!.revision as number)++;
    // }

    // this.appService.emitMongoCMD({ cmd: 'insertData' }, postObject);
    switch (type) {
      case 'DELETE':
        {
          const _val = val as ReplaySourceType;
          const postObject = {
            ..._val,
            userId: _val.userId,
            // userInfo: pick(_val!.userInfo, ['uuid', 'role']),
            file: omit(_val.file, 'value'),
          } as ReplaySourceType;
          this.appService.emitMongoCMD({ cmd: 'deleteData' }, postObject);
        }
        break;
      case 'UPDATE':
        {
          this.appService.emitMongoCMD({ cmd: `${path}/updateData` }, val);
        }
        break;
      default:
        {
          const _val = val as ReplaySourceType;
          const postObject = {
            ..._val,
            userId: _val.userId,
            // userInfo: pick(_val!.userInfo, ['uuid', 'role']),
            file: omit(_val.file, 'value'),
          } as ReplaySourceType;
          this.appService.emitMongoCMD(
            { cmd: `${path}/createData` },
            postObject,
          );
        }
        break;
    }
    // this.appService.emitMongoCMD({ cmd: `${path}/createData` }, postObject);
    //   val.timestamp + '.' + uuidv4().split('-')[0]
    // }
    // return (await daopaasDB()).put(
    //   'crdts',
    //   // crdtInfo,
    //   {
    //     ...val,
    //     userInfo: pick(val.userInfo, ['uuid', 'role']),
    //     file: omit(val.file, 'value'),
    //   },
    //   val.timestamp + '.' + uuidv4().split('-')[0],
    // );
    // }
  }
}
