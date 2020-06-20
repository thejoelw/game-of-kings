import { Variant, makeBoard, Board } from '.';

const boards = new WeakMap<Variant, Board>();

export const enumerateMoves = (
  variant: Variant,
  players: { spawnsAvailable: number }[],
  playerToMove: number,
  cells: ({ playerIndex: number; type: 'king' | 'pawn' } | null)[],
  enforceChecks: boolean,
) => {
  const board =
    boards.get(variant) ||
    (() => {
      const board = makeBoard(variant);
      boards.set(variant, board);
      return board;
    })();

  const moves: { type: string; fromIndex: number; toIndex: number }[] = [];

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
