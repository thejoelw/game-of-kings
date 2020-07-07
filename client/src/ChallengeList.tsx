import React from 'react';
import { List } from 'semantic-ui-react';

import { LobbyState } from 'game-of-kings-common';

import ChallengeItem from './ChallengeItem';

export default ({
  challenges,
  users,
}: {
  challenges: LobbyState['challenges'];
  users: LobbyState['users'];
}) => (
  <List divided relaxed>
    {challenges.map(ChallengeItem)}
  </List>
);
