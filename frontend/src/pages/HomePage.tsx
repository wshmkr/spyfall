import { useEffect, useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { PLAYER_NAME_LENGTH, post, uuid } from '../utils/utils.ts';
import LobbyCodeDialog from '../molecules/LobbyCodeDialog.tsx';

function HomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState(localStorage.getItem('playerName') || '');
  const [showLobbyCodeModal, setShowLobbyCodeModal] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/`, { method: 'GET' });
  }, []);

  const handleCreateLobby = () => {
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/lobby`,
      post({ playerName: name.trim(), playerId: localStorage.getItem('playerId') || uuid() }),
    )
      .then((response) => response.json())
      .then((json) => {
        if (json.lobbyId) {
          localStorage.setItem('playerId', json.playerId);
          localStorage.setItem('playerName', json.playerName);
          navigate(`/${json.lobbyId}`);
        } else {
          console.error(json);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleJoinLobby = () => {
    setShowLobbyCodeModal(true);
  };

  return (
    <Stack height="100%" p="2rem" justifyContent="center" alignItems="center">
      <img style={{ width: '100%', maxWidth: '400px' }} src={logo} alt="logo" />
      <Typography variant="h4" sx={{ mb: 5 }} fontFamily="Playpen Sans">
        Spyfall
      </Typography>
      <Stack width="100%" maxWidth="400px">
        <TextField
          label="Enter your name"
          placeholder="Player Name"
          value={name}
          slotProps={{ htmlInput: { maxLength: PLAYER_NAME_LENGTH } }}
          fullWidth
          onChange={(event) => setName(event.target.value)}
          sx={{ mb: 2 }}
        />
        <Stack spacing={1} mb={4}>
          <Button variant="contained" disabled={!name} onClick={handleCreateLobby}>
            Create Lobby
          </Button>
          <Button variant="contained" disabled={!name} onClick={handleJoinLobby}>
            Join Lobby
          </Button>
        </Stack>
      </Stack>
      <LobbyCodeDialog
        open={showLobbyCodeModal}
        onClose={() => setShowLobbyCodeModal(false)}
        playerName={name}
      />
    </Stack>
  );
}

export default HomePage;
