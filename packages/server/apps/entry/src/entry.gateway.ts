import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';

import { Socket, Server } from 'socket.io';
import { findIndex, pick } from 'lodash';
import { TextOperation } from 'ot';
import { config as envConfig } from 'dotenv';
import { AppService } from './entry.service';

import fetch from 'node-fetch';
import { CRDT, DockerInfoType, PlaygroundInfoType, UserInfo } from 'types';
import { v4 as uuidv4 } from 'uuid';
import { ReplayService } from './providers/replay.service';

envConfig();

type SocketOrString = Socket | string;

// const RedisConfig = {
//   host: process.env.SOCKET_INSTANCE_REDIS_HOST,
//   port: process.env.SOCKET_INSTANCE_REDIS_PORT,
//   password: process.env.SOCKET_INSTANCE_REDIS_PASSWORD,
// };

@WebSocketGateway(4001, { cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  @Inject(AppService)
  appService: AppService;

  @Inject(ReplayService)
  replayService: ReplayService;

  private readonly logger = new Logger(AppGateway.name);

  frontAppStatus: string;
  globalData: {
    isRecording: false;
  };

  docs = new Map();
  tempDocs = {};

  crdts: Map<number, CRDT> = new Map([]);

  dockerInfos: Map<string, DockerInfoType> = new Map([]);
  playgroundInfos: Map<string, PlaygroundInfoType> = new Map([]);
  playgroundUsers: Map<
    string,
    {
      users: UserInfo[];
      usersHistory: UserInfo[];
      followingUsers: {
        user: UserInfo;
        followingUser: UserInfo;
      }[];
    }
  > = new Map([]);

  eventBus: Map<string, CRDT> = new Map();
  ignoreTreeFiles = [];
  ENV_TYPE: string;

  async afterInit() {
    this.logger.verbose('Entry inited~');
    this.logger.verbose(
      Array.from(this.replayService.replayData),
      './.............',
    );
  }

  async handleConnection(client: Socket) {
    const uid = 'userId';

    if (!this.ENV_TYPE) {
      this.ENV_TYPE = client.handshake.auth.paasDomain.includes('staging')
        ? 'staging'
        : 'development';
    }

    const userInfos = this.playgroundUsers.get(
      client.handshake.auth.playgroundId,
    );

    if (
      this.ENV_TYPE === 'staging' &&
      userInfos &&
      userInfos.users.some(
        (user) => user.ticket === client.handshake.auth.ticket,
      )
    ) {
      client.emit('alreadyLogin');
      return;
    }

    if (!userInfos) {
      this.playgroundUsers.set(client.handshake.auth.playgroundId, {
        users: [],
        usersHistory: [],
        followingUsers: [],
      });
    }

    const clientHeader = {
      ...(client.handshake.auth as {
        tenantId: string;
        userId: string;
        playgroundId: string;
        ticket: string;
        [key: string]: unknown;
      }),
      userId: client.handshake.auth['userId'],
    };

    client.join(clientHeader.playgroundId);
    // toTrace(clientHeader);
    // throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    // const response = await fetch('https://develop.1024paas.com/paas/ticket', {

    // console.log(`${client.handshake.auth.paasDomain}`, '!!!!!!!!!!!!');

    if (typeof clientHeader.ticket !== 'string') {
      console.log('参数错误');
    }

    const response = await fetch(
      `https://${client.handshake.auth.paasDomain}/paas/ticket`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticket: clientHeader.ticket }),
      },
    );
    console.log(clientHeader.ticket, '.............');
    const { data, status } = await response.json();
    console.log(data, 'response........');
    if (process.env.NODE_ENV === 'production') {
      if (status !== 'success') {
        this.emitAuthorizeTicketError(client, '入场券出错，请校验重试！');
      }
      if (new Date().getTime() > data.tillTime) {
        this.emitAuthorizeTicketError(client, '入场券过期，请重新申请！');
      }
      // if (
      //   clientHeader.tenantId !== data.tenantId ||
      //   clientHeader.userId !== data.userId
      // ) {
      //   this.emitAuthorizeTicketError(client, '用户身份错误！');
      // }
      if (clientHeader.playgroundId !== data.playgroundId) {
        this.emitAuthorizeTicketError(client, '选择了错误的游乐场！');
      }
    }

    const user = await this.appService.authClient
      .send('auth/login', clientHeader)
      .toPromise();

    this.userInit(client, {
      ...client.handshake.auth,
      ...user,
      playgroundId: clientHeader.playgroundId,
    });
  }

  async handleDisconnect(client: Socket) {
    // console.log(client, 'A USER LEFT THE ROOM');
    // A client has disconnected
    // this.users--
    const { userId, playgroundId } = client.handshake.auth;

    const userInfos = this.playgroundUsers.get(playgroundId);

    this.appService.authClient.send('auth/remove', userId);

    if (userInfos.users) {
      userInfos.users.splice(
        findIndex(userInfos.users, {
          userId,
        }),
        1,
      );
    }

    // if (userInfos.usersHistory) {
    //   userInfos.usersHistory.splice(
    //     findIndex(userInfos.usersHistory, {
    //       userId,
    //     }),
    //     1,
    //   );
    // }

    this.playgroundUsers.set(playgroundId, userInfos);
    await this.appService.authClient.send('user/remove', userId);
    this.sendDataByRoom(
      client,
      'cursor',
      JSON.stringify({
        userId,
        cursor: false,
      }),
      'Client',
    );

    this.userLogout(client, JSON.stringify({ userId, cursor: false }));
    // const user = await this.appService.authClient.send('user/findOne', userId);
    // console.log(user, '!!!!!!!!!!!!');
  }

  async userInit(client: Socket, payload) {
    let responseData;

    const { playgroundId, ticket } = client.handshake.auth;

    const userInfos = this.playgroundUsers.get(playgroundId);

    const activePlayground = this.playgroundInfos.get(playgroundId);

    if (userInfos.users.length > 0 && activePlayground) {
      this.logger.log('PLAYGROUND_DATA FROM CACHE');
      this.getDockerInfo(playgroundId);
    } else {
      this.logger.log('DATA FRESH');
      this.initPlayground(playgroundId);
    }

    const sesstionUser = userInfos.users.find((u) => {
      if (u.userId === payload.userId) {
        u.username = payload.username;
        return u;
      }
    });

    console.log(payload, '.........................');
    const userInHistory = userInfos.usersHistory.find(
      (u) => u.userId === payload.userId,
    );

    const user = sesstionUser
      ? sesstionUser
      : ({
          ...pick(payload, ['userId', 'username', 'avatarUrl']),
          onlineCount: userInfos.usersHistory.length + 1,
          role:
            userInfos.usersHistory.length === 0
              ? `HOST`
              : `CO_${userInfos.usersHistory.length}`,
        } as unknown as UserInfo);
    let users;

    if (userInHistory) {
      users = userInfos.users.concat(userInHistory);

      this.playgroundUsers.set(playgroundId, {
        ...userInfos,
        users,
      });
      responseData = JSON.stringify({
        ...userInHistory,
        coUsers: users,
      });
    } else {
      users = userInfos.users.concat(user);
      this.playgroundUsers.set(playgroundId, {
        ...userInfos,
        users: userInfos.users.concat(user),
        usersHistory: userInfos.usersHistory.concat(user),
      });

      responseData = JSON.stringify({
        ...user,
        coUsers: users,
      });
    }

    this.sendDataByRoom(client, 'userEnteredRoom', responseData, 'Server');
  }

  userLogout(client, payload) {
    this.sendDataByRoom(client, 'userExitRoom', payload, 'Server');
  }
  @SubscribeMessage('errorHandler')
  errorHandler(payload): void {
    const playgroundId = payload.playgroundId;

    // messageId:'f8ae5bd3-3a50-4c45-b8ef-7da0dd74edf5'
    // playgroundId:'372433558737911808'
    // reason:'DOCKER_NOT_BIND'
    // replyMessageId:'233'
    // success:false
    // timestamp:1646622349
    this.sendDataByRoom(
      playgroundId,
      'errorHandler',
      pick(
        {
          ...payload,
          content: payload.reason,
        },
        ['playgroundId', 'timestamp', 'content'],
      ),
    );

    // this.sendRaMQEvent('errorHanler', {
    //   direction: 'toPlayground',
    //   playgroundId,
    // });
  }

  @SubscribeMessage('active')
  activePlayground(client: SocketOrString): void {
    const playgroundId =
      typeof client === 'string' ? client : client.handshake.auth.playgroundId;

    this.sendRaMQEvent('active', {
      direction: 'toPlayground',
      playgroundId,
    });
  }

  @SubscribeMessage('run')
  runConsole(client: Socket): void {
    const playgroundId = client.handshake.auth.playgroundId;
    const dockerId = this.playgroundInfos.get(playgroundId).activeDockerId;

    this.sendRaMQEvent('run', {
      direction: 'toDocker',
      playgroundId,
      dockerId,
    });
  }

  @SubscribeMessage('stop')
  stopRunning(client: Socket): void {
    const playgroundId = client.handshake.auth.playgroundId;
    const dockerId = this.playgroundInfos.get(playgroundId).activeDockerId;
    this.sendRaMQEvent('stop', {
      direction: 'toDocker',
      playgroundId,
      dockerId,
    });
  }

  @SubscribeMessage('appStatus')
  appStatus(client: Socket, payload: string): void {
    this.frontAppStatus = payload;
    client
      .to(client.handshake.auth.playgroundId)
      .emit('appStatus', this.frontAppStatus);
    // broadcast.emit('appStatus', this.frontAppStatus);
    // client.emit('appStatus', this.frontAppStatus);
  }

  @SubscribeMessage('globalData')
  globalDataSetter(client: Socket, payload): void {
    this.globalData = payload;
    this.sendDataByRoom(client, 'globalData', this.globalData, 'Client');
    // client.broadcast.emit('globalData', this.globalData);
    // client.emit('appStatus', this.frontAppStatus);
  }

  // @SubscribeMessage('selection')
  // async selection(client: Socket, payload) {
  //   const _payload = JSON.parse(payload) as CRDT;

  //   this.users.forEach((user) => {
  //     if (user.userId === _payload.userId) {
  //       user.selection = {
  //         ..._payload.selection,
  //         path: _payload.file.path,
  //       };
  //       _payload.userInfo = {
  //         ..._payload.userInfo,
  //         ...user,
  //       };
  //     }
  //   });
  //   this.sendDataByRoom(
  //     client,
  //     'selection',
  //     JSON.stringify(_payload),
  //     'Client',
  //   );
  //   // client.broadcast.emit('customAck', payload);
  // }

  @SubscribeMessage('following')
  following(client: Socket, payload): void {
    const { playgroundId } = client.handshake.auth;

    const userInfos = this.playgroundUsers.get(playgroundId);

    console.log(userInfos.followingUsers, '........');
    const hasUser = userInfos.followingUsers.some(
      (follow) => follow.followingUser.userId === payload.followingUser.userId,
    );

    if (!hasUser) {
      userInfos.followingUsers.push(payload);
    }

    // this.followingUsers.add(payload.user.userId);
    this.sendDataByRoom(
      client,
      'following',
      JSON.stringify(Array.from(userInfos.followingUsers)),
      'Client',
    );
  }

  @SubscribeMessage('unFollowing')
  unFollowing(client: Socket, payload): void {
    const { playgroundId } = client.handshake.auth;

    const userInfos = this.playgroundUsers.get(playgroundId);

    userInfos.followingUsers.splice(
      findIndex(userInfos.followingUsers, (d) => {
        return d.followingUser.userId === payload.followingUser.userId;
      }),
      1,
    );
    this.sendDataByRoom(
      client,
      'unFollowing',
      JSON.stringify(payload),
      'Client',
    );
  }

  @SubscribeMessage('position')
  async positionSetter(client: Socket, payload) {
    const _payload = JSON.parse(payload.toString()) as CRDT;
    this.sendDataByRoom(client, 'position', _payload, 'Client');
  }

  @SubscribeMessage('cursor')
  async cursor(client: Socket, payload) {
    const _payload = JSON.parse(payload) as CRDT;
    // console.log(_payload);

    const { playgroundId } = client.handshake.auth;

    const userInfos = this.playgroundUsers.get(playgroundId);

    userInfos.users.forEach((user) => {
      if (user.userId === _payload.userId) {
        user.cursor = { ..._payload.cursor, path: _payload.file.path };
        // toFixed: cursor
        // _payload.userInfo = {
        //   ..._payload.userInfo,
        //   ...user,
        // };
      }
    });
    // console.log(userInfos.users);
    // console.log(_payload);
    this.sendDataByRoom(client, 'cursor', JSON.stringify(_payload), 'Client');
  }

  @SubscribeMessage('extraSync')
  async extraSync(client: Socket, payload) {
    // this.server.emit('customAck', payload);
    this.sendDataByRoom(client, 'extraSync', payload, 'Client');
    // client.broadcast.emit('customAck', payload);
  }

  @SubscribeMessage('editFile')
  async editFile(client: Socket, payload: string, _d): Promise<void> {
    const dockerId = this.playgroundInfos.get(
      client.handshake.auth.playgroundId,
    ).activeDockerId;

    const _payload = JSON.parse(payload) as CRDT;

    // this.users.forEach((user) => {
    //   if (user.userId === _payload.userId) {
    //     user.cursor = { ..._payload.cursor, path: _payload.file.path };
    //     _payload.userInfo = {
    //       ..._payload.userInfo,
    //       ...user,
    //     };
    //   }
    // });

    let responsePayload;

    if (!/temp/.test(_payload.file.path)) {
      const { redisKey, doc, path, operations } = this.docs.get(
        `${dockerId}.${_payload.file.path}`,
      );

      const { operation } = this.receiveOperation(
        _payload.editor.revision,
        TextOperation.fromJSON(_payload.editor.operation),
        operations,
      );
      const crdt = {
        ..._payload,
        editor: {
          ..._payload.editor,
          operation: operation.toJSON(),
        },
      };

      operations.push(operation);

      responsePayload = JSON.stringify(crdt);
      // Buffer.from(JSON.stringify(crdt))
      client.emit('serverAck', responsePayload);
      // client.emit('serverAck', responsePayload);

      this.sendDataByRoom(client, 'editFile', responsePayload, 'Client');
      const docVal = operation.apply(doc);
      this.docs.set(`${dockerId}.${_payload.file.path}`, {
        doc: docVal,
        // operations: new Map(),
        operations,
        path,
        redisKey,
      });
      this.appService.setFile(redisKey, docVal);

      this.replayService.setReplaySource('replaysources', {
        ...crdt,
        editor: {
          ...crdt.editor,
          revision: crdt.editor.revision + 1,
        },
        event: 'editor',
        dockerId,
      });
    } else {
      // let temp_docs = this.tempDocs.get(`${dockerId}.${_payload.file.path}`);
      const docPath = `${dockerId}.${_payload.file.path}`;

      let temp_docs = this.tempDocs[docPath];

      if (!temp_docs) {
        this.tempDocs[docPath] = {
          operations: [],
          path: _payload.file.path,
          doc: '',
        };
        temp_docs = this.tempDocs[docPath];
      }

      const { operation } = this.receiveOperation(
        _payload.editor.revision,
        TextOperation.fromJSON(_payload.editor.operation),
        temp_docs.operations,
      );

      const operations = [...temp_docs.operations, operation];

      // console.log('我的队列', operations.length);

      const doc = operation.apply(temp_docs.doc);
      this.tempDocs[docPath] = {
        ...temp_docs,
        doc,
        operations,
      };

      const crdt = {
        ..._payload,
        editor: {
          ..._payload.editor,
          operation: operation.toJSON(),
        },
      };

      responsePayload = JSON.stringify(crdt);

      client.emit('serverAck', responsePayload);
      // this.setCRDTs(crdt);
      this.sendDataByRoom(
        client,
        'editFile',
        // new Blob([JSON.stringify(crdt)]),
        responsePayload,
        'Client',
      );

      this.replayService.setReplaySource('replaysources', {
        ...crdt,
        event: 'editor',
        dockerId,
      });

      // this.set(`${dockerId}.${_payload.file.path}`, {
      //   doc: operation.apply(doc),
      //   // operations: new Map(),
      //   operations,
      //   path,
      //   redisKey,
      // });
      // this.docs.set(`${dockerId}.${_payload.file.path}`);
      // this.saveFile(client, _payload.file.path, temp_docs.doc);
    }
  }

  receiveOperation(revision, operation, operations) {
    // console.log('new operation: ' + revision);

    if (revision < 0 || operations.length < revision) {
      throw new Error('operation revision not in history');
    }

    const concurrentOperations = operations.slice(revision);

    const { transform } = operation.constructor;
    for (let i = 0; i < concurrentOperations.length; i++) {
      operation = transform(operation, concurrentOperations[i])[0];
    }

    return { operation };
  }

  @SubscribeMessage('saveFile')
  async saveFile(client: Socket, payload: string): Promise<void> {
    const activeDockerId = this.playgroundInfos.get(
      client.handshake.auth.playgroundId,
    ).activeDockerId;

    const { redisKey, doc } = this.docs.get(`${activeDockerId}.${payload}`);
    console.log(payload);

    this.appService.setFile(redisKey, doc);
  }

  @SubscribeMessage('heartbeat')
  heartbeat(client: Socket, _payload: string) {
    console.log('pong', '💗');
    client.emit('heartbeat', 'ping');
  }

  @SubscribeMessage('upload')
  uploadFiles(client: Socket, payload: string): void {
    const playgroundId = client.handshake.auth.playgroundId;
    const dockerId = this.playgroundInfos.get(playgroundId).activeDockerId;

    const uploadPayload = JSON.parse(payload);

    console.log(payload, '......');
    this.sendRaMQEvent('uploadFile', {
      direction: 'toDocker',
      dockerId,
      playgroundId,
      message: {
        ...uploadPayload,
        target:
          uploadPayload.target === '/root/'
            ? uploadPayload.target.replace('root/', '')
            : uploadPayload,
      },
    });
  }

  @SubscribeMessage('mediaRecord')
  mediaRecord(client: Socket, payload: string): void {
    this.sendDataByRoom(false, 'mediaRecord', payload);
  }

  @SubscribeMessage('fileTreeOp')
  operateFileTreeItems(client: Socket, payload: string): void {
    // console.log(payload);
    const playgroundId = client.handshake.auth.playgroundId;
    const dockerId = this.playgroundInfos.get(playgroundId).activeDockerId;
    // this.dockerInfos.get(dockerId)
    // const keepDockerInfo = Object.assign({}, this.dockerInfos.get(dockerId));
    // const keepDockerInfo = { ...this.dockerInfos.get(dockerId) };

    const uploadPayload = JSON.parse(payload);
    // temp logic
    switch (uploadPayload.action) {
      case 'CREATE':
        this.ignoreTreeFiles = this.ignoreTreeFiles.filter(
          (file) => !file.path.includes(uploadPayload.path),
        );
        break;
      case 'RENAME':
        // this.ignoreTreeFiles.push({ path: uploadPayload.path });
        // eslint-disable-next-line no-case-declarations
        const hasNewFile = this.ignoreTreeFiles.some((file) => {
          if (file.newPath) {
            file.newPath = uploadPayload.newPath;
            file.path = uploadPayload.path;
            return true;
          }
          return false;
        });

        if (!hasNewFile) {
          this.ignoreTreeFiles.push({
            path: uploadPayload.path,
            newPath: uploadPayload.newPath,
          });
        }
        // this.ignoreTreeFiles.forEach((file) => {
        //   if ((file.path = uploadPayload.path)) {
        //     file.newPath = uploadPayload.newPath;
        //   }
        // });
        break;
      case 'DELETE':
        this.ignoreTreeFiles.push({ path: uploadPayload.path });
        break;
      case 'RECORVERY':
        this.ignoreTreeFiles = this.ignoreTreeFiles.filter(
          (file) => !file.path.includes(uploadPayload.path),
        );
        uploadPayload.action = 'CREATE';
        break;
      default:
        break;
    }

    // keepDockerInfo.fileTree = this.ignoreTreeFiles.reduce(
    //   (a, b) => setFiles(a, b.path),
    //   { ...keepDockerInfo.fileTree },
    // );

    // // console.log(this.ignoreTreeFiles);

    // const param = {
    //   // playgroundInfo,
    //   dockerInfo: keepDockerInfo,
    //   userInfo: uploadPayload.userInfo,
    //   // crdt,
    // };
    // this.sendDataByRoom(playgroundId, 'playgroundInfo', JSON.stringify(param));
    // this.sendDataByRoom(playgroundId, 'dockerInfo', JSON.stringify(param));
    // return;
    this.sendRaMQEvent('fileTreeOp', {
      direction: 'toDocker',
      dockerId,
      playgroundId,
      message: {
        ...uploadPayload,
      },
    });
  }

  sendDataByRoom(
    client,
    subscribePath,
    data?: unknown,
    type?: 'Server' | 'Client',
  ) {
    // if (!client) {
    //   this.server.to(this.consumerPlaygroundId).emit(subscribePath, data);
    //   return;
    // }

    if (client && typeof client === 'string') {
      this.server.to(client).emit(subscribePath, data);
      return;
    }

    switch (type) {
      /**
       *  specified room for emiting message except self
       */
      case 'Client':
        client.to(client.handshake.auth.playgroundId).emit(subscribePath, data);
        break;

      /**
       *  specified room for emiting message to whole clients
       */
      case 'Server':
        this.server
          .to(
            client.handshake.auth.playgroundId,
            // this.playgroundInfo.playgroundId,
          )
          .emit(subscribePath, data);
        break;

      /**
       *  only emit to self
       */
      default:
        client.emit(subscribePath, data);
        break;
    }
  }

  sendRaMQEvent(
    pattern,
    { message = {}, direction, playgroundId = '', dockerId = '', options = {} },
  ) {
    const dockerInfo = { dockerId, messageId: '233' };

    const routingKey =
      direction === 'toPlayground'
        ? `${direction}.${playgroundId}`
        : `${direction}.${playgroundId}.${dockerId}`;

    this.appService.sendMqMessage(pattern, {
      exchange: 'paas',
      routingKey,
      message: {
        timestamp: Date.now(),
        messageId: dockerInfo?.messageId,
        ...message,
      },
      options: {
        type: pattern,
        ...options,
      },
    });
  }

  setCRDTs(crdt) {
    this.crdts.set(this.crdts.size, {
      ...crdt,
      userInfo: pick(crdt.userInfo, ['userId', 'role']),
    });
  }

  setPlaygroundInfo({ playgroundInfo }) {
    this.playgroundInfos.set(playgroundInfo.playgroundId, playgroundInfo);

    this.sendDataByRoom(
      playgroundInfo.playgroundId,
      'playgroundStatus',
      playgroundInfo ? playgroundInfo.status : 'EMPTY',
    );
    // this.server.emit(
    //   'playgroundStatus',
    //   playgroundInfo ? playgroundInfo.status : 'EMPTY',
    // );
  }

  getDockerInfo(playgroundId: string) {
    const dockerInfo = this.dockerInfos.get(
      this.playgroundInfos.get(playgroundId).activeDockerId,
    );

    const crdt: CRDT = {
      timestamp: Date.now(),
      userId: undefined,
      terminal: {
        // doc: {
        action: 'Get',
        value: dockerInfo?.terminalHistory,
        // },
      },
    };

    const param = {
      playgroundInfo: this.playgroundInfos.get(playgroundId),
      dockerInfo: dockerInfo,
      crdt,
    };

    this.sendDataByRoom(playgroundId, 'playgroundInfo', JSON.stringify(param));

    this.sendDataByRoom(
      playgroundId,
      'dockerStatus',
      param.dockerInfo ? param.dockerInfo.runStatus : 'STOP',
    );

    this.sendDataByRoom(
      playgroundId,
      'playgroundStatus',
      param.playgroundInfo ? param.playgroundInfo.status : 'EMPTY',
    );
    // this.server.emit(
    //   'playgroundStatus',
    //   param.playgroundInfo ? param.playgroundInfo.status : 'EMPTY',
    // );
  }

  getEnvInfo({
    playgroundInfo,
    dockerInfo,
  }: {
    playgroundInfo: PlaygroundInfoType;
    dockerInfo?: DockerInfoType;
    isUserComing: boolean;
  }) {
    console.log('环境初始化');
    let gPlaygroundInfo = this.playgroundInfos.get(playgroundInfo.playgroundId);
    gPlaygroundInfo = !gPlaygroundInfo
      ? playgroundInfo
      : { ...gPlaygroundInfo, ...playgroundInfo };

    if (playgroundInfo.status === 'INACTIVE') {
      // this.activePlayground(gPlaygroundInfo.playgroundId);
      this.sendDataByRoom(
        gPlaygroundInfo.playgroundId,
        'playgroundStatus',
        gPlaygroundInfo.status,
      );

      return;
    }

    // 初始化Playground
    if (!dockerInfo) {
      this.playgroundInfos.set(gPlaygroundInfo.playgroundId, gPlaygroundInfo);

      // if (playgroundInfo.status === 'INACTIVE') {
      //   this.activePlayground(gPlaygroundInfo.playgroundId);
      //   return;
      // }

      this.sendRaMQEvent('playgroundInfo', {
        direction: 'toDocker',
        playgroundId: playgroundInfo.playgroundId,
        dockerId: playgroundInfo.dockerId,
        message: {
          timestamp: Date.now(),
        },
        options: { type: 'dockerInfo' },
      });
      return;
    }

    gPlaygroundInfo.activeDockerId = dockerInfo.dockerId;

    this.playgroundInfos.set(gPlaygroundInfo.playgroundId, gPlaygroundInfo);

    this.dockerInfos.set(dockerInfo.dockerId, dockerInfo);

    const crdt: CRDT = {
      timestamp: Date.now(),
      userId: undefined,
      // userInfo: { userId: undefined, role: '' },
      terminal: {
        // doc: {
        action: 'Get',
        value: dockerInfo?.terminalHistory,
        // },
      },
    };

    // console.log(gPlaygroundInfo);
    dockerInfo.fileTree = this.ignoreTreeFiles.reduce(
      (a, b) => setFiles(a, b),
      dockerInfo.fileTree,
    );
    const param = {
      playgroundInfo,
      dockerInfo,
      crdt,
    };

    this.sendDataByRoom(
      gPlaygroundInfo.playgroundId,
      'playgroundInfo',
      JSON.stringify(param),
    );

    // if (playgroundInfo.status !== 'RUNNING') {
    if (playgroundInfo.status !== 'ACTIVE') {
      // this.activePlayground(playgroundInfo.playgroundId);
      this.sendDataByRoom(
        gPlaygroundInfo.playgroundId,
        'playgroundStatus',
        'EMPTY',
      );
      this.sendDataByRoom(gPlaygroundInfo.playgroundId, 'dockerStatus', 'STOP');
    } else {
      this.sendDataByRoom(
        gPlaygroundInfo.playgroundId,
        'playgroundStatus',
        gPlaygroundInfo.status,
      );
      this.sendDataByRoom(
        gPlaygroundInfo.playgroundId,
        'dockerStatus',
        dockerInfo.runStatus,
      );
    }

    // this.server.emit(
    //   'playgroundStatus',
    //   param.playgroundInfo ? param.playgroundInfo.status : 'EMPTY',
    // );
  }

  switchDockerStatus({ playgroundId, status }) {
    this.sendDataByRoom(playgroundId, 'dockerStatus', status);
  }

  switchFileTreeData(FileTreeData) {
    const { playgroundId } = FileTreeData;

    const { activeDockerId } = this.playgroundInfos.get(playgroundId);

    const keepDockerInfo = this.dockerInfos.get(activeDockerId);

    keepDockerInfo.fileTree = FileTreeData;

    // keepDockerInfo.fileTree = this.ignoreTreeFiles.reduce(
    //   (a, b) => setFiles(a, b),
    //   { ...keepDockerInfo.fileTree },
    // );

    // console.log(
    //   this.ignoreTreeFiles.reduce((a, b) => setFiles(a, b), {
    //     ...keepDockerInfo.fileTree,
    //   }),
    // );

    // console.log('调用');
    this.sendDataByRoom(
      playgroundId,
      'fileNode',
      JSON.stringify(keepDockerInfo.fileTree),
    );
  }

  @SubscribeMessage('folderEvent')
  syncFolderEvent(client: Socket, payload: string): void {
    const playgroundId = client.handshake.auth.playgroundId;
    // const dockerId = this.playgroundInfos.get(
    //   client.handshake.auth.playgroundId,
    // ).activeDockerId;

    const crdt = JSON.parse(payload) as CRDT;

    this.sendDataByRoom(playgroundId, 'folderEvent', JSON.stringify(crdt));
  }

  @SubscribeMessage('fileContent')
  getFileContent(client: Socket, payload: string): void {
    const playgroundId = client.handshake.auth.playgroundId;
    const dockerId = this.playgroundInfos.get(
      client.handshake.auth.playgroundId,
    ).activeDockerId;

    const clientPayload = JSON.parse(payload) as CRDT;

    this.eventBus.set(clientPayload.userId, clientPayload);

    const THIS_PATH_DOC = this.docs.get(
      `${dockerId}.${clientPayload.file.path}`,
    );

    if (/\/$/.test(clientPayload.file.path)) {
      this.sendDataByRoom(
        client,
        'fileContent',
        JSON.stringify({
          timestamp: clientPayload.timestamp,
          // userInfo: clientPayload.userInfo,
          userId: clientPayload.userId,
          file: {
            path: clientPayload.file.path,
          },
          // editor: {
          //   evtType: clientPayload.editor.evtType,
          // },
        }),
        'Server',
      );
      return;
    }

    if (THIS_PATH_DOC) {
      // this.docs.get(`${dockerId}.${THIS_PATH_DOC.path}`)
      const operation =
        THIS_PATH_DOC.operations.length > 0
          ? THIS_PATH_DOC.operations.slice(-1)[0]
          : [];
      this.sendDataByRoom(
        client,
        'fileContent',
        JSON.stringify({
          timestamp: clientPayload.timestamp,
          userId: clientPayload.userId,
          file: {
            value: THIS_PATH_DOC.doc === null ? '' : THIS_PATH_DOC.doc,
            redisKey: THIS_PATH_DOC.redisKey,
            path: THIS_PATH_DOC.path,
          },
          editor: {
            operation,
            revision:
              THIS_PATH_DOC.operations.length > 0
                ? THIS_PATH_DOC.operations.length
                : 0,

            // evtType: userPayload.editor.evtType,
          },
        }),
        'Server',
      );

      this.replayService.setReplaySource('replaysources', {
        dockerId,
        event: 'file',
        timestamp: clientPayload.timestamp,
        userId: clientPayload.userId,
        // userInfo: clientPayload.userInfo,
        file: {
          value: THIS_PATH_DOC.doc === null ? '' : THIS_PATH_DOC.doc,
          redisKey: THIS_PATH_DOC.redisKey,
          path: THIS_PATH_DOC.path,
        },
        editor: {
          operation,

          revision:
            THIS_PATH_DOC.operations.length > 0
              ? THIS_PATH_DOC.operations.length
              : 0,

          // evtType: clientPayload.editor.evtType,
        },
      });
      console.log('READ DATA FROM CACHE');
      return;
    }
    // console.log(playgroundId, '.', dockerId, './.........');
    this.sendRaMQEvent('fetchFile', {
      direction: 'toDocker',
      dockerId,
      playgroundId,
      message: {
        // messageId: clientPayload.file.path,
        path: clientPayload.file.path,
        messageId: `${uuidv4()}.${clientPayload.userId}.${playgroundId}`,
      },
      options: { type: 'fileContent' },
    });
  }

  async getNixStatus(_data) {
    // console.log(data, '..............asdfadsfjasdljfjklasdkj;faj;kls');
  }

  async getComponentsConfig(_data) {
    // console.log(data, '..............qqqqqqqqqqqqqqqqqqqqqqqqqqq');
  }

  async sendFileContent({ redisKey, path, value, replyMessageId }) {
    const [, userId, playgroundId] = replyMessageId.split('.');
    // const userInfos = this.playgroundUsers.get(playgroundId);

    const { timestamp } = this.getCurrentUserReqData(userId);
    value = value.replace(/\r/gm, '\n');
    const dockerId = this.playgroundInfos.get(playgroundId).activeDockerId;

    value = value.replace(/\r\n/gim, '\n');
    this.docs.set(`${dockerId}.${path}`, {
      doc: value === null ? '' : value,
      operations: [],
      path,
      redisKey,
    });

    // const redisOp = this.docs.get(`${dockerId}.${path}`).operations;

    const crdt = {
      timestamp,
      userId,
      // userInfo,
      // editor: {
      //   // revision: redisOp.length,
      //   // operation: redisOp.length > 0 ? redisOp[redisOp.length - 1] : null,
      //   evtType: editor.evtType,
      // },
      file: {
        value,
        redisKey,
        path,
      },
    };

    this.sendDataByRoom(playgroundId, 'fileContent', JSON.stringify(crdt));

    // this.replayService.setReplaySource('replaysources', {
    //   dockerId,
    //   event: 'file',
    //   ...crdt,
    // });

    // this.replayService.setReplaySource(
    //   'replayfiles',
    //   {
    //     ...crdt,
    //     dockerId,
    //     value,
    //     revision: 0,
    //     path,
    //   },
    //   'UPDATE',
    // );
    // this.redisClient.get(redisKey, (err, data) => {
    //   if (err) {
    //     throw err;
    //   }
  }

  getCurrentUserReqData(replyMessageId): CRDT {
    return this.eventBus.get(replyMessageId);
  }

  // TO FIXED LOGIC
  @SubscribeMessage('terminal')
  terminalBinder(client: Socket, payload: string) {
    const playgroundId = client.handshake.auth.playgroundId;

    const dockerId = this.playgroundInfos.get(playgroundId).activeDockerId;

    // 待优化
    // this.userPayload = JSON.parse(payload) as CRDT;
    const userPayload = JSON.parse(payload) as CRDT;

    // this.eventBus.set(userPayload.userInfo.userId, userPayload);
    this.sendRaMQEvent('terminal', {
      direction: 'toDocker',
      playgroundId,
      dockerId,
      message: {
        // messageId: `${userIdv4()}.${
        //   this.userPayload.userInfo.userId
        // }.${playgroundId}`,
        value: userPayload.terminal.value,
      },
    });

    // this.sendDataByRoom(data.playgroundId, 'terminal', JSON.stringify(crdt));
  }

  async initPlayground(PLAYGROUND_ID) {
    this.sendRaMQEvent('playgroundInfo', {
      direction: 'toPlayground',
      playgroundId: PLAYGROUND_ID,
      message: {
        messageId: '1',
        timestamp: Date.now(),
      },
      options: { type: 'playgroundInfo' },
    });
  }

  @SubscribeMessage('adminClearCache')
  async adminClearCache(client: Socket) {
    // const userInfos = this.playgroundUsers.get(
    //   client.handshake.auth.playgroundId,
    // );
    const userInfos = this.playgroundUsers.get(
      client.handshake.auth.playgroundId,
    );
    userInfos.users = [];
    userInfos.usersHistory = [];
    userInfos.followingUsers = [];

    await this.appService.authClient.emit('user/clean', {});
    // userInfos.users = [];
    // userInfos.usersHistory = [];
    // userInfos.followingUsers = [];
    // this.playgroundUsers = new Map();
    this.docs = new Map();
    this.crdts = new Map([]);
    // this.users = [];
    // this.usersHistory = [];
    // this.followingUsers = [];

    // // this.user = {};
    // this.operations = [];
    // this.revision = 0;
    // this.limit = 10;
    // this.clientIO;
    // this.docs = new Map();
    // this.redisClient = null;
    // this.userPayload = null;

    // this.crdts = new Map([]);
    // this.socketId = null;
    // this.callstack = [];

    // this.activeDockerId = null;
    // this.consumerPlaygroundId = null;
    this.dockerInfos = new Map([]);
    this.playgroundInfos = new Map([]);
    // this.ignoreTreeFiles = [];

    this.server.emit('clearCache');
  }

  @SubscribeMessage('clearCache')
  async clearCache(client: Socket) {
    const userInfos = this.playgroundUsers.get(
      client.handshake.auth.playgroundId,
    );
    userInfos.users = [];
    userInfos.usersHistory = [];
    userInfos.followingUsers = [];
    await this.appService.authClient.emit('user/clean', {});

    this.docs = new Map();
    this.crdts = new Map([]);
    // // this.user = {};
    // this.operations = [];
    // this.revision = 0;
    // this.limit = 10;
    // this.clientIO;
    // this.redisClient = null;
    // this.userPayload = null;

    // this.socketId = null;
    // this.callstack = [];

    // this.activeDockerId = null;
    // this.consumerPlaygroundId = null;
    this.dockerInfos = new Map([]);
    this.playgroundInfos = new Map([]);

    // this.ignoreTreeFiles = [];

    this.sendDataByRoom(client.handshake.auth.playgroundId, 'clearCache');
  }

  getTerminalContent(data) {
    const { value } = data;
    console.log(value, '...........');
    // console.log(data);
    // const { userInfo } = this.userPayload;

    const crdt = {
      timestamp: Date.now(),
      // userInfo,
      terminal: {
        action: 'Edit',
        value: value,
      },
    };

    this.sendDataByRoom(data.playgroundId, 'terminal', JSON.stringify(crdt));
    // this.server.emit('terminal', JSON.stringify(crdt));
  }

  getConsoleContent(data) {
    const { value } = data;
    const crdt: CRDT = {
      timestamp: Date.now(),
      // userId
      // userInfo: {
      //   userId: '',
      //   role: '',
      // },
      console: {
        // doc: {
        action: 'Edit',
        value: value,
        // },
      },
    };
    this.sendDataByRoom(data.playgroundId, 'console', JSON.stringify(crdt));
    // this.server.emit('console', JSON.stringify(crdt));
  }

  emitAuthorizeTicketError(client, msg, close = true) {
    client.emit('authorized_error', msg);
    client.disconnect(close);
    // throw new Error(msg);
  }

  github0authLogin(response) {
    // this.server
    this.server.emit('github0auth', JSON.stringify(response));
  }
}

function setFiles(fileTree, val, fileUri?: string) {
  const uri = fileUri ? fileUri : fileTree.uri;
  fileTree.children = fileTree.children.filter((file) => {
    setFiles(file, val, uri);
    // if (file.name !== val) {
    // const uri = 'file:///home/runner/app';

    if (`${uri}${val.newPath}` === file.uri) {
      // console.log(
      //   JSON.stringify({
      //     ...file,
      //     oldPath: val.path,
      //   }),
      //   '.......',
      // );
      file.oldPath = val.path;
      return {
        // console.log('as', '........');
        ...file,
      };
    }
    if (!file.uri.includes(val.path)) {
      return file;
    }
  });

  return fileTree;
}
