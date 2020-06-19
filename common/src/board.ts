import * as t from 'io-ts';
import * as Honeycomb from 'honeycomb-grid';

import { VariantCodec } from '.';

export interface Cell {
	neighborIndices: number[];

	q: number;
	r: number;
	s: number;

	x: number;
	y: number;
}

export type Board = Cell[];

export const hexFactory = Honeycomb.extendHex({
	size: 1,
	orientation: 'pointy', // 'flat' or 'pointy'
});

type Variant = t.TypeOf<typeof VariantCodec>;
export const makeBoard = (variant: Variant): Board => {
	const cells = Honeycomb.defineGrid(hexFactory)
		.hexagon({
			radius: variant.radius,
			center: [0, 0],
		})
		.map(
			(hex, _, grid): Cell => ({
				neighborIndices: grid
					.neighborsOf(hex)
					.map((n) => (n ? grid.indexOf(n) : -1)),

				q: hex.q,
				r: hex.r,
				s: hex.s,

				...hex.toPoint(),
			}),
		);

	return [...cells];
};
