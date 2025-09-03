/* src/pages/FacturaLista.tsx */
import { useRef, useState } from "react";
import {
  Paper, IconButton, Typography, Tooltip, CircularProgress,
  Box,
  Button
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@apollo/client";
import { GET_ULTIMAS_FACTURAS } from "../graphql/queries/factura";
import { useReactToPrint } from "react-to-print";
import VistaFactura from "../vistas/VistaFactura";

export default function FacturaLista() {
  const { data, loading, error } = useQuery(GET_ULTIMAS_FACTURAS, {
    variables: { limit: 30 },
    fetchPolicy: "cache-and-network",
  });

  const [seleccion, setSeleccion] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSeleccion(null),
  });

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error.message}</Typography>;

  const rows = data.ultimasFacturas.map((f: any) => ({
    id: f.id,
    consecutivo: f.consecutivo,
    cliente: f.cliente?.nombre || "—",
    usuario: f.usuario.nombre,
    fecha: f.fecha ? new Date(Number(f.fecha)).toLocaleString('es-CR') : "—",
    total: Number(f.total).toFixed(2),
    formaPago: f.formaPago,
    estado: f.estado,
  }));

  const cols: GridColDef[] = [
    { field: "consecutivo", headerName: "Consecutivo", flex: 1 },
    { field: "cliente", headerName: "Cliente", flex: 1.5 },
    { field: "fecha", headerName: "Fecha", flex: 1.5 },
    { field: "total", headerName: "Total ₡", flex: 1 },
    { field: "formaPago", headerName: "Pago", flex: 1 },
    { field: "estado", headerName: "Estado", flex: 1 },
    {
      field: "acciones",
      headerName: "",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Imprimir">
          <IconButton
            onClick={() => {
              const f = data.ultimasFacturas.find((x: any) => x.id === params.row.id);

              // 🔄 construye lo que VistaFactura espera
              const facturaParaTicket = {
                negocio: "El Punto",                           
                fecha: new Date(Number(f.fecha)).toLocaleString('es-CR'),
                total: f.total,
                productos: f.lineas.map((l: any) => ({
                  nombre: l.producto.nombre,
                  precio: l.total
                }))
              };

              setSeleccion(facturaParaTicket);
              setTimeout(handlePrint, 200);/*  */
            }}
            size="small"
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 4 }}>
      <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" fontWeight={500} color="text.primary">
            Facturas recientes
          </Typography>
          <Button
            variant="text"
            href="/dashboard"
            startIcon={
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            sx={{
              color: "primary.main",
              fontWeight: 500,
              textTransform: "none",
              px: 2,
              borderRadius: 1,
              "&:hover": {
                background: "rgba(0, 150, 136, 0.08)",
              },
            }}
          >
            Volver
          </Button>
        </Box>
        <Paper
          sx={{
            height: 520,
            width: "100%",
            p: 0,
            background: "background.paper",
            borderRadius: 2,
            boxShadow: "none",
            border: "1px solid #ececec",
          }}
        >
          <DataGrid
            rows={rows}
            columns={cols}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[10]}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                background: "background.default",
                color: "text.secondary",
                fontWeight: 600,
                fontSize: 15,
                borderBottom: "1px solid #ececec",
              },
              "& .MuiDataGrid-row": {
                fontSize: 14,
                "&:hover": {
                  background: "rgba(0,0,0,0.03)",
                },
              },
              "& .MuiDataGrid-cell": {
                py: 1,
              },
              "& .MuiDataGrid-footerContainer": {
                background: "background.default",
                borderTop: "1px solid #ececec",
              },
            }}
          />
        </Paper>
      </Paper>

      {/* Componente oculto para imprimir */}
      {seleccion && (
        <div style={{ display: "none" }}>
          <VistaFactura ref={printRef} factura={seleccion} />
        </div>
      )}
    </Box>
  );
}
