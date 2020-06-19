import React from 'react';
import axios from 'axios';
import {
  Modal,
  Button,
  Form,
  Input,
  Dimmer,
  Loader,
  Message,
} from 'semantic-ui-react';

import { send } from './socket';

export default () => {
  const [username, setUsername] = React.useState('');

  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <Modal
      trigger={
        <div style={{ cursor: 'pointer' }} onClick={() => setOpen(true)}>
          Set Username
        </div>
      }
      open={open}
      onClose={() => setOpen(false)}
    >
      <Modal.Header>Set Username</Modal.Header>
      <Modal.Content image>
        <Form>
          <Form.Field>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Field>

          <Button
            type="submit"
            onClick={() => {
              send('user-rename', username);
              setOpen(false);
            }}
          >
            Rename
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};
