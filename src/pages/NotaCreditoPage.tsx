// pages/factura/cancelar.tsx
import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import {
  Box, Paper, Typography, Button, IconButton, Tooltip, TextField, CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import CancelIcon from "@mui/icons-material/Cancel";
import { GET_FACTURAS_EMITIDAS } from "../graphql/queries/notaCreditoQueries";
import { CANCELAR_FACTURA } from "../graphql/mutations/notasCredito";

export default function CancelarFacturaPage() {
  const { data, loading, error, refetch } = useQuery(GET_FACTURAS_EMITIDAS);
  const [cancelarFactura] = useMutation(CANCELAR_FACTURA);
  const [motivo, setMotivo] = useState("");
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<number | null>(null);
  const [enProceso, setEnProceso] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const handleCancelar = async (id: number) => {
    setFacturaSeleccionada(id);
  };

  const confirmarCancelacion = async () => {
    if (!facturaSeleccionada) return;
    setEnProceso(true);
    try {
      await cancelarFactura({
        variables: {
          facturaId: facturaSeleccionada,
          motivo: motivo || "Cancelación por error",
        },
      });
      alert("Factura cancelada con nota de crédito");
      setFacturaSeleccionada(null);
      setMotivo("");
      refetch();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEnProceso(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error.message}</Typography>;

  // const rows = data?.facturasEmitidas?.map((f: any) => ({
  //   id: f.id,
  //   consecutivo: f.consecutivo,
  //   cliente: f.cliente?.nombre || "—",
  //   fecha: new Date(f.fecha).toLocaleString(),
  //   total: f.total,
  //   estado: f.estado,
  // }));

  const allRows = data?.facturasEmitidas?.map((f: any) => ({
    id: f.id,
    consecutivo: f.consecutivo,
    cliente: f.cliente?.nombre || "—",
    fecha: f.fecha ? new Date(Number(f.fecha)).toLocaleString('es-CR') : "—",
    total: f.total,
    estado: f.estado,
  })) || [];

  const rows = allRows.filter((row: any) =>
    row.consecutivo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: "consecutivo", headerName: "Consecutivo", flex: 1 },
    { field: "cliente", headerName: "Cliente", flex: 1.5 },
    { field: "fecha", headerName: "Fecha", flex: 1.5 },
    { field: "total", headerName: "Total ₡", flex: 1 },
    { field: "estado", headerName: "Estado", flex: 1 },
    {
      field: "acciones",
      headerName: "",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Cancelar Factura">
          <IconButton
            onClick={() => handleCancelar(params.row.id)}
            disabled={params.row.estado !== "emitida"}
            color="error"
          >
            <CancelIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {/* <Typography variant="h5" mb={2}>Cancelar Facturas (Crear Nota de Crédito)</Typography> */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h5">Cancelar Facturas (Crear Nota de Crédito)</Typography>
          <TextField
            label="Buscar por consecutivo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            size="small"
            sx={{ width: 250 }}
          />
          <Button variant="outlined" href="/dashboard">
            Volver al Dashboard
          </Button>
        </Box>

        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          pageSizeOptions={[10]}
        />

        {facturaSeleccionada && (
          <Box mt={4}>
            <Typography>Motivo de cancelación para la factura #{facturaSeleccionada}:</Typography>
            <TextField
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Ej: Error en productos, factura duplicada, etc."
              sx={{ mt: 2, mb: 2 }}
            />
            <Button
              variant="contained"
              color="error"
              onClick={confirmarCancelacion}
              disabled={enProceso}
            >
              Confirmar Cancelación
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setFacturaSeleccionada(null);
                setMotivo("");
              }}
              sx={{ ml: 2 }}
            >
              Cancelar
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
