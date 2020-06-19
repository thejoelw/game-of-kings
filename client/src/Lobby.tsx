import React from 'react';

import { LobbyModule } from 'game-of-kings-common';

import Client from './Client';
import MatchList from './MatchList';
import { useModule } from './socket';

const Lobby = () => {
  const { users, challenges } = useModule('lobby', LobbyModule);
  return <MatchList users={users} challenges={challenges} />;
};

export default Lobby;
