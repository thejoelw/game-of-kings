import React from 'react';
import { Segment, Progress } from 'semantic-ui-react';

export const Timer = ({
  remainingTimeMs,
  totalTimeMs,
  onUpdate,
  active,
  attachPosition,
}: {
  remainingTimeMs: number;
  totalTimeMs: number;
  onUpdate: () => void;
  active: boolean;
  attachPosition: 'top' | 'bottom';
}) => {
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

  return (
    <Segment
      style={{
        padding: '0.6em',
        fontSize: '20px',
        fontFamily:
          "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
        backgroundColor: active ? '#d0e0bd' : 'white',
      }}
    >
      <Progress
        percent={(remainingTimeMs / totalTimeMs) * 100}
        attached={attachPosition}
      />
      {minutes.toString().padStart(2, '0')}
      <span style={{ color: flicker ? 'gray' : 'silver' }}>:</span>
      {seconds.toString().padStart(2, '0')}
    </Segment>
  );
};

export const CountdownTimer = ({
  endTime,
  totalTimeMs,
  attachPosition,
  onEnd,
}: {
  endTime: number;
  totalTimeMs: number;
  attachPosition: 'top' | 'bottom';
  onEnd: () => void;
}) => {
  const [lastRenderTime, setLastRenderTime] = React.useState(Date.now());

  const ended = lastRenderTime > endTime;
  React.useEffect(() => {
    ended && onEnd();
  }, [ended]);

  if (ended) {
    return (
      <Timer
        remainingTimeMs={0}
        totalTimeMs={totalTimeMs}
        onUpdate={() => {}}
        active={true}
        attachPosition={attachPosition}
      />
    );
  } else {
    return (
      <Timer
        remainingTimeMs={endTime - lastRenderTime}
        totalTimeMs={totalTimeMs}
        onUpdate={() => setLastRenderTime(Date.now())}
        active={true}
        attachPosition={attachPosition}
      />
    );
  }
};

export const PausedTimer = ({
  remainingTimeMs,
  totalTimeMs,
  attachPosition,
}: {
  remainingTimeMs: number;
  totalTimeMs: number;
  attachPosition: 'top' | 'bottom';
}) => (
  <Timer
    remainingTimeMs={remainingTimeMs}
    totalTimeMs={totalTimeMs}
    onUpdate={() => undefined}
    active={false}
    attachPosition={attachPosition}
  />
);
