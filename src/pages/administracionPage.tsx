import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import CrearUsuarioTab from '../pages/CrearUsuarioTab';
import AsignarPermisoTab from '../pages/AsignarPermisoTab';
import ConfiguracionTab from '../pages/ConfiguracionTab';
import PermisosTab from '../pages/PermisosTab'; 
import RolesTab from '../pages/RolesTab'; 

const AdminPage = () => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ 
      p: 4,
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'dark' ? '#1a0f1a' : 'transparent',
      transition: 'background-color 0.3s ease'
    }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom color="text.primary">
            Panel de Administración
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            href="/dashboard"
          >
            Volver al Dashboard
          </Button>
        </Box>

        {/* Tabs de navegación */}
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Crear Usuario" />
          <Tab label="Asignar Permiso" />
          <Tab label="Configuraciones" />
          <Tab label="Permisos" />
              <Tab label="Roles" />
        </Tabs>

        {/* Contenido de cada pestaña */}
        <Box sx={{ mt: 3 }}>
          {tab === 0 && <CrearUsuarioTab />}
          {tab === 1 && <AsignarPermisoTab />}
          {tab === 2 && <ConfiguracionTab />}
          {tab === 3 && <PermisosTab />}
          {tab === 4 && <RolesTab />}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminPage;
