import React from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { Link } from 'react-router-dom';
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
      data?: { id: string; rating: number };
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
                return (
                  <List.Item
                    key={gameID}
                    as={Link}
                    to={
                      isJoined && players.length === 2
                        ? `/match/${gameID}`
                        : undefined
                    }
                    onClick={
                      isJoined
                        ? undefined
                        : () =>
                            axios
                              .post(
                                `/games/${gameDefinition.name}/${gameID}/join`,
                                {
                                  playerID: 0,
                                  playerName: 'joel',
                                  data: {
                                    id: 'abc',
                                    rating: 700,
                                  },
                                },
                              )
                              .then((resp) => resp.data.playerCredentials)
                              .then((a) => console.log(a))
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
          }
        >
          Create Game
        </Button>
      </Segment>
    </>
  );
};
