import styled from '@emotion/styled';
import { FC, useEffect, useRef } from 'react';
import { FileSVG } from '~/components/FileTree/k-tree/icons';
import { LanIcon } from '~/enum/LanIcon';
import { daoStore } from '~/stores';
import { currentDoc } from '~/stores/daoStore';
import { editorStore } from '../Monaco/Extends/EditorData';

const FileTreeStackLayout = styled.ul<{
  [key: string]: any;
}>`
  .active {
    /* background-color: ${(props) => props.menuStyle.backgroundColor}; */
    /* background-color: @apply dao-light-green; */
    box-shadow: 0px 1px 0px 0 #333;
    border-width: 1px;
    border-style: solid;
  }

  width: 100%;
  height: ${(props) => props.menuStyle.height};
  /* transform: translate(0, -1px); */
  overflow-x: auto;
  flex-wrap: nowrap;

  li {
    /* width: 100px; */
    height: 100%;
    padding: 10px 36px 10px 12px;
    /* color: ${(props) => props.menuStyle.textColor}; */
    font-size: 12px;
    flex: 0 0 auto;
    font-weight: 500;
    color: #f1f2f3;
    &:hover {
      /* background: ${(props) => props.menuStyle.hoverBgColor}; */
      background: #272d2e;
      color: ${(props) => props.menuStyle.hoverTextColor};
    }
  }

  .tree-closer {
    right: 16px;
    font-size: 14px;
    opacity: 0;
    line-height: 0;
    transition: opacity 0.2s ease-in-out;
    color: ${(props) => props.menuStyle.iconColor};
    &.hover {
      opacity: 1;
      /* color: ${(props) => props.menuStyle.hoverIconColor}; */
      color: ${(props) => props.menuStyle.hoverIconColor};
    }
  }
`;

export const FileListStack: FC<{
  editor: any;
  menuStyle: {
    backgroundColor?: string;
  };
  switchModel: (model: any) => void;
  clearPlayground: () => void;
}> = ({
  editor,
  switchModel,
  menuStyle = {
    backgroundColor: '#005391',
    textColor: '#fff',
    hoverBgColor: 'rgb(37 45 124 / 80%)',
    hoverTextColor: '#fff',
    iconColor: '#fff',
    hoverIconColor: '#fff',
    height: '35px',
  },
}) => {
  const switchDoc = currentDoc((state) => state.switchDoc);
  const docFile = currentDoc((state) => state.doc);
  const dockerInfo = daoStore((state) => state.dockerInfo);
  const fileTreeStack = editorStore((state) => state.fileTreeStack);
  const setFileTreeStack = editorStore((state) => state.setFileTreeStack);

  const ref = useHorizontalScroll();
  const closeCurrentFile = (
    evt: React.MouseEvent<HTMLElement, MouseEvent>,
    index: number,
  ) => {
    evt.preventDefault();
    evt.stopPropagation();
    const _fileTreeStackList = [...fileTreeStack];
    _fileTreeStackList.splice(index, 1);
    // console.log(_fileTreeStackList);
    setFileTreeStack(_fileTreeStackList);
    if (_fileTreeStackList.length === 0) {
      // editor.setValue('');
      // editor.getModel().setValue('');
      // editor.setValue('');
      switchDoc({
        path: '',
        value: '',
      });
      // clearPlayground();
      editor.getModel().setValue('');
    } else {
      switchModel(_fileTreeStackList.slice(-1)[0].model!);
    }
  };

  return fileTreeStack && fileTreeStack.length > 0 ? (
    <FileTreeStackLayout
      menuStyle={menuStyle}
      id="menu-list"
      ref={ref}
      className="flex flex-row file-list-container items-center flex-shrink-0 scroll-smooth no-scrollbar overflow-x-scroll bg-codezone-black overflow-auto touch-pan-x"
    >
      {fileTreeStack?.map((f, index) => (
        <li
          key={f.path}
          className={`
            flex
            flex-row
            flex-grow-0
            relative
            flex-shrink-0
            justify-center
            items-center
            cursor-pointer
            ${
              f.path === docFile?.path
                ? 'active bg-dao-light-green border-dao-light-green'
                : ''
            }
          `}
          onClick={() => {
            switchModel(f.model!);
          }}
          onDoubleClick={(evt) => {
            closeCurrentFile(evt, index);
          }}
          onMouseEnter={(evt: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
            // &#xe7fc;

            evt.currentTarget?.lastElementChild?.classList?.add('hover');
          }}
          onMouseLeave={(evt: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
            // &#xe7fc;
            // console.log('out');
            evt.currentTarget?.lastElementChild?.classList?.remove('hover');
          }}
        >
          {LanIcon[f.label.split('.').slice(-1)[0] as keyof typeof LanIcon] ? (
            <i
              className={`text-xs mr-2 tree-devi-icon devicon-${
                LanIcon[f.label.split('.').slice(-1)[0] as keyof typeof LanIcon]
              }-plain colored`}
            />
          ) : (
            <FileSVG className="mr-2" />
          )}

          {f.label.split('/').slice(-1)[0]}

          <i
            className="d42 close tree-closer absolute"
            onClick={(evt) => {
              closeCurrentFile(evt, index);
            }}
          />
        </li>
      ))}
    </FileTreeStackLayout>
  ) : null;
};

function useHorizontalScroll() {
  const elRef = useRef(null!);
  const el = elRef.current as any;

  const onWheel = (e: { deltaY: number; preventDefault: () => void }) => {
    if (e.deltaY == 0) return;
    e.preventDefault();
    el?.scrollTo({
      left: el.scrollLeft + e.deltaY * 10,
      behavior: 'smooth',
    });
  };
  useEffect(() => {
    if (el) {
      el.addEventListener('wheel', onWheel);
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, [el]);
  return elRef;
}
