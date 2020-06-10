import React from 'react';
import axios from 'axios';

import { Modal, Button, Form, Input } from 'semantic-ui-react';

export default () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <Modal trigger={<Button>Login</Button>}>
      <Modal.Header>Login</Modal.Header>
      <Modal.Content image>
        <Form>
          <Form.Field>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Field>

          <Form.Field>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Field>

          <Button
            type="submit"
            onClick={() =>
              axios
                .post('/login', { username, password })
                .then((resp) => resp.data.success && onClose())
            }
          >
            Log In
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};
