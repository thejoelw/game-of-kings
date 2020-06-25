import io from 'socket.io-client';

export const connect = (serverUrl: string, userId: string, token: string) => {
	const ioParams = new URLSearchParams();
	ioParams.set('userId', userId);
	const socket = io(serverUrl, {
		query: ioParams.toString(),
	});

	socket.on('error', (err: any) => console.error(err));

	socket.emit('auth', { token });

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

	const onModuleUpdate = <StateType>(
		name: string,
		defn: {
			initialState: StateType;
			reducers: Record<string, (state: StateType, action: any) => StateType>;
		},
		callback: (state: StateType) => void,
	) => {
		let mod = modules.get(name);
		if (mod) {
			if (defn !== mod.defn) {
				throw new Error(
					`Two useModule calls with same name ${name} have different definitions!`,
				);
			}
			mod.listeners.push(callback);
		} else {
			mod = {
				defn,
				state: defn.initialState,
				listeners: [callback],
				unsub: () => unsubs.forEach((cb) => cb()),
			};
			modules.set(name, mod);

			let hadReset = false;

			const unsubs = [
				() => {
					socket.emit('unsub', name);
				},
			].concat(
				Object.entries(defn.reducers).map(([k, reducer]) => {
					const eventType = `${name}-${k}`;

					const cb = (action: any) => {
						console.log(
							name,
							k,
							!hadReset && k !== 'reset' ? 'dropped' : 'kept',
						);
						if (!hadReset) {
							if (k === 'reset') {
								hadReset = true;
							} else {
								return;
							}
						}

						if (!mod) {
							throw new Error('Something went very wrong');
						}

						mod.state = reducer(mod.state, action);
						mod.listeners.forEach((setter) => setter(mod!.state));
					};

					socket.on(eventType, cb);
					return () => {
						socket.off(eventType, cb);
					};
				}),
			);

			socket.emit('sub', name);
		}

		callback(mod.state);

		return () => {
			if (!mod) {
				throw new Error('Something went very wrong');
			}

			const index = mod.listeners.indexOf(callback);
			if (index === -1) {
				throw new Error(`Callback doesn't exist in listener list!`);
			}
			mod.listeners.splice(index, 1);
			if (mod.listeners.length === 0) {
				modules.delete(name);
				mod.unsub();
			}
		};
	};

	return { socket, onModuleUpdate };
};
