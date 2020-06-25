import React from 'react';
import { v4 as uuid } from 'uuid';

import { connect } from 'game-of-kings-common';

import { userId, token } from './user';

const conn = connect(
	'/',
	userId,
	token,
);

export const send = (event: string, ...args: any[]) =>
	conn.socket.emit(event, ...args);

export const useModule = <StateType>(
	name: string,
	defn: {
		initialState: StateType;
		reducers: Record<string, (state: StateType, action: any) => StateType>;
	},
) => {
	const [state, setState] = React.useState<StateType>(defn.initialState);

	React.useEffect(() => {
		console.log(`Restarting state for ${name}`);
		return conn.onModuleUpdate(name, defn, setState);
	}, [name, defn]);

	return state;
};

export const useLatency = () => {
	const [latency, setLatency] = React.useState<number | undefined>(undefined);

	React.useEffect(() => {
		conn.socket.on('pong', setLatency);
		return () => {
			conn.socket.off('pong', setLatency);
		};
	}, []);

	return latency;
};
