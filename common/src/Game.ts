import { Game, Ctx } from 'boardgame.io';
import * as Honeycomb from 'honeycomb-grid';

import { enumerateMoves } from './enumerateMoves';

export interface Piece {
  playerIndex: number;
  type: 'k' | 'p';
}
export interface Cell {
  piece?: Piece;

  neighborIndices: number[];

  q: number;
  r: number;
  s: number;

  x: number;
  y: number;
}
export interface Player {
  spawnsAvailable: number;
  timeLeftMs: number;
}
export interface State {
  cells: Cell[];
  players: Player[];
  drawOffered: Record<string, true | undefined>;
  result?: { winner: string } | { draw: true };
}

export const hexFactory = Honeycomb.extendHex({
  size: 1,
  orientation: 'pointy', // 'flat' or 'pointy'
});

export const gameDefinition = {
  name: 'game-of-kings',

  setup: (ctx: Ctx, setupData: {}): State => {
    const cells = Honeycomb.defineGrid(hexFactory)
      .hexagon({
        radius: 5,
        center: [0, 0],
      })
      .map(
        (hex, _, grid): Cell => ({
          piece: ({
            '1,-2,1': { playerIndex: 0, type: 'k' },
            '-1,2,-1': { playerIndex: 1, type: 'k' },
          } as { [key: string]: Piece })[`${hex.q},${hex.r},${hex.s}`],

          neighborIndices: grid.neighborsOf(hex).map((n) => grid.indexOf(n)),

          q: hex.q,
          r: hex.r,
          s: hex.s,
          ...hex.toPoint(),
        }),
      );

    return {
      cells: [...cells],
      players: Array.from({ length: ctx.numPlayers }, (i) => ({
        spawnsAvailable: 10,
        timeLeftMs: 5 * 60 * 1000,
      })),
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
          G.players[originCell.piece.playerIndex].spawnsAvailable++;
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
        playerIndex: originCell.piece.playerIndex,
        type: 'p',
      };
      G.players[originCell.piece.playerIndex].spawnsAvailable--;
    },

    offerDraw(G: State, ctx: Ctx, time: number, value: boolean) {
      G.drawOffered[ctx.currentPlayer] = value ? true : undefined;
    },
  },

  ai: { enumerate: enumerateMoves },

  playerView: (G: State, ctx: Ctx, playerId: string) => G,

  seed: '123',

  movesPerTurn: 1,

  endIf: (G: State, ctx: Ctx) => G.result,
};
