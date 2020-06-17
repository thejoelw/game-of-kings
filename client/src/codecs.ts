import * as t from 'io-ts';

const opt = <InnerType extends t.Any>(type: InnerType) =>
	t.union([type, t.undefined]);

export const UserCodec = t.type({
	id: t.string,
	username: t.string,
	rating: t.number,
});
export type User = t.TypeOf<typeof UserCodec>;

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
