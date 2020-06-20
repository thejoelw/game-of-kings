import { Variant, Piece, makeBoard } from '.';

export const makeCells = (variant: Variant) =>
	makeBoard(variant).map(
		(cell) =>
			(({
				'1,-2,1': { playerIndex: 0, type: 'king' },
				'-1,2,-1': { playerIndex: 1, type: 'king' },
			} as { [key: string]: Piece })[`${cell.q},${cell.r},${cell.s}`] || null),
	);
