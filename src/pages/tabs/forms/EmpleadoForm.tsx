import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Box, TextField, Button } from '@mui/material';
import type { FormEvent, ChangeEvent } from 'react';

const CREATE_EMPLEADO = gql`
  mutation crearEmpleado($input: EmpleadoInput!) {
    crearEmpleado(input: $input) {
      id
    }
  }
`;

interface EmpleadoInput {
  nombre: string;
  apellido: string;
  cedula: string;
  puesto: string;
}

interface EmpleadoFormProps {
  refetch: () => void;
}

const EmpleadoForm = ({ refetch }: EmpleadoFormProps) => {
  const [form, setForm] = useState<EmpleadoInput>({
    nombre: '',
    apellido: '',
    cedula: '',
    puesto: '',
  });

  const [crearEmpleado] = useMutation(CREATE_EMPLEADO, {
    onCompleted: () => {
      refetch();
      setForm({ nombre: '', apellido: '', cedula: '', puesto: '' });
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    crearEmpleado({ variables: { input: form } });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField name="nombre" label="Nombre" value={form.nombre} onChange={handleChange} />
      <TextField name="apellido" label="Apellido" value={form.apellido} onChange={handleChange} />
      <TextField name="cedula" label="Cédula" value={form.cedula} onChange={handleChange} />
      <TextField name="puesto" label="Puesto" value={form.puesto} onChange={handleChange} />
      <Button type="submit" variant="contained">Guardar</Button>
    </Box>
  );
};

export default EmpleadoForm;
