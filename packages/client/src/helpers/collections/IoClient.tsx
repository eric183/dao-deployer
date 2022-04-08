/* eslint-disable */
// @ts-nocheck
import { TextOperation } from 'ot';
import { useOT } from '~/hooks';
import { SocketType } from '~/hooks/collections/useOT';
import { daoStore } from '~/stores';
// import { setEditorOT } from './idb';

// import { openDB } from 'idb';
// import { omit, pick } from 'lodash';
// import { Client, Selection, TextOperation } from 'ot';
// import { useOT } from '~/hooks';
// import { daoStore } from '~/stores';
// import { setEditorOT } from './idb';
interface TestVectorLayer {
  // members of your "class" go here
  revision: number;
  // operation: [];
  // receiveOperation: [];
  // io?: SocketType;
  state: any;
  // Synchronized: any;
}

export const IoClient = function (this: TestVectorLayer, revision: number) {
  this.revision = revision; // the next expected revision number
  this.state = synchronized_; // start state
  // this.operation = [];
  // this.receiveOperation = [];
  // this.io = useOT.getState().socket;
} as unknown as {
  Synchronized: () => void;
  // revision: number, Synchronized: any
  new (revision: number, Synchronized: any): TestVectorLayer;
};

IoClient.prototype.setState = function (state: any) {
  this.state = state;
};

// Call this method when the user changes the document.
IoClient.prototype.applyClient = function (operation: any) {
  // this.operation = operation;
  this.setState(this.state.applyClient(this, operation));
};

// Call this method with a new operation from the server
IoClient.prototype.applyServer = function (operation: any) {
  this.revision++;
  // ;
  this.setState(this.state.applyServer(this, operation));
};

IoClient.prototype.serverAck = function () {
  // ;
  this.revision++;
  this.setState(this.state.serverAck(this));
};

IoClient.prototype.serverReconnect = function () {
  if (typeof this.state.resend === 'function') {
    this.state.resend(this);
  }
};

// Transforms a selection from the latest known server state to the current
// client state. For example, if we get from the server the information that
// another user's cursor is at position 3, but the server hasn't yet received
// our newest operation, an insertion of 5 characters at the beginning of the
// document, the correct position of the other user's cursor in our current
// document is 8.
IoClient.prototype.transformSelection = function (selection: any) {
  return this.state.transformSelection(selection);
};

IoClient.prototype.insertOTForDB = (obj: any) => {
  // setEditorOT(obj.ot.revision, pick(obj.ot, 'file', 'operation'));
  // await db.put('editor', pick(obj.ot, 'file', 'operation'), obj.ot.revision);
  // await db.add('favourite-number', obj, 'price');
};

// Override this method.
IoClient.prototype.sendOperation = function (
  revision: number,
  operation: TextOperation,
) {
  throw new Error('sendOperation must be defined in child class');
};
// Override this method.
IoClient.prototype.applyOperation = function (operation: any) {
  // daoStore.getState().setOperation(operation);

  // this.receiveOperation = operation;
  // console.log('operation is coming back', operation);
  throw new Error('applyOperation must be defined in child class');
  // this.serverAck();
};

// In the 'Synchronized' state, there is no pending operation that the client
// has sent to the server.
// eslint-disable-next-line @typescript-eslint/no-empty-function
function Synchronized() {}
IoClient.Synchronized = Synchronized;

Synchronized.prototype.applyClient = function (
  client: { sendOperation: (arg0: any, arg1: any) => void; revision: any },
  operation: any,
) {
  // When the user makes an edit, send the operation to the server and
  // switch to the 'AwaitingConfirm' state
  // ;
  client.sendOperation(client.revision, operation);
  return new AwaitingConfirm(operation);
};

Synchronized.prototype.applyServer = function (
  client: { applyOperation: (arg0: any) => void },
  operation: any,
) {
  // When we receive a new operation from the server, the operation can be
  // simply applied to the current document
  // ;
  client.applyOperation(operation);
  return this;
};

Synchronized.prototype.serverAck = function (client: any) {
  throw new Error('There is no pending operation.');
};

// Nothing to do because the latest server state and client state are the same.
Synchronized.prototype.transformSelection = function (x: any) {
  return x;
};

// Singleton
const synchronized_ = new Synchronized();

// In the 'AwaitingConfirm' state, there's one operation the client has sent
// to the server and is still waiting for an acknowledgement.
function AwaitingConfirm(this: any, outstanding: undefined) {
  // Save the pending operation
  this.outstanding = outstanding;
}
IoClient.AwaitingConfirm = AwaitingConfirm;

AwaitingConfirm.prototype.applyClient = function (client: any, operation: any) {
  // When the user makes an edit, don't send the operation immediately,
  // instead switch to 'AwaitingWithBuffer' state
  return new AwaitingWithBuffer(this.outstanding, operation);
};

AwaitingConfirm.prototype.applyServer = function (client, operation) {
  // This is another client's operation. Visualization:
  //
  //                   /\
  // this.outstanding /  \ operation
  //                 /    \
  //                 \    /
  //  pair[1]         \  / pair[0] (new outstanding)
  //  (can be applied  \/
  //  to the client's
  //  current document)
  var pair = operation.constructor.transform(this.outstanding, operation);
  client.applyOperation(pair[1]);
  return new AwaitingConfirm(pair[0]);
};

AwaitingConfirm.prototype.serverAck = function (client: any) {
  // The client's operation has been acknowledged
  // => switch to synchronized state
  return synchronized_;
};

AwaitingConfirm.prototype.transformSelection = function (selection: {
  transform: (arg0: any) => any;
}) {
  return selection.transform(this.outstanding);
};

AwaitingConfirm.prototype.resend = function (client: {
  sendOperation: (arg0: any, arg1: any) => void;
  revision: any;
}) {
  // The confirm didn't come because the client was disconnected.
  // Now that it has reconnected, we resend the outstanding operation.
  client.sendOperation(client.revision, this.outstanding);
};

// In the 'AwaitingWithBuffer' state, the client is waiting for an operation
// to be acknowledged by the server while buffering the edits the user makes
function AwaitingWithBuffer(this: any, outstanding: any, buffer: undefined) {
  // Save the pending operation and the user's edits since then
  this.outstanding = outstanding;
  this.buffer = buffer;
}
IoClient.AwaitingWithBuffer = AwaitingWithBuffer;

AwaitingWithBuffer.prototype.applyClient = function (
  client: any,
  operation: any,
) {
  // Compose the user's changes onto the buffer
  const newBuffer = this.buffer.compose(operation);
  return new AwaitingWithBuffer(this.outstanding, newBuffer);
};

AwaitingWithBuffer.prototype.applyServer = function (client, operation) {
  // Operation comes from another client
  //
  //                       /\
  //     this.outstanding /  \ operation
  //                     /    \
  //                    /\    /
  //       this.buffer /  \* / pair1[0] (new outstanding)
  //                  /    \/
  //                  \    /
  //          pair2[1] \  / pair2[0] (new buffer)
  // the transformed    \/
  // operation -- can
  // be applied to the
  // client's current
  // document
  //
  // * pair1[1]
  var transform = operation.constructor.transform;
  var pair1 = transform(this.outstanding, operation);
  var pair2 = transform(this.buffer, pair1[1]);
  client.applyOperation(pair2[1]);
  return new AwaitingWithBuffer(pair1[0], pair2[0]);
};
// AwaitingWithBuffer.prototype.applyServer = function (
//   client: { applyOperation: (arg0: any) => void },
//   operation: { constructor: { transform: any }; baseLength: any },
// ) {
//   // Operation comes from another client
//   //
//   //                       /\
//   //     this.outstanding /  \ operation
//   //                     /    \
//   //                    /\    /
//   //       this.buffer /  \* / pair1[0] (new outstanding)
//   //                  /    \/
//   //                  \    /
//   //          pair2[1] \  / pair2[0] (new buffer)
//   // the transformed    \/
//   // operation -- can
//   // be applied to the
//   // client's current
//   // document
//   //
//   // * pair1[1]
//   let pair2, pair1;
//   // checked = false;

//   // // if (this.outstanding === operation) {
//   // //   pair1 = transform(this.outstanding, operation);
//   // // }
//   // // if (this.buffer.baseLength === pair1[1].baseLength) {
//   // //   pair2 = transform(this.buffer, pair1[1]);
//   // // }
//   // if (this.outstanding.baseLength === operation.baseLength) {
//   //   pair1 = transform(this.outstanding, operation);
//   // }

//   // if (this.buffer.baseLength === pair1[1].baseLength) {
//   //   pair2 = transform(this.buffer, pair1[1]);
//   // }

//   const transform = operation.constructor.transform;
//   if (this.outstanding.baseLength === operation.baseLength) {
//     pair1 = transform(this.outstanding, operation);
//     if (this.buffer.baseLength === pair1[1].baseLength) {
//       pair2 = transform(this.buffer, pair1[1]);
//       client.applyOperation(pair2[1]);
//       // checked = true;
//       return new AwaitingWithBuffer(pair1[0], pair2[0]);
//     }
//   }
//   // if(pair1 && pair2) {
//   // }
// };

AwaitingWithBuffer.prototype.serverAck = function (client: {
  sendOperation: (arg0: any, arg1: any) => void;
  revision: any;
}) {
  // The pending operation has been acknowledged
  // => send buffer
  client.sendOperation(client.revision, this.buffer);
  return new AwaitingConfirm(this.buffer);
};

AwaitingWithBuffer.prototype.transformSelection = function (selection: {
  transform: (arg0: any) => {
    (): any;
    new (): any;
    transform: { (arg0: any): any; new (): any };
  };
}) {
  return selection.transform(this.outstanding).transform(this.buffer);
};

AwaitingWithBuffer.prototype.resend = function (client: {
  sendOperation: (arg0: any, arg1: any) => void;
  revision: any;
}) {
  // The confirm didn't come because the client was disconnected.
  // Now that it has reconnected, we resend the outstanding operation.
  client.sendOperation(client.revision, this.outstanding);
};

// export default Client;

// export class IoClient extends Client {
//   constructor(revision) {
//     super(revision);
//     // return ioClient;
//   }
//   revision: number;
//   state: Client.Synchronized;
//   io = useOT.getState().socket;

//   setState(state: Client.Synchronized): void {
//     throw new Error('Method not implemented.');
//   }
//   applyClient(operation: TextOperation): void {
//     throw new Error('Method not implemented.');
//   }
//   applyServer(operation: TextOperation): void {
//     throw new Error('Method not implemented.');
//   }
//   serverAck(): void {
//     throw new Error('Method not implemented.');
//   }
//   serverReconnect(): void {
//     throw new Error('Method not implemented.');
//   }
//   transformSelection(selection: Selection): Selection {
//     throw new Error('Method not implemented.');
//   }
//   sendOperation(revision: number, operation: TextOperation): void {
//     // console.log('调用监听');

//     this.insertOTForDB({
//       ot: {
//         operation,
//         revision,
//         file: {
//           ...omit(daoStore.getState().file, 'value'),
//           // valueAndPos,
//         },
//         userInfo: userStore.getState().userInfo,
//       },
//     });
//     this.io.emit(
//       'editFile',
//       // blob,
//       JSON.stringify({
//         ot: {
//           operation,
//           revision,
//           file: {
//             ...omit(daoStore.getState().file, 'value'),
//             // valueAndPos,
//           },
//           userInfo: userStore.getState().userInfo,
//         },
//       }),
//     );

//     // throw new Error('Method not implemented.');
//   }
//   async insertOTForDB(obj) {
//     setEditorOT(obj.ot.revision, pick(obj.ot, 'file', 'operation'));
//     // await db.put('editor', pick(obj.ot, 'file', 'operation'), obj.ot.revision);
//     // await db.add('favourite-number', obj, 'price');
//   }
//   applyOperation(operation: TextOperation): void {
//     throw new Error('Method not implemented.');
//   }
//   // sendOperation = (revision, operation) => {
//   //   this.io.emit(
//   //     'editFile',
//   //     // blob,
//   //     JSON.stringify({
//   //       ot: {
//   //         operation,
//   //         revision,
//   //         file: {
//   //           ...omit(daoStore.getState().file, 'value'),
//   //           // valueAndPos,
//   //         },
//   //         userInfo: userStore.getState().userInfo,
//   //       },
//   //     }),
//   //   );
//   // };
// }
