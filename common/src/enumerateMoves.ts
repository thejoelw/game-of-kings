import { Move, Variant, getBoard } from '.';

interface BoardState {
  variant: Variant;
  players: { spawnsAvailable: number }[];
  playerToMove: number;
  cells: ({ playerIndex: number; type: 'king' | 'pawn' } | null)[];
}

export const enumeratePseudoMoves = (boardState: BoardState): Move[] => {
  const { variant, players, playerToMove, cells } = boardState;

  const board = getBoard(variant);

  const moves: Move[] = [{ type: 'pass' }];

  cells.forEach((originCell, originIndex) => {
    if (originCell && originCell.playerIndex === playerToMove) {
      const isKing = originCell.type === 'king';

      board[originIndex].neighborIndices.forEach(
        (destIndex, neighborIndex, originNeighbors) => {
          if (destIndex === -1) {
            return;
          }
          const destCell = cells[destIndex];

          if (
            !destCell ||
            (destCell.playerIndex !== playerToMove &&
              (isKing || destCell.type === 'king'))
          ) {
            moves.push({
              type: 'movePiece',
              fromIndex: originIndex,
              toIndex: destIndex,
            });
          }

          if (
            isKing &&
            !destCell &&
            players[originCell!.playerIndex].spawnsAvailable > 0
          ) {
            moves.push({
              type: 'spawnPiece',
              fromIndex: originIndex,
              toIndex: destIndex,
            });
          }

          const i2 = originNeighbors[(neighborIndex + 2) % 6];
          if (i2 === -1) {
            return;
          }
          const p2 = cells[i2];
          if (!p2 || p2.playerIndex !== playerToMove) {
            return;
          }

          const i3 = originNeighbors[(neighborIndex + 3) % 6];
          if (i3 === -1) {
            return;
          }
          const p3 = cells[i3];
          if (p3) {
            return;
          }

          const i4 = originNeighbors[(neighborIndex + 4) % 6];
          if (i4 === -1) {
            return;
          }
          const p4 = cells[i4];
          if (!p4 || p4.playerIndex !== playerToMove) {
            return;
          }

          do {
            const testCell = cells[destIndex];
            if (testCell) {
              if (testCell.playerIndex !== playerToMove) {
                moves.push({
                  type: 'movePiece',
                  fromIndex: originIndex,
                  toIndex: destIndex,
                });
              }

              break;
            } else {
              moves.push({
                type: 'movePiece',
                fromIndex: originIndex,
                toIndex: destIndex,
              });
            }

            destIndex = board[destIndex].neighborIndices[neighborIndex];
          } while (destIndex !== -1);
        },
      );
    }
  });

  return moves;
};

export const enumerateLegalMoves = (boardState: BoardState): Move[] =>
  enumeratePseudoMoves(boardState).filter((m) => {
    if (boardState.variant.formation === 'tutorial') {
      return true;
    }

    const state_1 = reduceMove(boardState, m);
    return !enumeratePseudoMoves(state_1).some((n) => {
      const state_2 = reduceMove(state_1, n);
      return !state_2.cells.some(
        (c) => c && c.type === 'king' && c.playerIndex === state_2.playerToMove,
      );
    });
  });

export const reduceMove = (
  { variant, players, playerToMove, cells }: BoardState,
  move: Move,
): BoardState => {
  switch (move.type) {
    case 'movePiece':
      players =
        cells[move.fromIndex]!.type === 'king' && cells[move.toIndex]
          ? players.map((p, i) =>
              i === playerToMove
                ? { ...p, spawnsAvailable: p.spawnsAvailable + 1 }
                : p,
            )
          : players;
      cells = cells.map((c, i) =>
        i === move.fromIndex
          ? null
          : i === move.toIndex
          ? cells[move.fromIndex]
          : c,
      );
      break;

    case 'spawnPiece':
      players = players.map((p, i) =>
        i === playerToMove
          ? { ...p, spawnsAvailable: p.spawnsAvailable - 1 }
          : p,
      );
      cells = cells.map((c, i) =>
        i === move.toIndex ? { playerIndex: playerToMove, type: 'pawn' } : c,
      );
      break;

    case 'pass':
      break;
  }

  return {
    variant,
    players,
    playerToMove: 1 - playerToMove,
    cells,
  };
};

export const isCheckmated = (boardState: BoardState) =>
  enumerateLegalMoves(boardState).length === 0;
