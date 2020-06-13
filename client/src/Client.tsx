import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';

import { gameDefinition } from 'game-of-kings-common';
import Board from './Board';

export default Client({
  game: gameDefinition,
  board: Board,
  multiplayer: SocketIO({ server: window.location.host }),
});
