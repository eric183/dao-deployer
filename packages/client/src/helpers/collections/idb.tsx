import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { daoStore } from '~/stores';
import { v4 as uuidv4 } from 'uuid';
import { omit, pick } from 'lodash';
import { ReplaySourceType } from '~/types/crdt';
import Dexie from 'dexie';
const crdtInfo = {
  timestamp: '',
  editor: new Map(),
  selection: new Map(),
  terminal: new Map(),
  console: new Map(),
  file: new Map(),
  media: new Map(),
};
export const daopaasDB = async () => {
  return openDB('daopaas', 1, {
    upgrade(db) {
      db.createObjectStore('crdts');
      // store.createIndex('_id', '_id');

      // db.createObjectStore('ReplayCRDTs');
      // db.createObjectStore('daoStore.);
      db.createObjectStore('targetFiles');
      db.createObjectStore('originFiles');
      db.createObjectStore('users');
    },
  });
};

export async function setReplaySource(val: ReplaySourceType) {
  const { CRDTInfo, amDoing, globalData } = daoStore.getState();

  if (amDoing === 'replaying') return;

  if (val.event === 'editor') {
    (val.editor!.revision as number)++;
  }

  return (await daopaasDB()).put(
    'crdts',
    // crdtInfo,
    {
      ...val,
      userId: val.userId!,
      file: omit(val.file, 'value'),
    },
    val.timestamp + '.' + uuidv4().split('-')[0],
  );
  // }
}

export const GetDB = async (db_name: any, key: any, obj_name: any) => {
  return (await db_name).get(obj_name, key);
};

export const SetDB = async (
  db_name: any,
  key: any,
  val: any,
  obj_name: any,
) => {
  return (await db_name).put(obj_name, val, key);
};

export const ClearDB = async () => {
  const clearMap = ['crdts', 'targetFiles', 'originFiles', 'users'];
  // const clearMap = ['crdts', 'targetFiles', 'users'];
  const db = await daopaasDB();
  return Promise.all(clearMap.map((x) => db.clear(x)));
};

export async function getLocalFile(key: IDBKeyRange | IDBValidKey) {
  return (await daopaasDB()).get('targetFiles', key);
}

export async function setLocalFile(
  key?: IDBKeyRange | IDBValidKey,
  val?: {
    value: string;
    revision: number;
  },
) {
  return (await daopaasDB()).put('targetFiles', val, key);
}

export async function getLocalReplayFile(key: IDBKeyRange | IDBValidKey) {
  return (await daopaasDB()).get('originFiles', key);
}

export async function getAllLocalReplayFile() {
  return (await daopaasDB()).getAll('originFiles');
}

export async function setLocalReplayFile(
  key?: IDBKeyRange | IDBValidKey,
  val?: {
    value: string;
    revision: number;
    path?: string;
  },
) {
  return (await daopaasDB()).put('originFiles', val, key);
}

export async function getLocalCRDTs() {
  // .filter((a) => a.editor.evtType !== 'File')
  return await (await daopaasDB()).getAll('crdts');
  // return (await (await daopaasDB).getAll('crdts')).filter(
  //   (a) => a?.editor?.evtType !== 'File',
  // );
}

export async function setLocalMedia(
  key: IDBKeyRange | IDBValidKey | undefined,
  val: Dao_FrontType.CRDT,
) {
  return (await daopaasDB()).put('media', val, key);
}

export async function getLocalMedia() {
  return (await daopaasDB()).getAll('media');
}

// export const DexieInit = (dockerId: string) => {
//   // debugger;
//   const db = new Dexie(`docker-${dockerId}-test`);

// db.version(1).stores({
//   crdts: '++id,name,isCloseFriend',
//   files: '++id,name,kind',
// });

//   db.version(1).stores({
//     friends: `
//       id,
//       name,
//       age`,
//   });
//   // db.open();

//   setTimeout(() => {
//     // db.friends.add({
//     //   name: 'Ingemar Bergman',
//     //   isCloseFriend: 0,
//     //   quick: 2,
//     //   good: true,
//     // });

//     db.friends.bulkPut([
//       { id: 1, name: 'Josephine', age: 21 },
//       { id: 2, name: 'Per', age: 75 },
//       { id: 3, name: 'Simon', age: 5 },
//       { id: 4, name: 'Sara', age: 50, notIndexedProperty: 'foo' },
//     ]);

//     // db.friends.add({
//     //   name: 'libai',
//     //   isCloseFriend: 2,
//     //   quick: 3,
//     //   good: false,
//     // });

//     // db.friends.add({
//     //   name: 'zhuping',
//     //   isCloseFriend: 50,
//     //   quick: 12,
//     //   good: true,
//     // });
//   }, 2000);
//   // db.pets.add({
//   //   name: 'Josephina',
//   //   kind: 'dog',
//   //   fur: 'too long right now',
//   // });
// };
