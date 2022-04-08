import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Leva, folder, useControls } from 'leva';
import { ignoreReplayerStore } from '~/stores/ignoreReplayerStore';
import { daoStore } from '~/stores';
import { syncCursorStore } from '~/stores/daoStore';
import { useOT } from '~/hooks';

import { CmdKey } from './CmdKey';
import { guiStore } from '~/stores/guiStore';

export const GuiComponent = () => {
  const { socket } = useOT.getState();
  // useKBar();
  // const { color, select } = useControls({
  const showGUI = guiStore((state) => state.showGUI);
  const forbiddenComponent = (arg: Dao_FrontType.ModuleType, v: unknown) => {
    const editorSet = new Set(ignoreReplayerStore.getState().ignoreReplayers);

    v ? editorSet.add(arg) : editorSet.delete(arg);

    ignoreReplayerStore.getState().setIgnoreReplayer(Array.from(editorSet));
  };

  useControls({
    // number: 3,
    // color: {
    //   label: '颜色',
    //   value: 'lightblue',
    //   onChange: (v) => {
    //     console.log(v);
    //   },
    //   transient: false,
    // },
    // lsp: {
    //   value: daoStore.getState().globalData.useLsp,
    //   onChange: (v) => {
    //     // daoStore.getState().switchLspServer(v);
    //     daoStore.getState().setGlobalData({
    //       useLsp: v,
    //     });
    //     socket?.emit('globalData', {
    //       useLsp: v,
    //     });
    //   },
    //   transient: false,
    // },
    syncCursor: {
      label: '光标同步',
      value: daoStore.getState().globalData.syncCursor,
      onChange: (v) => {
        // syncCursorStore.getState().setSyncCursor(v);
        daoStore.getState().setGlobalData({
          syncCursor: v,
        });

        socket?.emit('globalData', {
          syncCursor: v,
        });
      },
      transient: false,
    },
    // position: {
    //   value: [0, 0, 0],
    //   hint: 'Position of the object relative to the screen',
    // },
    // eslint-disable-next-line prettier/prettier
    '屏蔽组件': folder({
      Editor: {
        value: false,
        onChange: (v) => {
          forbiddenComponent('Editor', v);
        },
        transient: false,
      },
      Terminal: {
        value: false,
        onChange: (v) => {
          forbiddenComponent('Terminal', v);
        },
        transient: false,
      },
      File: {
        value: false,
        onChange: (v) => {
          forbiddenComponent('Tree', v);
        },
        transient: false,
      },
    }),
  });

  // useEffect(() => {
  //   console.log(number, color, select);
  // }, [number, color, select]);
  return (
    <>
      <Leva hidden={!showGUI} />
      {/* <Ninja.NinjaKeys ref={ninjaKeys}></Ninja.NinjaKeys> */}
      <CmdKey />
    </>
  );
};
