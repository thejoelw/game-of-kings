import React from 'react';

import Client from './Client';
import MatchList from './MatchList';

import { LobbyResponse } from '../common/protocol';
import withEndpoint from './withEndpoint';

const Lobby = ({ endpointData }: { endpointData?: LobbyResponse }) => {
  return <MatchList lobbyData={endpointData} />;
};

export default withEndpoint<LobbyResponse>('/lobby', Lobby);
