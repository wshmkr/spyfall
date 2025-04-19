import { useEffect, useState } from 'react';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import useWebSocket from 'react-use-websocket';
import { Lobby, Player, WebSocketMessage, WebSocketMessageType } from '../models.ts';
import { uuid } from '../utils.ts';
import { NavigateFunction } from 'react-router-dom';

export interface GameStateType {
  players: Player[];
  creator: string;
  location?: string;
  startTime?: number;
  duration?: number;
  possibleLocations: string[];
}

export const useGameStateManager = (navigate: NavigateFunction) => {
  const {
    sendJsonMessage,
    lastJsonMessage,
    readyState: socketState,
  } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL);

  const [players, setPlayers] = useState<Player[]>([]);
  const [creator, setCreator] = useState<string>('');
  const [location, setLocation] = useState<string>();
  const [startTime, setStartTime] = useState<number>();
  const [duration, setDuration] = useState<number>();
  const [possibleLocations, setPossibleLocations] = useState<string[]>([]);

  const handleLobbyState = (lobby: Lobby) => {
    setPlayers(lobby.players);
    setCreator(lobby.creator);
    setLocation(lobby.location);
    setStartTime(lobby.start_time);
    setDuration(lobby.duration);

    const playerId = localStorage.getItem('playerId');
    const currentPlayer = lobby.players.find((player) => player.id === playerId);
    if (currentPlayer) {
      localStorage.setItem('playerName', currentPlayer.name);
    }
  };

  const handlePlayerJoin = (id: string, name: string, dedupe: number) => {
    if (players.some((player) => player.id === id)) return;
    setPlayers((prev) => [...prev, { id, name, dedupe, disconnected: false }]);
  };

  const handlePlayerLeave = (id: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  };

  const handlePlayerDisconnect = (id: string) => {
    setPlayers((prev) =>
      prev.map((player) => (player.id === id ? { ...player, disconnected: true } : player)),
    );
  };

  const handlePlayerReconnect = (id: string, name: string) => {
    if (id === localStorage.getItem('playerId')) return;

    setPlayers((prev) =>
      prev.map((player) => (player.id === id ? { ...player, disconnected: false, name } : player)),
    );
  };

  const handlePlayerRename = (playerId: string, newName: string, dedupe: number) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, name: newName, dedupe } : player,
      ),
    );

    if (playerId === localStorage.getItem('playerId')) {
      localStorage.setItem('playerName', newName);
    }
  };

  const handleCreatorChange = (id: string) => {
    setCreator(id);
  };

  const handlePossibleLocations = (locations: string[]) => {
    setPossibleLocations(locations);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  useEffect(() => {
    const message = lastJsonMessage as WebSocketMessage;
    if (!message) return;

    const { type, data } = message;
    switch (type as WebSocketMessageType) {
      case 'LOBBY_STATE':
        handleLobbyState(data.lobby);
        break;
      case 'PLAYER_JOIN':
        handlePlayerJoin(data.playerId, data.playerName, data.dedupe);
        break;
      case 'PLAYER_LEAVE':
        handlePlayerLeave(data.playerId);
        break;
      case 'PLAYER_RENAME':
        handlePlayerRename(data.playerId, data.playerName, data.dedupe);
        break;
      case 'PLAYER_DISCONNECT':
        handlePlayerDisconnect(data.playerId);
        break;
      case 'PLAYER_RECONNECT':
        handlePlayerReconnect(data.playerId, data.playerName);
        break;
      case 'CREATOR_CHANGE':
        handleCreatorChange(data.playerId);
        break;
      case 'POSSIBLE_LOCATIONS':
        handlePossibleLocations(data.locations);
        break;
      case 'GO_HOME':
        handleGoHome();
        break;
      default:
        console.error(`Received event with unhandled type: ${type}`);
    }
  }, [lastJsonMessage]);

  const playerJoinEvent = (lobbyId: string) => {
    if (!localStorage.getItem('playerId')) {
      localStorage.setItem('playerId', uuid());
    }
    sendJsonMessage({
      type: 'PLAYER_JOIN',
      data: {
        lobbyId: lobbyId,
        playerId: localStorage.getItem('playerId'),
        playerName:
          localStorage.getItem('playerName') ??
          uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            length: 2,
            separator: ' ',
            style: 'capital',
          }),
      },
    });
  };

  const playerRenameEvent = (newName: string) => {
    sendJsonMessage({
      type: 'PLAYER_RENAME',
      data: {
        playerId: localStorage.getItem('playerId'),
        playerName: newName,
      },
    });
  };

  const kickPlayerEvent = (playerId: string) => {
    sendJsonMessage({
      type: 'KICK_PLAYER',
      data: {
        playerId: playerId,
      },
    });
  };

  const startGameEvent = () => {
    sendJsonMessage({
      type: 'START_GAME',
      data: {},
    });
  };

  const returnToLobbyEvent = () => {
    sendJsonMessage({
      type: 'RESET_GAME',
      data: {},
    });
  };

  return {
    gameState: {
      players,
      creator,
      location,
      startTime,
      duration,
      possibleLocations,
    },
    sendEvent: {
      playerJoinEvent,
      playerRenameEvent,
      kickPlayerEvent,
      startGameEvent,
      returnToLobbyEvent,
    },
    socketState,
  };
};
