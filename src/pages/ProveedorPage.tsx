import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';

import { GET_PROVEEDORES } from '../graphql/queries/proveedor';
import {
  CREAR_PROVEEDOR,
  ACTUALIZAR_PROVEEDOR,
  ELIMINAR_PROVEEDOR,
} from '../graphql/mutations/proveedor';

/* ------------------------------------------------------------------ */
/* ---------------------------- Tipos -------------------------------- */
export type Proveedor = {
  id: string;
  nombre: string;
  TelCelular: string;
  TelOtro?: string;
  AgenteAsignado?: string;
  TelefonoAgente?: string;
  Supervisor?: string;
  TelSupervisor?: string;
  Frecuencia?: string;
  DiasVisita?: string;
  DiaEntrega?: string;
  Simpe?: string;
  SimpeNombre?: string;
  CuentaBancaria?: string;
  Banco?: string;
  NombrePropietarioCtaBancaria?: string;
  Otros?: string;
  Observaciones?: string;
  Estado: boolean;
};

/* ----------- metadatos para crear dinámicamente el formulario -------- */
const CAMPOS: {
  name: keyof Omit<Proveedor, 'id' | 'Estado'>;
  label: string;
  required?: boolean;
  half?: boolean;
}[] = [
    { name: 'nombre', label: 'Nombre', required: true, half: true },
    { name: 'TelCelular', label: 'Teléfono Celular', required: true, half: true },
    { name: 'TelOtro', label: 'Teléfono Alternativo', half: true },
    { name: 'AgenteAsignado', label: 'Agente Asignado', half: true },
    { name: 'TelefonoAgente', label: 'Teléfono Agente', half: true },
    { name: 'Supervisor', label: 'Supervisor', half: true },
    { name: 'TelSupervisor', label: 'Teléfono Supervisor', half: true },
    { name: 'Frecuencia', label: 'Frecuencia de Visita', half: true },
    { name: 'DiasVisita', label: 'Días de Visita', half: true },
    { name: 'DiaEntrega', label: 'Día de Entrega', half: true },
    { name: 'Simpe', label: 'Número SIMPE', half: true },
    { name: 'SimpeNombre', label: 'Nombre SIMPE', half: true },
    { name: 'CuentaBancaria', label: 'Cuenta Bancaria', half: true },
    { name: 'Banco', label: 'Banco', half: true },
    { name: 'NombrePropietarioCtaBancaria', label: 'Propietario Cuenta', half: true },
    { name: 'Otros', label: 'Otros', half: true },
    { name: 'Observaciones', label: 'Observaciones', half: true },
  ];

/* ==================================================================== */
export default function ProveedoresPage() {
  /* ---------- búsqueda rápida ---------- */
  const [buscar, setBuscar] = useState('');

  /* ---------- diálogo / edición ---------- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);

  /* ---------- estado del formulario ---------- */
  const formVacio: Omit<Proveedor, 'id'> = {
    nombre: '',
    TelCelular: '',
    TelOtro: '',
    AgenteAsignado: '',
    TelefonoAgente: '',
    Supervisor: '',
    TelSupervisor: '',
    Frecuencia: '',
    DiasVisita: '',
    DiaEntrega: '',
    Simpe: '',
    SimpeNombre: '',
    CuentaBancaria: '',
    Banco: '',
    NombrePropietarioCtaBancaria: '',
    Otros: '',
    Observaciones: '',
    Estado: true,
  };

  const [form, setForm] = useState<Omit<Proveedor, 'id'>>(formVacio);

  /* ---------------- Apollo ---------------- */
  const { data, loading, error, refetch } =
    useQuery<{ proveedores: Proveedor[] }>(GET_PROVEEDORES);

  const [crear] = useMutation(CREAR_PROVEEDOR);
  const [actualizar] = useMutation(ACTUALIZAR_PROVEEDOR);
  const [eliminar] = useMutation(ELIMINAR_PROVEEDOR);

  /* ---------------- handlers --------------- */
  const abrirNuevo = () => {
    setEditing(null);
    setForm(formVacio);
    setDialogOpen(true);
  };

  const abrirEditar = (row: Proveedor) => {
    const { id, ...rest } = row;
    setEditing(row);
    setForm(rest);
    setDialogOpen(true);
  };

  const guardar = async () => {
    const input = { ...form } as any;
    delete input.__typename;

    if (editing) {
      await actualizar({ variables: { id: +editing.id, input } });
    } else {
      await crear({ variables: { input } });
    }
    await refetch();
    setDialogOpen(false);
  };

  const borrar = async (id: string) => {
    if (confirm('¿Desea Eliminar proveedor?')) {
      await eliminar({ variables: { id: +id } });
      refetch();
    }
  };

  /* --------------- tabla ------------------- */
  const rows = (data?.proveedores ?? []).filter((p) =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'TelCelular', headerName: 'Celular', width: 140 },
    { field: 'AgenteAsignado', headerName: 'Agente', flex: 1 },
    {
      field: 'Estado',
      headerName: 'Estado',
      width: 110,
      renderCell: (p) => (p.row.Estado ? 'Activo' : 'Inactivo'),
      sortComparator: (a, b) => (a === b ? 0 : a ? -1 : 1),
    },
    {
      field: 'actions',
      headerName: '',
      width: 110,
      sortable: false,
      renderCell: (p) => (
        <>
          <IconButton color="primary" onClick={() => abrirEditar(p.row as Proveedor)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => borrar(p.id as string)}>
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  /* ====================== UI ====================== */
  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* CABECERA */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Proveedores</Typography>
          <Button variant="outlined" href="/dashboard">
            Volver al Dashboard
          </Button>
        </Box>

        {/* BOTÓN + BUSCADOR */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={abrirNuevo}
            color="primary"
          >
            Nuevo Proveedor
          </Button>

          <TextField
            size="small"
            label="Buscar por nombre"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            sx={{ minWidth: 240 }}
          />
        </Box>

        {error && <Alert severity="error">{error.message}</Alert>}

        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* DIÁLOGO ALTA / EDICIÓN */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{editing ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              guardar();
            }}
            sx={{ mt: 2 }}
          >
            <Grid container spacing={2}>
              {CAMPOS.map((c) => (
                <Grid item xs={12} sm={c.half ? 6 : 12} key={c.name}>
                  <TextField
                    label={c.label}
                    fullWidth
                    required={c.name === 'nombre' || c.name === 'TelCelular'}
                    value={(form as any)[c.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [c.name]: e.target.value })}
                  />
                </Grid>
              ))}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.Estado}
                      onChange={(e) => setForm({ ...form, Estado: e.target.checked })}
                    />
                  }
                  label="Activo"
                />
              </Grid>

              <Grid item xs={12} textAlign="right">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  {editing ? 'Actualizar' : 'Guardar'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}