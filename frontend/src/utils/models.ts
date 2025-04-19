export interface Player {
  id: string;
  name: string;
  role?: string;
  dedupe?: number;
  disconnected: boolean;
}

export interface Lobby {
  id: string;
  creator: string;
  players: Player[];
  location?: string;
  start_time?: number;
  duration?: number;
}

export enum LobbyStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
}

interface CreateLobbyRequest {
  playerName: string;
  playerId: string;
}

interface CheckLobbyRequest {
  playerName: string;
  playerId: string;
}

export type RequestBody = CreateLobbyRequest | CheckLobbyRequest;

export interface WebSocketMessage {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export type WebSocketMessageType =
  | 'LOBBY_STATE'
  | 'PLAYER_JOIN'
  | 'PLAYER_LEAVE'
  | 'PLAYER_RENAME'
  | 'PLAYER_DISCONNECT'
  | 'PLAYER_RECONNECT'
  | 'CREATOR_CHANGE'
  | 'POSSIBLE_LOCATIONS'
  | 'GO_HOME'
  | 'START_GAME'
  | 'RETURN_TO_LOBBY'
  | 'KICK_PLAYER';
