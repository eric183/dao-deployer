/* eslint-disable */
// @ts-nocheck

import { useEffect, useMemo, useState, FC, useReducer } from 'react';
// import { FileTreeType } from '~/mocks';
// import { Loading } from '../loading';
import { TreeFolder } from './folder';
import {
  recursionTreeHelper,
  reducer,
  TreeActionType,
  uploadTransfer,
} from './helper';
import { fetchMockTreeData } from './mockData';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { FileTreeType } from '~/types/crdt';
import styled from '@emotion/styled';
import { useOT } from '~/hooks';

// .drag-enter {
//   background: ${(props) => props.dropBgColor};

//   span {
//     color: ${(props) => props.dropTextColor};
//   }
// }
let keepTrees: any;
type TreeType = FileTreeType['dockerInfo']['fileTree'];

export type TreeFileProps = {
  dropBgColor: string;
  HoverBgColor: string;
  HoverTextColor: string;
  dropTextColor: string;
  expandNodes?: string[];
  onFileClick?: (file: TreeType) => void;
  onExpand?: (file: TreeType) => void;
  onCollapse?: (file: TreeType) => void;
  onUpload?: (file: TreeType) => void;
};

const grid = 8;

// const getListStyle = (isDraggingOver) => ({
//   background: isDraggingOver ? 'lightblue' : 'lightgrey',
//   padding: grid,
//   width: 250,
// });
const TreeRootLayout = styled.div<TreeFileProps>`
  .tree-hover {
    cursor: pointer;
  }
  &.drag-enter {
    background: ${(props) => props.dropBgColor};

    span {
      color: ${(props) => props.dropTextColor};
    }
  }
`;

export const FileTree: FC<TreeFileProps & { treeData: any }> = ({
  onFileClick,
  onExpand,
  onCollapse,
  expandNodes = [],
  treeData,
  dropTextColor = '#ccc',
  dropBgColor = 'rgba(255, 255, 255, 0.07)',
  HoverBgColor = 'rgba(255, 255, 255, 0.07)',
  HoverTextColor = 'red',
}) => {
  const [tree, setTree] = useState<TreeType>(treeData);
  const [originalTree, setOriginalTree] = useState<TreeType>(treeData);
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    fetchMockTreeData().then((responseData) => {
      setTree(responseData.dockerInfo.fileTree);
    });
  }, []);

  useEffect(() => {
    // console.log(treeData);

    if (treeData) {
      keepTrees = treeData;
      Object.freeze(keepTrees);
    }
    setTree(treeData);
    setOriginalTree(treeData);
  }, [treeData]);

  const dragEndSort = (result) => {
    const { source, destination } = result;
    // debugger;
    // dropped outside the list
    if (!destination) {
      return;
    }

    // debugger;
    if (source.droppableId === destination.droppableId) {
      // debugger;
      // const items = reorder(
      //   this.getList(source.droppableId),
      //   source.index,
      //   destination.index,
      // );
      // let state = { items };
      // if (source.droppableId === 'droppable2') {
      //   state = { selected: items };
      // }
      // this.setState(state);
    } else {
      // const result = move(
      //   this.getList(source.droppableId),
      //   this.getList(destination.droppableId),
      //   source,
      //   destination,
      // );
      // this.setState({
      //   items: result.droppable,
      //   selected: result.droppable2,
      // });
    }
  };

  return (
    <DragDropContext onDragEnd={dragEndSort}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <OptimizedRenderTree
            tree={tree}
            originalTree={originalTree}
            dropBgColor={dropBgColor}
            dropTextColor={dropTextColor}
            HoverBgColor={HoverBgColor}
            HoverTextColor={HoverTextColor}
            expandNodes={expandNodes}
            onFileClick={onFileClick}
            onExpand={onExpand}
            onCollapse={onCollapse}
            provided={provided}
            snapshot={snapshot}
          />
          // <div
          //   className="p-4 relative"
          //   onClick={() => {
          //     setCounter(counter + 1);
          //   }}
          //   {...provided.droppableProps}
          //   ref={provided.innerRef}
          //   style={getListStyle(snapshot.isDraggingOver)}
          //   draggable="true"
          // >
          //   {/* <input
          //     className="absolute top-0 left-0 w-full h-full"
          //     id="upload"
          //     type="file"
          //     hidden
          //     // className="hidden"
          //     onChange={(d) => {
          //       console.log(d);
          //     }}
          //   /> */}
          //   {/* <div>FileTree: {counter} </div> */}
          //   {/* <DemoTree /> */}
          //   <OptimizedRenderTree
          //     tree={tree}
          //     onFileClick={onFileClick}
          //     onExpand={onExpand}
          //     onCollapse={onCollapse}
          //     provided={provided}
          //     snapshot={snapshot}
          //   />
          // </div>
        )}
      </Droppable>
    </DragDropContext>
  );
  // return <div>{recursionTree}</div>;
};

export const OptimizedRenderTree: FC<
  {
    tree: TreeType;
    originalTree: TreeType;
    provided?: any;
    snapshot?: any;
  } & TreeFileProps
> = ({
  tree,
  originalTree,
  onFileClick,
  onExpand,
  onCollapse,
  provided,
  snapshot,
  dropBgColor,
  HoverBgColor,
  HoverTextColor,
  dropTextColor,
  expandNodes,
}) => {
  const [state, dispatch] = useReducer(reducer, { tree });

  useEffect(() => {
    if (tree && expandNodes) {
      dispatch({
        type: TreeActionType.TREE,
        payload: keepTrees,
      });
      console.log(expandNodes);
    }
  }, [expandNodes]);

  useEffect(() => {
    if (tree) {
      dispatch({
        type: TreeActionType.TREE,
        payload: tree,
      });
      // dispatch({
      //   type: 'setTree',
      //   tree,
      // });
    }
  }, [tree]);

  const recursionTree = useMemo(() => {
    // debugger;
    return recursionTreeHelper(state!.tree, {
      state,
      dispatch,
      onFileClick,
      onExpand,
      onCollapse,
      dropBgColor,
      HoverBgColor,
      HoverTextColor,
      dropTextColor,
      provided,
      snapshot,
    });
  }, [state]);

  return (
    <TreeRootLayout
      onDrop={(evt) => {
        evt.preventDefault();
        evt.currentTarget.firstElementChild!.classList.remove('drag-enter');
        uploadTransfer(evt);
      }}
      onDragOver={(evt) => {
        evt.preventDefault();
        if (evt.currentTarget === evt.target) {
          evt.currentTarget.classList.add('drag-enter');
        } else {
          evt.currentTarget.classList.remove('drag-enter');
        }
      }}
      // onDragLeave={(evt) => {
      //   // debugger;
      //   // console.log(evt.currentTarget);
      //   evt.currentTarget.classList.remove('drag-enter');
      // }}
      className="py-2 w-full h-full tree-bg rounded text-white"
      style={{ maxWidth: 'none' }}
      dropBgColor={dropBgColor}
      dropTextColor={dropTextColor}
      HoverBgColor={HoverBgColor}
      HoverTextColor={HoverTextColor}
    >
      {recursionTree}
    </TreeRootLayout>
  );
};
