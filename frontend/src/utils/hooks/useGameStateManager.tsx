import { useEffect, useState } from 'react';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import useWebSocket from 'react-use-websocket';
import { Lobby, Player } from '../models.ts';
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

interface JsonMessage {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any };
}

export const useGameStateManager = (navigate: NavigateFunction) => {
  const {
    sendJsonMessage,
    lastJsonMessage,
    readyState: socketState,
  } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL, {
    shouldReconnect: () => true,
    reconnectInterval: 3000,
    heartbeat: {
      message: 'PING',
      returnMessage: 'PONG',
      interval: 10000,
      timeout: 20000,
    },
  });

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

    if (localStorage.getItem('playerName') === null) {
      const thisPlayer = lobby.players.find(
        (player) => player.id === localStorage.getItem('playerId'),
      );
      localStorage.setItem('playerName', thisPlayer!.name);
    }
  };

  const handlePlayerJoin = (id: string, name: string, dedupe: number) => {
    const newPlayer: Player = {
      id: id,
      name: name,
      dedupe: dedupe,
      disconnected: false,
    };
    if (players.some((player) => player.id === id)) return;
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handlePlayerLeave = (id: string) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  const handlePlayerDisconnect = (id: string) => {
    const disconnectedPlayer = { ...players.find((player) => player.id === id)! };
    disconnectedPlayer.disconnected = true;

    setPlayers(players.map((player) => (player.id !== id ? player : disconnectedPlayer)));
  };

  const handlePlayerReconnect = (id: string, name: string) => {
    if (id === localStorage.getItem('playerId')) {
      return;
    }

    const reconnectedPlayer = { ...players.find((player) => player.id === id)! };
    reconnectedPlayer.disconnected = false;
    reconnectedPlayer.name = name;

    setPlayers(players.map((player) => (player.id !== id ? player : reconnectedPlayer)));
  };

  const handlePlayerRename = (playerId: string, newName: string, dedupe: number) => {
    const renamedPlayer = { ...players.find((player) => player.id === playerId)! };
    renamedPlayer.name = newName;
    renamedPlayer.dedupe = dedupe;

    setPlayers(players.map((player) => (player.id !== playerId ? player : renamedPlayer)));

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
    const message = lastJsonMessage as JsonMessage;
    if (!message) {
      return;
    }

    const data = message.data;
    switch (message.type) {
      case 'LOBBY_STATE': {
        handleLobbyState(data['lobby']);
        break;
      }
      case 'PLAYER_JOIN': {
        handlePlayerJoin(data['playerId'], data['playerName'], data['dedupe']);
        break;
      }
      case 'PLAYER_LEAVE': {
        handlePlayerLeave(data['playerId']);
        break;
      }
      case 'PLAYER_RENAME': {
        handlePlayerRename(data['playerId'], data['playerName'], data['dedupe']);
        break;
      }
      case 'PLAYER_DISCONNECT': {
        handlePlayerDisconnect(data['playerId']);
        break;
      }
      case 'PLAYER_RECONNECT': {
        handlePlayerReconnect(data['playerId'], data['playerName']);
        break;
      }
      case 'CREATOR_CHANGE': {
        handleCreatorChange(data['playerId']);
        break;
      }
      case 'POSSIBLE_LOCATIONS': {
        handlePossibleLocations(data['locations']);
        break;
      }
      case 'GO_HOME': {
        handleGoHome();
        break;
      }
      default: {
        console.error(`Received event with unhandled type: ${message.type}`);
      }
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

  const sendEvent = {
    playerJoinEvent,
    playerRenameEvent,
    kickPlayerEvent,
    startGameEvent,
    returnToLobbyEvent,
  };

  const gameState = {
    players,
    creator,
    location,
    startTime,
    duration,
    possibleLocations,
  };

  return {
    gameState,
    sendEvent,
    socketState,
  };
};
