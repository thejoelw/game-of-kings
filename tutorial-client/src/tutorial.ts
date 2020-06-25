import {
	MatchModule,
	UNINITIALIZED,
	Match,
	makeBoard,
	Piece,
} from 'game-of-kings-common';

import { send, onModuleUpdate, userId } from './socket';

export class GameOverError extends Error {
	constructor() {
		super('Tutorial game has ended');
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export const runTutorial = async (matchId: string) => {
	const baseMatch = await new Promise<Match>((resolve) => {
		const unlisten = onModuleUpdate(
			`match-${matchId}`,
			MatchModule,
			(match) => {
				if (match !== UNINITIALIZED) {
					unlisten();
					return resolve(match);
				}
			},
		);
	});

	send('match-reset-partial', {
		matchId,
		cells: baseMatch.cells.map(() => null),
	});

	const board = makeBoard(baseMatch.variant);

	const lookupCellIndex = (key: string) =>
		board.findIndex((cell) => `${cell.q},${cell.r},${cell.s}` === key);

	const setState = async (
		reset: boolean,
		setCells: Record<string, 'B' | 'b' | 'P' | 'p'>,
	) => {
		const match = await new Promise<Match>((resolve, reject) => {
			const unlisten = onModuleUpdate(
				`match-${matchId}`,
				MatchModule,
				(match) => {
					if (match !== UNINITIALIZED) {
						unlisten();

						if (match.status === 'playing') {
							return resolve(match);
						} else {
							return reject(new GameOverError());
						}
					}
				},
			);
		});

		const cells: (Piece | null)[] = match.cells.map(
			reset ? () => null : (c) => c,
		);
		Object.entries(setCells).forEach(
			([k, v]) =>
				(cells[lookupCellIndex(k)] = {
					B: { playerIndex: 0, type: 'king' as 'king' },
					b: { playerIndex: 0, type: 'pawn' as 'pawn' },
					P: { playerIndex: 1, type: 'king' as 'king' },
					p: { playerIndex: 1, type: 'pawn' as 'pawn' },
				}[v]),
		);

		send('match-reset-partial', {
			matchId,
			players: [{ spawnsAvailable: 12 }, { spawnsAvailable: 12 }],
			cells,
			playerToMove: 1,
			status: 'playing',
		});
	};

	const sendChat = async (msg: string) => send('match-chat', { matchId, msg });

	const waitForMove = (movePartial: Record<string, any>) =>
		new Promise((resolve, reject) => {
			const unlisten = onModuleUpdate(
				`match-${matchId}`,
				MatchModule,
				(match) => {
					if (match === UNINITIALIZED) {
						return;
					}

					if (match.status !== 'playing') {
						unlisten();
						return reject(new GameOverError());
					}

					if (match.playerToMove !== 0) {
						return;
					}

					if (match.log.length > 0) {
						console.log(movePartial, match.log[match.log.length - 1]);
						if (
							Object.entries(movePartial).every(
								([k, v]) =>
									(match.log[match.log.length - 1] as Record<string, any>)[
										k
									] === v,
							)
						) {
							unlisten();
							return resolve();
						}
					}

					send('match-reset-partial', {
						matchId,
						playerToMove: 1,
					});
				},
			);
		});

	const waitForWin = () =>
		new Promise((resolve, reject) => {
			const unlisten = onModuleUpdate(
				`match-${matchId}`,
				MatchModule,
				(match) => {
					if (match === UNINITIALIZED) {
						return;
					}

					if (match.status !== 'playing') {
						unlisten();
						return resolve();
					}

					if (match.playerToMove !== 0) {
						return;
					}

					send('match-reset-partial', {
						matchId,
						playerToMove: 1,
					});
				},
			);
		});

	const wait = (seconds: number) =>
		new Promise((resolve) => setTimeout(resolve, seconds * 1000));

	await sendChat(`Hello! I'm the Game of Kings tutorial bot.`);

	await setState(false, {
		'1,-2,1': 'P',
	});
	await sendChat(`Let's jump right in! The red piece is your king.`);
	await sendChat(`You can move it in any direction. Try doing that now.`);
	await waitForMove({ type: 'movePiece' });
	await wait(0.5);

	await sendChat(`Nice!`);
	await sendChat(
		`In the right-hand column, you will notice that you have 12 pawns available. Try dragging one of them onto the board next to your king.`,
	);
	await waitForMove({ type: 'spawnPiece' });
	await wait(0.5);

	await sendChat(
		`Excellent! Those are the basic moves, now let's look at capturing.`,
	);
	await setState(false, {
		'-1,2,-1': 'b',
	});
	await sendChat(
		`I just added an enemy pawn (that won't move). Try to capture it with your king.`,
	);
	await waitForMove({ type: 'movePiece', toIndex: lookupCellIndex('-1,2,-1') });
	await wait(0.5);

	await sendChat(
		`That was easy. However, if you had tried capturing with your pawn, you wouldn't have been able to (pawns can't capture pawns, except if they're shot from a bow).`,
	);
	await sendChat(`Oh, what is a bow, you ask?`);

	await setState(true, {
		'-3,-1,4': 'p',
		'-3,0,3': 'p',
		'-4,1,3': 'p',
		'4,0,-4': 'b',
	});
	await sendChat(`That's a bow.`);
	await sendChat(`Try using it to capture the enemy pawn.`);

	await waitForMove({ type: 'movePiece', toIndex: lookupCellIndex('4,0,-4') });
	await wait(0.5);

	await sendChat(`Kinda cool, right?`);
	await sendChat(
		`A bow requires at least three pieces in the "elbow" formation, with nothing behind it. Here's some bows you could create, along with a formation that's NOT a bow (the diamond).`,
	);

	await setState(true, {
		'0,-1,1': 'p',
		'0,1,-1': 'p',
		'-1,0,1': 'p',
		'1,0,-1': 'p',
		'-1,1,0': 'p',
		'1,-1,0': 'p',

		'1,-4,3': 'p',
		'2,-4,2': 'P',
		'3,-5,2': 'p',

		'4,-1,-3': 'p',
		'4,0,-4': 'p',
		'5,0,-5': 'p',
		'4,1,-5': 'p',

		'-1,3,-2': 'p',
		'-2,4,-2': 'p',
		'-2,5,-3': 'p',
		'-1,4,-3': 'p',

		'-5,2,3': 'p',
		'-4,2,2': 'p',
		'-4,3,1': 'P',

		'-2,-2,4': 'p',
		'-2,-3,5': 'p',
		'-3,-2,5': 'p',
		'-1,-2,3': 'p',
		'-2,-1,3': 'p',

		'5,-4,-1': 'b',
	});

	await sendChat(`Make a bow and capture the enemy pawn to continue`);
	await waitForMove({ type: 'movePiece', toIndex: lookupCellIndex('5,-4,-1') });

	await sendChat(
		`A few other minor things to know - when the king captures a piece, it "recruits" the piece and gains an extra spawn.`,
	);
	await sendChat(
		`Finally, any piece can capture the opponent's king (and, as stated before, be captured by the king).`,
	);

	await setState(true, {
		'-3,-1,4': 'p',
		'-3,0,3': 'p',
		'-4,1,3': 'p',
		'3,1,-4': 'B',
	});
	await sendChat(`Capture the enemy king to win.`);

	await waitForWin();
	await wait(0.5);

	await sendChat(`You've completed the tutorial.`);
};
