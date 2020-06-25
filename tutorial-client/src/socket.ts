import { connect } from 'game-of-kings-common';

const getEnvVar = (key: string) => {
	const val = process.env[key];
	if (!val) {
		throw new Error(`Must specify a ${key} env var`);
	}
	return val;
};

export const userId = 'd5844cd7-62f8-4f75-9116-550e894ae5a0';
const token =
	'6b0cdbb07552b22f76e519884f120ba27f7574c696fd3ac7d0309b71fb64e0b6a3e61c05136d13e7c5a1d7135db85b3842d638dfb986525dbe99942ebc881386';

const conn = connect(
	getEnvVar('GOK_SERVER_URL'),
	userId,
	token,
);

export const send = (event: string, ...args: any[]) =>
	conn.socket.emit(event, ...args);

export const onModuleUpdate = conn.onModuleUpdate;
