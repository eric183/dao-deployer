import React, { useEffect, useState } from 'react';
import { Terminal, ITerminalOptions } from 'xterm';
import { daoStore } from '~/stores';
import XTerm from '~/components/XTerm';
import { FollowLayout } from '../FollowLayout';
import { theme } from '~/theme';

type ConsoleProps = {
  options?: ITerminalOptions;
  height?: number | string;
  width?: number | string;
  fitHook?: boolean;
  className?: string;
};

const Console: React.FC<ConsoleProps> = ({ options, ...props }) => {
  const defaultOptions: ITerminalOptions = {
    convertEol: true,
    fontSize: 12,
    fontFamily: 'Monaco, Menlo, monospace',
    lineHeight: 1,
    cursorBlink: true,
    cursorWidth: 1,
    cursorStyle: 'block',
    rightClickSelectsWord: true,
    ...options,
    theme: {
      background: theme.extend.colors['dao-light-green'],
    },
  };

  const [terminal, setTerminal] = useState<Terminal>(null!);

  const OTSTATE = daoStore((state) => state);
  // const OTSTATE = daoStore((state) => state);

  const { dockerStatus } = daoStore((state) => state);

  const initTerminalText = (terminal: Terminal, text: string) => {
    terminal.write('\r\n');
    terminal.clear();
    writeText(terminal, text);
  };

  const writeText = (terminal: Terminal, text: string) => {
    terminal.write(text);
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
    if (dockerStatus === 'STOP') {
      // initTerminalText(terminal, '应用未启动\r\n');
      initTerminalText(terminal, '\r\n');
    } else {
      initTerminalText(terminal, daoStore.getState().dockerInfo.consoleHistory);
    }
  }, [terminal]);

  useEffect(() => {
    if (!terminal) return;
    const crdt = OTSTATE.CRDTInfo.console;
    if (crdt) {
      writeText(terminal, crdt?.value || '');
    }
  }, [OTSTATE.CRDTInfo]);

  useEffect(() => {
    if (!terminal) return;
    if (dockerStatus === 'STOP') {
      setTimeout(() => {
        writeText(terminal, '\n');
      }, 400);
    } else {
      initTerminalText(terminal, '');
    }
  }, [dockerStatus]);
  return (
    <FollowLayout>
      <div
        className={`console-container`}
        style={{ height: '100%', width: '100%' }}
      >
        <XTerm terminal={terminal} {...props} />
      </div>
    </FollowLayout>
  );
};

export default Console;
