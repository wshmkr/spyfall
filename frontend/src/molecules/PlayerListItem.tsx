import {
  Box,
  Button,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Modal,
  TextField,
} from '@mui/material';
import { Close, Edit, Face, FaceRetouchingNatural } from '@mui/icons-material';
import { useState } from 'react';
import { Player } from '../utils/models.ts';
import { modalStyle } from '../utils/utils.ts';

interface PlayerListItemProps {
  player: Player;
  rename: (newName: string) => void;
  creator: string;
}

function PlayerListItem({ player, rename, creator }: PlayerListItemProps) {
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState(player.name);

  const canEdit = player.id === localStorage.getItem('playerId');
  const canKick = creator === localStorage.getItem('playerId') && !canEdit;
  const dedupeString = (player.dedupe ?? 0 > 0) ? `(${[player.dedupe]})` : '';

  const onRename = () => {
    rename(newName);
    setShowModal(false);
  };

  return (
    <ListItem
      secondaryAction={
        (canEdit || canKick) && (
          <IconButton edge="end" onClick={() => setShowModal(true)}>
            {canEdit && <Edit />}
            {canKick && <Close />}
          </IconButton>
        )
      }
    >
      <ListItemIcon>{player.id === creator ? <FaceRetouchingNatural /> : <Face />}</ListItemIcon>
      <ListItemText primary={`${player.name} ${dedupeString}`} />
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box sx={modalStyle}>
          <TextField
            label="Change name"
            defaultValue={player.name}
            slotProps={{ htmlInput: { maxLength: 16 } }}
            autoComplete="off"
            fullWidth
            onChange={(text) => setNewName(text.target.value.trim())}
          />
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={onRename} disabled={newName === player.name}>
            Submit
          </Button>
        </Box>
      </Modal>
    </ListItem>
  );
}

export default PlayerListItem;
