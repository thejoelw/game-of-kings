import { Socket } from 'socket.io';

import { makeDecoder, SubMsgCodec, UnsubMsgCodec } from 'game-of-kings-common';

import { io } from './io';

export type ModuleInstance<StateType, ReducersType> = {
	actors: { [key in keyof ReducersType]: (data: any) => void };
	getState: () => StateType;
	join: (userId: string) => void;
	leave: (userId: string) => void;
};
export type GenericModuleInstance = ModuleInstance<any, Record<string, never>>;

const moduleInstances = new Map<string, GenericModuleInstance>();

/*
setInterval(
	() =>
		moduleInstances.forEach((inst, key) => {
			if (inst.getJoinedCount() === 0) {
				moduleInstances.delete(key);
			}
		}),
	10000,
);
*/

export const getModuleInstance = async <
	StateType,
	ReducersType extends Record<
		string,
		(state: StateType, action: any) => StateType
	>
>(
	name: string,
	defn: {
		initialState: StateType;
		reducers: ReducersType;
	},
): Promise<ModuleInstance<StateType, ReducersType>> => {
	if (moduleInstances.has(name)) {
		return moduleInstances.get(name) as (ModuleInstance<
			StateType,
			ReducersType
		>);
	} else {
		throw new Error(`Module ${name} does not exist`);
	}
};

export const createModuleInstance = async <
	StateType,
	ReducersType extends Record<
		string,
		(state: StateType, action: any) => StateType
	>
>(
	name: string,
	defn: {
		initialState: StateType;
		reducers: ReducersType;
	},
): Promise<ModuleInstance<StateType, ReducersType>> => {
	if (moduleInstances.has(name)) {
		return moduleInstances.get(name)! as ModuleInstance<
			StateType,
			ReducersType
		>;
	}

	let state: StateType = defn.initialState;

	const actors: Record<string, (action: any) => void> = {};

	Object.entries(defn.reducers).forEach(([k, reducer]) => {
		actors[k] = async (action: any) => {
			state = reducer(state, action);
			io.to(name).emit(`${name}-${k}`, action);
		};
	});

	const inst = {
		actors: actors as { [key in keyof ReducersType]: (data: any) => void },
		getState: () => state,
		join: (userId: string) => {
			if (actors.hasOwnProperty('join')) {
				actors.join(userId);
			}
		},
		leave: (userId: string) => {
			if (actors.hasOwnProperty('leave')) {
				actors.leave(userId);
			}
		},
	};

	moduleInstances.set(name, inst);
	return inst;
};

io.on('connection', (socket) => {
	console.log(`Socket with id ${socket.id} just connected`);

	const userId = socket.handshake.query['userId'];

	// Gotta block joining/leaving rooms due to https://github.com/socketio/socket.io/issues/3562
	let roomPromise: Promise<void> = Promise.resolve();

	const subDecoder = makeDecoder(SubMsgCodec);
	socket.on('sub', async (data: any) => {
		const name = subDecoder(data);

		const inst = await getModuleInstance(name, {
			initialState: {},
			reducers: {},
		});

		roomPromise = roomPromise.then(() => {
			if (!socket.rooms.hasOwnProperty(name)) {
				return new Promise((resolve) =>
					socket.join(name, () => {
						inst.join(userId);
						socket.emit(`${name}-reset`, inst.getState());

						resolve();
					}),
				);
			}
		});
	});

	const unsubDecoder = makeDecoder(UnsubMsgCodec);
	socket.on('unsub', async (data: any) => {
		const name = unsubDecoder(data);

		const inst = await getModuleInstance(name, {
			initialState: {},
			reducers: {},
		});

		roomPromise = roomPromise.then(() => {
			if (socket.rooms.hasOwnProperty(name)) {
				return new Promise((resolve) =>
					socket.leave(name, () => {
						inst.leave(userId);

						resolve();
					}),
				);
			}
		});
	});

	socket.on('disconnecting', (reason) => {
		Object.keys(socket.rooms).forEach(async (name) => {
			const inst = await getModuleInstance(name, {
				initialState: {},
				reducers: {},
			});

			inst.leave(userId);
		});
	});
});
