import * as t from 'io-ts';

import {
	makeDecoder,
	UserCodec,
	LobbyInitCodec,
	ChallengeCodec,
	AcceptChallengeCodec,
	MatchCodec,
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

export type LobbyState = t.TypeOf<typeof LobbyInitCodec>;
export const LobbyModule = {
	initialState: {
		users: [],
		challenges: [],
	} as LobbyState,

	reducers: {
		init: makeReducer(LobbyInitCodec)<LobbyState>(
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

export type UserState = t.TypeOf<typeof UserCodec>;
export const UserModule = {
	initialState: {
		username: 'guest',
		rating: 1500,
	} as UserState,

	reducers: {
		init: makeReducer(UserCodec)<UserState>((state, newState) => newState),

		update: makeReducer(t.partial(UserCodec.props))<UserState>(
			(state, updates) => ({ ...state, ...updates }),
		),
	},
};

export type MatchState = t.TypeOf<typeof MatchCodec>;
export const MatchModule = {
	initialState: {} as MatchState,

	reducers: {
		init: makeReducer(MatchCodec)<MatchState>((state, newState) => newState),
	},
};
