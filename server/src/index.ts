import { v4 as uuid } from 'uuid';

import {
	LobbyModule,
	UserModule,
	MatchModule,
	makeCells,
	makeDecoder,
	MoveCodec,
	moveTypeCodecs,
	enumerateMoves,
} from 'game-of-kings-common';

import './auth';
import { createModuleInstance, getModuleInstance } from './modules';
import { io } from './io';

const shuffleInPlace = <T>(arr: T[]) => {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
};

const hasOwnProperty = <X extends {}, Y extends PropertyKey>(
	obj: X,
	prop: Y,
): obj is X & Record<Y, unknown> => obj.hasOwnProperty(prop);

const moveDecoder = makeDecoder(MoveCodec);

(async () => {
	const lobby = await createModuleInstance('lobby', LobbyModule);

	io.on('connection', async (socket) => {
		const userId = socket.handshake.query['userId'];

		const user = await createModuleInstance(`user-${userId}`, UserModule);

		socket.on('user-rename', (data: any) =>
			user.actors.update({ username: data }),
		);

		socket.on('lobby-extend-challenge', lobby.actors.extendChallenge);
		socket.on('lobby-retract-challenge', lobby.actors.retractChallenge);

		socket.on('lobby-accept-challenge', async (data: any) => {
			const challenge = lobby
				.getState()
				.challenges.find((c) => c.id === data.challengeId);
			if (!challenge) {
				throw new Error(`Invalid challengeId: ${data.challengeId}`);
			}

			const matchId = uuid();

			const match = await createModuleInstance(`match-${matchId}`, MatchModule);
			match.actors.reset({
				variant: challenge.variant,
				log: [],
				players: shuffleInPlace([challenge.challengerId, userId]).map(
					(userId) => ({
						userId,
						spawnsAvailable: challenge.variant.spawnsAvailable,
						timeForMove: 5 * 60 * 1000,
					}),
				),
				playerToMove: 0,
				cells: makeCells(challenge.variant),
				status: 'playing',
				winner: undefined,
			});

			lobby.actors.acceptChallenge({
				...data,
				acceptDate: Date.now(),
				matchId,
			});
		});

		socket.on('match-do-move', async (data: any) => {
			const match = await getModuleInstance(
				`match-${data.matchId}`,
				MatchModule,
			);
			if (!match) {
				throw new Error(`Invalid matchId: ${data.matchId}`);
			}

			const candidateMoves = enumerateMoves(
				match.getState().variant,
				match.getState().players,
				match.getState().playerToMove,
				match.getState().cells,
				true,
			);

			if (
				!candidateMoves.some((m) =>
					Object.entries(m).every(([k, v]) => data[k] === v),
				)
			) {
				throw new Error(`Invalid move: ${JSON.stringify(data)}`);
			}

			const { type } = moveDecoder(data);
			match.actors[type]({ ...data, date: Date.now() });
		});
	});
})();
