import { useNavigate, useParams } from 'react-router-dom';
import { GameStateType, useGameStateManager } from '../utils/hooks/useGameStateManager';
import { useEffect } from 'react';
import { LobbyStatus } from '../utils/models.ts';
import LobbyPane from '../organisms/LobbyPane.tsx';
import RolePane from '../organisms/RolePane.tsx';
import { Divider, IconButton, Stack } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import LobbyCodeDisplay from '../molecules/LobbyCodeDisplay.tsx';

export interface GamePageProps {
  gameState: GameStateType;
  status?: LobbyStatus;
}

function GamePage() {
  const navigate = useNavigate();
  const { lobbyId } = useParams();

  useEffect(() => {
    if (!lobbyId || lobbyId.length !== 4) {
      navigate('/');
      return;
    }
    const sanitizedLobbyId = lobbyId.replace('I', '1').replace('0', 'O').toUpperCase();
    if (sanitizedLobbyId !== lobbyId) {
      navigate(`/${sanitizedLobbyId}`);
    }
  }, [lobbyId, navigate]);

  const { gameState, sendEvent, socketState } = useGameStateManager(navigate);
  const status = gameState.startTime ? LobbyStatus.IN_PROGRESS : LobbyStatus.NOT_STARTED;

  useEffect(() => {
    if (socketState === WebSocket.OPEN) {
      sendEvent.playerJoinEvent(lobbyId!);
    }
  }, [socketState]);

  return (
    <Stack height="100%">
      <Stack direction="row" spacing={-5} mx={1} my={0.5}>
        <IconButton onClick={() => navigate('/')} disableRipple>
          <ArrowBackIosNew color="primary" />
        </IconButton>
        <LobbyCodeDisplay lobbyId={lobbyId} />
      </Stack>
      <Divider />

      {status === LobbyStatus.NOT_STARTED && (
        <LobbyPane
          gameState={gameState!}
          playerRenameEvent={sendEvent.playerRenameEvent}
          kickPlayerEvent={sendEvent.kickPlayerEvent}
          startGameEvent={sendEvent.startGameEvent}
        />
      )}
      {status === LobbyStatus.IN_PROGRESS && (
        <RolePane gameState={gameState!} returnToLobbyEvent={sendEvent.returnToLobbyEvent} />
      )}
    </Stack>
  );
}

export default GamePage;
