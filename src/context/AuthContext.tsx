import React, { createContext, useContext, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { jwtDecode } from 'jwt-decode';

interface AuthContextProps {
  token: string | null;
  permisos: string[];
  usuario: TokenPayload | null;
  login: (token: string, permisos: string[]) => void;
  logout: () => void;
}

interface TokenPayload {
  id: string;
  nombre?: string;
  correo?: string;
  email?: string;
  empleado?: {
    id: string;
    nombre: string;
  };
  empleadoId?: string;
  // otros campos si es necesario
}
const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);
export const useAuth = () => useContext(AuthContext);

const SESSION_DURATION_MS = 30 * 60 * 1000;   // 30 min
const WARNING_BEFORE_MS = 60 * 1000;          // 1 min antes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [warn, setWarn] = useState(false);
  const [timerId, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [warningId, setWarning] = useState<NodeJS.Timeout | null>(null);
  const [permisos, setPermisos] = useState<string[]>(() => {
    const stored = localStorage.getItem('permisos');
    return stored ? JSON.parse(stored) : [];
  });
  const [usuario, setUsuario] = useState<TokenPayload | null>(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return null;

    try {   
      return jwtDecode<TokenPayload>(storedToken);
    } catch (err) {
      return null;
    }
  });
  const clearTimers = () => {
    if (timerId) clearTimeout(timerId);
    if (warningId) clearTimeout(warningId);
  };

  const startTimers = () => {
    clearTimers();
    const warnId = setTimeout(() => setWarn(true), SESSION_DURATION_MS - WARNING_BEFORE_MS);
    const logoutId = setTimeout(() => logout(), SESSION_DURATION_MS);
    setWarning(warnId);
    setTimer(logoutId);
  };

  const login = (t: string, permisosUsuario: string[]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('permisos', JSON.stringify(permisosUsuario));

    let decoded: TokenPayload | null = null;
    try {
      decoded = jwtDecode<TokenPayload>(t);
      setUsuario(decoded);
    } catch (err) {
      // Error manejado silenciosamente en producción
      // En desarrollo se puede descomentar para debugging: console.error("Error al decodificar el token JWT:", err);
    }

    setToken(t);
    setPermisos(permisosUsuario);
    startTimers();
  };

  const logout = () => {
    clearTimers();
    localStorage.removeItem('token');
    localStorage.removeItem('permisos');
    setToken(null);
    setPermisos([]);  
    setWarn(false);
    window.location.href = '/login';
    setUsuario(null);
  };

  // al montar, si hay token reinicia timers
  useEffect(() => {
    if (token) startTimers();
  }, []);

  return (
    <AuthContext.Provider value={{ token, permisos, usuario, login, logout }}>
      {children}
      <Dialog
        open={warn}
        onClose={() => setWarn(false)}
        aria-labelledby="session-expiry-title"
        aria-describedby="session-expiry-description"
      >
        <DialogTitle id="session-expiry-title">
          ⚠️ Sesión a punto de expirar
        </DialogTitle>
        <DialogContent>
          <Typography id="session-expiry-description">
            Tu sesión vencerá en menos de un minuto. ¿Deseas continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setWarn(false); startTimers(); }} variant="contained" color="primary">
            Continuar sesión
          </Button>
          <Button onClick={logout} variant="outlined" color="error">
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>

    </AuthContext.Provider>
  );
};

 