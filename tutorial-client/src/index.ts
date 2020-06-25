import { v4 as uuid } from 'uuid';

import { LobbyModule } from 'game-of-kings-common';

import { send, onModuleUpdate, userId } from './socket';
import { runTutorial, GameOverError } from './tutorial';

send('user-rename', 'Tutorial Bot');

const matches = new Map<string, {}>();

onModuleUpdate('lobby', LobbyModule, (lobby) => {
  const hasChallenge = lobby.challenges.some(
    ({ challengerId, opponentId, matchId }) => {
      if (challengerId === userId) {
        if (matchId) {
          if (!matches.has(matchId)) {
            matches.set(matchId, {});
            runTutorial(matchId)
              .catch((err) => {
                if (err instanceof GameOverError) {
                  return;
                } else {
                  throw err;
                }
              })
              .then(() => matches.delete(matchId));
          }
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
  );

  if (!hasChallenge) {
    send('lobby-extend-challenge', {
      id: uuid(),
      challengerId: userId,
      variant: {
        radius: 5,
        spawnsAvailable: 12,
        timeInitialMs: 5 * 60 * 1000,
        timeIncrementMs: 8 * 1000,
      },
    });
  }
});
