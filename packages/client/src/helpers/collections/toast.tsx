// import { Message, MsgType } from '~/components/Message';
import { toaster, Notification, Message, MessageProps } from 'rsuite';
import React from 'react';
import { PlacementType } from 'rsuite/esm/toaster/ToastContainer';

export class Toast {
  static message(props: {
    type: MessageProps['type'];
    content: string;
    placement: PlacementType;
  }) {
    // ;
    toaster.push(
      <Message showIcon {...props}>
        {props.content}
      </Message>,
      {
        placement: props.placement || 'topCenter',
        // ...props,
        // container:（）=> document.body,
      },
    );
  }
}
