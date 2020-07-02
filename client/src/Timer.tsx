import React from 'react';
import { Segment, Progress } from 'semantic-ui-react';

export interface RendererProps {
  remainingTimeMs: number;
  totalTimeMs: number;
  minutes: number;
  seconds: number;
  flicker: number;
}

export const Timer = ({
  remainingTimeMs,
  totalTimeMs,
  onUpdate,
  renderer,
}: {
  remainingTimeMs: number;
  totalTimeMs: number;
  onUpdate: () => void;
  renderer: (props: RendererProps) => JSX.Element;
}) => {
  if (remainingTimeMs < 0) {
    remainingTimeMs = 0;
  }
  let remaining = remainingTimeMs;

  const minutes = Math.floor(remaining / 60000);
  remaining -= minutes * 60000;

  const seconds = Math.floor(remaining / 1000);
  remaining -= seconds * 1000;

  const flicker = Math.floor(remaining / 500);
  remaining -= flicker * 500;

  // setTimeout(onUpdate, 500 - remaining);
  React.useEffect(() => {
    const timer = setTimeout(onUpdate, 100);
    return () => clearTimeout(timer);
  });

  return renderer({ remainingTimeMs, totalTimeMs, minutes, seconds, flicker });
};

export const CountdownTimer = ({
  endTime,
  totalTimeMs,
  renderer,
}: {
  endTime: number;
  totalTimeMs: number;
  renderer: (props: RendererProps) => JSX.Element;
}) => {
  const [lastRenderTime, setLastRenderTime] = React.useState(Date.now());

  return (
    <Timer
      remainingTimeMs={endTime - lastRenderTime}
      totalTimeMs={totalTimeMs}
      onUpdate={() => setLastRenderTime(Date.now())}
      renderer={renderer}
    />
  );
};

export const PausedTimer = ({
  remainingTimeMs,
  totalTimeMs,
  renderer,
}: {
  remainingTimeMs: number;
  totalTimeMs: number;
  renderer: (props: RendererProps) => JSX.Element;
}) => (
  <Timer
    remainingTimeMs={remainingTimeMs}
    totalTimeMs={totalTimeMs}
    onUpdate={() => undefined}
    renderer={renderer}
  />
);
