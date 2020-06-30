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
	MatchPartialCodec,
	DoMoveCodec,
	TimeoutCodec,
	ChatCodec,
	reduceMove,
	isCheckmated,
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

		update: makeReducer(t.partial(UserCodec.type.props))<User>(
			(state, updates) => ({
				...state,
				...updates,
			}),
		),
	},
};

export const MatchModule = {
	initialState: UNINITIALIZED as Match,

	reducers: {
		reset: makeReducer(MatchCodec)<Match>((state, newState) => newState),

		resetPartial: makeReducer(MatchPartialCodec)<Match>(
			(state, updateState) => ({
				...state,
				...updateState,
				players: state.players.map((p, i) =>
					updateState.players && updateState.players[i]
						? { ...p, ...updateState.players[i] }
						: p,
				),
			}),
		),

		doMove: makeReducer(DoMoveCodec)<Match>((state, move) => {
			const reduction = reduceMove(state, move);
			state = {
				...state,
				...reduction,
				players: state.players.map((p, i) => ({
					...p,
					...reduction.players[i],
				})),
			};

			state = {
				...state,
				log: state.log.concat([move]),
				players: state.players.map((p, i) =>
					i === state.playerToMove
						? {
								...p,
								timeForMoveMs:
									p.timeForMoveMs -
									(move.date - state.moveStartDate) +
									state.variant.timeIncrementMs,
						  }
						: p,
				),
				moveStartDate: move.date,
			};

			if (isCheckmated(state)) {
				state.status = 'checkmate';
				state.winner = 1 - state.playerToMove;
			} else if (
				state.log.length >= 2 &&
				state.log.slice(-2).every((l) => l.type === 'pass')
			) {
				state.status = 'drawn';
			}

			return state;
		}),

		timeout: makeReducer(TimeoutCodec)<Match>((state, { winner }) => ({
			...state,
			status: 'timeout',
			winner,
		})),

		chat: makeReducer(ChatCodec)<Match>((state, chat) => ({
			...state,
			chat: state.chat.concat([chat]),
		})),
	},
};
