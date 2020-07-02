import React from 'react';
import { Segment, Progress } from 'semantic-ui-react';

import { Match, ABORT_TIMEOUT } from 'game-of-kings-common';

import { CountdownTimer, PausedTimer, RendererProps } from './Timer';

const AbortTimer = ({
	match,
	playerIndex,
}: {
	match: Match;
	playerIndex: number;
}) =>
	match.playerToMove === playerIndex &&
	match.status === 'playing' &&
	match.log.length < 2 ? (
		<CountdownTimer
			endTime={match.moveStartDate + ABORT_TIMEOUT}
			totalTimeMs={ABORT_TIMEOUT}
			renderer={({ seconds }: RendererProps) => (
				<em style={{ fontSize: '12px' }}>
					{seconds} seconds to make first move
				</em>
			)}
		/>
	) : null;

export default AbortTimer;
