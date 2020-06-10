import { Client } from 'boardgame.io/react';
import { MCTSBot } from 'boardgame.io/ai';

import Game from '../common/Game';
import Board from './Board';

export default Client({
  game: Game,
  board: Board,
  multiplayer: { server: '/' },
});
