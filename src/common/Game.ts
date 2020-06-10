import { Game, Ctx } from 'boardgame.io';
import Honeycomb from 'honeycomb-grid';

import enumerateMoves from './enumerateMoves';

export interface Piece {
  playerId: string;
  type: 'k' | 'p';
  spawnsAvailable: number;
}
type HexData = {
  neighborIndices: number[];
  piece?: Piece;
};

export type Hex = Honeycomb.Hex<HexData>;
export const hexFactory = Honeycomb.extendHex<HexData>({
  size: 1,

  neighborIndices: [],
  piece: undefined,
});

export interface State {
  cells: Honeycomb.Grid<Hex>;
  drawOffered: Record<string, true | undefined>;
  result?: { winner: string } | { draw: true };
}

export default {
  name: 'Game of Kings',

  setup: (): State => {
    const cells = Honeycomb.defineGrid(hexFactory).hexagon({
      radius: 5,
      center: [0, 0],
    });
    cells.forEach((hex) => {
      hex.neighborIndices = cells.neighborsOf(hex).map((n) => cells.indexOf(n));
    });

    return {
      cells,
      drawOffered: {},
      result: undefined,
    };
  },

  moves: {
    movePiece: (
      G: State,
      ctx: Ctx,
      time: number,
      originIndex: number,
      destIndex: number,
    ) => {
      const originCell = G.cells[originIndex];
      const destCell = G.cells[destIndex];

      if (!originCell.piece) {
        throw new Error(`Cannot move from a cell without a piece!`);
      }

      if (destCell.piece) {
        if (originCell.piece.type === 'k') {
          originCell.piece.spawnsAvailable++;
        }
        if (destCell.piece.type === 'k') {
          G.result = { winner: ctx.currentPlayer };
        }
      }

      destCell.piece = originCell.piece;
      originCell.piece = undefined;
    },

    spawnPiece: (
      G: State,
      ctx: Ctx,
      time: number,
      originIndex: number,
      destIndex: number,
    ) => {
      const originCell = G.cells[originIndex];
      const destCell = G.cells[destIndex];

      if (!originCell.piece) {
        throw new Error(`Cannot spawn from a cell without a piece!`);
      }
      if (originCell.piece.type !== 'k') {
        throw new Error(`Cannot spawn from a non-king piece!`);
      }

      destCell.piece = {
        playerId: originCell.piece.playerId,
        type: 'p',
        spawnsAvailable: 0,
      };
      originCell.piece.spawnsAvailable--;
    },

    offerDraw(G: State, ctx: Ctx, time: number, value: boolean) {
      G.drawOffered[ctx.currentPlayer] = value ? true : undefined;
    },
  },

  ai: { enumerate: enumerateMoves },

  playerView: (G: State, ctx: Ctx, playerId: number) => G,

  seed: '123',

  movesPerTurn: 1,

  endIf: (G: State, ctx: Ctx) => G.result,
};
