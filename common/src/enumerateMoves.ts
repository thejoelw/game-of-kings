import { Ctx } from 'boardgame.io';

import { State } from './Game';

export const enumerateMoves = (G: State, ctx: Ctx) => {
  const curPlayerIndex = ctx.playOrder.indexOf(ctx.currentPlayer);
  if (curPlayerIndex === -1) {
    throw new Error(`Cannot find current player!`);
  }

  const moves: { move: string; args: [number, number] }[] = [];
  G.cells.forEach((originCell, originIndex) => {
    if (originCell.piece && originCell.piece.playerIndex === curPlayerIndex) {
      const isKing = originCell.piece.type === 'k';

      originCell.neighborIndices.forEach((destIndex, neighborIndex) => {
        if (destIndex === -1) {
          return;
        }
        const destCell = G.cells[destIndex];

        if (
          !destCell.piece ||
          (destCell.piece.playerIndex !== curPlayerIndex &&
            (isKing || destCell.piece.type === 'k'))
        ) {
          moves.push({
            move: 'movePiece',
            args: [originIndex, destIndex],
          });
        }

        if (
          isKing &&
          !destCell.piece &&
          G.players[originCell.piece!.playerIndex].spawnsAvailable > 0
        ) {
          moves.push({
            move: 'spawnPiece',
            args: [originIndex, destIndex],
          });
        }

        const i2 = originCell.neighborIndices[(neighborIndex + 2) % 6];
        if (i2 === -1) {
          return;
        }
        const p2 = G.cells[i2];
        if (!p2.piece || p2.piece.playerIndex !== curPlayerIndex) {
          return;
        }

        const i3 = originCell.neighborIndices[(neighborIndex + 3) % 6];
        if (i3 === -1) {
          return;
        }
        const p3 = G.cells[i3];
        if (p3.piece) {
          return;
        }

        const i4 = originCell.neighborIndices[(neighborIndex + 4) % 6];
        if (i4 === -1) {
          return;
        }
        const p4 = G.cells[i4];
        if (!p4.piece || p4.piece.playerIndex !== curPlayerIndex) {
          return;
        }

        do {
          const testCell = G.cells[destIndex];
          if (testCell.piece) {
            if (testCell.piece.playerIndex !== curPlayerIndex) {
              moves.push({
                move: 'movePiece',
                args: [originIndex, destIndex],
              });
            }

            break;
          } else {
            moves.push({
              move: 'movePiece',
              args: [originIndex, destIndex],
            });
          }

          destIndex = testCell.neighborIndices[neighborIndex];
        } while (destIndex !== -1);
      });
    }
  });
  return moves;
};
