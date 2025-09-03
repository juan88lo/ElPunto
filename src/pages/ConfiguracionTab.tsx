import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { CONFIGURACIONES } from '../graphql/queries/configuracion';
import {
  CREAR_CONFIGURACION,
  ACTUALIZAR_CONFIGURACION,
  ELIMINAR_CONFIGURACION,
} from '../graphql/mutations/configuracion';

interface Configuracion {
  id: string;
  clave: string;
  valor: number;
  prioridad: number;
  estado: boolean;
  pantalla: string;
}

interface FormState extends Omit<Configuracion, 'id'> {
  id?: string;
}

const defaultForm: FormState = {
  clave: '',
  valor: 0,
  prioridad: 0,
  estado: true,
  pantalla: '',
};

const ConfiguracionesPage: React.FC = () => {
  const [filtros, setFiltros] = useState<Partial<Pick<Configuracion, 'clave' | 'prioridad' | 'estado'>>>({});
  const [form, setForm] = useState<FormState>(defaultForm);
  const [success, setSuccess] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(CONFIGURACIONES, {
    variables: filtros,
    fetchPolicy: 'network-only',
  });

  const [crearCfg] = useMutation(CREAR_CONFIGURACION);
  const [actCfg] = useMutation(ACTUALIZAR_CONFIGURACION);
  const [delCfg] = useMutation(ELIMINAR_CONFIGURACION);

  const applyFiltro = (nuevo: typeof filtros) => {
    setFiltros(nuevo);
    refetch(nuevo);
  };
  type Filtro = Partial<Pick<Configuracion, 'clave' | 'prioridad' | 'estado'>>;

  /* ---------- INPUT TEXTO / NÚMERO ---------- */
  const handleFiltroInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated: Filtro = { ...filtros };

    if (value === '') {
      delete updated[name as keyof Filtro];
    } else if (name === 'prioridad') {
      const num = Number(value);
      updated.prioridad = isNaN(num) ? undefined : num;
    } else if (name === 'clave') {
      updated.clave = value;
    }

    applyFiltro(updated);
  };

  /* ---------- SELECT ACTIVO / INACTIVO ---------- */
  const handleEstadoSelect = (e: SelectChangeEvent<string>) => {
    const v = e.target.value;             // '', 'activo' o 'inactivo'
    const updated: Filtro = {
      ...filtros,
      estado: v === '' ? undefined : v === 'activo',
    };

    applyFiltro(updated);                 // <- también objeto directo
  };
  const resetForm = () => setForm(defaultForm);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const input = {
        clave: form.clave,
        valor: Number(form.valor),
        prioridad: Number(form.prioridad),
        estado: form.estado,
        pantalla: form.pantalla,
      };

      if (form.id) {
        await actCfg({ variables: { id: form.id, input } });
        setSuccess('Configuración actualizada');
      } else {
        await crearCfg({ variables: { input } });
        setSuccess('Configuración creada');
      }

      resetForm();
      refetch();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const seleccionarFila = (cfg: Configuracion) => {
    setForm(cfg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarFila = async (id: string) => {
    if (!window.confirm('¿Eliminar configuración?')) return;
    try {
      await delCfg({ variables: { id } });
      refetch();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* ---------- FILTROS ---------- */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              name="clave"
              label="Buscar por clave"
              value={filtros.clave ?? ''}
              onChange={handleFiltroInput}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="prioridad"
              label="Prioridad"
              type="number"
              value={filtros.prioridad ?? ''}
              onChange={handleFiltroInput}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Select
              value={
                filtros.estado === undefined
                  ? ''
                  : filtros.estado
                    ? 'activo'
                    : 'inactivo'
              }
              displayEmpty
              onChange={handleEstadoSelect}
              fullWidth
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              fullWidth
              onClick={() => refetch(filtros)}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ---------- FORMULARIO ---------- */}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="clave"
              label="Clave"
              value={form.clave}
              onChange={handleFormChange}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="valor"
              label="Valor"
              type="number"
              value={form.valor}
              onChange={handleFormChange}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="prioridad"
              label="Prioridad"
              type="number"
              value={form.prioridad}
              onChange={handleFormChange}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="pantalla"
              label="Pantalla"
              value={form.pantalla}
              onChange={handleFormChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="estado"
                  checked={form.estado}
                  onChange={handleFormChange}
                  color="primary"
                />
              }
              label="Activo"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={form.id ? <Edit /> : <AddIcon />}
              fullWidth
            >
              {form.id ? 'Actualizar' : 'Crear'}
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="outlined" color="secondary" onClick={resetForm} fullWidth>
              Limpiar
            </Button>
          </Grid>
          {success && (
            <Grid item xs={12}>
              <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mt: 1 }}>
                {success}
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* ---------- TABLA ---------- */}
      <Paper sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Clave</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Pantalla</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Cargando…</TableCell>
              </TableRow>
            ) : data?.configuraciones?.length ? (
              data.configuraciones.map((cfg: Configuracion) => (
                <TableRow key={cfg.id} hover>
                  <TableCell>{cfg.clave}</TableCell>
                  <TableCell>{cfg.valor}</TableCell>
                  <TableCell>{cfg.prioridad}</TableCell>
                  <TableCell>{cfg.estado ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell>{cfg.pantalla}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => seleccionarFila(cfg)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => eliminarFila(cfg.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>Sin datos</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ConfiguracionesPage;
