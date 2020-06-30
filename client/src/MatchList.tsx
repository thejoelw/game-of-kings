import React from 'react';
import axios from 'axios';
import { Link, Redirect } from 'react-router-dom';
import { Segment, List, Button } from 'semantic-ui-react';

import { LobbyState } from 'game-of-kings-common';

import { userId } from './user';
import { send } from './socket';
import UserBadge from './UserBadge';
import CreateGameModal from './CreateGameModal';

// const capitalize = (str:string) => str.charAt(0).toUpperCase() + str.slice(1);

export default ({
  challenges,
  users,
}: {
  challenges: LobbyState['challenges'];
  users: LobbyState['users'];
}) => (
  <>
    <Segment>
      <List divided relaxed>
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
                <div className="challenge">
                  <List.Header>
                    vs <UserBadge userId={challengerId} />
                  </List.Header>

                  <List.Description>
                    {variant.radius * 2 + 1}-cell {variant.formation},{' '}
                    {variant.spawnsAvailable} spawns,{' '}
                    {variant.timeInitialMs / (1000 * 60)}+
                    {variant.timeIncrementMs / 1000},{' '}
                    {
                      [
                        'casual',
                        'ranked',
                        '2x stakes',
                        '3x stakes',
                        '4x stakes',
                      ][variant.stakes]
                    }
                  </List.Description>
                </div>
              </List.Item>
            );
          },
        )}
      </List>

      <CreateGameModal />
    </Segment>
  </>
);
