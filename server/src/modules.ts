import { Socket } from 'socket.io';

import { makeDecoder, SubMsgCodec, UnsubMsgCodec } from 'game-of-kings-common';

import { io } from './io';

export type ModuleInstance = {
	actors: Record<string, (action: any) => void>;
	join: (socket: Socket) => void;
	leave: (socket: Socket) => void;
	getJoinedCount: () => number;
};

const moduleInstances = new Map<string, ModuleInstance>();
setInterval(
	() =>
		moduleInstances.forEach((inst, key) => {
			if (inst.getJoinedCount() === 0) {
				moduleInstances.delete(key);
			}
		}),
	10000,
);

export const getModuleInstance = async (name: string) => {
	return moduleInstances.get(name);
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
) => {
	if (moduleInstances.has(name)) {
		return moduleInstances.get(name)!;
	}

	let state = defn.initialState;
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
		actors,
		join: (socket: Socket) => {
			socket.emit(`${name}-init`, state);
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
		const inst = await getModuleInstance(name);
		if (inst && !socket.rooms.hasOwnProperty(name)) {
			socket.join(name);
			inst.join(socket);
		}
	});

	const unsubDecoder = makeDecoder(UnsubMsgCodec);
	socket.on('unsub', async (data: any) => {
		const name = unsubDecoder(data);
		const inst = await getModuleInstance(name);
		if (inst && socket.rooms.hasOwnProperty(name)) {
			socket.leave(name);
			inst.leave(socket);
		}
	});

	socket.on('disconnecting', (reason) => {
		Object.keys(socket.rooms).forEach(async (name) => {
			const inst = await getModuleInstance(name);
			if (inst) {
				inst.leave(socket);
			}
		});
	});
});
