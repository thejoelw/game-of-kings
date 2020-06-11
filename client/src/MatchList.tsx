import React from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { Link } from 'react-router-dom';
import { Menu, Segment, List, Button } from 'semantic-ui-react';

import { LobbyResponse } from 'game-of-kings-common';
import { useUser } from './user';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

export default ({ lobbyData }: { lobbyData?: LobbyResponse }) => {
  const user = useUser();

  return (
    <>
      <Menu fixed="top">
        <LoginModal />
        <RegisterModal />
      </Menu>

      <Segment>
        <List>
          {lobbyData && lobbyData.matches
            ? lobbyData.matches.map((match) => {
                const isJoined = match.players.some(
                  (player) => player.id === user.id,
                );
                return (
                  <List.Item
                    key={match.id}
                    as={Link}
                    to={
                      isJoined && match.players.length === 2
                        ? `/match/${match.id}`
                        : undefined
                    }
                    onClick={
                      isJoined
                        ? undefined
                        : () => axios.post(`/join_match/${match.id}`)
                    }
                  >
                    <List.Content>
                      <List.Header>Join Match</List.Header>
                      <List.Description>
                        {match.players
                          .map((p) => `${p.username} (${p.rating})`)
                          .join(', ')}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                );
              })
            : 'loading...'}
        </List>

        <Button onClick={() => axios.post(`/join_match/${uuid()}`)}>
          Create Game
        </Button>
      </Segment>
    </>
  );
};
