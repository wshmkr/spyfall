import { useState } from 'react';
import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import spyfallLogo from '../assets/logo.svg';
import {
  LOBBY_CODE_LENGTH,
  PLAYER_NAME_LENGTH,
  post,
  sanitizeLobbyCode,
  uuid,
} from '../utils/utils.ts';
import { modalStyle } from '../theme.ts';

function HomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState(localStorage.getItem('playerName') || '');
  const [showModal, setShowModal] = useState(false);
  const [disableCodeField, setDisableCodeField] = useState(false);
  const [codeHelperText, setCodeHelperText] = useState('');

  const handleCreateLobby = () => {
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/lobby`,
      post({ playerName: name.trim(), playerId: localStorage.getItem('playerId') || uuid() }),
    )
      .then((response) => response.json())
      .then((json) => {
        if (json['lobbyId']) {
          localStorage.setItem('playerId', json['playerId']);
          localStorage.setItem('playerName', json['playerName']);
          navigate(`/${json['lobbyId']}`);
        } else {
          console.error(json);
        }
      })
      .catch((error) => console.error(error));
  };

  // Call server to validate lobby code
  // If valid, join lobby with that code
  const handleCodeChange = (code: string) => {
    code = sanitizeLobbyCode(code);
    if (code.length != LOBBY_CODE_LENGTH) {
      setCodeHelperText('Code is 4 characters');
      return;
    }
    setDisableCodeField(true);
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/lobby/${code}`,
      post({ playerName: name.trim(), playerId: localStorage.getItem('playerId') || uuid() }),
    )
      .then((response) => response.json())
      .then((json) => {
        if (json['lobbyId']) {
          localStorage.setItem('playerId', json['playerId']);
          localStorage.setItem('playerName', json['playerName']);
          navigate(`/${code}`);
        } else {
          console.error(json);
          setCodeHelperText('Invalid Code');
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setDisableCodeField(false));
  };

  return (
    <Box>
      <img style={{ height: '8em' }} src={spyfallLogo} className="logo" alt="Spyfall logo" />
      <Typography variant="h4" sx={{ my: 4 }}>
        Spyfall
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Enter Your Name"
          placeholder="Player Name"
          defaultValue={localStorage.getItem('playerName')}
          slotProps={{ htmlInput: { maxLength: PLAYER_NAME_LENGTH } }}
          autoComplete="off"
          fullWidth
          onChange={(text) => setName(text.target.value)}
        />
      </Box>
      <Stack spacing={1}>
        <Button variant="contained" disabled={!name} onClick={handleCreateLobby}>
          Create Lobby
        </Button>
        <Button variant="contained" disabled={!name} onClick={() => setShowModal(true)}>
          Join Lobby
        </Button>
      </Stack>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h5" component="label">
            Enter Lobby Code
          </Typography>
          <TextField
            placeholder="Lobby Code"
            autoComplete="off"
            fullWidth
            slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
            helperText={codeHelperText}
            error={codeHelperText !== ''}
            disabled={disableCodeField}
            onChange={(text) => handleCodeChange(text.target.value)}
          />
        </Box>
      </Modal>
    </Box>
  );
}

export default HomePage;
