import { findIndex } from 'lodash';
import * as monaco from 'monaco-editor';
import { daoStore } from '~/stores';
import { currentDoc, DaoUserInfo } from '~/stores/daoStore';

interface ClientType {
  avatar: string;
  color: string;
  cursor?: CursorType;
  selection?: any;
  onlineCount: number;
  role: string;
  userId: string;
  username: string;
}

interface CursorType {
  position: number;
  selectionEnd: number;
  path?: string;
}

export class ClientMeta {
  [x: string]: any;
  clientList: {
    [x: string]: any;
    path?: string;
    userId?: string;
    cursor?: monaco.editor.IModelDeltaDecoration[];
  };
  tempCursors: {
    path: string;
    userId: string;
    cursorRange: any;
  }[];
  // constructor(id, listEl, editorAdapter, name, selection) {
  constructor(editor: any, clientList: any) {
    this.editor = editor;
    this.model = editor.getModel();

    this.renderCursorGroup = '';

    this.tempCursors = [];

    this.labelGroup = [];

    this.clientList = [];

    this.updateList(clientList);
  }

  updateModel() {
    this.model = this.editor.getModel();
  }

  set _updateList(list: any) {
    this.clientList = list;

    this.setCursors();
  }

  public updateList(list: any) {
    this._updateList = list;
  }

  public pushSelectionToList(arg: any) {
    // const injectList = Array.isArray(arg) ? arg : this.clientList;
    const finderBoolean = this.clientList.some(
      (client: { userId: any }) => client.userId === arg.userId,
    );

    if (!finderBoolean) {
      this.clientList.push(arg);
    } else {
      this.clientList = this.clientList.map(
        (client: {
          userId: any;
          selection: monaco.editor.IModelDeltaDecoration[];
        }) => {
          return {
            ...client,
            selection:
              client.userId === arg.userId ? arg.selection : client.selection,
          };
        },
      );
    }

    this.setSelection();
  }

  public pushCursorToList(arg: any) {
    // const injectList = Array.isArray(arg) ? arg : this.clientList;
    const finderBoolean = this.clientList.some(
      (client: { userId: any }) => client.userId === arg.userId,
    );

    if (!finderBoolean) {
      this.clientList.push(arg);
    } else {
      this.clientList = this.clientList.map(
        (client: {
          userId: any;
          cursor: monaco.editor.IModelDeltaDecoration[];
        }) => {
          return {
            ...client,
            cursor: client.userId === arg.userId ? arg.cursor : client.cursor,
          };
        },
      );
    }

    this.setCursors();
  }

  public setCursors() {
    const editorModel = this.editor.getModel()!;

    if (!editorModel) return;
    const deltaDecorationData = {
      firstArg: [],
      secondArg: [],
    };
    // debugger;
    deltaDecorationData.firstArg = this.renderCursorGroup
      ? this.renderCursorGroup
      : this.clientList.map((client: ClientType) => client.role);

    deltaDecorationData.secondArg = this.clientList.map(
      (client: ClientType) => {
        const { cursor } = client;
        if (cursor) {
          const start = editorModel.getPositionAt(cursor.position);
          const end = editorModel.getPositionAt(cursor.selectionEnd);
          return {
            range: new monaco.Range(
              start.lineNumber,
              start.column,
              end.lineNumber,
              end.column,
            ),

            options: {
              className:
                currentDoc.getState()!.doc!.path === cursor.path
                  ? client.role
                  : '',
            },
          };
        } else {
          return {
            range: new monaco.Range(0, 0, 0, 0),
            options: {
              className: '',
            },
          };
        }
      },
    );

    this.renderCursorGroup = this.editor.deltaDecorations(
      deltaDecorationData.firstArg,
      deltaDecorationData.secondArg,
    );

    this.setLabels();

    // const _label = document.querySelector<HTMLElement>(`.${u.role}-label`)!;

    // if (!_label?.classList?.contains('label-visible')) {
    //   _label?.classList.add('label-visible');
    // }

    // this.editor.layoutContentWidget({
    //   ...u.label,
    //   getPosition: function () {
    //     return {
    //       position: {
    //         lineNumber: (CRDTInfo.selection as number[][])[0][7],
    //         column: (CRDTInfo.selection as number[][])[0][6],
    //       },
    //       preference: [
    //         monaco.editor.ContentWidgetPositionPreference.ABOVE,
    //         monaco.editor.ContentWidgetPositionPreference.BELOW,
    //       ],
    //     };
    //   },
    // });
  }

  public removeCursor(user: Pick<DaoUserInfo, 'userId' | 'role'>) {
    const { userId } = user;
    const userInfo = this.clientList.find(
      (client: { userId: string | undefined }) => client.userId === userId,
    );
    this.clientList = this.clientList.filter(
      (client: { userId: string | undefined }) => client.userId !== userId,
    );
    // this.setLabels();
    const label = document.querySelector(`.${userInfo.role}-label`);
    label?.classList.add('no-cursor');
  }

  // public setSelection() {
  //   return;
  //   const editorModel = this.editor.getModel()!;
  //   const deltaDecorationData = {
  //     firstArg: [],
  //     secondArg: [],
  //   };
  //   deltaDecorationData.firstArg = this.renderSelectionGroup
  //     ? this.renderSelectionGroup
  //     : this.clientList.map((client: ClientType) => client.role);

  //   // delta: editor.deltaDecorations(
  //   //   deltaInfo.delta ? deltaInfo.delta : '',
  //   //   (CRDTInfo?.selection as number[][]).map((s) => ({
  //   //     range: new monaco.Range(s[0], s[1], s[2], s[3]),
  //   //     options: {
  //   //       isWholeLine: false,
  //   //       className: s[5] === s[6] ? deltaInfo.role : '',
  //   //       // stickiness:
  //   //       //   monaco.editor.TrackedRangeStickiness
  //   //       //     .NeverGrowsWhenTypingAtEdges,
  //   //       // linesDecorationsClassName: deltaInfo.role,
  //   //       inlineClassName: deltaInfo.role + '-selection',
  //   //       // glyphMarginClassName: 'myGlyphMarginClass',
  //   //     },
  //   //   })),
  //   // ),

  //   deltaDecorationData.secondArg = this.clientList.map(
  //     (client: ClientType) => {
  //       const { selection } = client;

  //       if (selection) {
  //         // const start = editorModel.getPositionAt(cursor.position);
  //         // const end = editorModel.getPositionAt(cursor.selectionEnd);
  //         return {
  //           range: new monaco.Range(
  //             selection[0],
  //             selection[1],
  //             selection[2],
  //             selection[3],
  //           ),
  //           options: {
  //             isWholeLine: false,
  //             className: selection[5] === selection[6] ? deltaInfo.role : '',
  //             // stickiness:
  //             //   monaco.editor.TrackedRangeStickiness
  //             //     .NeverGrowsWhenTypingAtEdges,
  //             // linesDecorationsClassName: deltaInfo.role,

  //             inlineClassName:
  //               daoStore.getState()!.doc!.path === cursor.path
  //                 ? client.role + '-selection'
  //                 : '',
  //             // glyphMarginClassName: 'myGlyphMarginClass',
  //           },
  //           // options: {
  //           //   className:
  //           // daoStore.getState()!.doc!.path === cursor.path
  //           //   ? client.role
  //           //   : '',
  //           // },
  //         };
  //       } else {
  //         return {
  //           range: new monaco.Range(0, 0, 0, 0),
  //           options: {
  //             className: '',
  //           },
  //         };
  //       }
  //     },
  //   );

  //   this.renderCursorGroup = this.editor.deltaDecorations(
  //     deltaDecorationData.firstArg,
  //     deltaDecorationData.secondArg,
  //   );
  // }

  public removeSelection(user: Pick<DaoUserInfo, 'userId' | 'role'>) {
    const { userId } = user;

    // this.renderCursors = this.renderCursors.filter(
    //   (cursorInfo: { userId?: string }) => cursorInfo.userId !== userId,
    // );
    // this.renderCursors.forEach((cursorInfo) => {
    //   if (cursorInfo.userId === userId) {
    //     this.editor.deltaDecorations(cursorInfo.cursor, []);
    //   }
    // });
  }

  public setLabels() {
    const editorModel = this.editor.getModel()!;

    this.clientList = this.clientList.map(
      (x: {
        cursor: { position: undefined; path: string | undefined };
        label: any;
        userId: any;
        role: any;
        username: any;
        color: any;
      }) => {
        const hasCursor =
          x.cursor !== undefined && x.cursor.position !== undefined;

        const start = !hasCursor
          ? { lineNumber: 1, column: 1 }
          : editorModel.getPositionAt(x.cursor.position);
        const contentWidget = {
          ...x.label,
          domNode: null as unknown as HTMLDivElement,
          getId: function () {
            return `label-${x.userId}`;
          },
          getDomNode: function () {
            // if (!x.cursor.path) return null;

            // daoStore.getState()!.doc!.path !== x?.cursor?.path

            if (!this.domNode) {
              this.domNode = document.createElement('div') as HTMLDivElement;
              this.domNode.className = `monaco-label ${x.role}-label no-cursor`;
              this.domNode.innerHTML = x.username!;
              this.domNode.style.background = x.color!;
              // this.domNode.style.opacity =
              //   noCursor
              //     ? '0'
              //     : '1';
              // daoStore.getState()!.doc!.path === x?.cursor?.path ? '1' : '0';
              // this.domNode.style.visibility =
              //   daoStore.getState()!.doc!.path === x.cursor.path
              //     ? 'visible !important'
              //     : 'hidden !important';
            }

            // if (this.domNode && x.cursor) {
            //   // this.domNode.style.visibiliÚty = 'visible !important';
            //   this.domNode.className = `monaco-label ${x.role}-label ${
            //     !hasCursor ? 'no-cursor' : ''
            //   }`;
            //   this.domNode.innerHTML = x.username!;
            //   this.domNode.style.background = x.color!;
            // }
            return this.domNode;
          },
          getPosition: function () {
            return {
              position: {
                lineNumber: start.lineNumber,
                column: start.column,
              },
              preference: [
                monaco.editor.ContentWidgetPositionPreference.ABOVE,
                monaco.editor.ContentWidgetPositionPreference.BELOW,
              ],
            };
          },
        };

        // if (!x.label.domNode) {
        // this.editor.getId();
        // _contentWidgets
        if (this.editor._contentWidgets[`label-${x.userId}`]) {
          this.editor.layoutContentWidget(contentWidget);
          const label = document.querySelector(`.${x.role}-label`);

          console.log(label);
          if (
            x?.cursor?.path &&
            currentDoc.getState()!.doc!.path === x?.cursor?.path
          ) {
            label?.classList.remove('no-cursor');
          } else {
            label?.classList.add('no-cursor');
          }
          // no-cursor
          // this.editor.layoutOverlayWidget(contentWidget);
        } else {
          this.editor.addContentWidget(contentWidget);
        }
        // } else {
        // }

        return {
          ...x,
          contentWidget,
        };
        // const end = editorModel.getPositionAt(x.cursor.selectionEnd);
        // x.label = this.editor.layoutContentWidget({
        //   ...x.label,
        //   getPosition: function () {
        //     return {
        //       position: {
        //         lineNumber: start.lineNumber,
        //         column: start.column,
        //       },
        //       preference: [
        //         monaco.editor.ContentWidgetPositionPreference.ABOVE,
        //         monaco.editor.ContentWidgetPositionPreference.BELOW,
        //       ],
        //     };
        //   },
        // });
      },
    );

    // );
  }
}
