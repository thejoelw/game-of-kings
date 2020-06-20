import React from 'react';
import { v4 as uuid } from 'uuid';

import { userId, token } from './user';

const ioParams = new URLSearchParams();
ioParams.set('userId', userId);
const socket = io('/', { query: ioParams.toString() });

socket.on('error', (err: any) => console.error(err));

export const send = (event: string, ...args: any[]) =>
	socket.emit(event, ...args);

send('auth', { token });

const modules = new Map<
	string,
	{
		defn: {
			initialState: any;
			reducers: Record<string, (state: any, action: any) => any>;
		};
		state: any;
		listeners: ((state: any) => void)[];
		unsub: () => void;
	}
>();

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

		let mod = modules.get(name);
		if (mod) {
			if (defn !== mod.defn) {
				throw new Error(
					`Two useModule calls with same name ${name} have different definitions!`,
				);
			}
			mod.listeners.push(setState);
			setState(mod.state);
		} else {
			mod = {
				defn,
				state: defn.initialState,
				listeners: [setState],
				unsub: () => unsubs.forEach((cb) => cb()),
			};
			modules.set(name, mod);

			const unsubs = Object.entries(defn.reducers)
				.map(([k, reducer]) => {
					const eventType = `${name}-${k}`;

					const cb = (action: any) => {
						if (!mod) {
							throw new Error('Something went very wrong');
						}
						console.log(mod.state);
						mod.state = reducer(mod.state, action);
						mod.listeners.forEach((setter) => setter(mod!.state));
					};

					socket.on(eventType, cb);
					return () => socket.off(eventType, cb);
				})
				.concat([() => socket.emit('unsub', name)]);

			socket.emit('sub', name);
		}

		return () => {
			if (!mod) {
				throw new Error('Something went very wrong');
			}

			const index = mod.listeners.indexOf(setState);
			if (index === -1) {
				throw new Error(`setState doesn't exist in listener list!`);
			}
			mod.listeners.splice(index, 1);
			if (mod.listeners.length === 0) {
				mod.unsub();
				modules.delete(name);
			}
		};
	}, [name, defn]);

	return state;
};

export const useLatency = () => {
	const [latency, setLatency] = React.useState<number | undefined>(undefined);

	React.useEffect(() => {
		socket.on('pong', setLatency);
		return () => {
			socket.off('pong', setLatency);
		};
	}, []);

	return latency;
};
