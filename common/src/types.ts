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
	MovePieceMoveCodec,
	SpawnPieceMoveCodec,
	PassMoveCodec,
	ResignMoveCodec,
	MoveCodec,
	DoMoveCodec,
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
export type MovePieceMove = t.TypeOf<typeof MovePieceMoveCodec>;
export type SpawnPieceMove = t.TypeOf<typeof SpawnPieceMoveCodec>;
export type PassMove = t.TypeOf<typeof PassMoveCodec>;
export type ResignMove = t.TypeOf<typeof ResignMoveCodec>;
export type Move = t.TypeOf<typeof MoveCodec>;
export type DoMove = t.TypeOf<typeof DoMoveCodec>;
export type Timeout = t.TypeOf<typeof TimeoutCodec>;
export type Chat = t.TypeOf<typeof ChatCodec>;
export type Match = t.TypeOf<typeof MatchCodec>;
