/* eslint-disable */
// @ts-nocheck

import styled from '@emotion/styled';
import { FC, useMemo } from 'react';
// import { Droppable } from 'react-beautiful-dnd';
import { CursorSVG, FolderSVG } from './icons';

// import { TreeFile } from './file';

const TreeFolderLayout = styled.div`
  .folder-nodes {
    /* transition: height 0.2s ease-in-out; */
    transition: max-height 1s ease-in-out;
  }
  .folder-collapse {
    max-height: 0;
    visibility: hidden;
  }

  .folder-expand {
    &:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      height: 100%;
      width: 2px;
      background: rgba(255, 255, 255, 0.1);
    }
  }
  svg {
    transition: transform 0.2s ease-in-out;
  }

  .rotate-90 {
    transform: rotate(90deg);
  }
`;

export const TreeFolder: FC<{
  id: string;
  root?: any;
  key?: any;
  type?: 'DIRECTORY' | 'FILE';
  expanded?: boolean;
  children?: any;
  onExpand?: (ele: any) => void;
  onCollapse?: (ele: any) => void;
}> = ({ id, children, type, expanded, onExpand, onCollapse, root }) => {
  // console.log(children);

  const nodeSetter = (children: any[], type?: string) => {
    if (Array.isArray(children)) {
      let ele;
      if (type === 'CHILDREN') {
        ele = children.filter((x) => typeof x.type !== 'string');
      }
      ele = children.find((x) => typeof x.type === 'string');
      return ele;
    } else {
      return children;
    }
  };

  const expandHandler = () => {
    if (expanded && onCollapse) {
      onCollapse(children);
    }

    if (!expanded && onExpand) {
      onExpand(children);
    }
  };

  const ElementInjector = useMemo(() => {
    switch (type) {
      case 'FILE':
        return <div>title</div>;

      case 'DIRECTORY':
        return (
          <TreeFolderLayout
            className={`${
              root?.name !== '/' ? 'pl-4' : 'px-2'
            } cursor-pointer folder-node relative`}
          >
            <div
              className="flex items-center justify-between p-2 hover:text-xl tree-hover rounded"
              onClick={expandHandler}
              onDragEnter={(e) => {
                // console.log('进来');
                onExpand && onExpand(children);
              }}
              onDrop={(e) => {
                e.preventDefault();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                // debugger;
              }}
              // onDragLeave={(e) => {
              //   console.log('离开');
              // }}
            >
              <div className="flex justify-between items-center w-full hover:font-bold">
                <div className="flex items-center">
                  <span className="mr-2.5">
                    <CursorSVG className={`${expanded ? 'rotate-90' : ''}`} />
                  </span>
                  <FolderSVG />
                  <span className="ml-2 text-sm font-gray">
                    {nodeSetter(children)}
                  </span>
                </div>
                {/* <span className="px-1 text-xs">u</span> */}
              </div>
            </div>

            <div
              className={`folder-nodes relative${
                expanded ? ' folder-expand' : ' folder-collapse'
              }`}
            >
              {Array.isArray(children)
                ? children.filter((x) => typeof x.type !== 'string')
                : null}
            </div>
          </TreeFolderLayout>
        );
      default:
        return null;
    }
  }, [children]);
  // const TreeNode = renderToElements(children);
  return ElementInjector;
};
