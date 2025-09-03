import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Alert, FormControlLabel, Switch
} from '@mui/material';
import { useMutation, gql } from '@apollo/client';
import { CREAR_EMPLEADO } from '../graphql/mutations/empleado';

const ACTUALIZAR_EMPLEADO = gql`
  mutation actualizarEmpleado(
    $id: ID!
    $nombre: String
    $apellido: String
    $puesto: String
    $salarioBase: Float
    $diasVacaciones: Float
    $estado: Boolean
  ) {
    actualizarEmpleado(
      id: $id
      nombre: $nombre
      apellido: $apellido
      puesto: $puesto
      salarioBase: $salarioBase
      diasVacaciones: $diasVacaciones
      estado: $estado
    ) { id }
  }
`;

interface EmpleadoDTO {
  id?: string;
  nombre: string;
  apellido: string;
  cedula: string;
  puesto: string;
  salarioBase: number;
  fechaIngreso: string;
  diasVacaciones: number;
  estado: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  refetch: () => void;
  empleado: EmpleadoDTO | null;
}

const EmpleadoModal = ({ open, onClose, refetch, empleado }: Props) => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    puesto: '',
    salarioBase: '',
    fechaIngreso: '',
    diasVacaciones: '',
    estado: true,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (empleado) {
      setForm({
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        cedula: empleado.cedula,
        puesto: empleado.puesto,
        salarioBase: empleado.salarioBase.toString(),
        fechaIngreso: empleado.fechaIngreso,
        diasVacaciones: empleado.diasVacaciones.toString(),
        estado: empleado.estado ?? true,
      });
    } else {
      setForm({
        nombre: '',
        apellido: '',
        cedula: '',
        puesto: '',
        salarioBase: '',
        fechaIngreso: '',
        diasVacaciones: '',
        estado: true,
      });
    }
  }, [empleado, open]);

  const [crear] = useMutation(CREAR_EMPLEADO, {
    onCompleted: () => {
      refetch();
      onClose();
      setErrorMsg(null);
    },
    onError: (error) => {
      setErrorMsg(error.message);
    },
  });

  const [actualizar] = useMutation(ACTUALIZAR_EMPLEADO, {
    onCompleted: () => {
      refetch();
      onClose();
      setErrorMsg(null);
    },
    onError: (error) => {
      setErrorMsg(error.message);
    },
  });

  const calcularDiasVacaciones = (fechaIngreso: string): number => {
    const ingreso = new Date(fechaIngreso);
    const hoy = new Date();
    const diffDias =
      (hoy.getTime() - ingreso.getTime()) / (1000 * 60 * 60 * 24);
    const mesesExactos = diffDias / 30.4375;
    const dias = mesesExactos * 1;
    return Math.round(dias * 10) / 10;
  };

  const recalc = () =>
    setForm((f) => ({
      ...f,
      diasVacaciones: calcularDiasVacaciones(f.fechaIngreso).toString(),
    }));

  const readyToSave =
    form.nombre && form.apellido && form.cedula && form.puesto && form.salarioBase;

  const handleSubmit = () => {
    const vars = {
      ...form,
      salarioBase: parseFloat(form.salarioBase),
      diasVacaciones: parseFloat(form.diasVacaciones || '0'),
      estado: form.estado ?? true,
    };

    if (empleado?.id) actualizar({ variables: { id: empleado.id, ...vars } });
    else crear({ variables: vars });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{empleado ? 'Editar empleado' : 'Registrar empleado'}</DialogTitle>

      <DialogContent>
        {/* Mensaje de error */}
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nombre" name="nombre" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <TextField label="Apellido" name="apellido" value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          <TextField label="Cédula" name="cedula" value={form.cedula}
            disabled={!!empleado}
            onChange={(e) => setForm({ ...form, cedula: e.target.value })} />
          <TextField label="Puesto" name="puesto" value={form.puesto}
            onChange={(e) => setForm({ ...form, puesto: e.target.value })} />
          <TextField label="Salario Base" type="number" name="salarioBase"
            value={form.salarioBase}
            onChange={(e) => setForm({ ...form, salarioBase: e.target.value })} />

          <TextField
            label="Fecha de ingreso"
            type="date"
            name="fechaIngreso"
            InputLabelProps={{ shrink: true }}
            disabled={!!empleado}
            value={form.fechaIngreso}
            onChange={(e) => {
              const fecha = e.target.value;
              setForm({
                ...form,
                fechaIngreso: fecha,
                diasVacaciones: calcularDiasVacaciones(fecha).toString(),
              });
            }}
          />

          <TextField label="Días de vacaciones" type="number"
            name="diasVacaciones"
            value={form.diasVacaciones}
            onChange={(e) => setForm({ ...form, diasVacaciones: e.target.value })} />

          <FormControlLabel
            control={
              <Switch
                checked={form.estado ?? true}
                onChange={e => setForm({ ...form, estado: e.target.checked })}
              />
            }
            label={form.estado ? "Activo" : "Inactivo"}
          />

          {empleado && (
            <Button variant="outlined" onClick={recalc}>
              Recalcular vacaciones
            </Button>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!readyToSave} onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmpleadoModal;