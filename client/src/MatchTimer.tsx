import React from 'react';
import { Segment, Progress } from 'semantic-ui-react';

import { Match } from 'game-of-kings-common';

import { CountdownTimer, PausedTimer, RendererProps } from './Timer';

const positions = ['bottom' as 'bottom', 'top' as 'top'];

const makeTimerRenderer = (
	active: boolean,
	attachPosition: 'bottom' | 'top',
) => ({
	remainingTimeMs,
	totalTimeMs,
	minutes,
	seconds,
	flicker,
}: RendererProps) => (
	<Segment
		style={{
			padding: '0.6em',
			fontSize: '20px',
			fontFamily:
				"source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
			backgroundColor: active ? '#d0e0bd' : 'white',
			margin: '0',
		}}
	>
		<Progress
			percent={(remainingTimeMs / totalTimeMs) * 100}
			attached={attachPosition}
		/>
		{minutes.toString().padStart(2, '0')}
		<span style={{ color: flicker ? 'gray' : 'silver' }}>:</span>
		{seconds.toString().padStart(2, '0')}
	</Segment>
);

const MatchTimer = ({
	match,
	playerIndex,
}: {
	match: Match;
	playerIndex: number;
}) =>
	match.playerToMove === playerIndex &&
	match.status === 'playing' &&
	match.log.length >= 2 ? (
		<CountdownTimer
			endTime={match.moveStartDate + match.players[playerIndex].timeForMoveMs}
			totalTimeMs={match.variant.timeInitialMs}
			renderer={makeTimerRenderer(true, positions[playerIndex])}
		/>
	) : (
		<PausedTimer
			remainingTimeMs={match.players[playerIndex].timeForMoveMs}
			totalTimeMs={match.variant.timeInitialMs}
			renderer={makeTimerRenderer(false, positions[playerIndex])}
		/>
	);

export default MatchTimer;
