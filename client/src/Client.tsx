import { Client } from 'boardgame.io/react';

import { gameDefinition } from 'game-of-kings-common';
import Board from './Board';

export default Client({
	game: gameDefinition,
	board: Board,
	multiplayer: { server: '/' },
});
