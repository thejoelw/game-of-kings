import React from 'react';
import { useParams } from 'react-router-dom';

import { MatchModule, UNINITIALIZED } from 'game-of-kings-common';

import { useModule } from './socket';
import Board from './Board';

const Match = () => {
	const { matchId } = useParams();
	const match = useModule(`match-${matchId}`, MatchModule);
	console.log(match);

	if (match === UNINITIALIZED) {
		return <>Loading...</>;
	} else {
		return <Board matchId={matchId} match={match} />;
	}
};

export default Match;
