import { Match, reduceMove, makeCells } from '.';

export const getPriorState = (
	match: Match,
	truncateLogLength: number,
): Match => {
	const log = match.log.slice(0, truncateLogLength);
	const reduction = log.reduce(reduceMove, {
		variant: match.variant,
		players: match.players.map(() => ({
			spawnsAvailable: match.variant.spawnsAvailable,
		})),
		playerToMove: 0,
		cells: makeCells(match.variant),
	});

	return {
		...match,
		...reduction,
		players: match.players.map((p, i) => ({ ...p, ...reduction.players[i] })),
		log,
		status: 'playing',
		winner: undefined,
	};
};
