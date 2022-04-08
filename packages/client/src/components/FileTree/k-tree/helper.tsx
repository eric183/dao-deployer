/* eslint-disable */
// @ts-nocheck

import { DragEvent, FC, useReducer } from 'react';
import { TreeFile } from './file';
import { TreeFolder } from './folder';
import { TreeFileProps } from './index';
import { useOT } from '~/hooks';

// import { Draggable } from 'react-beautiful-dnd';

// TreeFolder;
// TreeFile;

export enum TreeActionType {
  EXPAND = 'EXPAND',
  COLLAPSE = 'COLLAPSE',
  TREE = 'TREE',
}
export interface ActionType {
  type: TreeActionType;
  payload: any;
}

// load tree expanded from localStorage
const _TreeExpandStack = Array.from(
  JSON.parse(localStorage.getItem('treeExpand') || '[]'),
);

const TreeExpandStack = new Set(_TreeExpandStack);

const grid = 8;

// const getListStyle = (isDraggingOver) => ({
//   // background: isDraggingOver ? 'lightblue' : 'lightgrey',
//   // padding: grid,
//   // width: 250,
// });

export const uploadTransfer = (evt: DragEvent<HTMLDivElement>) => {
  const files = Array.from(evt.dataTransfer.files);
  const fileCounter: {
    path: string;
    content: string | ArrayBuffer | null;
  }[] = [];
  if (evt.currentTarget === evt.target) {
    // debugger;

    files.forEach((file) => {
      // debugger;
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (event) => {
        // debugger;
        // fileCounter--;
        fileCounter.push({
          path: `/${file.name}`,
          content: event.target!.result,
        });

        if (files.length === fileCounter.length) {
          useOT.getState().socket?.emit(
            'upload',
            JSON.stringify({
              target: '/',
              files: fileCounter,
            }),
          );
        }
        // console.log(event.target.result);
      };
    });
  }
};

export const TreeExpandSetter = (
  tree: { children: any[] },
  node: { name: string; expanded: boolean; uri: string } & string,
  type?: 'expand' | 'collapse',
) => {
  if (type === 'expand') {
    tree.children.forEach((item, _index, _array) => {
      if (item.expanded) {
        TreeExpandStack.add(item.uri);
      }

      if (item.uri === node) {
        item.expanded = true;
      }

      if (item.children && item.children.length > 0) {
        TreeExpandSetter(item, node, type);
      }
    });
  }

  if (!type) {
    tree.children.some((child) => {
      if (!type && child.name === node.name) {
        if (node.expanded) {
          TreeExpandStack.add(node.uri);
        } else {
          TreeExpandStack.delete(node.uri);
        }

        localStorage.setItem(
          'treeExpand',
          JSON.stringify(Array.from(TreeExpandStack)),
        );
        child.expanded = node.expanded;
        return true;
      } else {
        TreeExpandSetter(child, node);
      }
    });
  }

  return tree;
};

export const reducer = (state: { tree: any }, action: ActionType) => {
  const { type, payload } = action;

  switch (type) {
    case TreeActionType.EXPAND:
      return { tree: TreeExpandSetter(state.tree, payload) };
    case TreeActionType.COLLAPSE:
      return { tree: TreeExpandSetter(state.tree, payload) };
    case TreeActionType.TREE: {
      const JSON_ARR = JSON.parse(localStorage.getItem('treeExpand') || '[]');
      // const _treeExpand = Array.from(JSON_ARR);
      // debugger;
      // eslint-disable-next-line no-case-declarations
      const tree = JSON_ARR.reduce((acc, cur) => {
        return TreeExpandSetter(acc, cur, 'expand');
      }, payload);

      // TreeExpandSetter(state.tree)
      return { tree };
    }
    // console.log(_TreeExpandStack);
  }
};

const FileEventInjector: FC<{
  dropBgColor?: string;
  HoverBgColor?: string;
  HoverTextColor?: string;
  dropTextColor?: string;
  root?: any;
  data: { name: string };
  onClick?: (file: any) => void;
  index?: number;
  ref?: any;
  gotParent?: boolean;
}> = (props) => {
  // console.log(props);

  return (
    <TreeFile
      {...props}
      onClick={(_d) => {
        props.onClick && props.onClick(props.data);
      }}
    >
      {props.data.name}
    </TreeFile>
  );
};

export const recursionTreeHelper = (
  tree: any,
  arg: {
    state?: { tree: unknown };
    dispatch: any;
    provided?: any;
    snapshot?: any;
  } & TreeFileProps,
  parent?: any,
) => {
  return tree
    ? tree.children.map((item, index) => {
        // console.log(item);
        if (item.children && item.children.length > 0) {
          return item.type === 'DIRECTORY' ? (
            <TreeFolder
              root={tree}
              key={item.name}
              id={item.uri}
              type="DIRECTORY"
              expanded={item.expanded}
              onExpand={() => {
                item = {
                  ...item,
                  expanded: true,
                };
                arg.dispatch({
                  type: TreeActionType.EXPAND,
                  payload: item,
                });
                arg.onExpand && arg.onExpand(item);
              }}
              onCollapse={() => {
                item = {
                  ...item,
                  expanded: false,
                };
                arg.dispatch({
                  type: TreeActionType.COLLAPSE,
                  payload: item,
                });
                arg.onCollapse && arg.onCollapse(item);
              }}
            >
              <div>{item.name}</div>

              {recursionTreeHelper(item, arg)}
            </TreeFolder>
          ) : null;
        }
        return (
          <FileEventInjector
            {...arg}
            root={tree}
            data={item}
            key={item.uri}
            onClick={arg.onFileClick}
            index={index}
          />
        );
      })
    : null;
};
