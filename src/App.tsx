
import { ApolloProvider } from '@apollo/client';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material';
import DarkModeEnforcer from './components/DarkModeEnforcer';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import client from './apolloClient';
import { keyframes } from '@mui/system';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { CajaProvider } from './context/CajaContext';
import ProveedorPage from './pages/ProveedorPage';
import InventarioPage from './pages/InventarioPage';
import AdministracionPage from './pages/administracionPage';
import NotaCreditoPage from './pages/NotaCreditoPage';
import FamiliaPage from './pages/FamiliasPage';
import VentasPage from './pages/Factura';
import React from 'react';
import Logo from './assets/logopng.png';
import { useAuth } from './context/AuthContext';
import PagosPage from './pages/PagosPage';
import { PagosProvider } from './context/PagosContext';
import CajasPage from './pages/CajasPage';
import { SesionContext } from './context/SesionContext';
import SalesReport from './pages/reports/SalesReport';
import ReportesDashboard from "./pages/ReportesDashboard";
import ProfitReport from "./pages/reports/ProfitReport";
import InventoryReport from "./pages/reports/InventoryReport";
import { ThemeProvider, useThemeMode } from './context/ThemeContext';
import SolicitudVacaciones from './pages/SolicitudVacaciones';
import { AuthProvider } from './context/AuthContext';  
import CargarInventarioCSV from './pages/CargarInventarioCSV';
import Sidebar from './components/Sidebar';
import { useSidebar } from './hooks/useSidebar';
 
/* ------------------------------------------------------------------ */
/* ------------------ animación título app-bar ---------------------- */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
/* ------------------------------------------------------------------ */

/* ---------- 1. Componente que protege las rutas ---------- */
function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { token } = useAuth();                // token o user de tu contexto
  const location = useLocation();

  if (!token) {
    /* si no hay sesión, redirige al /login
       `state` guarda la ruta origen por si luego querés volver */
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
/* --------------------------------------------------------- */

function AppLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isDashboard = location.pathname === '/dashboard';
  const { token, logout, usuario } = useAuth();
  const { isDarkMode, toggleDarkMode } = useThemeMode();
  const { sidebarOpen, toggleSidebar } = useSidebar();

  // Mostrar sidebar solo en páginas internas (no en login ni dashboard)
  const showSidebar = token && !isLogin && !isDashboard;

  const sesion = usuario
    ? {
      usuario: { id: usuario.id, nombre: usuario.nombre ?? '' },
    }
    : null;


  function AppBarTitle() {
    const [title, setTitle] = useState('Bienvenido al Punto');

    useEffect(() => {
      const timer = setTimeout(() => {
        setTitle('El Punto');
      }, 5000);

      return () => clearTimeout(timer);
    }, []);

    return (
      <Typography
        variant="h4"
        sx={{
          fontFamily: '"UnifrakturCook", cursive',
          fontWeight: 'bold',
          letterSpacing: '4px',
          color: '#FFF8F0',
          animation: `${fadeIn} 1s ease-out`,
          textAlign: 'center',
          width: '100%',
        }}
      >
        {title}
      </Typography>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: isDarkMode ? '#1a0f1a' : '#ffffff',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar 
          open={sidebarOpen} 
          onToggle={toggleSidebar}
        />
      )}

      {/* Contenido principal con AppBar */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: showSidebar && sidebarOpen ? '280px' : showSidebar ? '70px' : 0,
        transition: 'margin-left 0.3s ease',
        flex: 1
      }}>
        {/* ---------- AppBar se oculta en /login ---------- */}
        {!isLogin && (
          <AppBar
            position="static"
            sx={{
              background: 'linear-gradient(90deg, #5B3758 0%, #7B4397 100%)',
              boxShadow: 6,
              borderRadius: 3,
              mx: 2,
              mt: 2,
              animation: `${fadeIn} 1s`,
            }}
          >
          <Toolbar
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              minHeight: 80,
              px: 3,
            }}
          >
            {/* Logo a la izquierda con animación */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                animation: `${fadeIn} 1.2s cubic-bezier(0.4,0,0.2,1)`,
              }}
            >
              <Box
                component="img"
                src={Logo}
                alt="Logo El Punto"
                sx={{
                  height: 56,
                  mr: 2,
                  borderRadius: '50%',
                  boxShadow: 2,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.08) rotate(-5deg)',
                  },
                }}
              />
            </Box>

            {/* Título centrado con animación */}
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'fit-content',
                zIndex: 1,
                animation: `${fadeIn} 1.5s`,
              }}
            >
              <AppBarTitle />
            </Box>

            {/* Botones a la derecha con animación */}
            <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Botón de modo oscuro */}
              <Tooltip title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
                <IconButton
                  onClick={toggleDarkMode}
                  sx={{
                    color: '#FFD6A5',
                    background: 'rgba(255, 214, 165, 0.1)',
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    animation: `${fadeIn} 1.8s`,
                    '&:hover': {
                      background: 'rgba(255, 214, 165, 0.2)',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              {/* Botón cerrar sesión */}
              {token && (
                <Button
                  onClick={logout}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(90deg, #FFD6A5 0%, #FFBC85 100%)',
                    color: '#5B3758',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: 2,
                    letterSpacing: 1,
                    transition: 'background 0.3s, transform 0.2s',
                    animation: `${fadeIn} 2s`,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #ffbc85 0%, #FFD6A5 100%)',
                      transform: 'scale(1.05)',
                    },
                  }}
                  disableElevation
                >
                  Cerrar sesión
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        )}
        
        {/* Container con las rutas */}
        <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          py: 4,
          backgroundColor: isDarkMode ? '#1a0f1a' : 'transparent',  // Negro con tinte morado
          transition: 'background-color 0.3s ease'
        }}
      >
        <SesionContext.Provider value={sesion}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/proveedores"
              element={
                <PrivateRoute>
                  <ProveedorPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventario"
              element={
                <PrivateRoute>
                  <InventarioPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/administracion"
              element={
                <PrivateRoute>
                  <AdministracionPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/familias"
              element={
                <PrivateRoute>
                  <FamiliaPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/ventas"
              element={
                <PrivateRoute>
                  <VentasPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/pagoproveedores"
              element={
                <PrivateRoute>
                  <PagosPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/Cajas"
              element={
                <PrivateRoute>
                  <CajasPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/notacredito"
              element={
                <PrivateRoute>
                  <NotaCreditoPage />
                </PrivateRoute>
              }
            />
            <Route path="/reportes/ventas" element={<PrivateRoute><SalesReport /></PrivateRoute>} />
            <Route path="/reportes" element={<PrivateRoute><ReportesDashboard /></PrivateRoute>} />

            <Route path="/reportes/utilidades" element={<PrivateRoute><ProfitReport /></PrivateRoute>} />
            <Route path="/reportes/inventario" element={<PrivateRoute><InventoryReport /></PrivateRoute>} />

            <Route path="/vacaciones" element={<PrivateRoute><SolicitudVacaciones /></PrivateRoute>} />
            <Route path="/cargar-inventario" element={<PrivateRoute><CargarInventarioCSV /></PrivateRoute>} />
            {/* Rutas protegidas para los reportes */}

            {/* redirección por defecto */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SesionContext.Provider>
        </Container>
      </Box>
    </Box >
  );
}

function App() {
  return (
    <ThemeProvider>
      <DarkModeEnforcer />
      <ApolloProvider client={client}>
        <AuthProvider>
          <CajaProvider>
            <PagosProvider>
              <Router>
                <AppLayout />
              </Router>
            </PagosProvider>
          </CajaProvider>
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}

export default App;
