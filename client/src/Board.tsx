import React from 'react';
import { Ctx } from 'boardgame.io';
import chroma from 'chroma-js';

import { State, hexFactory, enumerateMoves } from 'game-of-kings-common';

import { User } from './codecs';
import { CountdownTimer, PausedTimer } from './Timer';
import HexPoly, { setHexPolyTransform } from './HexPoly';

const corners = hexFactory()
  .corners()
  .map(({ x, y }) => ({
    x: x - hexFactory().width() / 2,
    y: y - hexFactory().height() / 2,
  }));

const cellScale = 1;

const colors = ['#4771b2', '#cf3759'];

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
  gameMetadata: { data: User }[];
  isActive: boolean;
  isMultiplayer: boolean;
  isConnected: boolean;
  credentials: string;
}) => {
  const [selectedCellIndex, selectCellIndex] = React.useState<
    number | 'spawn' | undefined
  >();
  const moveDstRef = React.useRef<number>();

  const selectedPolyRef = React.useRef<SVGPolygonElement>(null);

  React.useEffect(() => {
    const cb = (event: MouseEvent) => {
      moveDstRef.current = undefined;
      selectCellIndex(undefined);
    };
    window.addEventListener('mouseup', cb);
    return () => window.removeEventListener('mouseup', cb);
  }, []);

  React.useEffect(() => {
    const cb = (event: MouseEvent) => {
      if (!selectedPolyRef.current || moveDstRef.current !== undefined) {
        return;
      }

      const pt = selectedPolyRef.current.ownerSVGElement!.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;

      const loc = pt.matrixTransform(
        selectedPolyRef.current.ownerSVGElement!.getScreenCTM()!.inverse(),
      );

      selectedPolyRef.current!.classList.remove('gok-hex-snap');
      setHexPolyTransform(selectedPolyRef.current, loc);
    };

    window.addEventListener('mousemove', cb);
    return () => window.removeEventListener('mousemove', cb);
  }, []);

  const validMoves = enumerateMoves(G, ctx);

  const size = Math.sqrt(G.cells.length) * 1.1;

  const curPlayerIndex = ctx.playOrder.indexOf(ctx.currentPlayer);
  if (curPlayerIndex === -1) {
    throw new Error(`Cannot find current player!`);
  }

  const selfPlayerIndex = ctx.playOrder.indexOf(playerID);
  if (selfPlayerIndex === -1) {
    throw new Error(`Cannot find self player!`);
  }

  console.log(gameMetadata);

  return (
    <>
      <svg
        viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        style={{ flex: '1', overflow: 'visible', zIndex: 10 }}
      >
        {G.cells.map((cell, index) => {
          const move =
            isActive &&
            (selectedCellIndex === 'spawn'
              ? validMoves.find(
                  (m) => m.move === 'spawnPiece' && m.args[1] === index,
                )
              : validMoves.find(
                  (m) =>
                    m.move === 'movePiece' &&
                    m.args[0] === selectedCellIndex &&
                    m.args[1] === index,
                ));

          let onMouseUp = move
            ? () => {
                (moves as Record<string, (...args: any[]) => void>)[move.move](
                  Date.now(),
                  ...move.args,
                );
                events.endTurn();

                moveDstRef.current = undefined;
                selectCellIndex(undefined);
              }
            : undefined;

          return (
            <>
              <HexPoly
                key={index}
                cell={cell}
                fill={move ? '#E0E0E0' : '#C0C0C0'}
                scale={1}
                onMouseUp={onMouseUp}
                onMouseOver={
                  move
                    ? () => {
                        moveDstRef.current = index;
                        selectedPolyRef.current!.classList.add('gok-hex-snap');
                        setHexPolyTransform(
                          selectedPolyRef.current!,
                          G.cells[moveDstRef.current],
                        );
                      }
                    : undefined
                }
                onMouseOut={() => {
                  if (moveDstRef.current === index) {
                    moveDstRef.current = undefined;
                  }
                }}
              />

              {/*
              <text x={cell.x} y={cell.y} textAnchor="middle" fontSize={0.5}>
                {index}
              </text>
            */}
            </>
          );
        })}

        {G.cells
          .flatMap((cell, index) => {
            if (!cell.piece) {
              return [];
            }

            const move =
              isActive &&
              validMoves.find(
                (m) =>
                  m.move === 'movePiece' &&
                  m.args[0] === selectedCellIndex &&
                  m.args[1] === index,
              );

            let color = chroma(colors[cell.piece.playerIndex]);
            if (cell.piece.type === 'k') {
              color = chroma.scale([color, 'white'])(0.3);
            }
            if (move) {
              color = color.darken();
            }

            return {
              zIndex: index === selectedCellIndex ? 2 : 1,
              el: (
                <HexPoly
                  key={index}
                  ref={
                    selectedCellIndex === index ? selectedPolyRef : undefined
                  }
                  cell={
                    index === selectedCellIndex &&
                    moveDstRef.current !== undefined
                      ? G.cells[moveDstRef.current]
                      : cell
                  }
                  fill={color.hex()}
                  scale={index === selectedCellIndex ? 0.8 : 1}
                  onMouseDown={
                    selectedCellIndex === undefined &&
                    curPlayerIndex === selfPlayerIndex &&
                    cell.piece.playerIndex === selfPlayerIndex
                      ? (e) => {
                          e.preventDefault();
                          selectCellIndex(index);
                        }
                      : undefined
                  }
                  style={
                    cell.piece.playerIndex === selfPlayerIndex
                      ? { cursor: 'grab' }
                      : undefined
                  }
                />
              ),
            };
          })
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((a) => a.el)}

        {selectedCellIndex === 'spawn' && (
          <HexPoly
            ref={selectedPolyRef}
            cell={{ x: -10000, y: -10000 }}
            fill={colors[selfPlayerIndex]}
            scale={0.8}
          />
        )}

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
          boxShadow: '0 0 8px 0 gray',
          zIndex: 2,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(${
            curPlayerIndex ? 'to top' : 'to bottom'
          }, ${chroma.scale([colors[curPlayerIndex], '#EEEEEE'])(
            0.5,
          )} 0%, #EEEEEE 50%)`,
        }}
      >
        <CountdownTimer
          endTime={Date.now() + G.players[0].timeLeftMs}
          totalTimeMs={5 * 60 * 1000}
          attachPosition="bottom"
        />

        <div
          style={{
            flex: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="-1.1 -1.1 2.2 2.2"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            style={{
              width: 50,
              height: 50,
            }}
          >
            <HexPoly
              cell={{ x: 0, y: 0 }}
              fill={colors[0]}
              scale={1}
              onMouseDown={
                selectedCellIndex === undefined &&
                curPlayerIndex === 0 &&
                selfPlayerIndex === 0 &&
                G.players[0].spawnsAvailable > 0
                  ? (e) => {
                      e.preventDefault();
                      selectCellIndex('spawn');
                    }
                  : undefined
              }
              style={
                selfPlayerIndex === 0 && G.players[0].spawnsAvailable > 0
                  ? { cursor: 'grab' }
                  : {}
              }
            />
          </svg>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
            x{G.players[0].spawnsAvailable}
          </span>
        </div>

        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
          {gameMetadata[0].data.username} ({gameMetadata[0].data.rating})
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <hr
            style={{
              flex: '1',
              border: 'none',
              backgroundColor: 'silver',
              height: '1px',
              margin: '16px 8px',
            }}
          />
          <span style={{ color: 'silver' }}>VS</span>
          <hr
            style={{
              flex: '1',
              border: 'none',
              backgroundColor: 'silver',
              height: '1px',
              margin: '16px 8px',
            }}
          />
        </div>

        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
          {gameMetadata[1].data.username} ({gameMetadata[1].data.rating})
        </div>

        <div
          style={{
            flex: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="-1.1 -1.1 2.2 2.2"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            style={{
              width: 50,
              height: 50,
            }}
          >
            <HexPoly
              cell={{ x: 0, y: 0 }}
              fill={colors[1]}
              scale={1}
              onMouseDown={
                selectedCellIndex === undefined &&
                curPlayerIndex === 1 &&
                selfPlayerIndex === 1 &&
                G.players[1].spawnsAvailable > 0
                  ? (e) => {
                      e.preventDefault();
                      selectCellIndex('spawn');
                    }
                  : undefined
              }
              style={
                selfPlayerIndex === 1 && G.players[1].spawnsAvailable > 0
                  ? { cursor: 'grab' }
                  : {}
              }
            />
          </svg>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
            x{G.players[1].spawnsAvailable}
          </span>
        </div>

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
