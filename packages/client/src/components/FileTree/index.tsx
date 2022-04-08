/* eslint-disable */
// @ts-nocheck

import React, { useEffect, useRef, useState, Fragment } from 'react';

import { Tree, ControlledTreeEnvironment } from 'react-complex-tree';
import { Menu, Transition } from '@headlessui/react';
import { TreeItem, TreeItemIndex } from 'react-complex-tree/lib/esm/types';
import { daoStore } from '~/stores';
import { useOT } from '~/hooks';
import { IsMe } from '~/helpers';
import {
  currentDoc,
  fileTreeStore,
  loadingStore,
  userListStore,
  userStore,
} from '~/stores/daoStore';
import { FollowLayout } from '../FollowLayout';
import { ignoreReplayerStore } from '~/stores/ignoreReplayerStore';
import { v4 as uuidv4 } from 'uuid';
import styled from '@emotion/styled';
import { EditorData } from '../Editor/Monaco/Extends/EditorData';
import * as monaco from 'monaco-editor';
import { FileSVG, FolderSVG } from './k-tree/icons';
import { FExtension } from '~/enum/FExtension';
import { LanIcon } from '~/enum/LanIcon';
import { theme } from '~/theme';
import Skeleton from '../Skeleton';

export type FileSystemData = {
  type: 'DIRECTORY' | 'FILE';
  name: string;
  children: FileSystemData[];
};

export type UploadFile = {
  path: string;
  content: string;
};

export type AddedFiles = {
  target: string;
  files: UploadFile[];
};

interface FileTreeProps {
  onCustomSelect?: (items: TreeItemIndex[], treeId?: string) => void | null;
  onCustomExpand?: (fileData: AddedFiles) => void | null;
  onCustomFocus?: (fileData: AddedFiles) => void | null;
  onCustomCollapse?: (fileData: AddedFiles) => void | null;
  onClick?: (arg: { uri: string; path: string }) => void;
  bgColor?: string;
  dropBgColor?: string;
  dropTextColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  fontColor?: string;
  treeItemHeight?: string;
}

const TreeRootLayout = styled.div<{
  dropBgColor?: string;
  dropTextColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  bgColor?: string;
  fontColor?: string;
  treeItemHeight?: string;
}>`
  height: 100%;
  overflow: auto;

  .tree-devi-icon {
    margin-left: 2px;
    margin-right: 7px;
  }

  .devicon-bash-plain.colored {
    color: #fff;
  }

  .folder-svg {
    margin: 0 0.5rem 0 0.2rem;
  }

  .file-svg {
    margin: 0 0.5rem 0 0.2rem;
  }

  .rct-tree-item-arrow {
    display: none;
    &.rct-tree-item-arrow-hasChildren {
      display: block;
    }
  }

  ul.rct-tree-items-container {
    position: relative;
    ul.rct-tree-items-container {
      margin-left: 1rem;
      &:after {
        content: '';
        position: absolute;
        top: 0;
        height: 100%;
        width: 1px;
        z-index: 8888;
        left: -0.5rem;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .rct-tree-item-title-container {
    padding: 8px;
    /* height: ${(props) => props.treeItemHeight || '1.5rem'}; */
  }

  .rct-tree-root {
    background: ${(props) => props.bgColor};
    color: ${(props) => props.fontColor};
    overflow: auto;
  }

  .rct-tree-root.root-drag-over {
    background-color: ${(props) => props.hoverBgColor};
  }

  .rct-tree-item-button {
    padding: 8px 0;
    color: #e9f3f0;
  }
  .rct-tree-item-toolbar {
    display: none;
  }
  /* .rct-tree-item-li .rct-tree-item-title-container .rct-tree-item-toolbar */
  /* rct-tree-item-title-container  */
  .rct-tree-item-li {
    font-size: 14px;
    .rct-tree-item-title-container:hover {
      position: relative;
      .rct-tree-item-arrow {
        flex-shrink: 0;
      }

      .rct-tree-item-avatar {
        width: 20px;
        height: 20px;
        margin-left: 10px;
        background-color: white;
        right: 5px;
      }

      .rct-tree-item-toolbar {
        display: inline-block;
        padding-left: 28px;
        height: 100%;
        line-height: 38px;
        border-radius: 8px;
        background: linear-gradient(
          90deg,
          rgba(30, 31, 30, 0) 0%,
          #1e1f1e 100%
        );
        button {
          i {
            color: #e9f3f0;
            font-size: 18px;
          }
          margin-right: 12px;
        }
      }
    }
  }

  .rct-tree-root-focus {
    outline: none;
    .rct-tree-item-li-selected {
      .rct-tree-item-title-container-selected {
        position: relative;
        color: ${(props) => props.hoverTextColor};
        background-color: ${(props) => props.hoverBgColor};
        border-radius: 8px;
        border: none;
      }
    }
  }

  .rct-tree-root-focus {
    .rct-tree-item-title-container-focused {
      border-color: transparent;
      position: relative;
    }
  }

  :not(.rct-tree-root-focus) {
    .rct-tree-item-title-container-focused {
      border-color: transparent;
    }
    .rct-tree-item-li-selected {
      .rct-tree-item-title-container-selected {
        color: ${(props) => props.hoverTextColor};
        background-color: ${(props) => props.hoverBgColor};
        border-radius: 8px;
        border: none;
      }
    }
  }
`;
// &.root-drag-over {
//   background: rgb(44 71 133) !important;
// }

function addChildrenArray(children: string | any[], parent: TreeItem<string>) {
  for (let i = 0; i < children.length; i++) {
    if (children[i].type === 'DIRECTORY') {
      parent?.children?.push(`${parent.index}${children[i].name}/`);
    } else {
      parent?.children?.push(`${parent.index}${children[i].name}`);
    }
  }
}

function formatFileToTree(
  data: FileSystemData,
): Record<TreeItemIndex, TreeItem<string>> | undefined {
  if (!data) return;
  const formatData: Record<TreeItemIndex, TreeItem<string>> = {};
  const root = data.name;

  formatData[root] = {
    index: root,
    children: [],
    hasChildren: true,
    data: root,
  };
  addChildrenArray(data.children, formatData[root]);

  let nodeChildren = [...data.children];
  let pathChildren = [...formatData[root].children!];

  while (nodeChildren.length) {
    const size = nodeChildren.length;
    for (let i = 0; i < size; i++) {
      const child = nodeChildren.shift()!;
      const path = pathChildren.shift()!;
      nodeChildren = nodeChildren.concat(child.children);

      switch (child.type) {
        case 'DIRECTORY':
          {
            const dirPath = path;
            formatData[dirPath] = {
              index: dirPath,
              hasChildren: true,
              children: [],
              data: child.name,
            };
            addChildrenArray(child.children, formatData[dirPath]);
            pathChildren = pathChildren.concat(formatData[dirPath].children!);
          }
          break;
        case 'FILE':
          {
            const filePath = path;
            formatData[filePath] = {
              index: filePath,
              hasChildren: false,
              data: child.name,
            };
          }
          break;
        default:
          break;
      }
    }
  }
  return formatData;
}

export const getStringFromFile = async (file: File): Promise<string> => {
  const base64String: string = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e: ProgressEvent<FileReader>) => {
      resolve(e.target!.result as string);
    };
  });
  return base64String;
};

// FileTreeProps
const FileTree: React.FC<FileTreeProps> = ({
  onCustomSelect,
  dropBgColor = 'pink',
  dropTextColor = 'black',
  hoverBgColor = 'rgba(233, 243, 240, 0.05)',
  hoverTextColor = '#fff',
  bgColor = theme.extend.colors['codezone-black'],
  fontColor = '#fff',
  onClick,
  treeItemHeight,
  // ...props
}) => {
  const addedFolder: AddedFiles = { target: '', files: [] };
  const io = useOT.getState().socket;

  const [focusedItem, setFocusedItem] = useState<string>();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);
  const [remoteUserList, setRemoteUserList] = useState({});

  const [renameItem, setRenameItem] = useState<string>('');
  const [renameValue, setRenameValue] = useState<string>('');

  const treeRef = useRef<HTMLDivElement>(null!);
  const { CRDTInfo, dockerInfo } = daoStore((state) => state);
  const { moduleLoading, setModuleLoading } = loadingStore((state) => state);

  /**
   * @description initial tree structure area
   * */
  const { fileTree } = fileTreeStore((state) => state);
  const [treeData, setTreeData] = useState<
    Record<TreeItemIndex, TreeItem<string>>
  >({});
  useEffect(() => {
    if (daoStore.getState().amDoing === 'replaying') {
      setSelectedItems([]);
      setExpandedItems([]);
    }
    if (!fileTree.data) return;
    // debugger;
    const newData = formatFileToTree(fileTree?.data)!;
    setSelectedItems(selectedItems.filter((item) => newData[item]));
    setExpandedItems(expandedItems.filter((item) => newData[item]));
    setTreeData(newData);
  }, [fileTree]);

  /* 切换dockerInfo时候清空选项缓存 */
  useEffect(() => {
    setSelectedItems([]);
    setExpandedItems([]);
  }, [dockerInfo]);

  /**
   * @description fundamental event listener: onSelect, onExpand, onCollapse, onFocus...
   * */
  const onSelect = (items: TreeItemIndex[]) => {
    if (items.length === 1) {
      setSelectedItems(items);
      if (daoStore.getState().amDoing === 'coding') {
        const crdt: Dao_FrontType.CRDT = {
          timestamp: Date.now(),
          userId: userStore.getState().userInfo.userId!,
          // editor: {
          //   // extraInfo: {
          //   //   messageId: '1',
          //   //   playgroundId: daoStore.getState().playgroundInfo.playgroundId,
          //   // },
          //   evtType: 'File',
          // },
          file: {
            action: 'Get',
            path: items[0] as string,
            // redisKey: ''
          },
        };

        onClick &&
          onClick({
            uri: `${fileTree.data.uri}${items[0]}`,
            path: items[0] as string,
          });

        // setModuleLoading()
        loadingStore.getState().setModuleLoading({
          Editor: true,
        });
        useOT.getState().socket?.emit('fileContent', JSON.stringify(crdt));
      }
    }
  };
  const onExpand = (item: string) => {
    setExpandedItems([...expandedItems, item]);
  };
  const onCollapse = (item: string) => {
    setExpandedItems(
      expandedItems.filter((expandedItemIndex) => expandedItemIndex !== item),
    );
  };

  /**
   * @description logic of upload area
   * @description function traverseFileTree => for flatten web outer transferData to file Array
   * @description function onOriginDrop => for listening web origin drop event, getting web outer transferData, uploading file list
   * @description useEffect => add origin event listener for uploading files
   * @description function onUploadFile => io interface for uploading
   * */
  const onUploadFile = (payload: string) => {
    console.log(payload, 213);
    useOT.getState().socket?.emit('upload', payload);
    addedFolder.target = '';
    addedFolder.files = [];
    console.log(addedFolder, 217);
  };

  const formatUploadFileTarget = (path: string) => {
    if (path[path.length - 1] !== '/') {
      addedFolder.target = `${path.split('/').slice(0, -1).join('/')}/`;
    } else {
      addedFolder.target = path;
    }
  };

  const traverseFileTree = async (
    item: {
      fullPath?: string;
      isDirectory?: boolean;
      isFile?: boolean;
      name?: string;
      filesystem: FileSystemEntry;
      file?: (file: any) => Promise<File>;
    },
    path = '/',
  ): Promise<UploadFile[]> => {
    const data: UploadFile[] = await new Promise((resolve) => {
      if (item.isFile) {
        // Get file
        item?.file &&
          item.file(async (file: File) => {
            resolve([
              {
                path: `${path}${file.name}`,
                content: await getStringFromFile(file),
              },
            ]);
          });
      } else if (item.isDirectory) {
        // Get folder contents
        let result = [
          {
            path: `${path}${item.name}/`,
            content: '',
          },
        ];
        const dirReader = item.createReader();
        dirReader.readEntries(async (entries: string | any[]) => {
          for (let i = 0; i < entries.length; i++) {
            result = result.concat(
              await traverseFileTree(entries[i], `${path}${item.name}/`),
            );
          }
          resolve(result);
        });
      }
    });
    return data;
  };

  const onOriginDrop = async (evt: DragEvent) => {
    // event.preventDefault();
    // event.currentTarget.lastElementChild.classList.remove('root-drag-over');

    // let buttonElement = event.target;

    // while (buttonElement && buttonElement.tagName?.toLowerCase() !== 'button') {
    //   buttonElement = buttonElement.lastChild;
    // }
    // const node = buttonElement ? buttonElement.dataset['rctItemId'] : '/';
    // formatUploadFileTarget(node);

    // const items = event.dataTransfer.items;
    // if (items.length === 0) return;

    // const itemsIterate = [];
    // for (const i of items) {
    //   itemsIterate.push(i.webkitGetAsEntry());
    // }
    // console.log('drop5', 295);

    // for (const item of itemsIterate) {
    //   // webkitGetAsEntry is where the magic happens
    //   if (item) {
    //     addedFolder.files = addedFolder.files.concat(
    //       await traverseFileTree(item),
    //     );
    //   }
    // }
    // buttonElement?.parentNode.classList.remove(
    //   'rct-tree-item-title-container-selected',
    // );
    // buttonElement?.parentNode.parentNode.classList.remove(
    //   'rct-tree-item-li-selected',
    // );
    // console.log('drop5', 310);
    // onUploadFile(JSON.stringify(addedFolder));

    evt.preventDefault();
    (evt.currentTarget as HTMLDivElement).lastElementChild!.classList.remove(
      'root-drag-over',
    );

    let buttonElement = evt.target as HTMLButtonElement;
    // evt.currentTarget.tagName;
    while (buttonElement && buttonElement.tagName?.toLowerCase() !== 'button') {
      buttonElement = buttonElement.lastElementChild as HTMLButtonElement;
    }
    const node = buttonElement ? buttonElement.dataset['rctItemId'] : '/';
    formatUploadFileTarget(node!);

    const items = evt!.dataTransfer!.items;
    if (items.length === 0) return;

    const itemsIterate = [];
    for (const i of items) {
      itemsIterate.push(i.webkitGetAsEntry());
    }
    // console.log('drop5', 295);

    for (const item of itemsIterate) {
      // webkitGetAsEntry is where the magic happens
      if (item) {
        addedFolder.files = addedFolder.files.concat(
          await traverseFileTree(item),
        );
      }
    }
    buttonElement?.parentElement?.classList!.remove(
      'rct-tree-item-title-container-selected',
    );
    buttonElement?.parentElement?.parentElement!.classList.remove(
      'rct-tree-item-li-selected',
    );

    onUploadFile(JSON.stringify(addedFolder));
  };

  useEffect(() => {
    if (treeRef.current) {
      treeRef.current.removeEventListener('drop', onOriginDrop);
      treeRef.current.addEventListener('drop', onOriginDrop, false);
      treeRef.current.addEventListener(
        'dragover',
        (e: DragEvent) => {
          if (e.dataTransfer?.items.length === 0) return;
          e.preventDefault();
          e.stopPropagation();
        },
        false,
      );
      treeRef.current.addEventListener(
        'dragenter',
        (e: DragEvent) => {
          if (e?.dataTransfer?.items.length === 0) return;
          e.preventDefault();
          e.stopPropagation();
          const target = (e.target as HTMLDivElement)!;
          const currentTarget = (e.currentTarget as HTMLDivElement)!;

          // remove('root-drag-over');
          currentTarget.lastElementChild!.classList.remove('root-drag-over');

          if (target.classList!.contains('rct-tree-root')) {
            console.log(e.target);
            target.classList.add('root-drag-over');
          }

          if (target.tagName?.toLowerCase() === 'button') {
            target.parentElement!.classList.add(
              'rct-tree-item-title-container-selected',
            );
            target!.parentElement!.parentElement!.classList.add(
              'rct-tree-item-li-selected',
            );
          }
        },
        false,
      );
      treeRef.current.addEventListener(
        'dragleave',
        (e: DragEvent) => {
          if (e.dataTransfer!.items.length === 0) return;
          e.preventDefault();
          e.stopPropagation();
          // e.currentTarget.classList.remove('root-drag-over');
          const target = (e.target as HTMLDivElement)!;

          if (target.tagName.toLowerCase() === 'button') {
            target.parentElement!.classList.remove(
              'rct-tree-item-title-container-selected',
            );
            target.parentElement!.parentElement!.classList.remove(
              'rct-tree-item-li-selected',
            );
          }
        },
        false,
      );
    }
  }, [treeRef]);

  /**
   * @description remote user operation will be synchronized in other or local view
   * */
  useEffect(() => {
    const user = userListStore
      .getState()
      .userList.find((item) => item.uuid === CRDTInfo.userId);

    if (CRDTInfo?.file && user) {
      const path = CRDTInfo!.file!.path!;
      if (!IsMe(CRDTInfo.userId)) {
        setRemoteUserList((oldUserListItem) => {
          const userListItem = { ...oldUserListItem };
          // clear old data
          const remoteUserListObj = Object.entries(userListItem);
          for (const iteratorItem of remoteUserListObj) {
            const [key, value] = iteratorItem as [string, any[]];
            const index = value.findIndex((item) => item.uuid === user.uuid);
            if (index > -1) {
              userListItem[key].splice(index, 1);
              if (userListItem[key].length === 0) {
                delete userListItem[key];
              }
              break;
            }
          }
          //append new data
          if (userListItem[path]) {
            userListItem[path].push({
              uuid: user.uuid,
              color: user.color,
              avatar: user.avatarUrl,
            });
          } else {
            userListItem[path] = [
              {
                uuid: user.uuid,
                color: user.color,
                avatar: user.avatarUrl,
              },
            ];
          }
          return userListItem;
        });
        if (path[path.length - 1] === '/') {
          const index = expandedItems.indexOf(path);
          if (index === -1) {
            onExpand(path);
          } else {
            onCollapse(path);
          }
        }
        // to fixed switch
      } else if (
        daoStore.getState().amDoing === 'replaying' &&
        !ignoreReplayerStore
          .getState()
          .ignoreReplayers.some((d) => d === 'Tree')
      ) {
        onSelect([path]);
        if (path[path.length - 1] === '/') {
          const index = expandedItems.indexOf(path);
          if (index === -1) {
            onExpand(path);
          } else {
            onCollapse(path);
          }
        }
      }
    }
  }, [CRDTInfo]);

  /***
   * @desc file tree toolbar function
   * @desc contains addFile, addFolder, deleteFileFolder, renameFileFolder
   * */
  const handleAddFile = (path: string) => {
    onExpand(path);

    if (path[path.length - 1] !== '/') {
      path = `${path.split('/').slice(0, -1).join('/')}/`;
    }
    setTreeData((treeData) => {
      const newFilePath = `${path}${uuidv4().substring(0, 6)}`;
      treeData[path].children?.push(newFilePath);
      treeData[newFilePath] = {
        index: newFilePath,
        hasChildren: false,
        data: 'Untitled',
      };
      setRenameItem(newFilePath);
      setRenameValue('');
      return treeData;
    });
  };

  const handleAddFolder = (path: string) => {
    onExpand(path);

    if (path[path.length - 1] !== '/') {
      path = `${path.split('/').slice(0, -1).join('/')}/`;
    }
    setTreeData((treeData) => {
      const newFolderPath = `${path}${uuidv4().substring(0, 6)}/`;
      treeData[path].children?.push(newFolderPath);
      treeData[newFolderPath] = {
        index: newFolderPath,
        hasChildren: true,
        children: [],
        data: 'Untitled',
      };
      setRenameItem(newFolderPath);
      setRenameValue('');
      return treeData;
    });
  };

  const handleStopRenaming = (path: string) => {
    if (renameValue === '') {
      setTreeData((treeData) => {
        delete treeData[path];
        return treeData;
      });
    }
    setRenameItem('');
  };

  const handleSave = (treeNode: TreeItem<string>, name = '') => {
    const payload = {
      action: '',
      path: '',
      newPath: '',
      userInfo: userStore.getState().userInfo,
    };
    const newPath = (treeNode.index as string).split('/');

    if (treeNode.hasChildren) {
      newPath.splice(-2, 1, name);
    } else {
      newPath.splice(-1, 1, name);
    }
    if (treeNode.data === 'Untitled') {
      payload.action = 'CREATE';
      payload.path = newPath.join('/');
    } else {
      payload.action = 'RENAME';
      payload.path = treeNode.index as string;
      payload.newPath = newPath.join('/');
    }
    useOT.getState().socket?.emit('fileTreeOp', JSON.stringify(payload));
  };

  const handleUpload = (path: string, uploadType: 'file' | 'folder') => {
    formatUploadFileTarget(path);

    (
      document.getElementById(`manual-upload-${uploadType}`) as HTMLInputElement
    ).click();
  };

  const handleManualUploadFile = async (files: FileList) => {
    for (const item of files) {
      addedFolder.files = addedFolder.files.concat([
        {
          path: `/${item.name}`,
          content: await getStringFromFile(item),
        },
      ]);
    }
    onUploadFile(JSON.stringify(addedFolder));
  };

  const handleManualUploadFolder = async (files: FileList) => {
    for (const item of files) {
      addedFolder.files = addedFolder.files.concat([
        {
          path: `/${item.webkitRelativePath}`,
          content: await getStringFromFile(item),
        },
      ]);
    }
    onUploadFile(JSON.stringify(addedFolder));
  };

  const handleDeleteFileFolder = (path: string) => {
    // console.log(EditorData.fileTreeStack.filter((file) => file.path !== path));

    // console.log(path);
    EditorData.setFileTreeStack(
      EditorData.fileTreeStack.filter((file) => file.path !== path),
    );

    // monaco.editor.getModels().forEach((model) => {
    //   if (model.uri.path.includes(path)) {
    //     model.setValue('');
    //   }
    // });

    // console.log(monaco.editor.getModels()[0].uri);
    // EditorData.fileTreeStack.filter((file) => file.path !== path);
    useOT.getState().socket?.emit(
      'fileTreeOp',
      JSON.stringify({
        action: 'DELETE',
        path: path,
      }),
    );

    currentDoc.getState().switchDoc({
      value: '',
      path: '/',
      // action: undefined,
      // redisKey: undefined,
      // revision: undefined,
    });
  };

  return (
    <FollowLayout name="file">
      <Skeleton type="Tree" loading={moduleLoading.Tree}></Skeleton>

      <TreeRootLayout
        className="tree-root-containe"
        ref={treeRef}
        dropBgColor={dropBgColor}
        dropTextColor={dropTextColor}
        hoverBgColor={hoverBgColor}
        hoverTextColor={hoverTextColor}
        bgColor={bgColor}
        fontColor={fontColor}
        treeItemHeight={treeItemHeight}
      >
        <input
          id="manual-upload-file"
          type="file"
          multiple={true}
          hidden={true}
          onChange={(event) => {
            // console.log(event);
            handleManualUploadFile(event.target.files!);
          }}
        />
        <input
          id="manual-upload-folder"
          type="file"
          multiple={true}
          hidden={true}
          // webkitdirectory=""
          // mozdirectory=""
          // directory=""
          onChange={(event) => {
            handleManualUploadFolder(event.target.files!);
          }}
        />
        <ControlledTreeEnvironment
          canDragAndDrop={true}
          canSearch={false}
          items={treeData}
          onFocusItem={(item) => setFocusedItem(item.index as string)}
          onExpandItem={(item) => {
            onExpand(item.index as string);
          }}
          onCollapseItem={(item) => {
            onCollapse(item.index as string);
          }}
          getItemTitle={(item) => item.data}
          viewState={{
            ['tree-1']: {
              focusedItem,
              expandedItems,
              selectedItems,
            },
          }}
          onSelectItems={(items) => {
            onSelect(items);
            onCustomSelect?.(items);
          }}
          renderItem={({ title, arrow, depth, context, children }) => {
            return (
              <li
                {...context.itemContainerWithChildrenProps}
                className={[
                  'rct-tree-item-li',
                  context.isSelected ? 'rct-tree-item-li-selected' : '',
                  context.isExpanded ? 'rct-tree-item-li-expanded' : '',
                  context.isFocused ? 'rct-tree-item-li-focused' : '',
                  children ? 'rct-tree-item-li-hasChildren' : '',
                ].join(' ')}
              >
                <div
                  className={[
                    'rct-tree-item-title-container',
                    context.isSelected
                      ? 'rct-tree-item-title-container-selected'
                      : '',
                    context.isExpanded
                      ? 'rct-tree-item-title-container-expanded'
                      : '',
                    context.isFocused
                      ? 'rct-tree-item-title-container-focused'
                      : '',
                    children ? 'rct-tree-item-title-container-hasChildren' : '',
                  ].join(' ')}
                  // style={{ paddingLeft: `${depth}0px` }}
                >
                  {remoteUserList[
                    context.interactiveElementProps['data-rct-item-id']
                  ] &&
                    remoteUserList[
                      context.interactiveElementProps['data-rct-item-id']
                    ].map((remoteUser) => (
                      <div
                        className="rct-tree-item-avatar rounded-full absolute border"
                        key={remoteUser.uuid}
                        style={{
                          borderColor: remoteUser.color,
                          backgroundImage: `url(${remoteUser.avatar})`,
                        }}
                      />
                    ))}
                  <div className="rct-tree-item-toolbar absolute right-0">
                    <button
                      onClick={() => {
                        handleAddFile(
                          context.interactiveElementProps['data-rct-item-id'],
                        );
                      }}
                    >
                      <i className="d42 add-file" />
                    </button>
                    <button
                      onClick={() => {
                        handleAddFolder(
                          context.interactiveElementProps['data-rct-item-id'],
                        );
                      }}
                    >
                      <i className="d42 add-folder" />
                    </button>

                    <Menu as="div" className="relative inline-block">
                      {({ open }) => (
                        <>
                          <Menu.Button>
                            {/* 更多 */}
                            <i className="d42 more" />
                          </Menu.Button>
                          <Transition
                            show={open}
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items
                              static
                              className="absolute z-1 w-20 right-0 top-full"
                            >
                              <Menu.Item>
                                <div className="code-dropdown-btn-item">
                                  <button
                                    className="w-full justify-center my-2"
                                    onClick={() => {
                                      handleUpload(
                                        context.interactiveElementProps[
                                          'data-rct-item-id'
                                        ],
                                        'file',
                                      );
                                    }}
                                  >
                                    上传文件
                                  </button>
                                </div>
                              </Menu.Item>
                              <Menu.Item>
                                <div className="code-dropdown-btn-item">
                                  <button
                                    className="w-full justify-center my-2"
                                    onClick={() => {
                                      handleUpload(
                                        context.interactiveElementProps[
                                          'data-rct-item-id'
                                        ],
                                        'folder',
                                      );
                                    }}
                                  >
                                    上传文件夹
                                  </button>
                                </div>
                              </Menu.Item>
                              <Menu.Item>
                                <div className="code-dropdown-btn-item">
                                  <button
                                    className="w-full justify-center my-2"
                                    onClick={() => {
                                      setRenameValue(title?.props?.children);
                                      setRenameItem(
                                        context.interactiveElementProps[
                                          'data-rct-item-id'
                                        ],
                                      );
                                    }}
                                  >
                                    重命名
                                  </button>
                                </div>
                              </Menu.Item>
                              <Menu.Item>
                                <div className="code-dropdown-btn-item">
                                  <button
                                    className="w-full justify-center text-red-800 my-2"
                                    onClick={() =>
                                      handleDeleteFileFolder(
                                        context.interactiveElementProps[
                                          'data-rct-item-id'
                                        ],
                                      )
                                    }
                                  >
                                    删除
                                  </button>
                                </div>
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </>
                      )}
                    </Menu>
                  </div>
                  {arrow}
                  {renameItem ===
                  context.interactiveElementProps['data-rct-item-id'] ? (
                    <input
                      className="text-black focus:outline-none active:outline-none"
                      type="text"
                      autoFocus={true}
                      value={renameValue}
                      onInput={(event) => setRenameValue(event.target.value)}
                      onKeyDown={(event) => {
                        switch (event.key) {
                          case 'Enter':
                            handleStopRenaming(renameItem);
                            handleSave(treeData[renameItem], renameValue);
                            break;
                          case 'Escape':
                            handleStopRenaming(renameItem);
                            break;
                        }
                      }}
                    />
                  ) : (
                    <>
                      <button
                        {...context.itemContainerWithoutChildrenProps}
                        {...context.interactiveElementProps}
                        className={[
                          'rct-tree-item-button font-sans subpixel-antialiased',
                          context.isSelected
                            ? 'rct-tree-item-button-selected'
                            : '',
                          context.isExpanded
                            ? 'rct-tree-item-button-expanded'
                            : '',
                          context.isFocused
                            ? 'rct-tree-item-button-focused'
                            : '',
                          children
                            ? 'rct-tree-item-button-hasChildren'
                            : 'no-child',
                        ].join(' ')}
                      >
                        {arrow?.props?.className.includes(
                          'rct-tree-item-arrow-hasChildren',
                        ) ? (
                          <FolderSVG className="folder-svg" />
                        ) : LanIcon[
                            title?.props?.children.split('.').slice(-1)[0]
                          ] ? (
                          <i
                            className={`text-xs mr-1 tree-devi-icon devicon-${
                              LanIcon[
                                title.props.children.split('.').slice(-1)[0]
                              ]
                            }-plain colored`}
                          />
                        ) : (
                          <FileSVG className="file-svg" />
                        )}
                        <span>{title}</span>
                      </button>
                    </>
                  )}
                </div>
                {children}
              </li>
            );
          }}
        >
          <Tree treeId="tree-1" rootItem="/" treeLabel="File Tree" />
        </ControlledTreeEnvironment>
      </TreeRootLayout>
    </FollowLayout>
  );
};

export { FileTree };
