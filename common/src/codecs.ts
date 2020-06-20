import * as t from 'io-ts';

const opt = <InnerType extends t.Any>(type: InnerType) =>
	t.union([type, t.undefined]);
const orNull = <InnerType extends t.Any>(type: InnerType) =>
	t.union([type, t.null]);

export const SubMsgCodec = t.string;
export const UnsubMsgCodec = t.string;

export const AuthCodec = t.strict({ token: t.string });

export const UserCodec = t.strict({
	username: t.string,
	rating: t.number,
});

export const VariantCodec = t.strict({
	radius: t.number,
	spawnsAvailable: t.number,
});

export const ChallengeCodec = t.strict({
	id: t.string,
	challengerId: t.string,
	opponentId: opt(t.string),
	ratingMin: opt(t.number),
	ratingMax: opt(t.number),
	variant: VariantCodec,
	acceptDate: opt(t.number),
	matchId: opt(t.string),
});
export const LobbyStateCodec = t.strict({
	users: t.array(t.string),
	challenges: t.array(ChallengeCodec),
});
export const AcceptChallengeCodec = t.strict({
	challengeId: t.string,
	acceptorId: t.string,
	acceptDate: t.number,
	matchId: t.string,
});

export const PieceCodec = t.strict({
	playerIndex: t.number,
	type: t.keyof({ king: null, pawn: null }),
});
export const MoveCodec = t.strict({
	type: t.keyof({
		movePiece: null,
		spawnPiece: null,
		offerDraw: null,
		resign: null,
	}),
	date: t.number,
});
export const moveTypeCodecs = {
	movePiece: t.strict({
		...MoveCodec.type.props,
		fromIndex: t.number,
		toIndex: t.number,
	}),
	spawnPiece: t.strict({
		...MoveCodec.type.props,
		fromIndex: t.number,
		toIndex: t.number,
	}),
	offerDraw: t.strict({ ...MoveCodec.type.props }),
	resign: t.strict({ ...MoveCodec.type.props }),
};
export const MatchCodec = t.strict({
	variant: VariantCodec,
	log: t.array(MoveCodec),
	players: t.array(
		t.strict({
			userId: t.string,
			spawnsAvailable: t.number,
			timeForMove: t.number,
		}),
	),
	playerToMove: t.number,
	cells: t.array(orNull(PieceCodec)),
	status: t.keyof({
		playing: null,
		aborted: null,
		drawn: null,
		won: null,
	}),
	winner: opt(t.number),
});
