import { Socket } from 'socket.io';

import { makeDecoder, SubMsgCodec, UnsubMsgCodec } from 'game-of-kings-common';

import { io } from './io';

export type ModuleInstance<StateType, ReducersType> = {
	actors: { [key in keyof ReducersType]: (data: any) => void };
	getState: () => StateType;
	join: (socket: Socket) => void;
	leave: (socket: Socket) => void;
	getJoinedCount: () => number;
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
): Promise<ModuleInstance<StateType, ReducersType> | undefined> => {
	return moduleInstances.get(name) as (
		| ModuleInstance<StateType, ReducersType>
		| undefined);
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
	let joinedCount = 0;

	const actors: Record<string, (action: any) => void> = {};

	Object.entries(defn.reducers).forEach(([k, reducer]) => {
		actors[k] = (action: any) => {
			console.log('Executing action:', k, action);

			state = reducer(state, action);
			io.to(name).emit(`${name}-${k}`, action);
		};
	});

	const inst = {
		actors: actors as { [key in keyof ReducersType]: (data: any) => void },
		getState: () => state,
		join: (socket: Socket) => {
			socket.emit(`${name}-reset`, state);
			joinedCount++;

			if (actors.hasOwnProperty('join')) {
				actors.join(socket.request._query['userId']);
			}
		},
		leave: (socket: Socket) => {
			if (actors.hasOwnProperty('leave')) {
				actors.leave(socket.request._query['userId']);
			}

			joinedCount--;
		},
		getJoinedCount: () => joinedCount,
	};

	moduleInstances.set(name, inst);
	return inst;
};

io.on('connection', (socket) => {
	const subDecoder = makeDecoder(SubMsgCodec);
	socket.on('sub', async (data: any) => {
		const name = subDecoder(data);
		const inst = await getModuleInstance(name, {
			initialState: {},
			reducers: {},
		});
		if (inst && !socket.rooms.hasOwnProperty(name)) {
			socket.join(name);
			inst.join(socket);
		}
	});

	const unsubDecoder = makeDecoder(UnsubMsgCodec);
	socket.on('unsub', async (data: any) => {
		const name = unsubDecoder(data);
		const inst = await getModuleInstance(name, {
			initialState: {},
			reducers: {},
		});
		if (inst && socket.rooms.hasOwnProperty(name)) {
			socket.leave(name);
			inst.leave(socket);
		}
	});

	socket.on('disconnecting', (reason) => {
		Object.keys(socket.rooms).forEach(async (name) => {
			const inst = await getModuleInstance(name, {
				initialState: {},
				reducers: {},
			});
			if (inst) {
				inst.leave(socket);
			}
		});
	});
});
