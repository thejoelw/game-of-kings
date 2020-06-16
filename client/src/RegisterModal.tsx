import React from 'react';
import axios from 'axios';

import { Modal, Button, Form, Input } from 'semantic-ui-react';

export default () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  return (
    <Modal trigger={<div style={{ cursor: 'pointer' }}>Register</div>}>
      <Modal.Header>Register</Modal.Header>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={password !== confirmPassword}
            />
          </Form.Field>

          <Form.Field>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={password !== confirmPassword}
            />
          </Form.Field>

          <Button
            type="submit"
            disabled={password !== confirmPassword}
            onClick={() =>
              password === confirmPassword
                ? axios
                    .post('/register', { username, password })
                    .then((resp) => resp.data.success)
                : null
            }
          >
            Register
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};
