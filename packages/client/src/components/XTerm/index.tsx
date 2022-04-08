import React, { FC, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

/**
 * 特殊字符表
 * "\x1b[K",//清除光标至行末字符，包括光标位置，行属性不受影响。
    "\x1b[0K",//清除光标至行末字符，包括光标位置，行属性不受影响。
    "\x1b[1K",//清除行首至光标位置字符，包括光标位置，行属性不受影响。
    "\x1b[2K",//清除光标所在行的所有字符
    "\x1b[A",//光标上移
    "\x1b[B",//光标下移
    "\x1b[C",//光标右移
    "\x1b[D",//光标左移
    "\u00003", //Ctrl-C
 */

export interface XTermProps {
  terminal: Terminal;
  userLabel?: HTMLDivElement;
  height?: number | string;
  width?: number | string;
  fitHook?: boolean;
  onKey?: (character: string) => void;
}

const XTerm: FC<XTermProps> = ({ terminal, onKey, fitHook, ...props }) => {
  // debugger;
  const stateStyle = {
    height: '100%',
    width: '100%',
    padding: '5px 5px',
    // backgroundColor: theme.extend.colors['codezone-black'],
    ...props,
  };

  const xtermFitAddon = new FitAddon();

  const terminalRef = useRef<HTMLDivElement>(null);

  const initTerminalEvents = (term: Terminal) => {
    term.onKey(({ key, domEvent }) => {
      let character: string = key;

      switch (key.charCodeAt(0)) {
        case 13:
          break;
        case 27:
          switch (domEvent.key) {
            case 'ArrowLeft':
              if (term.buffer.active.cursorX <= 2) {
                return;
              }
              break;
            case 'ArrowRight':
              break;
            case 'ArrowUp':
            case 'ArrowDown':
              break;
            default:
              break;
          }
          break;
        case 8: // backspace key: delete char on the left of the cursor
        case 127:
          if (term.buffer.active.cursorX > 2) {
            character = '\b';
          }
          break;
        // case 27: // delete key: delete char on the right of the cursor
        //   character = '[3~';
        //   break;
        default:
          break;
      }

      onKey?.(character);
    });

    term.attachCustomKeyEventHandler((e: any) => {
      const ctrlOrCmd = e.metaKey || e.ctrlKey;
      if (e.type === 'keyup') return false;
      if (e.key === 'v' && ctrlOrCmd) {
        if (e.view?.navigator.clipboard) {
          e.view?.navigator.clipboard
            .readText()
            .then((res: string) => onKey?.(res));
        } else {
          onKey?.(e.target!.value);
        }
        return false;
      }
      return !(e.key === 'r' && ctrlOrCmd);
    });
  };

  const fitTerminal = () => {
    // eslint-disable-next-line no-useless-catch
    try {
      setTimeout(() => {
        xtermFitAddon.fit();
      }, 0);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (terminal) {
      terminal.loadAddon(xtermFitAddon);
      initTerminalEvents(terminal);
      terminal.open(terminalRef.current!);
      fitTerminal();
    }
  }, [terminal]);

  useEffect(() => {
    fitTerminal();
  }, [fitHook]);

  return (
    <>
      <div
        style={{
          ...stateStyle,
        }}
        ref={terminalRef}
      ></div>
    </>
  );
};

export default XTerm;
