import { io } from 'socket.io-client';
import create from 'zustand';
import { daoStore } from '~/stores';
import { userStore } from '~/stores/daoStore';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Options } from '~/types/DaoPaaS';
import { isDev } from '~/helpers/collections/util';

// process.env.NODE_ENV === 'production'

const [host, port] = [
  process.env.LOCAL_IP_HOST,
  process.env.SOCKET_INSTANCE_CLIENT_PORT,
];

export type SocketType = Socket<DefaultEventsMap, DefaultEventsMap>;
interface SocketOption extends Options {
  ioPath: string;
  debug?: boolean;
  paasDomain: string;
  ticket: string;
  playgroundId: string;
  avatarUrl?: string;
  username?: string;
  tenantId: string;
}

type UseSocketType = {
  socket?: Dao_FrontType.SocketType;
  socketHeader?: SocketOption;
  setSocket: (arg: Dao_FrontType.SocketType) => void;
  setSocketHeader: (arg: SocketOption) => void;
};

// Socket Store Logic Center
export const useOT = create<UseSocketType>((set) => ({
  socket: undefined,
  socketHeader: null!,
  setSocket: (arg) => set(() => ({ socket: arg })),
  setSocketHeader: (arg: SocketOption) => set(() => ({ socketHeader: arg })),
}));

export class sockerIO {
  constructor(auth: SocketOption) {
    const SOCKET_INSTANCE =
      (!isDev() ? '' : `ws://${host}:4001`) || auth.ioPath;
    useOT.getState().setSocketHeader(auth);
    return io(SOCKET_INSTANCE, {
      transports: ['websocket'],
      auth,
    });
  }
}
