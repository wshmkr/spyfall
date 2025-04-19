import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ad1457',
    },
    secondary: {
      main: '#f2e7fe',
    },
  },
  typography: {
    fontFamily: '"Sniglet", sans-serif',
    fontSize: 20,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiStack: {
      styleOverrides: {
        root: {
          fill: 'currentcolor',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          fill: 'currentcolor',
        },
      },
    },
    MuiSvgIcon: {
      defaultProps: {
        fontSize: 'small',
      },
      styleOverrides: {
        root: {
          fill: 'inherit',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          height: '50px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          height: '50px',
          minHeight: '50px',
          textTransform: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        spellCheck: false,
        autoComplete: 'off',
      },
    },
  },
});

export const listItemStylePrimary = {
  bgcolor: '#f2e7fe',
  color: '#ad1457',
  fill: '#ad1457',
  borderRadius: '5px',
};
