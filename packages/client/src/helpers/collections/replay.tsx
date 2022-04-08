import { daoStore } from '~/stores';

import { IsMe } from './userTool';
import {
  getLocalCRDTs,
  getLocalReplayFile,
  getLocalFile,
  setLocalReplayFile,
  setLocalFile,
  getAllLocalReplayFile,
  daopaasDB,
  setReplaySource,
  ClearDB,
} from './idb';
import { pick, random } from 'lodash';
import { currentDoc, fileTreeStore, userStore } from '~/stores/daoStore';
import { useOT } from '~/hooks';
import { Toast } from './toast';
import { ReplaySourceType } from '~/types/crdt';
import dayjs from 'dayjs';
import { TextOperation } from 'ot';
// const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

// import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
// import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
// dayjs.extend(isSameOrBefore);
// dayjs.extend(isSameOrAfter);

const { setAmDoing, setCRDTInfo, dockerInfo, CRDTInfo } = daoStore.getState();
const { doc, switchDoc } = currentDoc.getState();

export const replay = async (passInData: {
  timestamp: number;
  userId?: string;
}) => {
  if (daoStore.getState().amDoing !== 'replaying') {
    // clearReplayList();
    setAmDoing('replaying');
  }
  let operation;
  const replayList: Required<ReplaySourceType>[] = await getLocalCRDTs();
  // passInData.userId = undefined;
  const filterReplayList =
    passInData.userId === undefined
      ? replayList
      : replayList.filter(
          (replayItem) => replayItem.userId === passInData.userId,
        );

  const currentFilter = filterReplayList.filter(
    (f) =>
      dayjs(passInData.timestamp).isSame(f.timestamp) ||
      dayjs(passInData.timestamp).isBefore(f.timestamp),
    // dayjs(passInData.timestamp).isAfter(f.timestamp),
  );

  // 待处理算法;
  const filterReplaySource: Required<ReplaySourceType> = currentFilter[0];

  // filterReplayList.some((nowTimeData, index, array) => {
  //   if (
  //     dayjs(passInData.timestamp).isSame(nowTimeData.timestamp) ||
  //     dayjs(passInData.timestamp).isBefore(nowTimeData.timestamp)
  //   ) {
  //     filterReplaySource = nowTimeData as ReplaySourceType;
  //     // filterReplaySource = a as ReplaySourceType;
  //     return true;
  //     // return d[c - 1];
  //   }
  // });

  const replayFile = await getLocalReplayFile(filterReplaySource.file!.path!);

  const localFile = await getLocalFile(filterReplaySource.file!.path!);

  if (filterReplaySource.event === 'editor') {
    const tempFilter = filterReplayList
      .filter((x) => x.event === 'editor')
      .filter((x) => x.file?.path === replayFile.path);
    // range : end
    const operationFilter =
      filterReplaySource!.editor!.revision! > replayFile.revision
        ? tempFilter
            .filter(
              (x) =>
                x.editor!.revision! <= filterReplaySource!.editor!.revision!,
            )
            .filter((x) => x.editor!.revision! > replayFile.revision)
        : tempFilter
            .filter(
              (x) =>
                x!.editor!.revision! > filterReplaySource!.editor!.revision!,
            )
            .filter((x) => x!.editor!.revision! <= replayFile.revision);

    if (filterReplaySource!.editor!.revision! > replayFile.revision) {
      operation = operationFilter.reduce((currentOp, nextOp, _index) => {
        const NextOP = TextOperation.fromJSON(nextOp!.editor!.operation!);
        if (currentOp.targetLength === NextOP.baseLength) {
          return currentOp.compose(NextOP);
        } else {
          return NextOP.compose(currentOp);
        }
      }, new TextOperation().retain(replayFile.revision === 0 ? replayFile.value.length : localFile.value.length));
    } else {
      operation =
        operationFilter.length === 1
          ? TextOperation.fromJSON(
              operationFilter[0]!.editor!.operation!,
            ).invert(localFile.value)
          : (
              operationFilter.reduce((currentOp, nextOp) => {
                // const CurrentOP = TextOperation.fromJSON(currentOp!.editor!.operation!);
                const NextOP = TextOperation.fromJSON(
                  nextOp!.editor!.operation!,
                );

                if (Object.entries(currentOp).length === 0) {
                  return NextOP;
                }
                if ((currentOp as ReplaySourceType).editor) {
                  return TextOperation.fromJSON(
                    (currentOp as ReplaySourceType)!.editor!.operation!,
                  ).compose(NextOP);
                } else {
                  return (currentOp as unknown as TextOperation).compose(
                    NextOP,
                  );
                }
              }, {}) as unknown as TextOperation
            ).invert(localFile.value);

      // operation.invert(localFile.value).apply(localFile.value)
    }

    filterReplaySource!.editor!.operation = operation.toJSON();
  }

  if (filterReplaySource.file) {
    // if (filterReplaySource.event === 'file') {
    if (!filterReplaySource.file) return;
    // const doc = await getLocalReplayFile(filterReplaySource.file.path!);
    // const doc = {
    //   value: await getLocalReplayFile(filterReplaySource.file.path!),
    //   path: filterReplaySource.file.path,
    // };

    // const doc = await getLocalFile(filterReplaySource.file.path as string);
    // debugger;
    // filterReplaySource.file.value = doc;
    // if (doc?.path !== filterReplaySource.file.path) {
    // debugger;

    const fileVal = operation
      ? replayFile.revision === 0
        ? operation?.apply(replayFile.value)
        : operation?.apply(localFile.value)
      : replayFile.value;

    setLocalFile(filterReplaySource.file.path, {
      ...localFile,
      revision:
        // localFile
        //   ? localFile.revision
        //   :
        filterReplaySource.editor?.revision
          ? filterReplaySource.editor?.revision
          : 0,
      value: fileVal,
    });

    switchDoc?.({
      // value: doc.value,
      // value: operation?.apply(replayFile.value),
      value: replayFile.value,
      path: filterReplaySource.file.path as string,
    });
  }

  // console.log(daoStore.getState().amDoing);

  setLocalReplayFile(filterReplaySource?.file?.path, {
    ...replayFile,
    revision:
      filterReplaySource.event === 'file'
        ? 0
        : filterReplaySource?.editor?.revision,
    path: filterReplaySource?.file?.path,
  });

  setTimeout(() => {
    setCRDTInfo({
      ...filterReplaySource,
      // userInfo: WHICH_ROLE,
    });
  }, 0);
  // setAmDoing('code');
};

export const clearReplayList = () => {
  // 清空回放记录
  // console.log('已清空回放记录');

  return getAllLocalReplayFile()
    .then((allFiles) => {
      allFiles.length > 0 &&
        allFiles.forEach((f) => {
          setLocalReplayFile(f?.path, {
            ...f,
            revision: 0,
          });
        });
    })
    .catch((error) => {
      console.log(error);
    });
};

export const fetchReplayList = async () => {
  await ClearDB();
  const replayList = await (await fetch('/api/replaylist')).json();
  console.log(replayList);

  // const db = await daopaasDB();

  // const tx = db.transaction('crdts', 'readwrite');
  // setReplaySource(replayList);
  await Promise.all(
    replayList.source.map(async (x: ReplaySourceType) => setReplaySource(x)),
  );

  await Promise.all(
    replayList.files.map(async (x: any) =>
      setLocalReplayFile(x.path, pick(x, ['value', 'revision'])),
    ),
  );

  return replayList;
};
