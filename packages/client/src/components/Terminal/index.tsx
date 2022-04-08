import React, { useEffect, useState } from 'react';
import { Terminal, ITerminalOptions } from 'xterm';
import XTerm from '~/components/XTerm';
import {
  daoStore,
  shadowUserStore,
  userListStore,
  userStore,
} from '~/stores/daoStore';
import { useOT } from '~/hooks';
import { pick } from 'lodash';
import { IsMe } from '~/helpers';
import { FollowLayout } from '../FollowLayout';
import { theme } from '~/theme';

type TerminalProps = {
  options?: ITerminalOptions;
  height?: number | string;
  width?: number | string;
  fitHook?: boolean;
  className?: string;
};

const TerminalComponent: React.FC<TerminalProps> = ({ options, ...props }) => {
  const defaultOptions: ITerminalOptions = {
    ...options,
    ...props,
    theme: {
      background: theme.extend.colors['dao-light-green'],
    },
  };
  // debugger;
  const userLabel = document.createElement('div');
  userLabel.classList.add('xterm-helper-user-label');

  const [terminal, setTerminal] = useState<
    Terminal &
      Partial<{
        _core: {
          _helperContainer: HTMLElement;
        };
      }>
  >(null!);
  const { CRDTInfo } = daoStore((state) => state);
  const socket = useOT((state) => state.socket);

  const initTerminalText = (terminal: Terminal, text: string) => {
    // terminal.clear() 会留下最后一行代码，因此使用 write: \r\n 空置一行
    terminal.write('\r\n');
    terminal.clear();
    writeText(terminal, text);
  };

  const writeText = (terminal: Terminal, text: string) => {
    terminal.write(text);
  };

  const onKey = (char: string) => {
    if (daoStore.getState().amDoing === 'replaying') {
      return;
    }
    const crdt: Dao_FrontType.CRDT = {
      timestamp: Date.now(),
      userId: userStore.getState().userInfo.userId!,
      terminal: {
        action: 'Edit',
        value: char,
      },
    };
    useOT.getState()?.socket?.emit('terminal', JSON.stringify(crdt));
  };

  useEffect(() => {
    if (!terminal) {
      const term = new Terminal({
        ...defaultOptions,
        fontSize: 14,
        lineHeight: 1.5,
        fontFamily: 'UbuntuMono, Ubuntu Mono, courier-new, courier, monospace',
      });
      setTerminal(term);
    }
  }, []);
  useEffect(() => {
    if (!terminal) return;
    if (CRDTInfo.terminal) {
      initTerminalText(
        terminal,
        daoStore.getState()?.CRDTInfo?.terminal?.value || '',
      );
    }
  }, [terminal]);

  useEffect(() => {
    const crdt = CRDTInfo.terminal!;
    if (terminal && crdt) {
      if (crdt?.action === 'Get') {
        initTerminalText(terminal, crdt.value || '');
        return;
      }
      writeText(terminal, crdt.value || '');

      if (!CRDTInfo.userId) return;
      const postUser = userListStore
        .getState()
        .userList.find(({ userId }) => userId === CRDTInfo.userId);
      if (postUser && !IsMe(CRDTInfo.userId)) {
        const helperContainer = terminal?._core?._helperContainer;
        const childNode = helperContainer?.firstChild as HTMLElement;

        userLabel.innerText = postUser.username!;
        userLabel.style.backgroundColor = postUser.color!;
        userLabel.style.top = childNode.style.top;
        userLabel.style.left = childNode.style.left;

        helperContainer?.appendChild(userLabel);
        terminal.setOption('theme', {
          ...terminal.getOption('theme'),
          cursor: postUser.color,
        });
        const timer = setTimeout(() => {
          helperContainer?.removeChild(userLabel);
          terminal.setOption('theme', {
            ...terminal.getOption('theme'),
            cursor: '#ffffff',
          });
        }, 6000);
        return () => {
          try {
            helperContainer?.removeChild(userLabel);
          } catch (_) {
            // console.log('There isn\'t any "userLabel", please try again.');
          }
          terminal.setOption('theme', {
            ...terminal.getOption('theme'),
            cursor: '#ffffff',
          });
          clearTimeout(timer);
        };
      }
    }
  }, [CRDTInfo.terminal]);

  useEffect(() => {
    socket?.on('terminal', (d) => {
      const CRDTInfo = JSON.parse(d) as Dao_FrontType.CRDT;
      const crdt = CRDTInfo.terminal!;
      if (crdt) {
        if (crdt?.action === 'Get') {
          initTerminalText(terminal, crdt.value || '');
          return;
        }
        writeText(terminal, crdt.value || '');

        // if (!CRDTInfo.userId) return;
        // const postUser = userListStore
        //   .getState()
        //   .userList.find(({ uuid }) => uuid === CRDTInfo.userId);
        // if (postUser && !IsMe(CRDTInfo.userInfo)) {
        const helperContainer = terminal?._core?._helperContainer;
        const childNode = helperContainer?.firstChild as HTMLElement;

        // userLabel.innerText = postUser.username!;
        // userLabel.style.backgroundColor = postUser.color!;
        userLabel.style.top = childNode.style.top;
        userLabel.style.left = childNode.style.left;

        helperContainer?.appendChild(userLabel);
        // terminal.setOption('theme', {
        //   ...terminal.getOption('theme'),
        //   cursor: postUser.color,
        // });
        // let timer: NodeJS.Timeout;

        //   if (terminal) {
        //     timer = setTimeout(() => {
        //       helperContainer?.removeChild(userLabel);
        //       terminal.setOption('theme', {
        //         ...terminal.getOption('theme'),
        //         cursor: '#ffffff',
        //       });
        //     }, 6000);
        //     return () => {
        //       try {
        //         helperContainer?.removeChild(userLabel);
        //       } catch (_) {
        //         // console.log('There isn\'t any "userLabel", please try again.');
        //       }
        //       terminal.setOption('theme', {
        //         ...terminal.getOption('theme'),
        //         cursor: '#ffffff',
        //       });
        //       clearTimeout(timer);
        //     };
        //   }
        // }
        // }

        // const { userInfo } = daoStore.getState().CRDTInfo;

        // setCRDTInfo({
        //   ..._d,
        //   userInfo,
        // });
        daoStore.getState().setAsyncType('terminal');
        // setReplaySource({
        //   ..._d,
        //   event: 'terminal',
      }
    });
    return () => {
      socket?.off('terminal');
    };
  }, [terminal, socket]);

  return (
    <FollowLayout name="terminal">
      <div
        className="terminal-container shell-container"
        id="terminal"
        style={{ height: '100%', width: '100%' }}
      >
        <XTerm terminal={terminal} onKey={onKey} {...props} />
      </div>
    </FollowLayout>
  );
};

export default TerminalComponent;
