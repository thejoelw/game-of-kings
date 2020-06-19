import * as t from 'io-ts';

const opt = <InnerType extends t.Any>(type: InnerType) =>
	t.union([type, t.undefined]);

export const SubMsgCodec = t.string;
export const UnsubMsgCodec = t.string;

export const UserCodec = t.type({
	username: t.string,
	rating: t.number,
});
export type User = t.TypeOf<typeof UserCodec>;

export const VariantCodec = t.type({
	radius: t.number,
	spawnsAvailable: t.number,
});

export const ChallengeCodec = t.type({
	id: t.string,
	challengerId: t.string,
	opponentId: opt(t.string),
	ratingMin: opt(t.number),
	ratingMax: opt(t.number),
	variant: VariantCodec,
	acceptDate: opt(t.number),
	matchId: opt(t.string),
});
export const LobbyInitCodec = t.type({
	users: t.array(t.string),
	challenges: t.array(ChallengeCodec),
});
export const AcceptChallengeCodec = t.type({
	challengeId: t.string,
	acceptorId: t.string,
	acceptDate: t.number,
	matchId: t.string,
});

export const PieceCodec = t.type({
	playerIndex: t.number,
	type: t.keyof({ king: null, pawn: null }),
});
export const MoveCodec = t.type({
	type: t.keyof({
		movePiece: null,
		spawnPiece: null,
		offerDraw: null,
		resign: null,
	}),
	fromIndex: opt(t.number),
	toIndex: opt(t.number),
	moveDate: t.number,
});
export const MatchCodec = t.type({
	variant: VariantCodec,
	log: t.array(MoveCodec),
	players: t.array(
		t.type({
			id: t.string,
			timeLeft: t.number,
		}),
	),
	cells: t.array(opt(PieceCodec)),
	status: t.keyof({
		aborted: null,
		playing: null,
		haveDraw: null,
		haveWinner: null,
	}),
	winner: opt(t.number),
});

/*
export const LobbyResponseCodec = t.type({
	rooms: t.array(
		t.type({
			gameID: t.string,
			setupData: t.type({}),
			players: t.array(
				t.type({
					id: t.number,
					name: opt(t.string),
					data: opt(UserCodec),
				}),
			),
		}),
	),
});

export const LoginResponseCodec = t.type({
	success: t.boolean,
	user: opt(UserCodec),
});

export const GameResponseCodec = t.type({
	roomID: t.string,
	setupData: t.type({}),
	players: t.array(
		t.type({
			id: t.number,
			name: opt(t.string),
			data: opt(UserCodec),
		}),
	),
});
*/
