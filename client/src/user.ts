import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

import { User } from './codecs';

let globalUser: User = {
	id: Cookies.get('gok-userid') || uuidv4(),
	username: 'guest',
	rating: 1500,
};
Cookies.set('gok-userid', globalUser.id, { expires: 7 });

let listeners: ((user: User) => void)[] = [];

export const useUser = () => {
	const [user, setUser] = React.useState(globalUser);
	React.useEffect(() => {
		listeners.push(setUser);
		return () => {
			const index = listeners.indexOf(setUser);
			if (index === -1) {
				throw new Error(
					`Cannot unregister listener in array of length ${listeners.length}`,
				);
			}
			listeners.splice(index, 1);
		};
	}, [setUser]);

	return user;
};

export const setUser = (user: User) => {
	globalUser = user;
	listeners.forEach((cb) => cb(user));
};
