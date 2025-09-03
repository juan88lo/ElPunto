import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation } from '@apollo/client';
import {
  LISTAR_PERMISOS,
  CREAR_PERMISO,
  EDITAR_PERMISO,
  ELIMINAR_PERMISO,
} from '../graphql/mutations/permissions';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Permiso {
  id: number;
  nombrePermiso: string;
  Pantalla: string;
}

const PermisosTab = () => {
  const { data, loading, error, refetch } = useQuery<{ permisos: Permiso[] }>(LISTAR_PERMISOS);

  const [nombre, setNombre] = useState('');
  const [pantalla, setPantalla] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [crearPermiso, { loading: saving }] = useMutation(CREAR_PERMISO, {
    onCompleted: () => {
      setNombre('');
      setPantalla('');
      refetch();
    },
    onError: (err) => alert(err.message),
  });

  const [editarPermiso] = useMutation(EDITAR_PERMISO, {
    onCompleted: () => {
      setDialogOpen(false);
      refetch();
    },
    onError: (err) => alert(err.message),
  });

  const [eliminarPermiso] = useMutation(ELIMINAR_PERMISO, {
    onCompleted: refetch,
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() && pantalla.trim()) {
      crearPermiso({ variables: { nombre, pantalla } });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este permiso?')) {
      eliminarPermiso({ variables: { id } });
    }
  };

  /* ----------------------------- Editar Modal ----------------------------- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Permiso | null>(null);

  const openEditDialog = (permiso: Permiso) => {
    setEditData(permiso);
    setDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (editData)
      editarPermiso({
        variables: {
          id: editData.id,
          nombre: editData.nombrePermiso,
          pantalla: editData.Pantalla,
        },
      });
  };

  /* ------------------------ Columnas con acciones ------------------------ */
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nombrePermiso', headerName: 'Permiso', flex: 1 },
    { field: 'Pantalla', headerName: 'Pantalla', flex: 1 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 120,
      renderCell: ({ row }) => (
        <>
          <IconButton onClick={() => openEditDialog(row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const permisosFiltrados = useMemo(() => {
    return (data?.permisos ?? []).filter((p) =>
      p.nombrePermiso.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [data, busqueda]);

  return (
    <Box>
      {/* ------------------ Formulario de creación ------------------ */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Crear nuevo permiso
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Nombre del permiso"
                fullWidth
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Pantalla"
                fullWidth
                value={pantalla}
                onChange={(e) => setPantalla(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                fullWidth
                sx={{ height: '100%' }}
              >
                {saving ? 'Guardando…' : 'Crear'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* ------------------ Búsqueda ------------------ */}
      <Box mb={2}>
        <TextField
          label="Buscar permiso"
          fullWidth
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </Box>

      {/* ------------------ Tabla ------------------ */}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <DataGrid
          autoHeight
          rows={permisosFiltrados}
          columns={columns}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      )}

      {/* ------------------ Dialogo de edición ------------------ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Editar Permiso</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre del permiso"
            fullWidth
            value={editData?.nombrePermiso ?? ''}
            onChange={(e) =>
              setEditData((prev) => prev && { ...prev, nombrePermiso: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Pantalla"
            fullWidth
            value={editData?.Pantalla ?? ''}
            onChange={(e) =>
              setEditData((prev) => prev && { ...prev, Pantalla: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermisosTab;
