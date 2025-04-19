import { Stack, Typography } from '@mui/material';

interface RoleProps {
  role: string;
}

function RoleDisplay({ role }: RoleProps) {
  return (
    <Stack height="52px">
      <Typography
        sx={{
          height: '100%',
          py: 1,
          color: 'primary.main',
          bgcolor: 'secondary.main',
          fontSize: 'min(calc(1rem + 1.5vw), 27px)',
          alignContent: 'center',
          borderRadius: '5px 0 0 5px',
          lineHeight: 0.9,
        }}
      >
        {role}
      </Typography>
    </Stack>
  );
}

export default RoleDisplay;
