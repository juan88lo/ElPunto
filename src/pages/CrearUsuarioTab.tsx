import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import { Edit, Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';
import { CREAR_USUARIO, ELIMINAR_USUARIO, ACTUALIZAR_USUARIO } from '../graphql/mutations/mutations';
import { GET_ROLES } from '../graphql/queries/roles';
import { GET_USUARIOS } from '../graphql/queries/usuarios';
import { gql } from '@apollo/client';
export const GET_EMPLEADOS = gql`
  query GetEmpleados {
    empleados {
      id
      nombre
      apellido
    }
  }
`;

type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  estado: boolean;
  tipoUsuario: {
    id: string;
    nombre: string;
  };
  empleado?: {
    id: string;
    nombre: string;
    apellido: string;
  } | null;
};

type Rol = {
  id: string;
  nombre: string;
};

type Empleado = {
  id: string;
  nombre: string;
  apellido: string;
};

const CrearUsuarioTab = () => {
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    password: '',
    tipoUsuarioId: '',
    estado: true,
    empleado: null as Empleado | null,
  });
  const [success, setSuccess] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: rolesData, loading: loadingRoles } = useQuery<{ roles: Rol[] }>(GET_ROLES);
  const { data: usuariosData, refetch } = useQuery<{ usuarios: Usuario[] }>(GET_USUARIOS);
  const { data: empleadosData, loading: loadingEmpleados } = useQuery<{ empleados: Empleado[] }>(GET_EMPLEADOS);
  const [crearUsuario, { loading }] = useMutation(CREAR_USUARIO, {
    onCompleted: () => {
      setSuccess(true);
      setForm({ nombre: '', correo: '', password: '', tipoUsuarioId: '', estado: true, empleado: null });
      setOpenCreateDialog(false);
      refetch();
    },
  });

  const [eliminarUsuario] = useMutation(ELIMINAR_USUARIO, {
    onCompleted: () => refetch(),
  });

  const [actualizarUsuario] = useMutation(ACTUALIZAR_USUARIO, {
    onCompleted: () => {
      setOpenEditDialog(false);
      setEditingUser(null);
      refetch();
    },
  });

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  type FormFields = 'nombre' | 'correo' | 'password' | 'tipoUsuarioId' | 'estado';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as FormFields;
    const value = name === 'estado' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEmpleadoChange = (_: any, value: Empleado | null) => {
    setForm(prev => ({ ...prev, empleado: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    crearUsuario({
      variables: {
        nombre: form.nombre,
        correo: form.correo,
        password: form.password,
        tipoUsuarioId: form.tipoUsuarioId,
        estado: form.estado,
        ...(form.empleado?.id ? { empleadoId: parseInt(form.empleado.id) } : {}),
      }
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro que deseas eliminar este usuario?')) {
      eliminarUsuario({ variables: { id } });
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser({
      ...usuario,
      empleado: usuario.empleado ?? null,
    });
    setOpenEditDialog(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement & { name?: string; value: unknown };
    if (!name) return;
    if (name === 'estado') {
      setEditingUser(prev => prev ? { ...prev, estado: (e.target as HTMLInputElement).checked } : prev);
    } else {
      setEditingUser(prev => prev ? { ...prev, [name]: value } : prev);
    }
  };

  const handleEditEmpleado = (_: any, value: Empleado | null) => {
    setEditingUser(prev => prev ? { ...prev, empleado: value } : prev);
  };

  const handleUpdate = () => {
    if (!editingUser) return;
    if (!editingUser.nombre || !editingUser.correo || !editingUser.tipoUsuario?.id) {
      alert('Por favor completa todos los campos');
      return;
    }
    actualizarUsuario({
      variables: {
        id: editingUser.id,
        nombre: editingUser.nombre,
        correo: editingUser.correo,
        tipoUsuarioId: editingUser.tipoUsuario.id,
        estado: editingUser.estado,
        ...(editingUser.empleado?.id ? { empleadoId: parseInt(editingUser.empleado.id) } : {}),
      },
    });
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>
          Crear Usuario
        </Button>
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>Usuario creado exitosamente.</Alert>
        )}
      </Grid>

      {/* Tabla de usuarios */}
      <Grid item xs={12}>
        <h3>Usuarios existentes</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Tipo de Usuario</TableCell>
              <TableCell>Empleado</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuariosData?.usuarios?.map((u: Usuario) => (
              <TableRow key={u.id}>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.correo}</TableCell>
                <TableCell>{u.tipoUsuario?.nombre}</TableCell>
                <TableCell>
                  {u.empleado ? `${u.empleado.nombre} ${u.empleado.apellido}` : ''}
                </TableCell>
                <TableCell>{u.estado ? 'Activo' : 'Inactivo'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(u)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(u.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>

      {/* Modal de creación */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Usuario</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Correo"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Contraseña"
              name="password"
              value={form.password}
              onChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="dense"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              name="tipoUsuarioId"
              label="Tipo de Usuario"
              fullWidth
              margin="dense"
              value={form.tipoUsuarioId}
              onChange={handleChange}
              required
              disabled={loadingRoles}
            >
              {rolesData?.roles?.map((rol: Rol) => (
                <MenuItem key={rol.id} value={rol.id}>
                  {rol.nombre}
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              options={empleadosData?.empleados ?? []}
              getOptionLabel={(option: Empleado) => `${option.nombre} ${option.apellido}`}
              value={form.empleado}
              onChange={handleEmpleadoChange}
              renderInput={(params) => (
                <TextField {...params} label="Empleado (opcional)" margin="dense" />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={loadingEmpleados ? 'Cargando...' : 'No hay empleados'}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.estado}
                  onChange={handleChange}
                  name="estado"
                />
              }
              label={form.estado ? 'Activo' : 'Inactivo'}
            />
            <DialogActions sx={{ px: 0 }}>
              <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Crear'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            name="nombre"
            value={editingUser?.nombre || ''}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Correo"
            name="correo"
            value={editingUser?.correo || ''}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
          />
          <TextField
            select
            label="Tipo de Usuario"
            name="tipoUsuario"
            fullWidth
            margin="dense"
            value={editingUser?.tipoUsuario?.id || ''}
            onChange={(e) => {
              const rolId = e.target.value;
              const rol = rolesData?.roles.find(r => r.id === rolId);
              if (rol) {
                setEditingUser(prev => prev ? { ...prev, tipoUsuario: rol } : prev);
              }
            }}
          >
            {rolesData?.roles?.map(rol => (
              <MenuItem key={rol.id} value={rol.id}>
                {rol.nombre}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            options={empleadosData?.empleados ?? []}
            getOptionLabel={(option: Empleado) => `${option.nombre} ${option.apellido}`}
            value={editingUser?.empleado ?? null}
            onChange={handleEditEmpleado}
            renderInput={(params) => (
              <TextField {...params} label="Empleado (opcional)" margin="dense" />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={loadingEmpleados ? 'Cargando...' : 'No hay empleados'}
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!editingUser?.estado}
                onChange={e =>
                  setEditingUser(prev =>
                    prev ? { ...prev, estado: e.target.checked } : prev
                  )
                }
                name="estado"
              />
            }
            label={editingUser?.estado ? 'Activo' : 'Inactivo'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpdate} variant="contained">
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CrearUsuarioTab; 