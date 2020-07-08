import React from 'react';

import { Match } from 'game-of-kings-common';

import { userId } from './user';
import HexPoly from './HexPoly';

const colors = ['#4771b2', '#cf3759'];

const PieceSpawner = ({
	match,
	playerIndex,
	onMouseDown,
}: {
	match: Match;
	playerIndex: number;
	onMouseDown?: () => void;
}) => (
	<div
		style={{
			flex: '1',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}}
	>
		<svg
			viewBox="-1.1 -1.1 2.2 2.2"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			style={{
				width: 50,
				height: 50,
			}}
		>
			<HexPoly
				cell={{ x: 0, y: 0 }}
				fill={colors[playerIndex]}
				scale={1}
				onMouseDown={
					onMouseDown &&
					match.players[playerIndex].userId === userId &&
					match.players[playerIndex].spawnsAvailable > 0
						? (e) => {
								e.preventDefault();
								onMouseDown();
						  }
						: undefined
				}
				style={
					match.players[playerIndex].userId === userId &&
					match.players[playerIndex].spawnsAvailable > 0
						? { cursor: 'grab' }
						: {}
				}
			/>
		</svg>
		<span style={{ fontWeight: 'bold', fontSize: '16px' }}>
			x{match.players[playerIndex].spawnsAvailable}
		</span>
	</div>
);

export default PieceSpawner;
