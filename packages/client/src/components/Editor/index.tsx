import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';

import { daoStore } from '~/stores';
import { TextOperation } from 'ot';
import create from 'zustand';
import { IoClient, IsMe } from '~/helpers';
import { useOT } from '~/hooks';
import {
  getLocalFile,
  getLocalReplayFile,
  setLocalFile,
  setLocalReplayFile,
  setReplaySource,
} from '~/helpers/collections/idb';
import { FExtension } from '~/enum/FExtension';
import {
  currentDoc,
  diffStore,
  fileTreeStore,
  loadingStore,
  shadowUserStore,
  userListStore,
  userStore,
} from '~/stores/daoStore';
import { debounce } from 'lodash';

import { FollowLayout } from '../FollowLayout';
import { ignoreReplayerStore } from '~/stores/ignoreReplayerStore';
import {
  ContentLayout,
  DifferLayout,
  EditorLayout,
} from './Monaco/EditorStyle';
import { MonacoAdapter } from './Monaco/Adapter';
import { EditorData } from './Monaco/Extends/EditorData';
import { ClientMeta } from './Monaco/Extends/ClientMeta';
import { ioDataTransfer } from '~/helpers/collections/ioDataTransfer';
import { Markdown } from './Markdown';
import { checkIfTheFileHasDeleted } from '~/helpers/collections/util';
import { Dracula } from './Monaco/Themes/Dracula';
import { FileListStack } from './FileListStack';
import { Differ } from './Monaco/Differ';
import Skeleton from '../Skeleton';

import { theme as customTheme } from '~/theme';
import { FileData } from '~/types/dao';
// theme.theme;

// import { WheelHandler } from 'rsuite/esm/DOMHelper';

// debugger
export interface EditorPropsInstance {
  doc?: {
    type?: string;
    value?: string;
    path?: string;
  };
  docType?: string;
  containerStyle?: any;
  editorStyle?: any;
  menuStyle?: any;
  useLsp?: boolean;
  serviceWorkerOrigin?: string;
  theme?: {
    marginViewOverlaysBgColor?: string;
    lineNumbersWidth?: string;
    lineNumbersLeft?: string;
    lineNumbersColor?: string;
    activeLineNumberColor?: string;
    editor?: {
      foreground?: string;
      background?: string;
      lineHighlightBackground?: string;
    };
  };
}

const APP_DIR = '/home/runner/app';

export type FExtensionType = Partial<typeof FExtension>;

let editor: monaco.editor.IStandaloneCodeEditor & { _codeEditorService?: any };
let diffEditor: monaco.editor.IStandaloneDiffEditor;

const docServer = new Map();

const curserStore = create<{
  cursor: any;
  setCursor: (arg: any) => any;
}>((set) => ({
  cursor: {},
  setCursor: (arg) => set((state) => ({ cursor: arg })),
}));

const client = new (IoClient as any)(0);
const temps = [];

export const Editor: React.FC<EditorPropsInstance> = ({
  doc,
  containerStyle,
  menuStyle,
  editorStyle,
  serviceWorkerOrigin,
  useLsp,
  theme,
}) => {
  const divEl = useRef<HTMLDivElement>(null!);
  const diffEle = useRef<HTMLDivElement>(null!);
  const [clientEditor, setClientEditor] = useState<MonacoAdapter>(null!);
  const [diffClientEditor, setDiffClientEditor] = useState<Differ>(null!);
  const [otherClients, setOtherClients] = useState<ClientMeta>(null!);
  const [showMarkdown, setShowMarkdown] = useState<boolean>(false);
  const [markdownVal, setMarkdownVal] = useState<string>('');

  const { switchDoc } = currentDoc.getState();
  const { setCRDTInfo, setAsyncType } = daoStore.getState();

  const CRDTInfo = daoStore((state) => state.CRDTInfo);

  const dockerInfo = daoStore((state) => state.dockerInfo);
  const fileTree = fileTreeStore((state) => state.fileTree);

  const file = daoStore((state) => state.CRDTInfo.file)!;
  const docFile = currentDoc((state) => state.doc);
  const globalData = daoStore((state) => state.globalData);
  const amDoing = daoStore((state) => state.amDoing);
  const diffPattern = diffStore((state) => state.diffPattern);
  const { moduleLoading, setModuleLoading } = loadingStore((state) => state);

  const [keepVal, setKeepVal] = useState('');
  // const userList = userListStore.subscribe((state) => state.userList);
  const userList = userListStore((state) => state.userList);
  const userInfo = userStore((state) => state.userInfo);

  const io = useOT((state) => state.socket)!;
  const debounced = debounce((callback) => {
    callback();
  }, 300);

  // 待优化逻辑
  const switchModel = (model: monaco.editor.ITextModel) => {
    const { CRDTInfo, setCRDTInfo } = daoStore.getState();
    setCRDTInfo({
      ...CRDTInfo,
      file: {
        value: model.getValue(monaco.editor.EndOfLinePreference.LF),
        path: model.uri.path.replace(APP_DIR, ''),
      },
    });
    // switchDoc({
    //   value: model.getValue(),
    //   path: model.uri.path.replace(APP_DIR, ''),
    // });
  };

  client.sendOperation = (revision: number, operation: any) => {
    if (daoStore.getState().amDoing === 'replaying') return;

    const { userInfo } = userStore.getState();
    const { doc, switchDoc } = currentDoc.getState();
    let path: string | undefined;
    // console.log(doc);
    if (doc?.path) {
      path = doc.path;
    }
    // else {
    //   // path = `temp-${temps.length + 1}`;
    //   // switchDoc({ path });
    //   // temps.push(path);
    // }

    // path = doc?.path ? doc.path : `temp-${temps.length + 1}`;
    // switchDoc(path);

    const crdt: Dao_FrontType.CRDT = {
      timestamp: Date.now(),
      userId: userInfo['userId']!,
      cursor: {
        ...clientEditor.getCursor(),
        path,
      },
      editor: {
        operation,
        revision,
        // evtType: 'Editor',
      },
      file: {
        action: 'Update',
        path: path!,
      },
    };

    io?.emit('editFile', JSON.stringify(crdt));
    // io?.emit('editFile', ioDataTransfer.encode(crdt));
  };

  client.applyOperation = (operation: any) => {
    clientEditor.applyOperation(operation);
  };

  const onChange = (operation: TextOperation) => {
    const applyDoc = currentDoc.getState().doc;
    // console.log(clientEditor.liveOperationCode);

    // setShowMarkdown(true);

    client.applyClient(operation);
    // setTimeout(() => {
    setLocalFile(applyDoc?.path ? applyDoc?.path : 'singleFile', {
      value: editor.getModel()!.getValue(monaco.editor.EndOfLinePreference.LF),
      // revision: client.revision + 1,
      revision: client.revision,
    });
    // }, 0);

    if (applyDoc?.path?.includes('md')) {
      setMarkdownVal(
        editor.getModel()!.getValue(monaco.editor.EndOfLinePreference.LF)!,
      );
    }

    setKeepVal(
      editor.getModel()!.getValue(monaco.editor.EndOfLinePreference.LF)!,
    );
  };

  const onDidScroll = (evt: any) => {
    // console.log(evt);

    const crdt: Dao_FrontType.CRDT = {
      timestamp: Date.now(),
      // userInfo: pick(userInfo, ['role', 'uuid']),
      userId: userInfo['userId']!,
      // cursor: {
      //   ...clientEditor.getCursor(),
      //   path,
      // },
      // editor.getVisibleRanges()[0].endLineNumber
      // position: {
      //   endLineNumber: editor.getVisibleRanges()[0].endLineNumber,
      // },
      file: {
        action: 'Update',
        path: currentDoc.getState().doc.path,
      },
    };
    // io?.emit('editFile', JSON.stringify(crdt));
    io?.emit('position', ioDataTransfer.encode(crdt));
    clientEditor.ignoreNextExtraChange = false;
  };

  const onSelectionActivity = (
    evt: monaco.editor.ICursorSelectionChangedEvent,
  ) => {
    const { amDoing } = daoStore.getState();
    const { doc } = currentDoc.getState();
    return;
    console.log(evt.source);
    if (amDoing === 'replaying') return;
    // if (evt.source === 'api') {
    if (evt.source === 'mouse' || evt.source === 'keyboard') {
      // cursorTool(evt);
      // debounced(() => {
      // console.log('当前revision:', client.revision);
      const selection = [
        [
          evt.selection.startLineNumber,
          evt.selection.startColumn,
          evt.selection.endLineNumber,
          evt.selection.endColumn,
          evt.selection.selectionStartLineNumber,
          evt.selection.selectionStartColumn,
          evt.selection.positionColumn,
          evt.selection.positionLineNumber,
        ],
        ...evt.secondarySelections.map((s) => [
          s.startLineNumber,
          s.startColumn,
          s.endLineNumber,
          s.endColumn,
          s.selectionStartLineNumber,
          s.selectionStartColumn,
          s.positionColumn,
          s.positionLineNumber,
        ]),
      ];

      // const crdt: Dao_FrontType.CRDT = {
      //   timestamp: Date.now(),
      //   selection,
      //   file: {
      //     action: 'Update',
      //     path: doc?.path,
      //   },
      //   userId: user
      //   userInfo: pick(userInfo, 'uuid', 'role'),
      // };

      // io?.emit('selection', JSON.stringify(crdt));
      // });
      //   cursorTool(evt);
      //   // io?.emit('extraSync', JSON.stringify(crdt));
      // });
    }
    if (evt.reason === 0 || evt.source === 'model') return;

    // debounced(() => {
    //   cursorTool(evt);
    //   // io?.emit('extraSync', JSON.stringify(crdt));
    // });
  };

  const onCursorActivity = (evt: { reason: number; source: string }) => {
    if (!evt) return;

    if (evt?.reason === 0 && evt?.source === 'keyboard') return;
    const cursor = clientEditor.getCursor();
    curserStore.getState().setCursor(cursor);
    // console.log(cursor);
    // if (!clientEditor.ignoreNextChange) {
    sendCursor(cursor);
    // }
    // clientEditor.ignoreNextChange = false;
  };

  const sendCursor = (cursor?: any) => {
    const crdt: Dao_FrontType.CRDT = {
      timestamp: Date.now(),
      cursor: cursor ? cursor : curserStore.getState().cursor,
      file: {
        action: 'Update',
        path: currentDoc.getState()?.doc?.path,
      },
      userId: userInfo['userId']!,
    };
    // sendPos = selection;
    io?.emit('cursor', JSON.stringify(crdt));
  };

  const onBlur = (operation: TextOperation) => {
    // client.applyClient(operation);
  };

  const onFocus = (operation: TextOperation) => {
    const cursor = clientEditor.getCursor();
    sendCursor(cursor);
    // clientEditor.onCursorActivity();
  };

  const updateModel = (file: FileData) => {
    if (file?.path && editor) {
      let egt = /\.(\w+$)/gim.exec(file.path!)!;
      egt = egt ? egt : (['', file.path.substring(1)] as RegExpExecArray);

      const { CRDTInfo, amDoing } = daoStore.getState();
      const { shadowUser } = shadowUserStore.getState();
      const language = FExtension[egt[1] as keyof FExtensionType];

      setShowMarkdown(false);
      setMarkdownVal('');

      if (egt[1] === 'md') {
        setShowMarkdown(true);
        setMarkdownVal(file?.value ? file?.value : '');
      }

      if (
        file.path &&
        egt &&
        amDoing === 'replaying' &&
        !ignoreReplayerStore
          .getState()
          .ignoreReplayers.some((d) => d === 'Editor')
      ) {
        EditorData.updateModel(
          {
            value: file!.value!,
            path: file.path,
            language,
            APP_DIR,
          },
          (gotModel: monaco.editor.ITextModel | null) => {
            client.revision = CRDTInfo.editor?.revision
              ? CRDTInfo.editor.revision
              : 0;

            editor.setModel(gotModel);

            clientEditor?.updateModel();

            // console.log(EditorData.fileTreeStack);
            // EditorData.setFileTreeStack(EditorData.fileTreeStack.slice(-1));

            clientEditor?.onFocus();
            clientEditor?.onCursorActivity();

            otherClients?.setCursors();

            if (file) {
              docServer.set(file.path, {
                operation: [],
                revision: client.revision,
                value: file.value,
              });
              // daoStore.getState().amDoing !== 'replaying' &&
              //   setLocalFile(file?.path, {
              //     value: file.value!,
              //     revision: client.revision,
              //   });
            }
          },
          true,
        );
        return;
      }

      if (
        amDoing !== 'replaying' &&
        (shadowUser.userId || (file!.path && egt && IsMe(CRDTInfo.userId!)))
      ) {
        // 单独打开文件
        EditorData.setFileTreeStack([]);
        // EditorData.setFileTreeStack(EditorData.fileTreeStack.slice(-1));
        EditorData.updateModel(
          {
            value: file!.value!,
            path: file.path,
            language,
            APP_DIR,
          },
          (gotModel: monaco.editor.ITextModel | null) => {
            client.revision = CRDTInfo.editor?.revision
              ? CRDTInfo.editor.revision
              : 0;

            editor.setModel(gotModel);

            clientEditor?.updateModel();

            // console.log(EditorData.fileTreeStack);
            // EditorData.setFileTreeStack(EditorData.fileTreeStack.slice(-1));

            clientEditor?.onFocus();
            clientEditor?.onCursorActivity();

            otherClients?.setCursors();

            if (file) {
              docServer.set(file.path, {
                operation: [],
                revision: client.revision,
                value: file.value,
              });
              daoStore.getState().amDoing !== 'replaying' &&
                setLocalFile(file?.path, {
                  value: file.value!,
                  revision: client.revision,
                });
            }
          },
          true,
        );
      }
    }
  };

  const clearPlayground = () => {
    if (!editor) return;

    monaco.editor.getModels().forEach((model) => model.dispose());
    EditorData.setFileTreeStack([]);
  };

  const serviceBinder = () => {
    const editorService = editor._codeEditorService;
    const openEditorBase = editorService.openCodeEditor.bind(editorService);
    editorService.openCodeEditor = async (
      input: { resource: { path: string | RegExp } },
      source: any,
      workspacePath: any,
    ) => {
      const result = await openEditorBase(input, source);
      if (result === null) {
        const gotSource = monaco.editor
          .getModels()
          .find((x) => new RegExp(input.resource.path).test(x.uri.path))!;

        switchModel(gotSource);
      }

      return result; // always return the base result
    };
  };

  /*
   * 初始化
   */
  useEffect(() => {
    clearPlayground();
    editor = monaco.editor.create(divEl.current, {
      theme: 'vs-dark',

      automaticLayout: true,
      minimap: {
        enabled: false,
      },
      glyphMargin: true,
      lightbulb: {
        enabled: true,
      },
    });

    diffEditor = monaco.editor.createDiffEditor(diffEle.current, {
      automaticLayout: true,
      // minimap: {
      //   enabled: false,
      // },
      // glyphMargin: true,
      // lightbulb: {
      //   enabled: true,
      // },
    });

    editor.onDidAttemptReadOnlyEdit(() => {
      // console.log(editor.getOptions());
      const text =
        '该文件已被删除，继续编辑需要重新创建此文件，请确认是否重新创建？';
      if (confirm(text)) {
        editor.updateOptions({
          readOnly: false,
        });

        const _fileTreeStack = EditorData.fileTreeStack.map((value) => {
          return {
            ...value,
            deleted: false,
            label: value.label.replace(' has deleted', ''),
          };
          // }
        });

        EditorData.setFileTreeStack(_fileTreeStack);

        // if (treeNode.hasChildren) {
        //   newPath.splice(-2, 1, name);
        // } else {
        //   newPath.splice(-1, 1, name);
        // }
        // if (treeNode.data === 'Untitled') {
        //   payload.action = 'CREATE';
        //   payload.path = newPath.join('/');
        // } else {

        const payload = {
          action: 'RECORVERY',
          path: currentDoc.getState()?.doc?.path,
          newPath: '',
        };
        // payload.newPath = newPath.join('/');
        // }
        io?.emit('fileTreeOp', JSON.stringify(payload));
      }
    });

    monaco.editor.defineTheme(
      'myCoolTheme',
      Dracula({
        ...theme,
        editor: {
          background: customTheme.extend.colors['dao-light-green'],
          lineHighlightBackground: customTheme.extend.colors['dao-light-green'],
          // foreground: customTheme.extend.colors['dao-light-green'],
        },
      }) as monaco.editor.IStandaloneThemeData,
    );

    monaco.editor.setTheme('myCoolTheme');

    setClientEditor(new MonacoAdapter(editor, serviceWorkerOrigin));

    setDiffClientEditor(new Differ(diffEditor));

    setOtherClients(
      new ClientMeta(
        editor,
        userList.filter((x) => !IsMe(x.userId!)),
      ),
    );

    serviceBinder();

    editor.onDidChangeModel(() => {
      // console.log('data');

      setTimeout(() => {
        const lineElement = document.createElement('div');
        lineElement.className = 'line-class absolute';
        document
          .querySelector('.margin-view-overlays')
          ?.appendChild(lineElement);
      }, 100);
    });
    // window.editor = editor;
    // editor.onDidBlurEditorWidget(() => {
    //   console.log('init');
    //   // const lineElement = document.createElement('div');
    //   // lineElement.className = 'line-class absolute';
    //   // document.querySelector('.margin-view-overlays')?.appendChild(lineElement);
    // });
    // setTimeout(() => {
    //   editor.updateOptions({
    //     minimap: {
    //       enabled: true,
    //     },
    //   });
    // }, 5000);

    // setTimeout(async () => {
    //   const replayList = (await getLocalCRDTs()) as ReplaySourceType[];
    //   // debugger;
    //   const replayItem = replayList[random(replayList.length)];
    //   setInterval(() => {
    //     replay({
    //       timestamp: replayItem.timestamp,
    //     });
    //   }, 1500);
    // }, 5000);
    // setTimeout(() => {
    //   io.disconnect();
    // }, 2000);
    return () => {
      console.log('editor disposed');
    };
  }, []);
  /*
   * 注册编辑器
   */
  useEffect(() => {
    clientEditor?.registerCallbacks({
      change: onChange,
      cursorActivity: onCursorActivity,
      selectionActivity: onSelectionActivity,
      blur: onBlur,
      focus: onFocus,
      scroll: onDidScroll,
    });

    clientEditor?.onCursorActivity();

    // setTimeout(() => {
    //   editor.revealLine(120);
    //   debugger;
    //   // editor.revealLine(editor?.getModel()?.getLineCount());
    // }, 2000);
  }, [clientEditor]);

  /*
   * 注册 IO
   */
  useEffect(() => {
    io?.on('editFile', (d: string) => {
      // const _d = ioDataTransfer.decode(d);
      const _d = JSON.parse(d);
      const path = currentDoc.getState().doc?.path;

      // setAsyncType('editor');

      // console.log(editor.getModel());

      if (editor?.getModel()?.uri.path.includes(_d?.file?.path as string)) {
        client.applyServer(TextOperation.fromJSON(_d.editor!.operation!));
      }

      if (!IsMe(_d) && _d!.file!.path) {
        // otherClients?.setCursors();
        const user = userListStore
          .getState()
          .userList.find((x) => x.userId === _d.userId);
        otherClients?.pushCursorToList({
          ...user,
          cursor: {
            ..._d.cursor,
            path: _d!.file!.path,
          },
        });
        // if (_d.file?.path !== path) {
        //   otherClients?.removeCursor(user);
        // }

        setTimeout(() => {
          if (_d?.file?.path?.includes('md')) {
            setMarkdownVal(editor.getModel()!.getValue(1));
          }
        }, 100);
      }

      setCRDTInfo(_d);
      setAsyncType('editor');

      // setReplaySource(_d);
      setReplaySource({
        ..._d,
        event: 'editor',
        editor: {
          ..._d.editor,
          // revision: (_d.editor?.revision as number) + 1,
          revision: _d.editor?.revision as number,
        },
      });
    });

    io?.on('serverAck', async (d: string) => {
      // 待确认逻辑
      const _d = JSON.parse(d);
      // const _d = ioDataTransfer.decode(d);

      client.serverAck();

      setCRDTInfo(_d);
      setAsyncType('editor');

      docServer.set(_d?.file?.path, {
        ...docServer.get(_d?.file?.path),
        operation: client.operation,
      });

      const file = await getLocalReplayFile(_d.file!.path!);

      setLocalReplayFile(_d?.file?.path, {
        value: file!.value as string,
        revision: file.revision + 1,
        path: _d.file!.path,
      });

      setReplaySource({
        ..._d,
        event: 'editor',
        editor: {
          ..._d.editor,
          revision: _d.editor?.revision as number,
        },
      });
      // setServerAck();
    });

    io?.on('selection', async (d: string) => {
      const _d = JSON.parse(d) as Dao_FrontType.CRDT;
      const path = currentDoc.getState().doc?.path;

      // console.log(_d);
      // setCRDTInfo(_d);
      setAsyncType('editor');
      // if (_d.slection) {
      // otherClients?.setOtherSelection(_d);

      if (!IsMe(_d.userId!) && _d!.file!.path) {
        // otherClients?.setCursors();
        // otherClients?.pushSelectionToList(_d.userInfo);
        // const user = userListStore
        //   .getState()
        //   .userList.find((x) => x.userU === _d.userInfo.userU);
        // otherClients?.pushSelectionToList({
        //   ...user,
        //   ..._d.userInfo,
        // });
        // if (_d.file?.path !== path) {
        //   otherClients?.removeSelection(_d.userInfo);
        // otherClients?.removeCursor(_d.userInfo);
        // }
      }
      // }
    });

    io?.on('cursor', async (d: string) => {
      const _d = JSON.parse(d) as Dao_FrontType.CRDT;
      // const path = currentDoc.getState().doc?.path;
      setAsyncType('editor');

      if (!IsMe(_d.userId!) && _d?.file?.path) {
        const user = userListStore
          .getState()
          .userList.find((x) => x.userId === _d.userId);
        otherClients?.pushCursorToList({
          ...user,
          cursor: {
            ..._d.cursor,
            path: _d!.file!.path,
          },
        });

        // console.log('cursor');
        // if (_d.file?.path !== currentDoc.getState().doc.path) {
        //   otherClients?.removeCursor({ userId: user?.userId });
        // }
      }

      if (!IsMe(_d.userId!) && !_d.cursor) {
        otherClients?.removeCursor(_d);
      }
    });

    return () => {
      io?.off('editFile');
      io?.off('serverAck');
      io?.off('selection');
      io?.off('cursor');
    };
  }, [clientEditor, io]);

  useEffect(() => {
    // console.log(userList);
    // otherClients?.updateList = userList;
    otherClients?.updateList(userList.filter((x) => !IsMe(x.userId!)));
  }, [userList]);

  useEffect(() => {
    const { amDoing } = daoStore.getState();

    setTimeout(() => {
      setModuleLoading({
        Editor: false,
      });
    }, 200);

    if (amDoing === 'replaying') return;
    if (docFile!.path === '/') {
      // updateModel(docFile);
      editor.setValue('');
    }

    if (/\/$/.test(docFile!.path!)) return;
    updateModel(docFile);
  }, [docFile]);

  useEffect(() => {
    if (IsMe(CRDTInfo.userId!)) {
      clearPlayground();
    }
  }, [dockerInfo]);

  useEffect(() => {
    const { amDoing } = daoStore.getState();

    if (amDoing === 'replaying') {
      getLocalFile(CRDTInfo.file!.path!).then((d) => {
        editor.setValue(d.value);

        // const newData = TextOperation.fromJSON(
        //   CRDTInfo.editor!.operation!,
        // ).apply(editor.getValue());
        // editor.setValue(newData);
      });
      // clearPlayground();
    }
  }, [CRDTInfo]);

  useEffect(() => {
    // disableEditor
    editor.updateOptions({
      readOnly: globalData.disableEditor,
    });
  }, [globalData]);

  useEffect(() => {
    const _fileTreeStack = EditorData.fileTreeStack.map((value) => {
      if (checkIfTheFileHasDeleted(fileTree, value.path)) {
        // value.model?.updateOptions({
        //   readOnly: true,
        // });
        // monaco.editor.getModels()[0].updateOptions({
        //   readOnly: true,
        // });

        return {
          ...value,
          deleted: true,
          label: `${value.label} has deleted`,
        };
      }

      // const val = getFile(fileTree, value);

      return value;
    });

    EditorData.setFileTreeStack(_fileTreeStack);
    // return value

    if (docFile?.path && checkIfTheFileHasDeleted(fileTree, docFile.path)) {
      editor.updateOptions({
        readOnly: true,
      });
    }
  }, [fileTree]);

  useEffect(() => {
    if (amDoing === 'diff' && diffPattern.length > 0) {
      const _diffPattern = diffPattern.map((diffModel) =>
        monaco.editor.createModel(diffModel.value, diffModel.type),
      ) as monaco.editor.ITextModel[];
      diffEditor.setModel({
        original: _diffPattern[0],
        modified: _diffPattern[1],
      });
    }

    // if (diffPattern.length === 0) {
    //   setAmDoingTo('code');
    // }
  }, [amDoing, diffPattern]);

  // useEffect(() => {}, [])
  // console.log(appStatus);
  return (
    <FollowLayout name="editor">
      <Skeleton type="Editor" loading={moduleLoading.Editor}></Skeleton>

      <Markdown
        showMarkdown={showMarkdown}
        markdownVal={markdownVal}
        setDrawerOpen={(boolean) => {
          console.log(boolean);
        }}
      />
      <DifferLayout
        className={`absolute z-0 ${
          amDoing === 'diff' ? 'visible' : 'hidden'
          // amDoing === 'diff' ? 'visible' : 'visible'
        }`}
        ref={diffEle}
      />

      <EditorLayout
        // style={{ display: amDoing === 'diff' ? 0 : 1 }}
        className={`editor-container flex-col z-0 relative ${
          amDoing === 'diff' ? 'hidden' : 'visible'
          // amDoing === 'diff' ? 'hidden' : 'hidden'
        }`}
        theme={theme}
      >
        <FileListStack
          editor={editor}
          menuStyle={menuStyle}
          switchModel={switchModel}
          clearPlayground={clearPlayground}
        />

        <ContentLayout
          ref={divEl}
          userList={userListStore.getState().userList}
          className="editor-content flex-1"
          style={editorStyle}
        ></ContentLayout>
      </EditorLayout>
    </FollowLayout>
  );
};
