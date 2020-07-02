import * as t from 'io-ts';

const opt = <InnerType extends t.Any>(type: InnerType) =>
	t.union([type, t.undefined]);
const orNull = <InnerType extends t.Any>(type: InnerType) =>
	t.union([type, t.null]);

const NonNegIntCodec = t.brand(
	t.number,
	(n): n is t.Branded<number, { readonly NonNegInt: symbol }> =>
		n >= 0 && Number.isInteger(n),
	'NonNegInt',
);

export const SubMsgCodec = t.string;
export const UnsubMsgCodec = t.string;

export const AuthCodec = t.strict({
	token: t.string,
});

export const RatingCodec = t.strict({
	mean: t.number,
	std: t.number,
	volatility: t.number,
});
export const UserCodec = t.strict({
	username: t.string,
	rating: RatingCodec,
});
export const MatchResultCodec = t.strict({
	opponentRating: RatingCodec,
	result: t.number,
	stakes: NonNegIntCodec,
});

export const VariantCodec = t.strict({
	radius: NonNegIntCodec,
	formation: t.keyof({
		tutorial: null,
		monarchy: null,
		diarchy: null,
		triarchy: null,
		colonies: null,
	}),
	spawnsAvailable: NonNegIntCodec,
	timeInitialMs: NonNegIntCodec,
	timeIncrementMs: NonNegIntCodec,
	stakes: NonNegIntCodec,
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

export const MovePieceMoveCodec = t.strict({
	type: t.literal('movePiece'),
	fromIndex: t.number,
	toIndex: t.number,
});
export const SpawnPieceMoveCodec = t.strict({
	type: t.literal('spawnPiece'),
	fromIndex: t.number,
	toIndex: t.number,
});
export const PassMoveCodec = t.strict({
	type: t.literal('pass'),
});
export const ResignMoveCodec = t.strict({
	type: t.literal('resign'),
});
export const MoveCodec = t.union([
	MovePieceMoveCodec,
	SpawnPieceMoveCodec,
	PassMoveCodec,
	ResignMoveCodec,
]);
export const DoMoveCodec = t.intersection([
	t.strict({
		date: t.number,
	}),
	MoveCodec,
]);

export const AbortCodec = t.strict({});
export const TimeoutCodec = t.strict({
	winner: t.number,
});
export const ChatCodec = t.strict({
	date: t.number,
	userId: t.string,
	msg: t.string,
});
export const MatchCodec = t.strict({
	variant: VariantCodec,
	log: t.array(DoMoveCodec),
	players: t.array(
		t.strict({
			userId: t.string,
			spawnsAvailable: t.number,
			timeForMoveMs: t.number,
		}),
	),
	playerToMove: t.number,
	moveStartDate: t.number,
	cells: t.array(orNull(PieceCodec)),
	chat: t.array(ChatCodec),
	status: t.keyof({
		playing: null,
		aborted: null,
		drawn: null,
		checkmate: null,
		timeout: null,
	}),
	winner: opt(t.number),
});
export const MatchPartialCodec = t.exact(
	t.partial({
		...MatchCodec.type.props,
		players: t.array(
			t.exact(t.partial(MatchCodec.type.props.players.type.type.props)),
		),
	}),
);
