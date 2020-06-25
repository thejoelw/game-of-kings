import * as t from 'io-ts';

import {
	SubMsgCodec,
	UnsubMsgCodec,
	AuthCodec,
	UserCodec,
	VariantCodec,
	ChallengeCodec,
	LobbyStateCodec,
	AcceptChallengeCodec,
	PieceCodec,
	MoveCodec,
	TimeoutCodec,
	ChatCodec,
	MatchCodec,
} from '.';

export type SubMsg = t.TypeOf<typeof SubMsgCodec>;
export type UnsubMsg = t.TypeOf<typeof UnsubMsgCodec>;
export type Auth = t.TypeOf<typeof AuthCodec>;
export type User = t.TypeOf<typeof UserCodec>;
export type Variant = t.TypeOf<typeof VariantCodec>;
export type Challenge = t.TypeOf<typeof ChallengeCodec>;
export type LobbyState = t.TypeOf<typeof LobbyStateCodec>;
export type AcceptChallenge = t.TypeOf<typeof AcceptChallengeCodec>;
export type Piece = t.TypeOf<typeof PieceCodec>;
export type Move = t.TypeOf<typeof MoveCodec>;
export type Timeout = t.TypeOf<typeof TimeoutCodec>;
export type Chat = t.TypeOf<typeof ChatCodec>;
export type Match = t.TypeOf<typeof MatchCodec>;
