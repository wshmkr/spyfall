import { Box, Button, List, Typography } from '@mui/material';
import PlayerListItem from '../molecules/PlayerListItem.tsx';
import { GamePageProps } from '../pages/GamePage.tsx';

type LobbyPaneProps = GamePageProps & {
  playerRenameEvent: (newName: string) => void;
  kickPlayerEvent: (playerId: string) => void;
  startGameEvent: () => void;
};
function LobbyPane({
  gameState,
  playerRenameEvent,
  kickPlayerEvent,
  startGameEvent,
}: LobbyPaneProps) {
  const isCreator = gameState.creator === localStorage.getItem('playerId');

  return (
    <Box height="80vh" display="flex" flexDirection="column">
      <List sx={{ flexGrow: 1 }}>
        {gameState.players.map((player) => (
          <PlayerListItem
            key={player.id + player.name}
            player={player}
            rename={playerRenameEvent}
            kick={kickPlayerEvent}
            creator={gameState.creator}
          />
        ))}
      </List>
      {isCreator && (
        <Button
          onClick={startGameEvent}
          disabled={gameState.players.length < 3}
          variant="contained"
        >
          Start Game
        </Button>
      )}
      {!isCreator && <Typography>Waiting for Host...</Typography>}
    </Box>
  );
}

export default LobbyPane;
