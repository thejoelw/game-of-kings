import { AuthCodec, makeDecoder } from 'game-of-kings-common';

import { io } from './io';

const auths = new Map<string, string>();

// Add tutorial-client auth
export const tutorialUserId = 'd5844cd7-62f8-4f75-9116-550e894ae5a0';
auths.set(
	tutorialUserId,
	'6b0cdbb07552b22f76e519884f120ba27f7574c696fd3ac7d0309b71fb64e0b6a3e61c05136d13e7c5a1d7135db85b3842d638dfb986525dbe99942ebc881386',
);

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
