import * as t from 'io-ts';

import {
	makeDecoder,
	LobbyStateCodec,
	LobbyState,
	ChallengeCodec,
	AcceptChallengeCodec,
	UserCodec,
	User,
	MatchCodec,
	Match,
	Move,
	moveTypeCodecs,
} from '.';

const opt = <InnerType extends t.Any>(type: InnerType) =>
	t.union([type, t.undefined]);

const makeReducer = <CodecType extends t.Any>(codec: CodecType) => {
	const decoder = makeDecoder(codec);
	return <StateType>(
		cb: (state: StateType, action: t.TypeOf<CodecType>) => StateType,
	) => (state: StateType, action: any) => cb(state, decoder(action));
};

const appendObj = <T extends { id: string }>(arr: T[], val: T) => {
	if (arr.some((el) => el.id === val.id)) {
		throw new Error(`Append violates unique id constraint for id ${val.id}`);
	}
	return arr.concat([val]);
};
const appendId = (arr: string[], val: string) => {
	if (arr.includes(val)) {
		throw new Error(`Append violates unique id constraint for id ${val}`);
	}
	return arr.concat([val]);
};

export const UNINITIALIZED = {};

export const LobbyModule = {
	initialState: {
		users: [],
		challenges: [],
	} as LobbyState,

	reducers: {
		reset: makeReducer(LobbyStateCodec)<LobbyState>(
			(state, newState) => newState,
		),

		join: makeReducer(t.string)<LobbyState>((state, userId) => ({
			...state,
			users: appendId(state.users, userId),
		})),
		leave: makeReducer(t.string)<LobbyState>((state, userId) => ({
			...state,
			users: state.users.filter((u) => u !== userId),
			challenges: state.challenges.filter((c) => c.challengerId !== userId),
		})),

		extendChallenge: makeReducer(ChallengeCodec)<LobbyState>(
			(state, challenge) => ({
				...state,
				challenges: appendObj(
					state.challenges.filter(
						(c) => c.challengerId !== challenge.challengerId,
					),
					challenge,
				),
			}),
		),
		retractChallenge: makeReducer(t.string)<LobbyState>((state, id) => ({
			...state,
			challenges: state.challenges.filter((c) => c.id !== id),
		})),

		acceptChallenge: makeReducer(AcceptChallengeCodec)<LobbyState>(
			(state, { challengeId, acceptorId, acceptDate, matchId }) => ({
				...state,
				challenges: state.challenges.map((c) =>
					c.id === challengeId
						? { ...c, opponentId: acceptorId, acceptDate, matchId }
						: c,
				),
			}),
		),
	},
};

export const UserModule = {
	initialState: {
		username: 'guest',
		rating: 1500,
	} as User,

	reducers: {
		reset: makeReducer(UserCodec)<User>((state, newState) => newState),

		update: makeReducer(t.partial(UserCodec.props))<User>((state, updates) => ({
			...state,
			...updates,
		})),
	},
};

const doBaseMove = (state: Match, move: Move) => ({
	...state,
	log: state.log.concat([move]),
	playerToMove: (state.playerToMove + 1) % state.players.length,
});
export const MatchModule = {
	initialState: UNINITIALIZED as Match,

	reducers: {
		reset: makeReducer(MatchCodec)<Match>((state, newState) => newState),

		movePiece: makeReducer(moveTypeCodecs.movePiece)<Match>((state, move) =>
			doBaseMove(
				{
					...state,
					players:
						state.cells[move.fromIndex] &&
						state.cells[move.fromIndex]!.type === 'king' &&
						state.cells[move.toIndex]
							? state.players.map((p, i) =>
									i === state.playerToMove
										? { ...p, spawnsAvailable: p.spawnsAvailable + 1 }
										: p,
							  )
							: state.players,
					cells: state.cells.map((c, i) =>
						i === move.fromIndex
							? null
							: i === move.toIndex
							? state.cells[move.fromIndex]
							: c,
					),
				},
				move,
			),
		),

		spawnPiece: makeReducer(moveTypeCodecs.movePiece)<Match>((state, move) =>
			doBaseMove(
				{
					...state,
					players: state.players.map((p, i) =>
						i === state.playerToMove
							? { ...p, spawnsAvailable: p.spawnsAvailable - 1 }
							: p,
					),
					cells: state.cells.map((c, i) =>
						i === move.toIndex
							? { playerIndex: state.playerToMove, type: 'pawn' }
							: c,
					),
				},
				move,
			),
		),

		offerDraw: makeReducer(moveTypeCodecs.offerDraw)<Match>(
			(state, move) => state,
		),

		resign: makeReducer(moveTypeCodecs.resign)<Match>((state, move) => state),
	},
};
