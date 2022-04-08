/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as ws from 'ws';
import * as http from 'http';
import * as url from 'url';
import * as net from 'net';
import * as path from 'path';
import * as rpc from '@codingame/monaco-jsonrpc';
import * as rpcServer from '@codingame/monaco-jsonrpc/lib/server';
import * as lsp from 'vscode-languageserver';

import { Injectable } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
// @WebSocketGateway(7700, { namespace: 'events' })
@WebSocketGateway(7700)
export class LspService {
  @WebSocketServer()
  server: Server;
  // async onApplicationBootstrap() {
  // }

  async handleConnection(webSocket: ws.IWebSocket) {
    this.init(webSocket);
  }

  // @SubscribeMessage('events')
  // handleEvent() {
  // }
  init(webSocket) {
    // console.log(client);
    // wss.handleUpgrade(request, socket, head, (webSocket) => {
    const socket: rpc.IWebSocket = {
      send: (content) =>
        webSocket.send(content, (error) => {
          // console.log(content);
          if (error) {
            throw error;
          }
        }),
      onMessage: (cb) => webSocket.on('message', cb),
      onError: (cb) => webSocket.on('error', cb),
      onClose: (cb) => webSocket.on('close', cb),
      dispose: () => webSocket.close(),
    };
    // launch the server when the web socket is opened

    if (webSocket.readyState === webSocket.OPEN) {
      this.launch(socket);
    } else {
      webSocket.on('open', () => this.launch(socket));
    }
    // });

    process.on('uncaughtException', function (err: any) {
      console.error('Uncaught Exception: ', err.toString());
      if (err.stack) {
        console.error(err.stack);
      }
    });

    // create the express application
    // const app = express();
    // // server the static content, i.e. index.html
    // app.use(express.static(__dirname));
    // // start the server
    // const server = app.listen(8008);
    // create the web socket
    // const wss = new ws.Server({
    //   noServer: true,
    //   perMessageDeflate: false,
    // });
    // wss.handleUpgrade(request, socket, head, (webSocket) => {
    //   const socket: rpc.IWebSocket = {
    //     send: (content) =>
    //       webSocket.send(content, (error) => {
    //         if (error) {
    //           throw error;
    //         }
    //       }),
    //     onMessage: (cb) => webSocket.on('message', cb),
    //     onError: (cb) => webSocket.on('error', cb),
    //     onClose: (cb) => webSocket.on('close', cb),
    //     dispose: () => webSocket.close(),
    //   };
    //   // launch the server when the web socket is opened
    //   if (webSocket.readyState === webSocket.OPEN) {
    //     launch(socket);
    //   } else {
    //     webSocket.on('open', () => launch(socket));
    //   }
    // });
    // server.on(
    //   'upgrade',
    //   (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    //     const pathname = request.url
    //       ? url.parse(request.url).pathname
    //       : undefined;
    //     if (pathname === '/ts') {
    //       wss.handleUpgrade(request, socket, head, (webSocket) => {
    //         const socket: rpc.IWebSocket = {
    //           send: (content) =>
    //             webSocket.send(content, (error) => {
    //               if (error) {
    //                 throw error;
    //               }
    //             }),
    //           onMessage: (cb) => webSocket.on('message', cb),
    //           onError: (cb) => webSocket.on('error', cb),
    //           onClose: (cb) => webSocket.on('close', cb),
    //           dispose: () => webSocket.close(),
    //         };
    //         // launch the server when the web socket is opened
    //         if (webSocket.readyState === webSocket.OPEN) {
    //           launch(socket);
    //         } else {
    //           webSocket.on('open', () => launch(socket));
    //         }
    //       });
    //     }
    //   },
    // );
  }
  launch(socket: rpc.IWebSocket) {
    const reader = new rpc.WebSocketMessageReader(socket);
    const writer = new rpc.WebSocketMessageWriter(socket);
    // const asExternalProccess = process.argv.findIndex(value => value === '--external') !== -1;
    // if (asExternalProccess)  {
    // start the language server as an external process
    // const extJsonServerPath = path.resolve(__dirname, 'ext-json-server.js');
    // const extJsonServerPath = path.resolve(__dirname, 'ext-json-server.js');
    const socketConnection = rpcServer.createConnection(reader, writer, () =>
      socket.dispose(),
    );

    // const serverConnection = rpcServer.createServerProcess('TypeScript language', 'node', [extJsonServerPath]);
    const serverConnection = rpcServer.createServerProcess(
      // 'TypeScript language',
      // 'typescript-language-server',
      // ['--stdio', '--log-level=1'],
      'Ruby language',
      'solargraph',
      ['stdio'],

      // 'node',
      // const serverConnection = rpcServer.createServerProcess(
      //   'TypeScript language',
      //   'node',
      //   [
      //     path.resolve(
      //       __dirname,
      //       '../../../../',
      //       '../../../../',
      //       'node_modules',
      //       'typescript-language-server',
      //       'lib',
      //       'cli.js',
      //     ),
      //     '--stdio',
      //     '--tsserver-path=' +
      //       path.join(
      //         __dirname,
      //         '../../../../',
      //         '../../../../',
      //         'node_modules',
      //         'typescript',
      //         'bin',
      //         'tsserver',
      //       ),
      //     '--log-level=4',
      //   ],
    );

    rpcServer.forward(socketConnection, serverConnection, (message) => {
      if (rpc.isRequestMessage(message)) {
        if (message.method === lsp.InitializeRequest.type.method) {
          const initializeParams = message.params as lsp.InitializeParams;
          initializeParams.processId = process.pid;
        }
      }
      return message;
    });
  }
}
