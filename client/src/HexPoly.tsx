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
    content,
    ...extraProps
  }: {
    cell: { x: number; y: number };
    scale: number;
    content?: string;
  } & React.SVGProps<SVGPolygonElement>,
  ref: React.Ref<SVGGElement>,
) => (
  <g
    ref={ref}
    transform={`translate(${cell.x} ${cell.y}) scale(${boardScale * scale})`}
  >
    <polygon
      points={corners}
      stroke="black"
      strokeWidth="0.1"
      opacity="1"
      pointerEvents={
        Object.entries(extraProps).some(
          ([k, v]) => k.startsWith('onMouse') && v,
        )
          ? 'visiblePainted'
          : 'none'
      }
      {...extraProps}
    />

    {content ? (
      <text
        x={0}
        y={0}
        textAnchor="middle"
        alignmentBaseline="middle"
        style={{
          fontSize: '1.8px',
          fontWeight: 'bold',
          pointerEvents: 'none',
          filter: 'url(#glow)',
        }}
      >
        {content}
      </text>
    ) : null}
  </g>
);

export const hexStaticBlock = () => (
  <filter id="glow">
    <feFlood result="flood" floodColor="white" floodOpacity="1"></feFlood>
    <feComposite
      in="flood"
      result="mask"
      in2="SourceGraphic"
      operator="in"
    ></feComposite>
    <feGaussianBlur
      in="mask"
      result="blurred"
      stdDeviation="0.1"
    ></feGaussianBlur>
    <feMerge>
      <feMergeNode in="blurred"></feMergeNode>
      <feMergeNode in="SourceGraphic"></feMergeNode>
    </feMerge>
  </filter>
);

export const setHexPolyTransform = (
  hp: SVGGElement,
  cell: { x: number; y: number },
) => {
  const tfm = hp.ownerSVGElement!.createSVGTransform();
  tfm.setTranslate(cell.x, cell.y);
  hp.transform.baseVal.replaceItem(tfm, 0);
};

export default React.forwardRef(HexPoly);
