export interface GameConfig {
  radius: number;
}

export interface User {
  id: string;
  username: string;
  rating: number;
}

export interface Match {
  id: string;
  gameConfig: GameConfig;
  players: User[];
}

export interface LobbyResponse {
  matches: Match[];
  user: User;
}
