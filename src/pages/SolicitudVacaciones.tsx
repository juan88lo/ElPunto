import React, { useState } from 'react';
import {
  Card, CardHeader, CardContent, Stack, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, IconButton, Box
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { EMPLEADOS_Q } from '../graphql/queries/vacaciones';
import { CREAR_VACACION, APROBAR_VACACION, ELIMINAR_VACACION, EDITAR_VACACION } from '../graphql/mutations/vacaciones';
import { useAuth } from '../context/AuthContext';

import { GET_VACACIONES } from '../graphql/queries/vacaciones';

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  diasVacaciones: number;
}
interface VacacionTomada {
  id: string;
  empleado: Empleado | null;
  dias: number;
  fecha: string;
  estado: string;
}

export interface TokenPayload {
  id: number;
  tipoUsuarioId: number;
  empleadoId?: number;
  iat?: number;
  exp?: number;
}

const SolicitudVacaciones: React.FC = () => {
  const { usuario } = useAuth() as { usuario: TokenPayload | null };
  const { data, loading, error, refetch } = useQuery(GET_VACACIONES);
  const { data: empleadosData, loading: loadingEmpleados } = useQuery<{ empleados: Empleado[] }>(EMPLEADOS_Q);
  const [aprobarVacacion] = useMutation(APROBAR_VACACION, { onCompleted: refetch });
  const [crearVacacion] = useMutation(CREAR_VACACION, { onCompleted: refetch });
  const [eliminarVacacion] = useMutation(ELIMINAR_VACACION, { onCompleted: refetch });
  const [editarVacacion] = useMutation(EDITAR_VACACION, { onCompleted: refetch });

  // Modal de crear/editar
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState<VacacionTomada | null>(null);
  const [form, setForm] = useState({ dias: '', fecha: '' });

  // Dialogo de eliminar
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [vacacionAEliminar, setVacacionAEliminar] = useState<string | null>(null);

  // Buscar empleado actual
  const empleadoActual = empleadosData?.empleados.find(
    (emp: any) => String(emp.id) === String(usuario?.empleadoId)
  );

  // Abrir modal para nueva solicitud
  const handleOpenCreate = () => {
    setEditData(null);
    setForm({ dias: '', fecha: '' });
    setOpenDialog(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (v: VacacionTomada) => {
    setEditData(v);
    setForm({ dias: String(v.dias), fecha: v.fecha });
    setOpenDialog(true);
  };

  // Guardar nueva o editada
  const handleSave = () => {
    if (editData) {
      editarVacacion({ variables: { id: editData.id, dias: Number(form.dias), fecha: form.fecha } });
    } else {
      if (!usuario) return;
      crearVacacion({
        variables: {
          empleadoId: usuario.empleadoId,
          dias: Number(form.dias),
          fecha: form.fecha
        }
      });
    }
    setOpenDialog(false);
  };

  // Eliminar
  const handleDeleteClick = (id: string) => {
    setVacacionAEliminar(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (vacacionAEliminar) {
      eliminarVacacion({ variables: { id: vacacionAEliminar } });
      setOpenDeleteDialog(false);
      setVacacionAEliminar(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setVacacionAEliminar(null);
  };

  // Aprobar/rechazar
  const handleAprobar = (id: string, estado: string) => {
    aprobarVacacion({ variables: { id, estado } });
  };

  return (
    <Stack spacing={4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom color="text.primary">
          Panel de Administración
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          href="/dashboard"
        >
          Volver al Dashboard
        </Button>
      </Box>
      <Card>
        <CardHeader
          title="Solicitudes de Vacaciones"
          action={
            <Button variant="contained" onClick={handleOpenCreate}>
              Solicitar Vacaciones
            </Button>
          }
        />
        <CardContent>
          {error && <Alert severity="error">{error.message}</Alert>}

          {/* Alerta siempre visible */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Días de vacaciones disponibles:{' '}
            <strong>
              {empleadoActual
                ? empleadoActual.diasVacaciones
                : loadingEmpleados
                  ? 'Cargando...'
                  : 'No encontrado'}
            </strong>
          </Alert>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Empleado</TableCell>
                <TableCell>Días</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.vacacionesTomadas.map((v: VacacionTomada) => (
                <TableRow key={v.id}>
                  <TableCell>
                    {v.empleado?.nombre || 'Sin nombre'} {v.empleado?.apellido || ''}
                  </TableCell>
                  <TableCell>{v.dias}</TableCell>
                  <TableCell>{v.fecha}</TableCell>
                  <TableCell>
                    <Typography color={
                      v.estado === 'aprobada'
                        ? 'success.main'
                        : v.estado === 'rechazada'
                          ? 'error.main'
                          : 'warning.main'
                    }>
                      {v.estado ? v.estado.charAt(0).toUpperCase() + v.estado.slice(1) : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>

                    {usuario?.tipoUsuarioId === 1 && v.estado === 'pendiente' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleAprobar(v.id, 'aprobada')}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleAprobar(v.id, 'rechazada')}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}
                    {/* El usuario puede editar/eliminar solo sus propias solicitudes pendientes */}
                    {(usuario?.tipoUsuarioId === 1 || usuario?.empleadoId === v.empleado?.id) && v.estado === 'pendiente' && (
                      <>
                        <IconButton onClick={() => handleOpenEdit(v)}><Edit /></IconButton>
                        <IconButton onClick={() => handleDeleteClick(v.id)}><Delete /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal para crear/editar */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editData ? 'Editar Solicitud' : 'Solicitar Vacaciones'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Días"
              type="number"
              value={form.dias}
              onChange={e => setForm(f => ({ ...f, dias: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Fecha"
              type="date"
              value={form.fecha}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editData ? 'Guardar Cambios' : 'Solicitar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo de confirmación de eliminación */}
      <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta solicitud de vacaciones? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default SolicitudVacaciones;