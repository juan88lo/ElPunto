import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useDarkModeForcer, useDarkModeRerender } from '../hooks/useDarkMode';

// Tema claro
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F9A825', 
      contrastText: '#fff',
    },
    secondary: {
      main: '#fbc02d',  
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    divider: '#e0e0e0',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#F9A825',
          color: '#4A0072',
          '&:hover': {
            backgroundColor: '#fbc02d',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
        },
      },
    },
  },
});

// Tema oscuro
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F9A825',
      contrastText: '#1a1a1a',
    },
    secondary: {
      main: '#fbc02d',
    },
    background: {
      default: '#0f0f0f',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    divider: '#333333',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f0f0f !important',
          color: '#ffffff !important',
        },
        html: {
          backgroundColor: '#0f0f0f !important',
        },
        '#root': {
          backgroundColor: '#0f0f0f !important',
          color: '#ffffff !important',
        }
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#F9A825',
          color: '#1a1a1a',
          '&:hover': {
            backgroundColor: '#fbc02d',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #2a2a2a 0%, #3a3a3a 100%)',
          backgroundColor: '#2a2a2a !important',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e !important',
          borderColor: '#333333',
          color: '#ffffff !important',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e !important',
          color: '#ffffff !important',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f0f0f !important',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#ffffff !important',
        },
        body2: {
          color: '#b0b0b0 !important',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e !important',
          color: '#ffffff !important',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e !important',
          color: '#ffffff !important',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e !important',
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1e1e1e !important',
            color: '#ffffff !important',
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e !important',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a !important',
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e !important',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent !important',
          color: '#ffffff !important',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent !important',
          color: '#ffffff !important',
          borderColor: '#333333 !important',
        },
      },
    },
  },
});

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Usar los hooks para forzar el modo oscuro
  useDarkModeForcer(isDarkMode);
  useDarkModeRerender(isDarkMode);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Aplicar clases CSS al body para forzar el modo correspondiente
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.setAttribute('data-mui-color-scheme', 'dark');
      
      // Remover clases de modo claro
      document.body.classList.remove('light-mode');
      document.documentElement.classList.remove('light-mode');
      
      // Forzar color de fondo inmediatamente
      document.body.style.setProperty('background-color', '#0f0f0f', 'important');
      document.documentElement.style.setProperty('background-color', '#0f0f0f', 'important');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.removeAttribute('data-mui-color-scheme');
      
      // Añadir clases de modo claro
      document.body.classList.add('light-mode');
      document.documentElement.classList.add('light-mode');
      document.documentElement.setAttribute('data-theme', 'light');
      
      // Restaurar colores del modo claro inmediatamente
      document.body.style.setProperty('background-color', '#fafafa', 'important');
      document.documentElement.style.setProperty('background-color', '#fafafa', 'important');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={currentTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
