import React from 'react';
import { useParams } from 'react-router-dom';

import Client from './Client';
import { useUser } from './user';

export default () => {
  const { matchId } = useParams();
  const user = useUser();

  return <Client debug={false} gameID={matchId} playerID={user.id} />;
};
