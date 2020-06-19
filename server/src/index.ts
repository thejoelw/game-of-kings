import { v4 as uuid } from 'uuid';

import { LobbyModule, UserModule, MatchModule } from 'game-of-kings-common';

import { createModuleInstance } from './modules';
import { io } from './io';

(async () => {
	const lobby = await createModuleInstance('lobby', LobbyModule);

	io.on('connection', async (socket) => {
		const userId = socket.request._query['userId'];
		const user = await createModuleInstance(`user-${userId}`, UserModule);

		socket.on('user-rename', (data: any) =>
			user.actors.update({ username: data }),
		);

		socket.on('lobby-extend-challenge', lobby.actors.extendChallenge);
		socket.on('lobby-retract-challenge', lobby.actors.retractChallenge);

		socket.on('lobby-accept-challenge', async (data: any) => {
			const matchId = uuid();

			const match = await createModuleInstance(`match-${matchId}`, MatchModule);

			lobby.actors.acceptChallenge({
				...data,
				acceptDate: Date.now(),
				matchId,
			});
		});
	});
})();
