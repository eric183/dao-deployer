import styled from '@emotion/styled';
import { DaoUserInfo } from '~/stores/daoStore';
// import { T_UserInfo } from '~/stores/daoStore';
import { EditorPropsInstance } from '../../index';

export const EditorLayout = styled.div<Pick<EditorPropsInstance, 'theme'>>`
  width: 100%;

  height: 100%;
  flex-flow: 1;
  min-height: 300px;
  .editor-content {
    width: 100%;
    height: 100%;
  }
  /* .contentWidgets {
    visibility: hidden;
  } */
  .no-cursor {
    opacity: 0;
  }

  .monaco-label {
    padding: 2px 6px;
    margin-top: -4px;
    font-size: 12px;
    border-radius: 4px 4px 4px 0px;
    word-break: keep-all;
    font-size: 12px;
    line-height: 17px;
    color: #fff;
  }

  .line-class {
    width: 44px;
    height: 100%;
    right: 16px;
    background-color: #283134;
  }

  .margin-view-overlays {
    & > div {
      z-index: 1;

      &.line-class {
        z-index: 0;
      }
    }
    /* background-color: ${(props) =>
      props.theme.marginViewOverlaysBgColor ?? '#283134'}; */

    .line-numbers {
      /* color: ${(props) => props.theme.lineNumbersColor}; */
      /* width: ${(props) =>
        props.theme.lineNumbersWidth ?? '18px'} !important; */
      /* left: ${(props) =>
        props.theme.lineNumbersLeft ?? '36px'} !important; */

      /* background: #283134;
      padding-right: 8px;
      width: 44px;
      box-sizing: content-box; */
      &.active-line-number {
        /* color: ${(props) => props.theme.activeLineNumberColor}; */
        color: ${(props) => props.theme.activeLineNumberColor};
      }
    }
  }
`;

export const ContentLayout = styled.div<{ userList: DaoUserInfo[] }>`
  flex: 1;
  ${(props) =>
    props.userList.map(
      (u) =>
        '.' +
        u.role +
        '{' +
        'background:' +
        u.color +
        ';' +
        'width: 2px !important;' +
        '}',
    )}
  ${(props) =>
    props.userList.map(
      (u) =>
        '.' +
        u.role +
        '-selection' +
        '{' +
        'background:' +
        u.color +
        'a6' +
        ';' +
        'color: #fff' +
        ';' +
        'width: 2px !important;' +
        '}',
    )}
`;

export const DifferLayout = styled.div`
  width: 100%;
  height: 100%;
`;
