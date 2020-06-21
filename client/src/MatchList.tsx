import React from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { Link, Redirect } from 'react-router-dom';
import { Segment, List, Button } from 'semantic-ui-react';

import { LobbyState } from 'game-of-kings-common';

import { userId } from './user';
import { send } from './socket';
import UserBadge from './UserBadge';

export default ({
  challenges,
  users,
}: {
  challenges: LobbyState['challenges'];
  users: LobbyState['users'];
}) => (
  <>
    <Segment>
      <List>
        {challenges.map(
          ({ id, challengerId, opponentId, variant, matchId }) => {
            const isMine = challengerId === userId;

            if ((challengerId === userId || opponentId === userId) && matchId) {
              return <Redirect to={`/match/${matchId}`} />;
            }

            return (
              <List.Item
                key={id}
                onClick={
                  isMine
                    ? () => send('lobby-retract-challenge', id)
                    : () =>
                        send('lobby-accept-challenge', {
                          challengeId: id,
                          acceptorId: userId,
                        })
                }
              >
                <List.Content>
                  <List.Header>Join Match</List.Header>
                  <List.Description>
                    <UserBadge userId={challengerId} />
                  </List.Description>
                </List.Content>
              </List.Item>
            );
          },
        )}
      </List>

      <Button
        onClick={() =>
          send('lobby-extend-challenge', {
            id: uuid(),
            challengerId: userId,
            variant: {
              radius: 5,
              spawnsAvailable: 12,
              timeInitialMs: 5 * 60 * 1000,
              timeIncrementMs: 8 * 1000,
            },
          })
        }
      >
        Create Game
      </Button>
    </Segment>
  </>
);
