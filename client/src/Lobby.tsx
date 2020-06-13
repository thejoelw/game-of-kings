import React from 'react';
import * as t from 'io-ts';

import Client from './Client';
import MatchList from './MatchList';

import { gameDefinition } from 'game-of-kings-common';
import withEndpoint from './withEndpoint';

const LobbyResponseType = t.type({
  rooms: t.array(
    t.type({
      gameID: t.string,
      setupData: t.type({}),
      players: t.array(
        t.type({
          id: t.number,
          name: t.union([t.string, t.undefined]),
          data: t.union([
            t.type({
              id: t.string,
              rating: t.number,
            }),
            t.undefined,
          ]),
        }),
      ),
    }),
  ),
});

interface LobbyResponseType {
  rooms: { gameID: string; players: { id: string }[]; setupData: any }[];
}

const Lobby = ({
  endpointData,
}: {
  endpointData?: t.TypeOf<typeof LobbyResponseType>;
}) => {
  return <MatchList rooms={endpointData && endpointData.rooms} />;
};

export default withEndpoint(
  `/games/${gameDefinition.name}`,
  LobbyResponseType,
  Lobby,
);
