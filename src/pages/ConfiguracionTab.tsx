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
  Typography,
  Divider,
  Card,
  CardContent,
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

  // Estados para configuración de impuestos en facturación
  const [impuestoConfig, setImpuestoConfig] = useState({
    usarImpuestoGlobal: false,
    valorImpuestoGlobal: 13
  });

  // Estados para configuración de agrupación de productos duplicados
  const [agrupacionConfig, setAgrupacionConfig] = useState({
    agruparDuplicados: true
  });

  const { data, loading, refetch } = useQuery(CONFIGURACIONES, {
    variables: filtros,
    fetchPolicy: 'network-only',
  });

  const [crearCfg] = useMutation(CREAR_CONFIGURACION);
  const [actCfg] = useMutation(ACTUALIZAR_CONFIGURACION);
  const [delCfg] = useMutation(ELIMINAR_CONFIGURACION);

  // Cargar configuración de impuestos al inicializar
  React.useEffect(() => {
    if (data?.configuraciones) {
      const configImpuestoGlobal = data.configuraciones.find((c: Configuracion) => c.clave === 'USAR_IMPUESTO_GLOBAL');
      const configValorImpuesto = data.configuraciones.find((c: Configuracion) => c.clave === 'VALOR_IMPUESTO_GLOBAL');
      
      if (configImpuestoGlobal || configValorImpuesto) {
        setImpuestoConfig({
          usarImpuestoGlobal: configImpuestoGlobal?.estado || false,
          valorImpuestoGlobal: configValorImpuesto?.valor !== undefined ? configValorImpuesto.valor : 13
        });
      }
    }
  }, [data]);

  // Cargar configuración de agrupación al inicializar
  React.useEffect(() => {
    if (data?.configuraciones) {
      const configAgrupacion = data.configuraciones.find((c: Configuracion) => c.clave === 'AGRUPAR_PRODUCTOS_DUPLICADOS');
      
      if (configAgrupacion) {
        setAgrupacionConfig({
          agruparDuplicados: configAgrupacion?.estado !== undefined ? configAgrupacion.estado : true
        });
      }
    }
  }, [data]);

  // Función para guardar configuración de impuestos
  const guardarConfigImpuestos = async () => {
    try {
      // Guardar o actualizar configuración USAR_IMPUESTO_GLOBAL
      const configImpuestoGlobal = data?.configuraciones?.find((c: Configuracion) => c.clave === 'USAR_IMPUESTO_GLOBAL');
      const inputImpuestoGlobal = {
        clave: 'USAR_IMPUESTO_GLOBAL',
        valor: impuestoConfig.usarImpuestoGlobal ? 1 : 0,
        prioridad: 1,
        estado: impuestoConfig.usarImpuestoGlobal,
        pantalla: 'FACTURACION',
      };

      if (configImpuestoGlobal) {
        await actCfg({ variables: { id: configImpuestoGlobal.id, input: inputImpuestoGlobal } });
      } else {
        await crearCfg({ variables: { input: inputImpuestoGlobal } });
      }

      // Guardar o actualizar configuración VALOR_IMPUESTO_GLOBAL
      const configValorImpuesto = data?.configuraciones?.find((c: Configuracion) => c.clave === 'VALOR_IMPUESTO_GLOBAL');
      const valorImpuestoNumerico = parseFloat(String(impuestoConfig.valorImpuestoGlobal)) || 0;
      const inputValorImpuesto = {
        clave: 'VALOR_IMPUESTO_GLOBAL',
        valor: valorImpuestoNumerico,
        prioridad: 2,
        estado: true,
        pantalla: 'FACTURACION',
      };

      if (configValorImpuesto) {
        await actCfg({ variables: { id: configValorImpuesto.id, input: inputValorImpuesto } });
      } else {
        await crearCfg({ variables: { input: inputValorImpuesto } });
      }

      setSuccess('Configuración de impuestos guardada correctamente');
      refetch();
    } catch (err: any) {
      alert(`Error al guardar configuración: ${err.message}`);
    }
  };

  // Función para guardar configuración de agrupación de productos duplicados
  const guardarConfigAgrupacion = async () => {
    try {
      // Guardar o actualizar configuración AGRUPAR_PRODUCTOS_DUPLICADOS
      const configAgrupacion = data?.configuraciones?.find((c: Configuracion) => c.clave === 'AGRUPAR_PRODUCTOS_DUPLICADOS');
      const inputAgrupacion = {
        clave: 'AGRUPAR_PRODUCTOS_DUPLICADOS',
        valor: agrupacionConfig.agruparDuplicados ? 1 : 0,
        prioridad: 3,
        estado: agrupacionConfig.agruparDuplicados,
        pantalla: 'FACTURACION',
      };

      if (configAgrupacion) {
        await actCfg({ variables: { id: configAgrupacion.id, input: inputAgrupacion } });
      } else {
        await crearCfg({ variables: { input: inputAgrupacion } });
      }

      setSuccess('Configuración de agrupación guardada correctamente');
      refetch();
    } catch (err: any) {
      alert(`Error al guardar configuración: ${err.message}`);
    }
  };

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
      {/* ---------- CONFIGURACIÓN DE IMPUESTOS PARA FACTURACIÓN ---------- */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>Configuración de Impuestos en Facturación</span>  
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            Controla cómo se calculan los impuestos en las facturas: desde cada producto individual o con un valor global.
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={impuestoConfig.usarImpuestoGlobal}
                    onChange={(e) => setImpuestoConfig(prev => ({
                      ...prev,
                      usarImpuestoGlobal: e.target.checked
                    }))}
                    color="secondary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Usar Impuesto Global
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {impuestoConfig.usarImpuestoGlobal 
                        ? 'Se aplicará el valor global a todos los productos'
                        : 'Se usará el impuesto individual de cada producto'
                      }
                    </Typography>
                  </Box>
                }
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Valor Impuesto Global (%)"
                type="number"
                value={impuestoConfig.valorImpuestoGlobal}
                onChange={(e) => setImpuestoConfig(prev => ({
                  ...prev,
                  valorImpuestoGlobal: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                }))}
                disabled={!impuestoConfig.usarImpuestoGlobal}
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                sx={{
                  '& .MuiInputBase-input': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={guardarConfigImpuestos}
                sx={{ fontWeight: 600 }}
              >
                Guardar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ---------- CONFIGURACIÓN DE AGRUPACIÓN DE PRODUCTOS DUPLICADOS ---------- */}
      <Card sx={{ mb: 3, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>Configuración de Productos Duplicados en Ventas</span>  
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            Controla cómo se manejan los productos duplicados al escanear códigos de barras: agrupar cantidades o crear líneas separadas.
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={agrupacionConfig.agruparDuplicados}
                    onChange={(e) => setAgrupacionConfig(prev => ({
                      ...prev,
                      agruparDuplicados: e.target.checked
                    }))}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Agrupar Productos Duplicados
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {agrupacionConfig.agruparDuplicados 
                        ? 'Suma cantidades automáticamente al escanear códigos repetidos'
                        : 'Crea una nueva línea para cada código escaneado'
                      }
                    </Typography>
                  </Box>
                }
                sx={{ color: 'inherit' }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: agrupacionConfig.agruparDuplicados 
                    ? 'rgba(76, 175, 80, 0.2)' 
                    : 'rgba(255, 152, 0, 0.2)',
                  border: `1px solid ${agrupacionConfig.agruparDuplicados 
                    ? 'rgba(76, 175, 80, 0.5)' 
                    : 'rgba(255, 152, 0, 0.5)'}`,
                }}
              >
                <Typography variant="caption" fontWeight="bold">
                  {agrupacionConfig.agruparDuplicados ? '✓ ACTIVADO' : '✗ DESACTIVADO'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={guardarConfigAgrupacion}
                sx={{ fontWeight: 600 }}
              >
                Guardar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
