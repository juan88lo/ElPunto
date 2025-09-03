/* src/pages/Factura.tsx */
import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FacturaNueva from "./ventasPage";
import FacturaLista from "../pages/FacturaLista";

const Factura: React.FC = () => {
  const [tab, setTab] = useState(0);
  const theme = useTheme();

  return (
    <Box sx={{ 
      px: 2, 
      pt: 2,
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'dark' ? '#1a0f1a' : 'transparent',
      transition: 'background-color 0.3s ease'
    }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="tabs factura">
        <Tab label="Nueva factura" />
        <Tab label="Últimas 30 facturas" />
      </Tabs>

      {tab === 0 && <FacturaNueva />}
      {tab === 1 && <FacturaLista />}
    </Box>
  );
};

export default Factura;
