import React from 'react';
import { Ctx } from 'boardgame.io';
import chroma from 'chroma-js';

import { State, hexFactory, enumerateMoves } from 'game-of-kings-common';

import { CountdownTimer, PausedTimer } from './Timer';
import HexPoly from './HexPoly';

const corners = hexFactory()
  .corners()
  .map(({ x, y }) => ({
    x: x - hexFactory().width() / 2,
    y: y - hexFactory().height() / 2,
  }));

const cellScale = 1;

const colors = ['blue', 'red'];

const Board = ({
  G,
  ctx,
  moves,
  events,
  reset,
  undo,
  redo,
  log,
  gameID,
  playerID,
  gameMetadata,

  isActive,
  isMultiplayer,
  isConnected,
  credentials,
}: {
  G: State;
  ctx: Ctx;
  moves: {
    movePiece: (time: number, originIndex: number, destIndex: number) => void;
    spawnPiece: (time: number, originIndex: number, destIndex: number) => void;
    offerDraw: (time: number, value: boolean) => void;
  };
  events: {
    endTurn: () => void;
  };
  reset: () => void;
  undo: () => void;
  redo: () => void;
  log: any[];
  gameID: string;
  playerID: string;
  gameMetadata: {}[];
  isActive: boolean;
  isMultiplayer: boolean;
  isConnected: boolean;
  credentials: string;
}) => {
  const [selectedCellIndex, selectCellIndex] = React.useState<
    number | undefined
  >();
  const [moveDst, setMoveDst] = React.useState<number | undefined>();

  // const [activeMoveType, setActiveMoveType] = React.useState<
  //   'movePiece' | 'spawnPiece'
  // >('movePiece');

  React.useEffect(() => {
    const cb = (event: MouseEvent) => {
      selectCellIndex(undefined);
      setMoveDst(undefined);
    };
    window.addEventListener('mouseup', cb);
    return () => window.removeEventListener('mouseup', cb);
  }, []);

  const validMoves = enumerateMoves(G, ctx);

  const size = Math.sqrt(G.cells.length) * 1.1;

  console.log({
    G,
    ctx,
    moves,
    events,
    reset,
    undo,
    redo,
    log,
    gameID,
    playerID,
    gameMetadata,

    isActive,
    isMultiplayer,
    isConnected,
    credentials,
  });

  console.log(validMoves, selectedCellIndex);

  return (
    <>
      <svg
        viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        style={{ flex: '1' }}
      >
        {G.cells.map((cell, index) => {
          const move =
            isActive &&
            validMoves.find(
              (m) =>
                // m.move === activeMoveType &&
                m.args[0] === selectedCellIndex && m.args[1] === index,
            );

          return (
            <HexPoly
              cell={cell}
              color={move ? '#E0E0E0' : '#C0C0C0'}
              scale={1}
              onMouseDown={undefined}
              onMouseOver={move ? () => setMoveDst(index) : undefined}
            />
          );
        })}

        {G.cells.map((cell, index) => {
          if (!cell.piece) {
            return;
          }

          const move =
            isActive &&
            validMoves.find(
              (m) =>
                // m.move === activeMoveType &&
                m.args[0] === selectedCellIndex && m.args[1] === index,
            );

          let color = chroma(colors[0]);
          if (cell.piece.type === 'k') {
            color = chroma.scale([color, 'white'])(0.7);
          }
          if (move) {
            color = color.darken();
          }

          let onClick = move
            ? () => {
                (moves as Record<string, (...args: any[]) => void>)[move.move](
                  Date.now(),
                  ...move.args,
                );
                events.endTurn();
                selectCellIndex(undefined);
              }
            : () => {
                selectCellIndex(index);
                // setActiveMoveType('movePiece');
              };

          return (
            <HexPoly
              cell={
                index === selectedCellIndex && moveDst !== undefined
                  ? G.cells[moveDst]
                  : cell
              }
              color={color.hex()}
              scale={index === selectedCellIndex ? 0.8 : 1}
              onMouseDown={() => selectCellIndex(index)}
              onMouseOver={undefined}
            />
          );
        })}

        {/*G.cells.map((hex, index) => {
          const zeros =
            Number(hex.q === 0) + Number(hex.r === 0) + Number(hex.s === 0);
          let text: string | undefined;
          if (zeros === 2) {
            if (hex.q === 0) {
              text = `${hex.q}q`;
            }
            if (hex.r === 0) {
              text = `${hex.q}q`;
            }
            if (hex.s === 0) {
              text = `${hex.q}q`;
            }
          } else if (zeros === 3) {
            text = '0';
          } else {
            text = `${hex.q}q+${hex.r}r+${hex.s}s`;
          }

          return (
            text && (
              <text
                x={hex.x}
                y={hex.y + 0.1}
                textAnchor="middle"
                fontSize={0.2}
                fill={'black'}
              >
                {text}
              </text>
            )
          );
        })*/}
      </svg>

      <div
        style={{
          width: '250px',
          backgroundColor: '#eeeeee',
          boxShadow: '0 0 8px 0 gray',
          zIndex: 2,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {`
        game type

        foreach player:
          name
          rating
          timer

        move history
        resign
        `}

        <CountdownTimer
          endTime={Date.now() + G.players[0].timeLeftMs}
          totalTimeMs={5 * 60 * 1000}
          attachPosition="bottom"
        />

        <div style={{ flex: '1' }}></div>
        <hr
          style={{
            // boxShadow: 'silver 0px 0px 2px 1px',
            border: '0.5px solid silver',
            margin: '16px 8px',
          }}
        />
        <div style={{ flex: '1' }}></div>

        <CountdownTimer
          endTime={Date.now() + G.players[1].timeLeftMs}
          totalTimeMs={5 * 60 * 1000}
          attachPosition="top"
        />
      </div>
    </>
  );

  /*

    return (
      <HexGrid width={600} height={600} viewBox="-50 -50 100 100">
        <Layout
          size={{ x: 5, y: 5 }}
          flat={false}
          spacing={1.1}
          origin={{ x: 0, y: 0 }}
        >
          {this.props.G.cells.map((piece, cellIndex) => {
            const ggCell = gameGlobals.cells[cellIndex];

            const move =
              this.props.isActive &&
              moves.find(
                (m) =>
                  m.move === this.state.activeMoveType &&
                  m.args[0] === this.state.selectedCellIndex &&
                  m.args[1] === cellIndex,
              );

            let color = chroma(
              piece ? gameGlobals.players[piece.playerIndex].color : 'silver',
            );
            if (piece && piece.type === 'k') {
              color = chroma.scale([color, 'white'])(0.7);
            }
            if (move) {
              color = color.darken();
            }

            let onClick = move
              ? this.doMove(move)
              : piece
              ? this.selectPiece(cellIndex)
              : null;

            return (
              <g fill={color.hex()}>
                <Hexagon
                  key={`${ggCell.q},${ggCell.r},${ggCell.s}`}
                  q={ggCell.q}
                  r={ggCell.r}
                  s={ggCell.s}
                  onClick={onClick}
                >
                  {piece && piece.spawnsAvailable > 0 ? (
                    <g onClick={this.toggleMoveType(cellIndex)}>
                      <circle
                        cx={2}
                        cy={-2}
                        r={2}
                        fill={
                          this.state.selectedCellIndex === cellIndex &&
                          this.state.activeMoveType === 'spawnPiece'
                            ? 'green'
                            : 'white'
                        }
                        stroke={
                          this.state.selectedCellIndex === cellIndex &&
                          this.state.activeMoveType === 'spawnPiece'
                            ? 'green'
                            : 'green'
                        }
                        strokeWidth={0.2}
                      />
                      <text
                        x={2}
                        y={-1.3}
                        textAnchor="middle"
                        fontSize={2}
                        fill={
                          this.state.selectedCellIndex === cellIndex &&
                          this.state.activeMoveType === 'spawnPiece'
                            ? 'white'
                            : 'green'
                        }
                      >
                        {`+${piece.spawnsAvailable}`}
                      </text>
                    </g>
                  ) : null}
                </Hexagon>
              </g>
            );
          })}
        </Layout>
      </HexGrid>
    );
    */
};

export default Board;

/*
class Board extends React.Component {
  state = {
    activeMoveType: 'movePiece',
  };

  doMove = (move) => (e) => {
    this.props.moves[move.move](Date.now(), ...move.args);
    this.props.events.endTurn();
    this.setState({
      selectedCellIndex: undefined,
    });
  };

  selectPiece = (cellIndex) => (e) => {
    this.setState({
      selectedCellIndex: cellIndex,
      activeMoveType: 'movePiece',
    });
  };

  toggleMoveType = (cellIndex) => (e) => {
    this.setState((state) => ({
      selectedCellIndex: cellIndex,
      activeMoveType: { movePiece: 'spawnPiece', spawnPiece: 'movePiece' }[
        state.activeMoveType
      ],
    }));

    e.stopPropagation();
  };

  render() {
  }
}
*/
