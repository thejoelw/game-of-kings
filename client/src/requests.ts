import axios from 'axios';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { gameDefinition } from 'game-of-kings-common';

import {
  LobbyResponseCodec,
  LoginResponseCodec,
  GameResponseCodec,
} from './codecs';

const makeDecoder = <CodecType extends t.Any>(codec: CodecType) => (resp: {
  data: any;
}): t.TypeOf<CodecType> => {
  const result = codec.decode(resp.data);
  if (isLeft(result)) {
    throw new Error(PathReporter.report(result).join('\n'));
  }

  return result.right;
};

export const getLobby = () =>
  axios
    .get(`/games/${gameDefinition.name}`)
    .then(makeDecoder(LobbyResponseCodec));
export type LobbyResponseType = t.TypeOf<typeof LobbyResponseCodec>;

export const login = (username: string, password: string) =>
  axios
    .post(`/login`, { username, password })
    .then(makeDecoder(LoginResponseCodec));
export type LoginResponseType = t.TypeOf<typeof LoginResponseCodec>;

export const getGame = (gameId: string) =>
  axios
    .get(`/games/${gameDefinition.name}/${gameId}`)
    .then(makeDecoder(GameResponseCodec));
export type GameResponseType = t.TypeOf<typeof GameResponseCodec>;
