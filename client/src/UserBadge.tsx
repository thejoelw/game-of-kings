import React from 'react';

import { UserModule } from 'game-of-kings-common';

import { useModule } from './socket';

const UserBadge = ({ userId }: { userId: string }) => {
	const { username, rating } = useModule(`user-${userId}`, UserModule);
	return (
		<>
			{username} (
			<span title={`${Math.round(rating.mean)} ±${Math.round(rating.std)}`}>
				{Math.round(rating.mean)}
			</span>
			)
		</>
	);
};

export default UserBadge;
