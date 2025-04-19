import { Stack, Typography } from '@mui/material';

interface LocationProps {
  location: string;
}

function LocationDisplay({ location }: LocationProps) {
  return (
    <Stack height="52px">
      <Typography
        sx={{
          height: '100%',
          py: 1,
          color: 'secondary.main',
          bgcolor: 'primary.main',
          fontSize: 'min(calc(1rem + 1.5vw), 27px)',
          alignContent: 'center',
          borderRadius: '0 5px 5px 0',
          lineHeight: 0.9,
        }}
      >
        {location}
      </Typography>
    </Stack>
  );
}

export default LocationDisplay;
