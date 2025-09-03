import { Box, Grid, Paper, Typography, Button, Stack, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BarChartIcon from "@mui/icons-material/BarChart";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaidIcon from "@mui/icons-material/Paid";

const reportes = [
  {
    titulo: "Reporte de Ventas",
    descripcion: "Totales por día",
    ruta: "/reportes/ventas",
    icon: <BarChartIcon fontSize="large" />,
    color: "#1976d2",
  },
  {
    titulo: "Reporte de Inventario",
    descripcion: "Stock actual",
    ruta: "/reportes/inventario",
    icon: <InventoryIcon fontSize="large" />,
    color: "#388e3c",
  },
  {
    titulo: "Reporte de Compras",
    descripcion: "Compras por proveedor",
    ruta: "/reportes/compras",
    icon: <ShoppingCartIcon fontSize="large" />,
    color: "#fbc02d",
  },
  {
    titulo: "Reporte de Utilidades",
    descripcion: "Ganancias netas",
    ruta: "/reportes/utilidades",
    icon: <PaidIcon fontSize="large" />,
    color: "#d32f2f",
  },
];

export default function ReportesDashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: 4 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight={700} color="primary.main">
        Panel de Reportes
      </Typography>
      <Stack direction="row" justifyContent="flex-end" mb={3}>
        <Button href="/dashboard" variant="outlined" color="secondary">
          Volver al Dashboard
        </Button>
      </Stack>
      <Grid container spacing={4}>
        {reportes.map((reporte, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                borderRadius: 3,
                textAlign: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-6px) scale(1.03)",
                  boxShadow: 8,
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: reporte.color,
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 2,
                }}
              >
                {reporte.icon}
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                {reporte.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {reporte.descripcion}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: reporte.color,
                  color: "#fff",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#333" },
                }}
                onClick={() => navigate(reporte.ruta)}
              >
                Ver Reporte
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}