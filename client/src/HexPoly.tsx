import React from 'react';

import { hexFactory } from 'game-of-kings-common';

const corners = hexFactory()
  .corners()
  .map(({ x, y }) => ({
    x: x - hexFactory().width() / 2,
    y: y - hexFactory().height() / 2,
  }))
  .map(({ x, y }: { x: number; y: number }) => `${x},${y}`)
  .join(' ');

const boardScale = 1;

const HexPoly = (
  {
    cell,
    color,
    scale,
    onMouseDown,
    onMouseUp,
    onMouseOver,
    onMouseOut,
  }: {
    cell: { x: number; y: number };
    color: string;
    scale: number;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
    onMouseOver?: () => void;
    onMouseOut?: () => void;
  },
  ref: React.Ref<SVGPolygonElement>,
) => {
  console.log('render');
  return (
    <polygon
      ref={ref}
      className="gok-hex"
      points={corners}
      fill={color}
      stroke="black"
      strokeWidth="0.1"
      opacity="1"
      transform={`translate(${cell.x} ${cell.y}) scale(${boardScale * scale})`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      pointerEvents={
        onMouseDown || onMouseUp || onMouseOver || onMouseOut
          ? 'visiblePainted'
          : 'none'
      }
    />
  );
};

export default React.forwardRef(HexPoly);
