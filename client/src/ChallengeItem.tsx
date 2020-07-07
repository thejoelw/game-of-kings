import React from 'react';
import { Redirect } from 'react-router-dom';
import { List } from 'semantic-ui-react';

import { Challenge } from 'game-of-kings-common';

import { userId } from './user';
import { send } from './socket';
import UserBadge from './UserBadge';
import VariantDescription from './VariantDescription';

const ChallengeItem = ({
	id,
	challengerId,
	opponentId,
	variant,
	matchId,
}: Challenge) => {
	const isMine = challengerId === userId;

	if ((challengerId === userId || opponentId === userId) && matchId) {
		return <Redirect to={`/match/${matchId}`} />;
	}

	return (
		<List.Item
			key={id}
			onClick={
				isMine
					? () => send('lobby-retract-challenge', id)
					: () =>
							send('lobby-accept-challenge', {
								challengeId: id,
								acceptorId: userId,
							})
			}
		>
			<div className="challenge">
				<List.Header>
					vs <UserBadge userId={challengerId} />
				</List.Header>

				<List.Description>
					<VariantDescription {...variant} />
				</List.Description>
			</div>
		</List.Item>
	);
};

export default ChallengeItem;
