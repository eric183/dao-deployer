import { useEffect, useRef, useState } from 'react';
import { CustomProvider, Drawer, Placeholder } from 'rsuite';
import { adminClearCache, clearCache } from '~/helpers/collections/clearCache';
import { getLocalCRDTs } from '~/helpers/collections/idb';
import { replay } from '~/helpers/collections/replay';
import { useOT } from '~/hooks';
import { daoStore } from '~/stores';
import { guiStore } from '~/stores/guiStore';
import { ReplaySourceType } from '~/types/crdt';
import { DrawerComponent } from './DrawComponent';
import * as monaco from 'monaco-editor';

// import * as dayjs from 'dayjs';
// import { userListStore } from '~/stores/daoStore';
import 'ninja-keys';
import { currentDoc, diffStore } from '~/stores/daoStore';

export const CmdKey = () => {
  const ninjaKeys = useRef<any>(null!);

  const actions = [
    {
      id: 'active',
      title: '激活容器',
      hotkey: 'a',
      mdIcon: 'input',
      handler: () => {
        useOT.getState()?.socket?.emit('active');
        // io?.emit('active');
        // window.open('https://develop.1024paas.com/storybook');
      },
    },
    {
      id: 'disable editor',
      title: '禁用/启用 编辑器',
      hotkey: 'ed',
      mdIcon: 'edit',
      handler: () => {
        daoStore.getState().setGlobalData({
          disableEditor: !daoStore.getState().globalData.disableEditor,
        });
        // if (prompt('请输入密码') === 'kuangsa183') {
        //   useOT.getState()?.socket?.emit('stop');
        // }
        // io?.emit('active');
        // window.open('https://develop.1024paas.com/storybook');
      },
    },
    {
      id: 'active editor diff',
      title: '禁用/启用 diff',
      hotkey: 'd',
      mdIcon: 'edit',
      handler: () => {
        const { setAmDoing, amDoing } = daoStore.getState();
        const { doc } = currentDoc.getState();
        const { setDiffPattern, diffPattern } = diffStore.getState();

        if (amDoing !== 'diff') {
          setAmDoing('diff');
          const path = prompt('请输入 diff 文件路径');
          const type = prompt('请输入 diff 文件类型');
          if (!path || !type) return;
          // console.log(monaco);
          const gotModel = monaco.editor
            .getModels()
            .find((x) => x.uri.path.includes(path))!;

          setDiffPattern([
            {
              value: doc!.value!,
              type: 'typescript',
            },
            {
              value: gotModel.getValue(),
              type,
            },
          ]);
        } else {
          setAmDoing('coding');
          setDiffPattern([]);
        }

        // if (prompt('请输入密码') === 'kuangsa183') {
        //   useOT.getState()?.socket?.emit('stop');
        // }
        // io?.emit('active');
        // window.open('https://develop.1024paas.com/storybook');
      },
    },
    {
      id: 'disable markdown',
      title: '禁用/启用 Markdown',
      hotkey: 'ed',
      mdIcon: 'swap_horiz',
      handler: () => {
        daoStore.getState().setGlobalData({
          disableEditor: !daoStore.getState().globalData.showMarkdown,
        });

        const mardownToggle = document.querySelector(
          '.markdown-layout',
        ) as HTMLElement;
        const markdownLayout = window.getComputedStyle(
          document.querySelector('.markdown-layout')!,
        ) as unknown as CSSStyleDeclaration;

        mardownToggle.style.display =
          markdownLayout?.display === 'none' ? 'block' : 'none';
      },
    },
    {
      id: 'clearCache',
      title: '清除缓存',
      // hotkey: 'c',
      mdIcon: 'autorenew',
      handler: () => {
        clearCache();
        // console.log('navigation to projects');
      },
    },
    // {
    //   id: 'containerStop',
    //   title: '停止容器',
    //   hotkey: 'cs',
    //   mdIcon: 'input',
    //   handler: () => {
    //     if (prompt('请输入密码') === 'kuangsa183') {
    //       useOT.getState()?.socket?.emit('stop');
    //     }
    //     // io?.emit('active');
    //     // window.open('https://develop.1024paas.com/storybook');
    //   },
    // },
    {
      id: 'replaying',
      title: '回放',
      hotkey: 'r',
      mdIcon: 'alarm',
      handler: () => {
        setChildren();
        // setHotkeys()

        // const { showGUI, setShowGUI } = guiStore.getState();
        // setShowGUI(!showGUI);
      },
      // children: [],
    },
    {
      id: 'GUI',
      title: 'GUI',
      hotkey: 'g',
      mdIcon: 'build_circle',
      handler: () => {
        const { showGUI, setShowGUI } = guiStore.getState();
        setShowGUI(!showGUI);
      },
    },
    {
      id: 'admClearCache',
      title: '清除缓存【ADMIN_ONLY】',
      // hotkey: 'k',
      mdIcon: 'admin_panel_settings',
      handler: () => {
        if (prompt('请输入密码') === 'kuangsa183') {
          adminClearCache();
        }
        // clearCache();
        // console.log('navigation to projects');
      },
    },
    {
      id: 'DOC',
      title: '文档',
      mdIcon: 'desktop_windows',
      children: [
        {
          id: 'tsdoc',
          title: 'API 文档',
          // hotkey: 't',
          mdIcon: 'highlight',
          handler: () => {
            window.open('https://develop.1024paas.com/tsdoc');
          },
        },
        {
          id: 'storybook',
          title: 'Storybook',
          // hotkey: 's',
          mdIcon: 'description',
          handler: () => {
            window.open('https://develop.1024paas.com/storybook');
          },
        },
      ],
    },
  ];
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [replayList, setReplayList] = useState<ReplaySourceType[]>(null!);
  const [hotkeys, setHotkeys] = useState(actions);

  useEffect(() => {
    // console.log('leva init');
    // if (ninjaKeys.current) {
    //   ninjaKeys.current.data = hotkeys;
    // }
    if (ninjaKeys.current) {
      ninjaKeys.current.data = hotkeys;

      // setTimeout(() => {
      //   hotkeys.push({
      //     id: 'test',
      //     title: 'test',
      //     mdIcon: 'dark_mode',
      //     // keywords: 'lol',
      //     hotkey: 'lol',
      //     handler: () => {
      //       console.log('test');
      //     },
      //   });
      //   console.log('Added', hotkeys);
      //   ninjaKeys.current.data = hotkeys;
      // }, 5000);
    }
  }, []);
  useEffect(() => {
    if (!drawerOpen) {
      ninjaKeys.current.close();
    }
  }, [drawerOpen]);
  const setChildren = async (_id?: string) => {
    setReplayList((await getLocalCRDTs()) as ReplaySourceType[]);
    setDrawerOpen(true);
  };
  return (
    <CustomProvider theme="dark">
      <ninja-keys ref={ninjaKeys} className="dark"></ninja-keys>
      <DrawerComponent
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        replayList={replayList}
      />
    </CustomProvider>
  );
};
