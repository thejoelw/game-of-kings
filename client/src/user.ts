import { v4 as uuid } from 'uuid';

export const userId = localStorage.getItem('gok-user-id') || uuid();
localStorage.setItem('gok-user-id', userId);

const generateToken = () => {
	const data = new Uint8Array(64);
	window.crypto.getRandomValues(data);
	return Buffer.from(data).toString('hex');
};

export const token = localStorage.getItem('gok-token') || generateToken();
localStorage.setItem('gok-token', token);
