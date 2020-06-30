import * as t from 'io-ts';
import { v4 as uuid } from 'uuid';

import {
	LobbyModule,
	UserModule,
	MatchModule,
	makeCells,
	makeDecoder,
	MoveCodec,
	enumerateLegalMoves,
} from 'game-of-kings-common';

import { tutorialUserId } from './auth';
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

const moveDecoder = makeDecoder(
	t.intersection([MoveCodec, t.type({ matchId: t.string })]),
);
const matchTimeouts = new Map<string, NodeJS.Timeout>();

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

			const players = [challenge.challengerId, userId].map((userId) => ({
				userId,
				spawnsAvailable: challenge.variant.spawnsAvailable,
				timeForMoveMs: challenge.variant.timeInitialMs,
			}));

			const match = await createModuleInstance(`match-${matchId}`, MatchModule);
			match.actors.reset({
				variant: challenge.variant,
				log: [],
				players:
					challenge.challengerId === tutorialUserId
						? players
						: shuffleInPlace(players),
				playerToMove: 0,
				moveStartDate: Date.now(),
				cells: makeCells(challenge.variant),
				chat: [],
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
			data = { ...data, date: Date.now() };
			const { type, matchId } = moveDecoder(data);

			const match = await getModuleInstance(`match-${matchId}`, MatchModule);
			if (!match) {
				throw new Error(`Invalid matchId: ${matchId}`);
			}

			{
				const { players, playerToMove, status } = match.getState();

				if (status !== 'playing') {
					throw new Error(`You cannot move in an ${status} match`);
				}

				if (players[playerToMove].userId !== userId) {
					throw new Error(`You cannot move for that player`);
				}

				const candidateMoves = enumerateLegalMoves(match.getState());

				if (
					!candidateMoves.some((m) =>
						Object.entries(m).every(([k, v]) => data[k] === v),
					)
				) {
					throw new Error(`Invalid move: ${JSON.stringify(data)}`);
				}
			}

			if (matchTimeouts.has(matchId)) {
				clearTimeout(matchTimeouts.get(matchId)!);
				matchTimeouts.delete(matchId);
			}

			match.actors.doMove(data);

			{
				const { players, playerToMove, moveStartDate } = match.getState();

				if (playerToMove !== undefined) {
					const timeout = setTimeout(() => {
						matchTimeouts.delete(matchId);
						match.actors.timeout({ winner: 1 - playerToMove });
					}, moveStartDate + players[playerToMove].timeForMoveMs - Date.now());

					matchTimeouts.set(matchId, timeout);
				}
			}
		});

		if (userId === tutorialUserId) {
			socket.on('match-chat', async (data: any) => {
				data = { ...data, date: Date.now(), userId };

				const match = await getModuleInstance(
					`match-${data.matchId}`,
					MatchModule,
				);
				if (!match) {
					throw new Error(`Invalid matchId: ${data.matchId}`);
				}

				match.actors.chat(data);
			});

			socket.on('match-reset-partial', async (data: any) => {
				const match = await getModuleInstance(
					`match-${data.matchId}`,
					MatchModule,
				);
				if (!match) {
					throw new Error(`Invalid matchId: ${data.matchId}`);
				}

				match.actors.resetPartial(data);
			});
		}
	});
})();
