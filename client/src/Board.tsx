import React from 'react';
import chroma from 'chroma-js';

import {
	hexFactory,
	enumerateLegalMoves,
	getBoard,
	Match,
} from 'game-of-kings-common';

import { User } from './codecs';
import { CountdownTimer, PausedTimer } from './Timer';
import HexPoly, { hexStaticBlock, setHexPolyTransform } from './HexPoly';
import UserBadge from './UserBadge';
import { send } from './socket';
import { userId } from './user';

const corners = hexFactory()
	.corners()
	.map(({ x, y }) => ({
		x: x - hexFactory().width() / 2,
		y: y - hexFactory().height() / 2,
	}));

const cellScale = 1;

const colors = ['#4771b2', '#cf3759'];

const Board = ({ matchId, match }: { matchId: string; match: Match }) => {
	const board = getBoard(match.variant);

	const [selectedCellIndex, selectCellIndex] = React.useState<
		number | 'spawn' | undefined
	>();
	const moveDstRef = React.useRef<number>();

	const selectedPolyRef = React.useRef<SVGGElement>(null);

	React.useEffect(() => {
		const cb = (event: MouseEvent) => {
			moveDstRef.current = undefined;
			selectCellIndex(undefined);
		};
		window.addEventListener('mouseup', cb);
		return () => window.removeEventListener('mouseup', cb);
	}, []);

	React.useEffect(() => {
		const cb = (event: MouseEvent) => {
			if (!selectedPolyRef.current || moveDstRef.current !== undefined) {
				return;
			}

			const pt = selectedPolyRef.current.ownerSVGElement!.createSVGPoint();
			pt.x = event.clientX;
			pt.y = event.clientY;

			const loc = pt.matrixTransform(
				selectedPolyRef.current.ownerSVGElement!.getScreenCTM()!.inverse(),
			);

			selectedPolyRef.current!.classList.remove('gok-hex-snap');
			setHexPolyTransform(selectedPolyRef.current, loc);
		};

		window.addEventListener('mousemove', cb);
		return () => window.removeEventListener('mousemove', cb);
	}, []);

	const validMoves =
		match.status === 'playing' ? enumerateLegalMoves(match) : [];

	const size = Math.sqrt(match.cells.length) * 1.1;

	const selfPlayerIndex = match.players.findIndex((p) => p.userId === userId);
	if (selfPlayerIndex === -1) {
		throw new Error(`Cannot find self player!`);
	}

	return (
		<div
			style={{
				flex: '1',
				display: 'flex',
				flexDirection: 'row',
				overflow: 'hidden',
			}}
		>
			<svg
				viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
				xmlns="http://www.w3.org/2000/svg"
				xmlnsXlink="http://www.w3.org/1999/xlink"
				style={{ flex: '1', overflow: 'visible', zIndex: 10 }}
			>
				{hexStaticBlock()}

				{match.cells.map((cell, index) => {
					const move =
						selectedCellIndex === 'spawn'
							? validMoves.find(
									(m) => m.type === 'spawnPiece' && m.toIndex === index,
							  )
							: validMoves.find(
									(m) =>
										m.type === 'movePiece' &&
										m.fromIndex === selectedCellIndex &&
										m.toIndex === index,
							  );

					let onMouseUp = move
						? () => {
								send('match-do-move', { ...move, matchId });

								moveDstRef.current = undefined;
								selectCellIndex(undefined);
						  }
						: undefined;

					return (
						<HexPoly
							key={index}
							cell={board[index]}
							fill={move ? '#E0E0E0' : '#C0C0C0'}
							scale={1}
							onMouseDown={() =>
								console.log(
									`${board[index].q},${board[index].r},${board[index].s}`,
								)
							}
							onMouseUp={onMouseUp}
							onMouseOver={
								move
									? () => {
											moveDstRef.current = index;
											selectedPolyRef.current!.classList.add('gok-hex-snap');
											setHexPolyTransform(
												selectedPolyRef.current!,
												board[moveDstRef.current],
											);
									  }
									: undefined
							}
							onMouseOut={() => {
								if (moveDstRef.current === index) {
									moveDstRef.current = undefined;
								}
							}}
						/>
					);
				})}

				{match.cells
					.flatMap((cell, index) => {
						if (!cell) {
							return [];
						}

						const move = validMoves.find(
							(m) =>
								m.type === 'movePiece' &&
								m.fromIndex === selectedCellIndex &&
								m.toIndex === index,
						);

						let color = chroma(colors[cell.playerIndex]);
						if (move) {
							color = color.darken();
						}

						return {
							zIndex: index === selectedCellIndex ? 2 : 1,
							el: (
								<HexPoly
									key={index}
									ref={
										selectedCellIndex === index ? selectedPolyRef : undefined
									}
									cell={
										board[
											index === selectedCellIndex &&
											moveDstRef.current !== undefined
												? moveDstRef.current
												: index
										]
									}
									fill={color.hex()}
									scale={index === selectedCellIndex ? 0.8 : 1}
									onMouseDown={
										selectedCellIndex === undefined &&
										match.playerToMove === selfPlayerIndex &&
										cell.playerIndex === selfPlayerIndex
											? (e) => {
													e.preventDefault();
													selectCellIndex(index);
											  }
											: undefined
									}
									style={
										cell.playerIndex === selfPlayerIndex
											? { cursor: 'grab' }
											: undefined
									}
									content={cell.type === 'king' ? '♔' : undefined}
								/>
							),
						};
					})
					.sort((a, b) => a.zIndex - b.zIndex)
					.map((a) => a.el)}

				{selectedCellIndex === 'spawn' && (
					<HexPoly
						ref={selectedPolyRef}
						cell={{ x: -10000, y: -10000 }}
						fill={colors[selfPlayerIndex]}
						scale={0.8}
					/>
				)}

				{/*match.cells.map((hex, index) => {
          const zeros =
            Number(hex.q === 0) + Number(hex.r === 0) + Number(hex.s === 0);
          let text: string | undefined;
          if (zeros === 2) {
            if (hex.q === 0) {
              text = `${hex.q}q`;
            }
            if (hex.r === 0) {
              text = `${hex.q}q`;
            }
            if (hex.s === 0) {
              text = `${hex.q}q`;
            }
          } else if (zeros === 3) {
            text = '0';
          } else {
            text = `${hex.q}q+${hex.r}r+${hex.s}s`;
          }

          return (
            text && (
              <text
                x={hex.x}
                y={hex.y + 0.1}
                textAnchor="middle"
                fontSize={0.2}
                fill={'black'}
              >
                {text}
              </text>
            )
          );
        })*/}
			</svg>

			<div
				style={{
					width: '200px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-evenly',
				}}
			>
				{match.status !== 'playing' && (
					<div
						style={{
							flex: '1',
							maxHeight: '100px',
							boxShadow: '0 0 8px 0 gray',
							zIndex: 2,
							padding: '8px',
							background: '#EEEEEE',
						}}
					>
						{{
							aborted: () => <strong>Game aborted</strong>,
							drawn: () => <strong>Draw offered and accepted</strong>,
							checkmate: () => (
								<>
									<strong>Checkmate</strong>
									<div>
										<UserBadge userId={match.players[match.winner!].userId} />{' '}
										is victorious!
									</div>
								</>
							),
							timeout: () => (
								<>
									<strong>Timeout</strong>
									<div>
										<UserBadge userId={match.players[match.winner!].userId} />{' '}
										is victorious!
									</div>
								</>
							),
							resignation: () => (
								<>
									<strong>Resignation</strong>
									<div>
										<UserBadge userId={match.players[match.winner!].userId} />{' '}
										is victorious!
									</div>
								</>
							),
						}[match.status]()}
					</div>
				)}

				{match.chat.length > 0 && (
					<div
						style={{
							flex: '1',
							boxShadow: '0 0 8px 0 gray',
							zIndex: 2,
							padding: '8px',
							background: '#EEEEEE',
							overflowY: 'auto',
						}}
					>
						{match.chat.map((c, index) => (
							<p key={index} ref={(el) => el && el.scrollIntoView()}>
								{c.msg}
							</p>
						))}
					</div>
				)}

				<div
					style={{
						flex: '1',
						maxHeight: '400px',
						boxShadow: '0 0 8px 0 gray',
						zIndex: 2,
						padding: '8px',
						display: 'flex',
						flexDirection: 'column',
						background:
							match.status === 'playing'
								? `linear-gradient(${
										match.playerToMove ? 'to top' : 'to bottom'
								  }, ${chroma.scale([colors[match.playerToMove], '#EEEEEE'])(
										0.5,
								  )} 0%, #EEEEEE 50%)`
								: '#EEEEEE',
					}}
				>
					{match.playerToMove === 0 ? (
						<CountdownTimer
							endTime={match.moveStartDate + match.players[0].timeForMoveMs}
							totalTimeMs={match.variant.timeInitialMs}
							attachPosition="bottom"
						/>
					) : (
						<PausedTimer
							remainingTimeMs={match.players[0].timeForMoveMs}
							totalTimeMs={match.variant.timeInitialMs}
							attachPosition="bottom"
						/>
					)}

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
								fill={colors[0]}
								scale={1}
								onMouseDown={
									selectedCellIndex === undefined &&
									match.playerToMove === 0 &&
									selfPlayerIndex === 0 &&
									match.players[0].spawnsAvailable > 0
										? (e) => {
												e.preventDefault();
												selectCellIndex('spawn');
										  }
										: undefined
								}
								style={
									selfPlayerIndex === 0 && match.players[0].spawnsAvailable > 0
										? { cursor: 'grab' }
										: {}
								}
							/>
						</svg>
						<span style={{ fontWeight: 'bold', fontSize: '16px' }}>
							x{match.players[0].spawnsAvailable}
						</span>
					</div>

					<div style={{ textAlign: 'center', fontWeight: 'bold' }}>
						<UserBadge userId={match.players[0].userId} />
					</div>

					<div style={{ display: 'flex', alignItems: 'center' }}>
						<hr
							style={{
								flex: '1',
								border: 'none',
								backgroundColor: 'silver',
								height: '1px',
								margin: '16px 8px',
							}}
						/>
						<span style={{ color: 'silver' }}>VS</span>
						<hr
							style={{
								flex: '1',
								border: 'none',
								backgroundColor: 'silver',
								height: '1px',
								margin: '16px 8px',
							}}
						/>
					</div>

					<div style={{ textAlign: 'center', fontWeight: 'bold' }}>
						<UserBadge userId={match.players[1].userId} />
					</div>

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
								fill={colors[1]}
								scale={1}
								onMouseDown={
									selectedCellIndex === undefined &&
									match.playerToMove === 1 &&
									selfPlayerIndex === 1 &&
									match.players[1].spawnsAvailable > 0
										? (e) => {
												e.preventDefault();
												selectCellIndex('spawn');
										  }
										: undefined
								}
								style={
									selfPlayerIndex === 1 && match.players[1].spawnsAvailable > 0
										? { cursor: 'grab' }
										: {}
								}
							/>
						</svg>
						<span style={{ fontWeight: 'bold', fontSize: '16px' }}>
							x{match.players[1].spawnsAvailable}
						</span>
					</div>

					{match.playerToMove === 1 ? (
						<CountdownTimer
							endTime={match.moveStartDate + match.players[1].timeForMoveMs}
							totalTimeMs={match.variant.timeInitialMs}
							attachPosition="top"
						/>
					) : (
						<PausedTimer
							remainingTimeMs={match.players[1].timeForMoveMs}
							totalTimeMs={match.variant.timeInitialMs}
							attachPosition="top"
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default Board;
