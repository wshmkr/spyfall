import { AppBar, Box, Grid2, Stack, Tab, Tabs } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { AssignmentInd, Place, PowerOff } from '@mui/icons-material';
import { Player } from '../utils/models.ts';
import StrikeableButton from '../atoms/StrikeableButton.tsx';

interface NotesTabsProps {
  players: Player[];
  locations: string[];
}

interface LocationsTabProps {
  locations: string[];
  selected: boolean;
}

interface PlayersTabProps {
  players: Player[];
  selected: boolean;
}

function LocationsTab({ locations, selected }: LocationsTabProps) {
  return (
    <Box hidden={!selected}>
      <Grid2 container rowSpacing={0}>
        {locations.map((location) => (
          <Grid2 size={{ xs: 6, sm: 4 }} key={location}>
            <StrikeableButton text={location} />
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}

function PlayersTab({ players, selected }: PlayersTabProps) {
  return (
    <Box hidden={!selected}>
      <Grid2 container>
        {players.map((player) => {
          return (
            <Grid2 size={{ xs: 12, sm: 6 }} sx={{ my: 1 }} key={player.name}>
              <StrikeableButton text={player.name} icon={player.disconnected && <PowerOff />} />
            </Grid2>
          );
        })}
      </Grid2>
    </Box>
  );
}

function NotesTabs({ players, locations }: NotesTabsProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Stack pt={1}>
      <AppBar position="static" sx={{ borderRadius: '5px 5px 2px 2px' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
          <Tab
            label="Locations"
            icon={<Place sx={{ fontSize: 20 }} />}
            iconPosition="start"
            value={0}
          />
          <Tab
            label="Players"
            icon={<AssignmentInd sx={{ fontSize: 20 }} />}
            iconPosition="start"
            value={1}
          />
        </Tabs>
      </AppBar>
      <Box height="66vh" overflow="auto">
        <LocationsTab locations={locations} selected={tabIndex === 0} />
        <PlayersTab players={players} selected={tabIndex === 1} />
      </Box>
    </Stack>
  );
}

export default NotesTabs;
