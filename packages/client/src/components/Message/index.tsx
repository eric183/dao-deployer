import React, { useEffect } from 'react';
import { Message as MessageComponent, toaster, Notification } from 'rsuite';
import { TypeAttributes } from 'rsuite/esm/@types/common';
import create from 'zustand';

export type MsgType = {
  type: 'info' | 'success' | 'warning' | 'error';
  content?: string | number;
  setMessage?: ({
    type,
    content,
  }: {
    type: MsgType['type'];
    content: MsgType['content'];
  }) => void;
  closable?: boolean;
  setClosable?: (bol: boolean) => void;
};
export const messageStore = create<MsgType>((set) => ({
  type: 'info',
  content: '',
  setMessage: ({ type, content }) =>
    set(() => ({
      type,
      content,
    })),
  closable: true,
  setClosable: (bol) => set(() => ({ closable: bol })),
}));

export const Message: React.FC<{
  type?: TypeAttributes.Status;
  content: string;
}> = ({ type, content }) => {
  // const { type, content, closable, setClosable } = messageStore.getState();

  // useEffect(() => {
  //   setClosable(false);
  // }, [type, content]);
  // useEffect(() => {
  //   setTimeout(() => {
  //     // setClosable(false);
  //     // toaster.push(<MessageComponent>MessageComponent</MessageComponent>);
  //     toaster.push(<Notification>message</Notification>, {
  //       placement: 'topEnd',
  //     });
  //   }, 2000);
  // }, []);

  return (
    <>
      <MessageComponent
        // full
        showIcon
        type={type}
        // closable={closable}
        closable={false}
        // duration={0}
        // onClose={() => {
        //   setClosable(true);
        // }}
      >
        {content}
      </MessageComponent>
    </>
  );
};
