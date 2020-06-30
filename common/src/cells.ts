import { Variant, Piece, getBoard } from '.';

export class InvalidVariantException extends Error {
	constructor() {
		super('Invalid variant');
		Object.setPrototypeOf(this, InvalidVariantException.prototype);
	}
}

const assert = (cond: boolean) => {
	if (!cond) {
		throw new InvalidVariantException();
	}
	return true;
};

const formations = {
	tutorial: (variant: Variant) => ({}),
	monarchy: (variant: Variant) =>
		assert(variant.radius >= 2) && {
			'1,-2,1': { playerIndex: 0, type: 'king' },
			'-1,2,-1': { playerIndex: 1, type: 'king' },
		},
	diarchy: (variant: Variant) =>
		assert(variant.radius >= 3) && {
			'1,-3,2': { playerIndex: 0, type: 'king' },
			'2,-3,1': { playerIndex: 0, type: 'king' },
			'-1,3,-2': { playerIndex: 1, type: 'king' },
			'-2,3,-1': { playerIndex: 1, type: 'king' },
		},
	triarchy: (variant: Variant) =>
		assert(variant.radius >= 3) && {
			'1,-2,1': { playerIndex: 0, type: 'king' },
			'1,-3,2': { playerIndex: 0, type: 'king' },
			'2,-3,1': { playerIndex: 0, type: 'king' },
			'-1,2,-1': { playerIndex: 1, type: 'king' },
			'-1,3,-2': { playerIndex: 1, type: 'king' },
			'-2,3,-1': { playerIndex: 1, type: 'king' },
		},
	colonies: (variant: Variant) =>
		assert(variant.radius >= 3) && {
			[`0,-${variant.radius},${variant.radius}`]: {
				playerIndex: 0,
				type: 'king',
			},
			[`${variant.radius},-${variant.radius},0`]: {
				playerIndex: 1,
				type: 'king',
			},
			[`${variant.radius},0,-${variant.radius}`]: {
				playerIndex: 0,
				type: 'king',
			},
			[`0,${variant.radius},-${variant.radius}`]: {
				playerIndex: 1,
				type: 'king',
			},
			[`-${variant.radius},${variant.radius},0`]: {
				playerIndex: 0,
				type: 'king',
			},
			[`-${variant.radius},0,${variant.radius}`]: {
				playerIndex: 1,
				type: 'king',
			},
		},
} as Record<string, (variant: Variant) => Record<string, Piece>>;

export const isVariantValid = (variant: Variant) => {
	try {
		formations[variant.formation](variant);
		return true;
	} catch (e) {
		if (e instanceof InvalidVariantException) {
			return false;
		} else {
			throw e;
		}
	}
};

export const makeCells = (variant: Variant) =>
	getBoard(variant).map(
		(cell) =>
			formations[variant.formation](variant)[`${cell.q},${cell.r},${cell.s}`] ||
			null,
	);
