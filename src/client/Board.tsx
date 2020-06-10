import React from 'react';
import { Ctx } from 'boardgame.io';

import { State, hexFactory } from '../common/Game';
import enumerateMoves from '../common/enumerateMoves';

const Board = ({ G, ctx }: { G: State; ctx: Ctx }) => {
  const [activeMoveType, setActiveMoveType] = React.useState('movePiece');

  const moves = enumerateMoves(G, ctx);
  console.log(moves);

  return (
    <svg
      viewBox="0 0 80 20"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <symbol id="hex" width="10" height="10" viewBox="0 0 2 2">
        <circle cx="0" cy="0" r="1" />
        <polygon
          points={hexFactory()
            .corners()
            .map(({ x, y }: { x: number; y: number }) => `${x},${y}`)
            .join(' ')}
          fill="none"
          stroke="black"
        />
      </symbol>

      {G.cells.map((hex) => (
        <use xlinkHref="#hex" x={hex.x} y={hex.y} style={{ opacity: 1.0 }} />
      ))}
    </svg>
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
