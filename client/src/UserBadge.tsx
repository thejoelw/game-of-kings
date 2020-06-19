import React from 'react';

import { UserModule } from 'game-of-kings-common';

import { useModule } from './socket';

const UserBadge = ({ userId }: { userId: string }) => {
	const { username, rating } = useModule(`user-${userId}`, UserModule);
	return (
		<>
			{username} ({rating})
		</>
	);
};

export default UserBadge;
