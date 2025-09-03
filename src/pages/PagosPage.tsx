// src/pages/PagosPage.tsx
import { useState } from 'react';
import { Box, Tabs, Tab, Card, Typography, Button } from '@mui/material';
import EmpleadosTab from '../pages/tabs/EmpleadosTab';
import PagoProvTab from '../pages/tabs/PagoProvTab';
import PlanillasTab from '../pages/tabs/PlanillasTab';
import { useAuth } from '../context/AuthContext';

const PagosPage = () => {
  const { permisos } = useAuth();
  const [tab, setTab] = useState(0);

  const handleTab = (_: React.SyntheticEvent, value: number) => setTab(value);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#5B3758' }}>
        Módulo de Pagos
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5"></Typography>
        <Button
          variant="outlined"
          href="/dashboard"
          sx={{
            boxShadow: 2,
            borderWidth: 2,
            borderColor: '#b2dfdb', // pastel teal
            backgroundColor: '#e0f7fa', // pastel cyan
            color: '#00695c',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: '#b2ebf2', // lighter pastel cyan
              borderColor: '#4dd0e1',
              color: '#004d40',
              boxShadow: 4,
            },
          }}
        >
          Volver al Dashboard
        </Button>
      </Box>
      <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
        <Tabs value={tab} onChange={handleTab} centered>
          <Tab label="Empleados" disabled={!permisos.includes('ver_empleados')} />
          <Tab label="Pago a Proveedores" disabled={!permisos.includes('ver_pagoproveedores')} />
          <Tab label="Planillas" disabled={!permisos.includes('ver_planillas')} />
        </Tabs>

        {tab === 0 && <EmpleadosTab />}
        {tab === 1 && <PagoProvTab />}
        {tab === 2 && <PlanillasTab />}
      </Card>
    </Box>
  );
};

export default PagosPage;
