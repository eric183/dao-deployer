/* eslint-disable */
// @ts-nocheck

import styled from '@emotion/styled';
import { createRef, FC, forwardRef, Ref, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { TreeFileProps } from './index';
import { CreateFileSVG, FileSVG, LockSVG, MoreSVG, VisibleSVG } from './icons';

const TreeFileLayout = styled.div<{
  HoverBgColor: string;
  HoverTextColor: string;
  dropBgColor: string;
  dropTextColor: string;
}>`
  .menu-icon {
    background: transparent;
    border-radius: 4px;
    /* padding: 5px; */
    &:hover {
      background: rgba(255, 255, 255, 0.07);
    }
  }

  .tree-hover:hover {
    background: ${(props) => props.HoverBgColor};
  }

  .drag-enter {
    background: ${(props) => props.dropBgColor};

    span {
      color: ${(props) => props.dropTextColor};
    }
  }

  .hover-text-color span:hover {
    color: ${(props) => props.HoverTextColor};
  }
`;

export const TreeFile = forwardRef(
  (
    {
      index,
      data,
      children,
      type,
      gotParent,
      root,
      dropTextColor,
      dropBgColor,
      HoverBgColor,
      HoverTextColor,
      onClick,
    }: {
      index?: number;
      data?: any;
      key?: any;
      type?: 'DIRECTORY' | 'FILE';
      root?: any;
      // dropTextColor?: string;
      // dropBgColor?: string;
      // HoverBgColor?: string;
      // HoverTextColor?: string;
      gotParent?: boolean;
      children: React.ReactNode;
      onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    } & TreeFileProps,
    ref: Ref<HTMLDivElement>,
  ) => {
    const svgRef = createRef<SVGSVGElement>();

    const [menuVisible, setMeneVisible] = useState<boolean>(false);
    // console.log(HoverBgColor);
    return (
      <TreeFileLayout
        className={`${
          root.name !== '/' ? 'pl-4' : 'px-2'
        } cursor-pointer relative z-20`}
        onClick={onClick}
        onDrop={(evt) => {
          evt.preventDefault();
          evt.currentTarget.firstElementChild!.classList.remove('drag-enter');
          // console.log(e);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        dropBgColor={dropBgColor}
        dropTextColor={dropTextColor}
        HoverBgColor={HoverBgColor}
        HoverTextColor={HoverTextColor}
        // onDragEnter={(evt) => {
        //   evt.currentTarget.firstChild!.style!.background = 'red';
        //   // console.log(evt.currentTarget);
        // }}

        onMouseEnter={(e) => {
          setMeneVisible(true);
        }}
        onMouseLeave={(e) => {
          setMeneVisible(false);
        }}
      >
        <Draggable key={index!} draggableId={data.uri} index={index!}>
          {(provided, snapshot) => (
            <div
              onDragOver={(evt) => {
                // if (evt.currentTarget!.style!.background === '') {
                //   evt.currentTarget!.style!.background = 'red';
                // }
                evt.currentTarget.classList.add('drag-enter');
                // console.log(evt.currentTarget);
              }}
              onDragLeave={(evt) => {
                // debugger;
                // console.log(evt.currentTarget);
                evt.currentTarget.classList.remove('drag-enter');
              }}
              className="flex items-center justify-between p-2 hover:text-xl tree-hover rounded relative"
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <div className="flex justify-between items-center w-full hover:font-bold hover-text-color w-6/12 overflow-hidden">
                <div className="flex items-center overflow-hidden">
                  <FileSVG ref={svgRef} />
                  <span className="ml-2 text-sm font-gray text-ellipsis overflow-hidden whitespace-nowrap">
                    {children}
                  </span>
                </div>
                {/* <span className="px-1 text-xs text-red-500">+1</span> */}
              </div>
              {/* <span className="pl-4">a</span> */}
              <section
                className={`flex-shrink-0 pr-2 box-content transition-opacity absolute top-0 right-0 h-full w-5/12 flex items-center justify-between cursor-pointer${
                  menuVisible ? ' visible' : ' hidden'
                }`}
              >
                <div className="menu-icon flex-shrink-0">
                  <CreateFileSVG />
                </div>
                <div className="menu-icon flex-shrink-0">
                  <LockSVG />
                </div>
                <div className="menu-icon flex-shrink-0">
                  <VisibleSVG />
                </div>
                <div className="menu-icon flex-shrink-0 menu-icon-more">
                  <MoreSVG />
                </div>
              </section>
            </div>
            // <div></div>
          )}
        </Draggable>
      </TreeFileLayout>
      // <TreeFileLayout className="px-4 cursor-pointer">
      //   <div
      //     className="flex items-center justify-between p-2 hover:text-xl"
      //     onClick={onClick}
      //     ref={ref}
      //   >
      //     <div className="flex justify-between items-center w-full hover:font-bold">
      //       <div className="flex items-center">
      //         <FileSVG ref={svgRef} />
      //         <span className="ml-2 text-sm">{children}</span>
      //       </div>
      //       <span className="px-1 text-xs text-red-500">+1</span>
      //     </div>
      //     <span className="pl-4"></span>
      //   </div>
      //   <div></div>
      // </TreeFileLayout>
    );
    // return <TreeFileLayout>File: {children}</TreeFileLayout>;
  },
);
TreeFile.displayName = 'TreeFile';
