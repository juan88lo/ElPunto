// src/pages/FamiliasPage.tsx
import { useState } from 'react';
import {
  Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent,
  Grid, TextField, Switch, FormControlLabel, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FAMILIAS } from '../graphql/queries/familia';

import {
  CREAR_FAMILIA,
  ACTUALIZAR_FAMILIA,
  ELIMINAR_FAMILIA
} from '../graphql/mutations/familia';

type Familia = {
  id: string;
  nombre: string;
  Observaciones?: string;
  Estado: boolean;
};

export default function FamiliasPage() {
  const [filtroNombre, setFiltroNombre] = useState('');

  const localeText = {
    noRowsLabel: 'Sin filas',
    columnMenuLabel: 'Menú de columna',
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Familia | null>(null);
  const [form, setForm] = useState({
    nombre: '', Observaciones: '', Estado: true
  });

  const { data, loading, refetch } = useQuery<{ familias: Familia[] }>(GET_FAMILIAS);
  const [crearFamilia] = useMutation(CREAR_FAMILIA);
  const [actualizarFamilia] = useMutation(ACTUALIZAR_FAMILIA);
  const [eliminarFamilia] = useMutation(ELIMINAR_FAMILIA);

  const openNew = () => {
    setEditing(null);
    setForm({ nombre: '', Observaciones: '', Estado: true });
    setDialogOpen(true);
  };

  const familiasFiltradas = (data?.familias ?? []).filter((f) =>
    f.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const openEdit = (row: Familia) => {
    setEditing(row);
    setForm({
      nombre: row.nombre,
      Observaciones: row.Observaciones ?? '',
      Estado: row.Estado
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await actualizarFamilia({ variables: { id: editing.id, ...form } });
    } else {
      await crearFamilia({ variables: form });
    }
    await refetch();
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar categoría?')) {
      await eliminarFamilia({ variables: { id } });
      refetch();
    }
  };


  const columns: GridColDef[] = [
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'Observaciones', headerName: 'Observaciones', flex: 1 },
    {
      field: 'Estado',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (params.row.Estado ? 'Activo' : 'Inactivo'),
      sortComparator: (v1, v2) => (v1 === v2 ? 0 : v1 ? -1 : 1),
    },
    {
      field: 'actions',
      headerName: '',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => openEdit(params.row as Familia)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.id as string)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];


  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Gestión de Categorías</Typography>
          <Button variant="outlined" href="/dashboard">Volver al Dashboard</Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#F9A825',
              '&:hover': { backgroundColor: '#fbc02d' }
            }}
            onClick={openNew}
          >
            Nueva categoría
          </Button>

          <TextField
            label="Buscar por nombre"
            variant="outlined"
            size="small"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            sx={{ ml: 2, minWidth: 250 }}
          />
        </Box>

        <DataGrid
          autoHeight
          loading={loading}
          rows={familiasFiltradas}
          columns={columns}
          pageSizeOptions={[5, 10]}
          localeText={localeText}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }} onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Observaciones"
                  name="Observaciones"
                  value={form.Observaciones}
                  onChange={e => setForm({ ...form, Observaciones: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.Estado}
                      onChange={e => setForm({ ...form, Estado: e.target.checked })}
                    />
                  }
                  label="Activo"
                />
              </Grid>
              <Grid item xs={12} textAlign="right">
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: '#F9A825',
                    color: '#fff',
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#fbc02d' }
                  }}
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
