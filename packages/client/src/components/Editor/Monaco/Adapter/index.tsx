import { listen } from '@codingame/monaco-jsonrpc';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as monacoCore from 'monaco-editor-core';
import * as monaco from 'monaco-editor';

import {
  MonacoLanguageClient,
  MessageConnection,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
  MonacoWorkspace,
} from '@codingame/monaco-languageclient';
import { FExtension } from '~/enum/FExtension';
import { debounce, pick } from 'lodash';
import { SerializedTextOperation, TextOperation } from 'ot';
import { setLocalFile } from '~/helpers/collections/idb';
import { Toast } from '~/helpers/collections/toast';
import { useOT } from '~/hooks';
import { daoStore } from '~/stores';
import { userStore, currentDoc } from '~/stores/daoStore';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { IoClient } from '~/helpers';
import { fromEvent } from 'rxjs';
import { Cursor } from '../Extends/Cursor';
// import {
//   indexToLineAndColumn,
//   lineAndColumnToIndex,
// } from '../Extends/Helpers/MonacoIndexConverter';
import { operationFromMonacoChanges } from '../Extends/Helpers/OperationFromMonacoChanges';
import { isDev } from '~/helpers/collections/util';

const APP_DIR = '/home/runner/app';
const docServer = new Map();
const client = new (IoClient as any)(0);
type FExtensionType = Partial<typeof FExtension>;

export class MonacoAdapter {
  editor: monaco.editor.IStandaloneCodeEditor & { _codeEditorService?: any };
  ignoreNextChange: boolean;
  lspInited: boolean;
  callbacks: any;
  monacoModel: monaco.editor.ITextModel;
  lastCursorRange: monaco.Selection | null;
  liveOperationCode: string;
  public ignoreNextExtraChange: any;

  constructor(
    monacoIns: monaco.editor.IStandaloneCodeEditor & {
      _codeEditorService?: any;
    },
    serviceWorkerOrigin?: string,
  ) {
    this.editor = monacoIns;

    this.callbacks = {};
    this.ignoreNextChange = false;
    this.ignoreNextExtraChange = false;

    this.lspInited = false;

    this.monacoWorkspaceInjection(serviceWorkerOrigin);

    this.monacoModel = this.editor.getModel()!;

    this.liveOperationCode = '';

    this.lastCursorRange = this.editor.getSelection()!;

    /** Adapter Callback Functions */
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onCursorActivity = this.onCursorActivity.bind(this);
    this.onSelectionActivity = this.onSelectionActivity.bind(this);
    this.onDidScrollChange = this.onDidScrollChange.bind(this);

    /** Editor Callback Handler */
    this.editor.onDidChangeModelContent(this.onChange);
    this.editor.onDidBlurEditorWidget(this.onBlur);
    this.editor.onDidFocusEditorWidget(this.onFocus);
    this.editor.onDidChangeCursorSelection(this.onSelectionActivity);
    this.editor.onDidChangeCursorPosition(this.onCursorActivity);
    this.editor.onDidScrollChange(this.onDidScrollChange);
    // this.editor.onDidAttemptReadOnlyEdit(this.onAttemptReadOnlyEdit);
    this.init();
  }

  private init() {
    this.eventInitBinder();

    this.lspServerInject('ruby', false);
  }

  public updateModel() {
    this.monacoModel = this.editor.getModel()!;
    this.liveOperationCode = this.getCode();
  }

  public registerCallbacks(callbacks: any) {
    this.callbacks = {
      ...this.callbacks,
      ...callbacks,
    };
  }

  /**
   * @method registerUndo
   * @param {function} callback - Callback Handler for Undo Event
   */
  public registerUndo(callback: any) {
    if (typeof callback === 'function') {
      this.callbacks.undo = callback;
    } else {
      throw new Error(
        'MonacoAdapter: registerUndo method expects a ' +
          'callback function in parameter',
      );
    }
  }
  /**
   * @method registerRedo
   * @param {function} callback - Callback Handler for Redo Event
   */

  public registerRedo(callback: any) {
    if (typeof callback === 'function') {
      this.callbacks.redo = callback;
    } else {
      throw new Error(
        'MonacoAdapter: registerRedo method expects a ' +
          'callback function in parameter',
      );
    }
  }

  public trigger(evt: any, ...args: any | any[]) {
    const action = this.callbacks && this.callbacks[evt];
    action && action.apply(this, args);
  }

  private cursorTool = (evt: monaco.editor.ICursorSelectionChangedEvent) => {
    // const { CRDTInfo } = daoStore.getState();
    const { userInfo } = userStore.getState();

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

    const crdt: Dao_FrontType.CRDT = {
      timestamp: Date.now(),
      selection,
      file: {
        action: 'Update',
        path: currentDoc.getState().doc.path,
      },
      userId: userInfo.userId!,
      // userInfo: pick(userInfo, 'uuid', 'role'),
    };
    // sendPos = selection;
    useOT.getState()?.socket?.emit('selection', JSON.stringify(crdt));
  };

  public onChange(evt: monaco.editor.IModelContentChangedEvent) {
    // console.log('eol', evt.eol);
    if (!evt.changes) return;
    if (!this.ignoreNextChange) {
      const { isFlush, changes } = evt;

      if (!isFlush) {
        try {
          const { operation, liveOperationCode } = operationFromMonacoChanges(
            evt,
            this.liveOperationCode.replace(/\r\n/gim, '\n'),
          )!;
          this.liveOperationCode = liveOperationCode;

          this.trigger('change', operation);
        } catch (err) {
          console.log(err);
        }
      } else {
        this.trigger('cursorActivity', evt);
      }
    }

    this.ignoreNextChange = false;
  }

  public onDidScrollChange(evt: any) {
    if (!this.ignoreNextExtraChange) {
      this.trigger('scroll', evt);
    }

    this.ignoreNextExtraChange = false;
  }

  public onSelectionActivity(evt: monaco.editor.ICursorSelectionChangedEvent) {
    setTimeout(() => {
      this.trigger('selectionActivity', evt);
    }, 0);
  }

  public onBlur() {
    if (this.editor?.getSelection()?.isEmpty()) {
      this.trigger('blur');
    }
  }

  public onFocus() {
    this.trigger('focus');
  }

  public onCursorActivity(evt?: monaco.editor.ICursorPositionChangedEvent) {
    setTimeout(() => {
      return this.trigger('cursorActivity', evt);
    }, 0);
  }

  private eventInitBinder() {
    this.editor.onKeyDown(
      (evt: {
        keyCode: number;
        ctrlKey: any;
        metaKey: any;
        preventDefault: () => any;
      }) => {
        if (evt.keyCode === 49) {
          (evt.ctrlKey || evt.metaKey) && evt.preventDefault();
        }
      },
    );

    this.editor.onDidScrollChange((evt) => {
      if (!evt.scrollLeftChanged && !evt.scrollTopChanged) return;

      const { userInfo } = userStore.getState();

      const topPercent = evt.scrollTopChanged
        ? (evt.scrollTop / evt.scrollHeight).toFixed(2)
        : 1;

      const leftPercent = evt.scrollLeftChanged
        ? (evt.scrollLeft / evt.scrollWidth).toFixed(2)
        : 1;

      const crdt: Dao_FrontType.CRDT = {
        timestamp: Date.now(),
        userId: userInfo.userId!,
        extendInfo: {
          type: 'editor-scroll',
          topPercent,
          leftPercent,
        },
      };

      useOT.getState()?.socket?.emit('extraSync', JSON.stringify(crdt));
    });

    this.editor.createContextKey('save', true);

    this.editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        const { doc } = currentDoc.getState();

        useOT.getState()?.socket?.emit('saveFile', doc?.path);

        Toast.message({
          type: 'success',
          content: '保存成功~~🤘 ↑↑↓↓←→←→ABAB',
          placement: 'topCenter',
        });
      },
      'save',
    );
  }

  public lspServerInject(_lan: string, useLsp = true) {
    // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    //   allowNonTsExtensions: true,
    // });
    monaco.languages.register({
      id: 'ruby',
      extensions: ['.rb'],
      aliases: ['ruby', 'RUBY'],
      // extensions: ['.rb', '.rjs', '.gemspec', '.rbx'],
      // aliases: ['Ruby', 'ruby', 'rjs', 'gemspec', 'rb'],
      // mimetypes: ['application/json']
    });

    monaco.languages.register({
      id: 'go',
      extensions: ['.go'],
      aliases: ['go', 'GO'],
      // extensions: ['.rb', '.rjs', '.gemspec', '.rbx'],
      // aliases: ['Ruby', 'ruby', 'rjs', 'gemspec', 'rb'],
      // mimetypes: ['application/json']
    });

    monaco.languages.register({
      id: 'python',
      extensions: ['.py'],
      aliases: ['python', 'PYTHON'],
      // extensions: ['.rb', '.rjs', '.gemspec', '.rbx'],
      // aliases: ['Ruby', 'ruby', 'rjs', 'gemspec', 'rb'],
      // mimetypes: ['application/json']
    });

    monaco.languages.register({
      id: 'java',
      extensions: ['.java'],
      aliases: ['java', 'JAVA'],
      // extensions: ['.rb', '.rjs', '.gemspec', '.rbx'],
      // aliases: ['Ruby', 'ruby', 'rjs', 'gemspec', 'rb'],
      // mimetypes: ['application/json']
    });
    monaco.languages.register({
      id: 'typescript',
      extensions: ['.ts'],
      aliases: ['TypeScript', 'ts', 'TS', 'typescript'],
      // mimetypes: ['application/json']
    });

    const { lspUrl } = daoStore.getState().dockerInfo;
    const { ticket } = daoStore.getState().playgroundInfo;
    // if (!useLsp || !lspUrl || this.lspInited) return;
    if (!lspUrl || this.lspInited) return;
    this.lspInited = true;

    MonacoServices.install(monaco as typeof monacoCore);
    if (!lspUrl) return;
    // const webSocket = (new ReconnectingWebSocket('ws://192.168.2.15:7700', [], {
    const webSocket = new ReconnectingWebSocket(
      `wss://${lspUrl}/${ticket}`,
      [],
      {
        // const webSocket = (new ReconnectingWebSocket(
        //   'ws://192.168.2.9:3001/runner',
        //   [],
        //   {
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 10000,
        maxRetries: Infinity,
        debug: false,
      },
    ) as unknown as WebSocket;

    // listen when the web socket is opened
    listen({
      webSocket,
      onConnection: (connection) => {
        // console.log('lsp inited');
        // create and start the language client
        // const languageClient = createLanguageClient(connection);
        const languageClient = new MonacoLanguageClient({
          name: 'Language Client',
          clientOptions: {
            // use a language id as a document selector
            // documentSelector: [lan],
            // documentSelector: [{ language: 'ruby', pattern: '**∕*.rb' }],
            documentSelector: ['java', 'ruby', 'python', 'go'],
            // disable the default error handler
            errorHandler: {
              error: () => ErrorAction.Continue,
              closed: () => CloseAction.DoNotRestart,
            },
          },
          // create a language client connection from the JSON RPC connection on demand
          connectionProvider: {
            get: (errorHandler, closeHandler) => {
              return Promise.resolve(
                createConnection(connection, errorHandler, closeHandler),
              );
            },
          },
        });
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
      },
    });
  }

  private monacoWorkspaceInjection(
    serviceWorkerOrigin: string | undefined = 'https://staging.1024paas.com',
  ) {
    const { debug } = useOT.getState().socketHeader!;
    if (!isDev() || debug) {
      self.MonacoEnvironment = {
        globalAPI: true,
        getWorkerUrl(_moduleId: any, label: string) {
          if (label === 'json') {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            importScripts('${serviceWorkerOrigin}/assets/json.worker.js');`)}`;
          }
          if (label === 'css' || label === 'scss' || label === 'less') {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            importScripts('${serviceWorkerOrigin}/assets/css.worker.js');`)}`;
          }
          if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            importScripts('${serviceWorkerOrigin}/assets/html.worker.js');`)}`;
          }
          if (label === 'typescript' || label === 'javascript') {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            importScripts('${serviceWorkerOrigin}/assets/ts.worker.js');`)}`;
          }
          return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
              importScripts('${serviceWorkerOrigin}/assets/editor.worker.js');`)}`;
          // return 'serviceWorkerOriginhttps://develop.1024paas.com/assets/editor.worker.43309ac9.js';
        },
      };
    }

    if (isDev() && !debug) {
      self.MonacoEnvironment = {
        // baseUrl: '',
        globalAPI: true,
        getWorker(_: any, label: string) {
          if (label === 'json') {
            return new jsonWorker();
          }
          if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
          }
          if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
          }
          if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
          }
          return new editorWorker();
        },
      };
    }
  }

  private invertOperation(
    operation: { invert: (arg0: any) => void },
    docVal: any,
  ) {
    operation.invert(docVal);
  }

  public applyOperation(operation: TextOperation) {
    this.ignoreNextChange = true;

    console.log('change from server');
    this.applyOperationToMonaco(operation);
    this.ignoreNextChange = false;
  }

  private applyOperationToMonaco(operation: TextOperation, pushStack = false) {
    const { ops } = operation;
    const model = this.editor.getModel()!;
    let index = 0;
    const results = [] as monaco.editor.IIdentifiedSingleEditOperation[];

    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      // 如果某个操作是保留则我们的索引保持跟进
      if (TextOperation.isRetain(op)) {
        index += op as number;
      } else if (TextOperation.isInsert(op)) {
        // 某个操作是插入我们替换编辑器的内容
        const insert = model.getPositionAt(index);
        results.push({
          forceMoveMarkers: true,
          range: new monaco.Range(
            insert.lineNumber,
            insert.column,
            insert.lineNumber,
            insert.column,
          ),
          text: op as string,
        });
      } else if (TextOperation.isDelete(op)) {
        const start = model.getPositionAt(index);
        const end = model.getPositionAt(index - (op as number));

        results.push({
          forceMoveMarkers: false,
          range: new monaco.Range(
            start.lineNumber,
            start.column,
            end.lineNumber,
            end.column,
          ),
          text: null,
        });
        index -= op as number;
      }
    }
    if (pushStack) {
      // model.pushEditOperations([], results);
      model.pushEditOperations(
        [],
        results,
        null as unknown as monaco.editor.ICursorStateComputer,
      );
    } else {
      model.applyEdits(results);
    }
    // console.log(this.getCode());
    this.liveOperationCode = this.getCode();
  }

  public getCursor() {
    let selection = this.editor.getSelection()!;

    /** Fallback to last cursor change */
    if (typeof selection === 'undefined' || selection === null) {
      selection = this.lastCursorRange!;
    }

    /** Obtain selection indexes */
    const startPos = selection.getStartPosition();
    const endPos = selection.getEndPosition();
    let start = this.editor?.getModel()?.getOffsetAt(startPos) as number;
    let end = this.editor?.getModel()?.getOffsetAt(endPos) as number;

    /** If Selection is Inversed */
    if (start > end) {
      const _ref = [end, start];
      start = _ref[0];
      end = _ref[1];
    }

    /** Return cursor position */
    return new Cursor(start, end);
  }

  public getCode = () =>
    this.editor.getValue({
      lineEnding: '\n',
      preserveBOM: false,
    });
}
