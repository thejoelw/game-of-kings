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

export default () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [status, setStatus] = React.useState<
    'closed' | 'input' | 'loading' | 'bad auth' | 'error'
  >('closed');

  return (
    <Modal
      trigger={
        <div style={{ cursor: 'pointer' }} onClick={() => setStatus('input')}>
          Login
        </div>
      }
      open={status !== 'closed'}
      onClose={() => setStatus('closed')}
    >
      <Modal.Header>Login</Modal.Header>
      <Modal.Content image>
        <Dimmer active={status === 'loading'}>
          <Loader />
        </Dimmer>
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
            onClick={() => {
              setStatus('loading');
              axios
                .post('/login', { username, password })
                .then((resp) => resp.data)
                .catch((err) => {
                  if (err.code === 405) {
                    return { success: false };
                  } else {
                    setStatus('error');
                    throw err;
                  }
                })
                .then(({ success, user }) =>
                  setStatus(success ? 'closed' : 'bad auth'),
                )
                .catch((err) => console.error(err));
            }}
          >
            Log In
          </Button>
        </Form>

        {status === 'bad auth' && (
          <Message negative>
            <Message.Header>There was a problem logging in</Message.Header>
            <p>Your username or password was incorrect</p>
          </Message>
        )}
        {status === 'error' && (
          <Message negative>
            <Message.Header>There was a problem logging in</Message.Header>
            <p>Internal server error</p>
          </Message>
        )}
      </Modal.Content>
    </Modal>
  );
};
