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
    scale,
    ...extraProps
  }: {
    cell: { x: number; y: number };
    scale: number;
  } & React.SVGProps<SVGPolygonElement>,
  ref: React.Ref<SVGPolygonElement>,
) => (
  <polygon
    ref={ref}
    points={corners}
    stroke="black"
    strokeWidth="0.1"
    opacity="1"
    transform={`translate(${cell.x} ${cell.y}) scale(${boardScale * scale})`}
    pointerEvents={
      Object.entries(extraProps).some(([k, v]) => k.startsWith('onMouse') && v)
        ? 'visiblePainted'
        : 'none'
    }
    {...extraProps}
  />
);

export const setHexPolyTransform = (
  hp: SVGPolygonElement,
  cell: { x: number; y: number },
) => {
  const tfm = hp.ownerSVGElement!.createSVGTransform();
  tfm.setTranslate(cell.x, cell.y);
  hp.transform.baseVal.replaceItem(tfm, 0);
};

export default React.forwardRef(HexPoly);
