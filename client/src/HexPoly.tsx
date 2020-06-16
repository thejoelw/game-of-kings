import React from 'react';

import { hexFactory, Cell } from 'game-of-kings-common';

const corners = hexFactory()
  .corners()
  .map(({ x, y }) => ({
    x: x - hexFactory().width() / 2,
    y: y - hexFactory().height() / 2,
  }))
  .map(({ x, y }: { x: number; y: number }) => `${x},${y}`)
  .join(' ');

const boardScale = 1;

export default ({
  cell,
  color,
  scale,
  onMouseDown,
  onMouseOver,
}: {
  cell: Cell;
  color: string;
  scale: number;
  onMouseDown?: () => void;
  onMouseOver?: () => void;
}) => (
  <polygon
    className="gok-hex"
    points={corners}
    fill={color}
    stroke="black"
    strokeWidth="0.1"
    opacity="1"
    transform={`translate(${cell.x} ${cell.y}) scale(${boardScale * scale})`}
    onMouseDown={onMouseDown}
    onMouseOver={onMouseOver}
  />
);
