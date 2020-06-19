import React from 'react';
import { useParams } from 'react-router-dom';

import Client from './Client';
import { userId } from './user';

import { getGame } from './requests';

export default () => {
	const { matchId } = useParams();

	const [playerId, setPlayerId] = React.useState<number | undefined>();
	React.useEffect(() => {
		getGame(matchId)
			.then((g) => g.players.findIndex((p) => p.data && p.data.id === userId))
			.then((index) => (index !== -1 ? index : undefined))
			.then(setPlayerId);
	}, [matchId, userId]);

	return playerId === undefined ? (
		<p style={{ padding: '1em' }}>Loading...</p>
	) : (
		<Client
			debug={false}
			gameID={matchId}
			playerID={playerId.toString()}
			credentials={localStorage.getItem(`gok-creds-${matchId}`)}
		/>
	);
};
