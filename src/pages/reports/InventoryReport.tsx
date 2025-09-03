import { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Box, Paper, Typography,
  CircularProgress, TextField, MenuItem, Grid, Button, Stack
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { REPORTE_INVENTARIO } from "../../graphql/queries/inventario";
import DescargaInventarioPDF from "../DescargaInventarioPDF"; // Ajusta la ruta según tu estructura

export default function InventoryReport() {
  const [filters, setFilters] = useState({
    familiaId: "",
    proveedorId: "",
    stockMenorQue: "",
    stockMayorQue: "",
  });

  const { data, loading, error, refetch } = useQuery(REPORTE_INVENTARIO, {
    variables: {
      familiaId: filters.familiaId ? Number(filters.familiaId) : undefined,
      proveedorId: filters.proveedorId ? Number(filters.proveedorId) : undefined,
      stockMenorQue: filters.stockMenorQue ? Number(filters.stockMenorQue) : undefined,
      stockMayorQue: filters.stockMayorQue ? Number(filters.stockMayorQue) : undefined,
    },
  });

  const cols: GridColDef[] = [
    { field: "codigoBarras", headerName: "Código", flex: 1 },
    { field: "nombre", headerName: "Producto", flex: 2 },
    { field: "familia", headerName: "Familia", flex: 1 },
    { field: "proveedor", headerName: "Proveedor", flex: 1 },
    { field: "existencias", headerName: "Stock", width: 90, type: "number" },
    { field: "costoUnitario", headerName: "Costo ₡", width: 110, type: "number" },
    { field: "precioVenta", headerName: "Venta ₡", width: 110, type: "number" },
    { field: "margenUnitario", headerName: "Margen ₡", width: 110, type: "number" },
    { field: "costoTotal", headerName: "Costo total", width: 120, type: "number" },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>

        <Typography variant="h5" gutterBottom>Reporte de Inventario</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mb={2}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Inventario
          </Typography>
          <Button href="/reportes" variant="outlined" color="secondary">
            Volver al Dashboard
          </Button>
        </Stack>
        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Familia ID"
              fullWidth
              value={filters.familiaId}
              onChange={(e) => setFilters({ ...filters, familiaId: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Proveedor ID"
              fullWidth
              value={filters.proveedorId}
              onChange={(e) => setFilters({ ...filters, proveedorId: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Stock <"
              fullWidth
              value={filters.stockMenorQue}
              onChange={(e) => setFilters({ ...filters, stockMenorQue: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Stock >"
              fullWidth
              value={filters.stockMayorQue}
              onChange={(e) => setFilters({ ...filters, stockMayorQue: e.target.value })}
              size="small"
            />
          </Grid>

          {/* Botones */}
          <Grid item xs={12} display="flex" gap={2}>
            <Button variant="contained" onClick={() => refetch()}>
              Aplicar filtros
            </Button>
            <Button variant="outlined" onClick={() => {
              setFilters({ familiaId: "", proveedorId: "", stockMenorQue: "", stockMayorQue: "" });
              refetch();
            }}>
              Limpiar
            </Button>

            {/* Botón de descarga */}
            <DescargaInventarioPDF filtros={filters} />
          </Grid>
        </Grid>

        {/* Estado de carga o error */}
        {loading && <CircularProgress />}
        {error && <Typography color="error">{error.message}</Typography>}

        {/* Tabla de resultados */}
        {data && (
          <Paper sx={{ height: 600, border: "1px solid #e0e0e0" }}>
            <DataGrid
              rows={data.reporteInventario}
              columns={cols}
              getRowId={(row) => row.id}
              pageSizeOptions={[10, 25, 50]}
            />
          </Paper>
        )}
      </Paper>
    </Box>
  );
}
