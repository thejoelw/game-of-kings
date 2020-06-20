import { AuthCodec, makeDecoder } from 'game-of-kings-common';

import { io } from './io';

const auths = new Map<string, string>();

io.on('connection', (socket) => {
	const userId = socket.handshake.query['userId'];
	let authed = false;

	socket.use((packet, next) => {
		if (authed || packet[0] === 'auth') {
			next();
		} else {
			next(new Error('Not authenticated'));
		}
	});

	const authDecoder = makeDecoder(AuthCodec);
	socket.on('auth', (data: any) => {
		const { token } = authDecoder(data);

		if (auths.has(userId)) {
			authed = auths.get(userId) === token;
		} else {
			auths.set(userId, token);
			authed = true;
		}
	});
});
