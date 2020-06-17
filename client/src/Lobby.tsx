import React from 'react';

import Client from './Client';
import MatchList from './MatchList';
import withEndpoint from './withEndpoint';
import { getLobby, LobbyResponseType } from './requests';

const Lobby = ({ endpointData }: { endpointData?: LobbyResponseType }) => {
  return <MatchList rooms={endpointData && endpointData.rooms} />;
};

export default withEndpoint(getLobby, Lobby);
