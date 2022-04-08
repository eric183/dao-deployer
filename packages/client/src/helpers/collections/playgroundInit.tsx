import { findIndex, omit } from 'lodash';
import {
  dockerState,
  ErrorMsgState,
  fileTreeStore,
  followingUserStore,
  loadingStore,
  daoStore,
  shadowUserStore,
  userListStore,
  userStore,
  currentDoc,
  ackStore,
} from '~/stores/daoStore';
import { roleColors } from './mock';
import { random as _random } from 'lodash';
import { IsMe } from './userTool';
import { unstable_batchedUpdates } from 'react-dom';
import { getLocalReplayFile, setLocalReplayFile, setReplaySource } from './idb';
import { clearReplayList } from './replay';
import { Toast } from './toast';
import { resetDB, ResetPlayground } from './resetter';
import { UserInfo } from '~/types/dao';
import { isDev } from './util';

// const heartbeatTime = 1000 * 60 * 10;
const heartbeatTime = 1000 * 60;
// const heartbeatTime = 3000;
const PlaygroundInit = <
  T extends { [key: string]: string | (() => void) } & {
    socket: Dao_FrontType.SocketType;
  },
>(
  arg: T,
) => {
  // const PlaygroundInit = <T, >(arg: T): T => {
  const { ticket, socket, callback } = arg;
  unstable_batchedUpdates(() => {
    // const io = useOT.getState().socket;
    const setUserInfo = userStore.getState().setUserInfo;
    const setUserList = userListStore.getState().setUserList;
    const { switchFileTree } = fileTreeStore.getState();

    const {
      setCRDTInfo,
      setAsyncType,
      // setSenders,
      // setServerAck,
      // switchFileTree,
      setPlaygroundInfo,
      setDockerInfo,
      setPlaygroundStatus,
      setDockerStatus,
      setAmDoing,
      setGlobalData,
    } = daoStore.getState();

    const { setCustomAck } = ackStore.getState();
    const { switchDoc } = currentDoc.getState();

    ResetPlayground();
    window.clearCache = () => {
      localStorage.clear();
      resetDB();
      socket.emit('clearCache');
    };

    window.Toast = Toast;

    setDockerInfo({
      ...daoStore.getState().dockerInfo,
      ticket,
    });

    // clearReplayList();
    socket.on('connect', () => {
      console.log('已连接');
      setAsyncType(undefined);

      setInterval(() => {
        socket.emit('heartbeat', '💗');
        // printReport(heartbeatTime);
      }, heartbeatTime);
    });

    socket.on('clearCache', () => {
      window.location.reload();
      // io.disconnect();
    });

    socket.on('appStatus', (data) => {
      setAmDoing(data);
    });

    socket.on('globalData', (data: { [key: string]: any }) => {
      setGlobalData(data);
    });

    socket.on('github0auth', (data) => {
      // setGlobalData(data);
      setUserInfo({
        ...userStore.getState().userInfo,
        github0auth: JSON.parse(data),
      });

      window.loginWindow.close();
    });

    socket.on('userEnteredRoom', (data: string) => {
      let originUser = userStore.getState().userInfo;
      const userData = JSON.parse(data);
      // const userIndex = Number(/\d+/gim.exec(userData.role!)![0]);

      // const { coUsers } = userData;
      const color = roleColors(userData.onlineCount - 1);

      if (originUser.userId === userData.userId) {
        originUser = omit(
          {
            ...userData,
            color,
            // avatar: avatarGenerator(_random(0, 6), userData),
          },
          'coUsers',
        );
        setUserInfo(originUser);

        // Auto active playground
        if (daoStore.getState().playgroundStatus === 'INACTIVE') {
          socket?.emit('active');
        }
      }

      const userInfoList = [
        originUser,
        ...userData.coUsers
          .filter(
            (f: { userId: string | undefined }) =>
              f.userId !== originUser.userId,
          )
          .map((user: { userId: string; onlineCount: number }) => {
            return {
              ...user,
              // avatar: avatarGenerator(_random(0, 6), user),
              color: roleColors(user.onlineCount - 1),
            };
          }),
      ];
      setUserList(userInfoList);
    });

    socket.on('userExitRoom', (data: string) => {
      // let originUser = userStore.getState().userInfo;
      const userData = JSON.parse(data);
      // const userIndex = Number(/\d+/gim.exec(userData.role!)![0]);

      // const { coUsers } = userData;

      const userList = userListStore
        .getState()
        .userList.filter((user) => user.userId !== userData.userId);
      setUserList(userList);
    });

    socket.on('following', (d: string) => {
      // debugger;
      const users_server = JSON.parse(d);
      const followingUsers: {
        user: UserInfo;
        followingUser: UserInfo;
      }[] = users_server.filter(({ user }: { user: UserInfo }) =>
        IsMe(user.userId),
      );

      followingUserStore
        .getState()
        .setFollowingUsers(
          followingUsers.map(({ followingUser }) => followingUser),
        );
    });

    socket.on('unFollowing', (d: string) => {
      // debugger;
      const { followingUsers, setFollowingUsers } =
        followingUserStore.getState();
      const user = JSON.parse(d);

      followingUsers.splice(
        findIndex(
          followingUsers,
          (f) => f.userId === user.followingUser.userId,
        ),
        1,
      );

      setFollowingUsers(followingUsers);
      // .split(findIndex((u=> u.userId === user.),)
      // const followingUsers: {
      //   user: T_UserInfo;
      //   followingUser: T_UserInfo;
      // }[] = JSON.parse(d).filter(({ user }: { user: UserInfo }) => IsMe(user));

      // followingUserStore
      //   .getState()
      //   .setFollowingUsers(
      //     followingUsers.map(({ followingUser }) => followingUser),
      //   );
    });

    socket.on('playgroundInfo', (data: string) => {
      const { playgroundInfo, crdt, dockerInfo } = JSON.parse(data);
      // activePlayground(playgroundInfo, crdt, dockerInfo);
      setCRDTInfo(crdt);
      const otPlaygroundInfo = daoStore.getState().playgroundInfo;
      setPlaygroundInfo({
        ...playgroundInfo,
        ...otPlaygroundInfo,
        activeDockerId: playgroundInfo?.dockerId,
      });
      if (dockerInfo) {
        // DexieInit(dockerInfo.dockerId);

        otPlaygroundInfo?.dockerInfos?.set(dockerInfo.dockerId, dockerInfo);

        setDockerInfo({
          ...daoStore.getState().dockerInfo,
          ...dockerInfo,
        });

        dockerState.getState().setDockerStatus(dockerInfo.status);
        // debugger;
        dockerInfo.fileTree &&
          switchFileTree({
            data: dockerInfo.fileTree,
          });
        typeof callback === 'function' && callback();
      }

      // setReplaySource(crdt);
    });

    socket.on('dockerInfo', (data: string) => {
      const { dockerInfo } = JSON.parse(data);
      // debugger;
      // setCRDTInfo(crdt);

      const otPlaygroundInfo = daoStore.getState().playgroundInfo;
      // setPlaygroundInfo({
      //   ...playgroundInfo,
      //   ...otPlaygroundInfo,
      //   activeDockerId: playgroundInfo?.dockerId,
      // });
      if (dockerInfo) {
        otPlaygroundInfo?.dockerInfos?.set(dockerInfo.dockerId, dockerInfo);

        setDockerInfo({
          ...daoStore.getState().dockerInfo,
          ...dockerInfo,
        });

        dockerState.getState().setDockerStatus(dockerInfo.status);
        // debugger;
        dockerInfo.fileTree &&
          switchFileTree({
            data: dockerInfo.fileTree,
          });
        // callback && callback();
      }

      // setReplaySource(crdt);
    });

    socket.on('playgroundStatus', (data) => {
      setPlaygroundStatus(data);
      // debugger;

      if (data === 'INACTIVE') {
        loadingStore.getState().setModuleLoading({
          Editor: true,
          Tree: true,
        });
      }

      if (data === 'ACTIVE') {
        loadingStore.getState().setModuleLoading({
          Editor: false,
          Tree: false,
        });
      }

      // setModuleLoading
    });

    socket.on('dockerStatus', (data: any) => {
      // debugger;
      setDockerStatus(data || 'STOP');
    });

    socket.on('folderEvent', async (d: string) => {
      const _d = JSON.parse(d) as Dao_FrontType.CRDT;

      setCRDTInfo(_d);
      setAsyncType('file');
      setReplaySource({
        ..._d,
        event: 'file',
      });

      const localReplayFile = await getLocalReplayFile(_d.file!.path!);

      if (!localReplayFile) {
        setLocalReplayFile(_d?.file?.path, {
          value: _d.file!.value as string,
          revision: 0,
          path: _d.file!.path,
        });
      }
      // console.log(_d);
      if (
        shadowUserStore.getState().shadowUser?.userId ||
        (IsMe(_d.userId!) && _d.file)
      ) {
        // switchDoc(_d.file);
      }
    });

    socket.on('fileContent', async (d: string) => {
      const _d = JSON.parse(d) as Dao_FrontType.CRDT;
      const file = (_d.file as Required<Dao_FrontType.CRDT['file']>)!;
      // const editor = _d;
      // debugger;
      setCRDTInfo(_d);
      setAsyncType('file');
      setReplaySource({
        ..._d,
        event: 'file',
      });

      // const localReplayFile = await getLocalReplayFile(_d.file!.path!);

      // getLocalReplayFile(_d.file!.path!).then((d) => {
      //   debugger;
      // });
      const localReplayFile = await getLocalReplayFile(file.path);
      // getLocalReplayFile(file.path!);
      if (!localReplayFile) {
        setLocalReplayFile(file.path, {
          value: file.value as string,
          path: file.path,
          revision: 0,
        });
      }
      // console.log(_d);
      if (
        shadowUserStore.getState().shadowUser?.userId ||
        (IsMe(_d.userId!) && file)
      ) {
        switchDoc(file);

        // (await daopaasDB).put('files', _d?.file?.value, _d?.file?.path);

        // (await daopaasDB).put(
        //   'replayFiles',
        //   _d.editor.doc.value,
        //   _d.editor.doc.path,
        // );
        // console.log('serverRevision', _d.editor.revision);
      }
    });

    socket.on('saveFile', (d: string) => {
      const _d = JSON.parse(d);

      // setFileSaved(d);
      // console.log(_d.editor.revision);
    });

    socket.on('extraSync', (d: string) => {
      const _d = JSON.parse(d) as Dao_FrontType.CRDT;
      // console.log(_d);

      switch (_d.extendInfo.type) {
        case 'editor-scroll':
          setCRDTInfo(_d);
          setAsyncType('editor');
          // setReplaySource(_d);
          setCustomAck();
          break;
        case 'mousemove':
          setCRDTInfo(_d);
          setCustomAck();
          break;

        default:
          return;
      }
    });

    // socket.on('sender', (d) => {
    //   setSenders([...daoStore.getState().senders, JSON.parse(d).sender]);
    // });

    socket.on('fileNode', (data: string) => {
      const res = JSON.parse(data);

      switchFileTree({
        // data: res.data,
        data: res,
      });
    });

    socket.on('console', (d: string) => {
      const _d = JSON.parse(d) as Dao_FrontType.CRDT;
      // setCRDTInfo(_d);
      setCRDTInfo(_d);
      setAsyncType('console');

      setReplaySource({
        ..._d,
        event: 'console',
      });
    });

    // socket.on('mediaRecord', (d) => {
    //   const _d = JSON.parse(d) as Dao_FrontType.CRDT;
    //   setLocalMedia(_d.timestamp, _d);
    //   // setCRDTInfo(_d);
    //   setCRDTInfo(_d);
    //   setAsyncType('media');

    //   setReplaySource({
    //     ..._d,
    //     event: 'media',
    //   });
    // });

    socket.on('heartbeat', () => {
      console.log('pong ', '❤');
    });

    socket.on('errorHandler', (d: any) => {
      // debugger;
      ErrorMsgState.getState().setMessage(d);
      // throw d;
    });

    // 断联处理
    socket.on('disconnect', (reason: string) => {
      // console.log(reason, '连接断开');
      // debugger;

      // if (reason === 'io server disconnect') {
      if (reason === 'io client disconnect') {
        console.log('客户端已断开连接');

        // the disconnection was initiated by the server, you need to reconnect manually
        return;
      }

      socket.io.connect();

      // ReconnectTimer = setInterval(() => {
      //   if (socket.connected) {
      //     console.log('reconnected');
      //     clearInterval(ReconnectTimer);
      //     ReconnectTimer = null as unknown as NodeJS.Timer;
      //     return;
      //   }
      //   console.log('重连中');

      //   socket.io.connect();
      // }, 2000);
    });

    socket.on('authorized_error', (error: any) => {
      setTimeout(() => {
        Toast.message({
          type: 'error',
          content: error,
          placement: 'bottomEnd',
        });
      }, 2000);
    });

    socket.on('connect_error', () => {
      // setTimeout(() => {
      //   Toast.message({
      //     type: 'error',
      //     content: '连接错误, 重新连接中~~~请稍后',
      //     placement: 'bottomEnd',
      //   });
      // }, 2000);
      // console.log('连接错误, 重新连接中~~~请稍后');
      socket.io.connect();
      // throw error;
    });

    socket.on('connect_timeout', (timeout: any) => {
      console.log(timeout, '连接超时');

      socket.io.connect();
      // throw timeout + 'error';
    });

    socket.on('alreadyLogin', () => {
      // setTimeout(() => {
      //   Toast.message({
      //     type: 'error',
      //     content: '该账号已经登录',
      //     placement: 'topCenter',
      //   });
      // }, 2000);
    });

    socket.on('error', (error: any) => {
      // setTimeout(() => {
      //   Toast.message({
      //     type: 'error',
      //     content: '连接错误，重连中',
      //     placement: 'bottomEnd',
      //   });
      // }, 2000);
      console.log(error, '连接错误，重连中');
      socket.io.connect();
      // throw error;
    });

    // socket.on('reconnecting', (attemptNumber) => {
    //   // console.log('重连中', attemptNumber);
    //   io.connect();
    // });

    socket.on('reconnect_attempt', (attemptNumber: any) => {
      console.log('重连中', '...', attemptNumber);
    });

    socket.io.on('reconnect', () => {
      console.log('已重连~~');
      // Toast.message({
      //   type: 'info',
      //   content: '已成功重新连接！',
      //   placement: 'topCenter',
      // });

      //   const userData = JSON.parse(data);
      //   const _u = {
      //     ...userData,
      //     color: roleColors(userData.onlineCount - 1),
      //   };

      //   // 进入房间user
      //   setUserStack(userData.coUsers);
      //   setUserInfo(_u);
      //   const co_user = {};
      //   Object.keys(userData.coUsers).forEach((user) => {
      //     // co_user[userData.coUsers[user['userId']]] = userData.coUsers[user];
      //     co_user[userData.coUsers[user]['userId']] = userData.coUsers[user];
      //   });
      //   localStorage.setItem('userStack', JSON.stringify(co_user));
      //   localStorage.setItem('userInfo', JSON.stringify(omit(_u, 'coUsers')));
    });
  });
};

export { PlaygroundInit };
