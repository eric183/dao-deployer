import React from 'react';
import { Button, ButtonToolbar, Modal as ModalContent } from 'rsuite';

export const Modal: React.FC<{
  onCancel: () => void;
  text: string;
  open: boolean;
}> = ({ open, text, onCancel }) => {
  // const [, setOpen] = React.useState(false);
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);

  return (
    <div className="modal-container">
      <ButtonToolbar>
        <Button onClick={onCancel}>Disable</Button>
      </ButtonToolbar>

      <ModalContent
        backdrop="static"
        role="alertdialog"
        open={open}
        onClose={onCancel}
        size="xs"
      >
        <ModalContent.Body>
          {/* <RemindIcon
            style={{
              color: '#ffb300',
              fontSize: 24,
            }}
          /> */}
          {text}
        </ModalContent.Body>
        <ModalContent.Footer>
          <Button onClick={onCancel} appearance="primary">
            Ok
          </Button>
          <Button onClick={onCancel} appearance="subtle">
            Cancel
          </Button>
        </ModalContent.Footer>
      </ModalContent>
    </div>
  );
};
