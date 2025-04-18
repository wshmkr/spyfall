import { useEffect, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Timer } from '@mui/icons-material';

interface GameTimerProps {
  startTime: number;
  duration: number;
  setGameOver: (b: boolean) => void;
}

function GameTimer({ startTime, duration, setGameOver }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = startTime + duration - now;

      if (diff <= 0) {
        setGameOver(true);
        return;
      }

      const minutes = Math.floor(diff / 60)
        .toString()
        .padStart(2, '0');
      const seconds = (diff % 60).toString().padStart(2, '0');
      setTimeLeft(`${minutes}:${seconds}`);
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [startTime, duration, setGameOver]);

  return (
    <Button variant="contained" disabled sx={{ height: '47px' }}>
      <Timer />
      {timeLeft ? timeLeft : <CircularProgress size={24} color="inherit" />}
    </Button>
  );
}

export default GameTimer;
