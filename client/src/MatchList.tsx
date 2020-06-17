import React from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { Link, Redirect } from 'react-router-dom';
import { Segment, List, Button } from 'semantic-ui-react';

import { gameDefinition } from 'game-of-kings-common';
import { useUser } from './user';

export default ({
  rooms,
}: {
  rooms?: {
    gameID: string;
    players: {
      id: number;
      name?: string;
      data?: { id: string; username: string; rating: number };
    }[];
    setupData: any;
  }[];
}) => {
  const user = useUser();

  return (
    <>
      <Segment>
        <List>
          {rooms
            ? rooms.map(({ gameID, players }) => {
                const isJoined = players.some(
                  (player) => player.data && player.data.id === user.id,
                );

                if (isJoined && players.every((p) => p.data)) {
                  return <Redirect to={`/match/${gameID}`} />;
                }

                return (
                  <List.Item
                    key={gameID}
                    onClick={
                      isJoined
                        ? undefined
                        : () =>
                            axios
                              .post(
                                `/games/${gameDefinition.name}/${gameID}/join`,
                                {
                                  playerID: players.findIndex(
                                    (p) =>
                                      p.data === undefined ||
                                      p.data.id === user.id,
                                  ),
                                  playerName: user.username,
                                  data: user,
                                  isJoined,
                                },
                              )
                              .then((resp) => resp.data.playerCredentials)
                              .then((creds) =>
                                localStorage.setItem(
                                  `gok-creds-${gameID}`,
                                  creds,
                                ),
                              )
                    }
                  >
                    <List.Content>
                      <List.Header>Join Match</List.Header>
                      <List.Description>
                        {players
                          .filter((p) => p.name && p.data)
                          .map((p) => `${p.name} (${p.data!.rating})`)
                          .join(', ')}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                );
              })
            : 'loading...'}
        </List>

        <Button
          onClick={() =>
            axios
              .post(`/games/${gameDefinition.name}/create`, {
                numPlayers: 2,
                setupData: {},
                unlisted: false,
              })
              .then((resp) => resp.data.gameID)
              .then((gameId) =>
                axios
                  .post(`/games/${gameDefinition.name}/${gameId}/join`, {
                    playerID: 0,
                    playerName: user.username,
                    data: user,
                  })
                  .then((resp) => resp.data.playerCredentials)
                  .then((creds) =>
                    localStorage.setItem(`gok-creds-${gameId}`, creds),
                  ),
              )
          }
        >
          Create Game
        </Button>
      </Segment>
    </>
  );
};
