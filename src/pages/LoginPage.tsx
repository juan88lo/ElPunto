import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import {
  Box, Button, TextField, Typography, Paper,
  CircularProgress, Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material/styles';
import Logo from '../assets/elpuntologo.jpg';

const LOGIN_MUTATION = gql`
  mutation Login($correo: String!, $password: String!) {
    login(correo: $correo, password: $password) {
      token
      mensaje
      usuario {
        id
        nombre
        permisos { nombrePermiso }
        tipoUsuario {
          id
          nombre
        }
        empleado {
          id
          nombre
        }
      }
    }
  }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login } = useAuth();          
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [runLogin, { data, loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await runLogin({ variables: { correo, password } });
      const { token, usuario } = res.data.login;

      // transforma [{nombrePermiso:'ver_ventas'}, ...] → ['ver_ventas', ...]
      const permisosArray = usuario.permisos.map((p: any) => p.nombrePermiso);

      // guarda en AuthContext (esto también puede usar localStorage si así lo definiste)
      login(token, permisosArray);

      // navega SIN recargar toda la aplicación
      navigate('/dashboard');
    } catch (err: any) {
      // Error manejado silenciosamente en producción
      // En desarrollo se puede descomentar para debugging: console.error('Error de login:', err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #4A0072 60%, #2a1a3a 100%)'  // Mantener morado en modo oscuro
          : 'linear-gradient(135deg, #4A0072 60%, #F9A825 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Efecto decorativo en la parte morada */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '60%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
          <ellipse cx="300" cy="400" rx="320" ry="120" fill="#fff" fillOpacity={theme.palette.mode === 'dark' ? "0.08" : "0.13"} />
          <ellipse cx="320" cy="600" rx="200" ry="60" fill="#fff" fillOpacity={theme.palette.mode === 'dark' ? "0.06" : "0.09"} />
          <ellipse cx="250" cy="200" rx="180" ry="50" fill="#fff" fillOpacity={theme.palette.mode === 'dark' ? "0.05" : "0.08"} />
        </svg>
      </Box>
      <Paper
        elevation={10}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 400,
          borderRadius: 6,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px 0 rgba(74,0,114,0.3)'
            : '0 8px 32px 0 rgba(74,0,114,0.18)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: theme.palette.mode === 'dark' 
            ? 'rgba(45,35,50,0.95)'  // Fondo con tinte morado
            : 'rgba(255,255,255,0.96)',
          zIndex: 1,
          border: theme.palette.mode === 'dark' ? '1px solid #5B3758' : 'none',  // Borde morado
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
            width: '100%',
          }}
        >
          <img
            src={Logo}
            alt="El Punto"
            style={{
              maxWidth: 120,
              borderRadius: 12,
              boxShadow: '0 2px 12px 0 rgba(74,0,114,0.10)',
            }}
          />
        </Box>

        <Typography
          variant="h5"
          align="center"
          sx={{
            mb: 3,
            color: theme.palette.mode === 'dark' ? '#D1C4E9' : '#4A0072',  // Morado claro en modo oscuro
            fontWeight: 700,
            letterSpacing: 1,
            textShadow: theme.palette.mode === 'dark' 
              ? '0 1px 2px rgba(0,0,0,0.5)'
              : '0 1px 2px #fff8',
            transition: 'color 0.3s ease',
          }}
        >
          Iniciar Sesión
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Correo"
            type="email"
            fullWidth
            required
            variant="outlined"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: theme.palette.mode === 'dark' ? '#4a3a4a' : '#f7f7fa',  // Fondo con tinte morado
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? '#7B4397' : '#ddd',  // Borde morado
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? '#9C4DCC' : '#bbb',  // Hover morado
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F9A825',
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.mode === 'dark' ? '#D1C4E9' : 'inherit',  // Label morado claro
              },
              '& .MuiInputBase-input': {
                color: theme.palette.mode === 'dark' ? '#fff' : 'inherit',
              },
            }}
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            required
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: theme.palette.mode === 'dark' ? '#4a3a4a' : '#f7f7fa',  // Fondo con tinte morado
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? '#7B4397' : '#ddd',  // Borde morado
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? '#9C4DCC' : '#bbb',  // Hover morado
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F9A825',
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.mode === 'dark' ? '#D1C4E9' : 'inherit',  // Label morado claro
              },
              '& .MuiInputBase-input': {
                color: theme.palette.mode === 'dark' ? '#fff' : 'inherit',
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            variant="contained"
            sx={{
              backgroundColor: '#F9A825',
              color: theme.palette.mode === 'dark' ? '#1a1a1a' : '#4A0072',
              fontWeight: 'bold',
              fontSize: 17,
              borderRadius: 3,
              py: 1.2,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 2px 8px 0 rgba(249,168,37,0.3)'
                : '0 2px 8px 0 #F9A82544',
              '&:hover': {
                backgroundColor: '#fbc02d',
                color: theme.palette.mode === 'dark' ? '#1a1a1a' : '#4A0072',
              },
              transition: 'all 0.2s',
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
          </Button>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error.message}
          </Alert>
        )}
        {data && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            {data.login.mensaje}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
