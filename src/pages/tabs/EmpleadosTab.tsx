import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import EmpleadoModal from '../../modal/EmpleadoModal';

const EMPLEADOS_Q = gql`
  query empleados {
    empleados {
      id
      nombre
      apellido
      cedula
      puesto
      salarioBase
      fechaIngreso
      diasVacaciones
      estado
    }
  }
`;

const DELETE_EMPLEADO = gql`
  mutation eliminarEmpleado($id: ID!) {
    eliminarEmpleado(id: $id)
  }
`;

const EmpleadosTab = () => {
  const { data, refetch } = useQuery(EMPLEADOS_Q);
  const [delEmpleado] = useMutation(DELETE_EMPLEADO, {
    onCompleted: () => refetch(),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);

  const handleNew = () => {
    setSelectedEmpleado(null);
    setModalOpen(true);
  };

  const handleEdit = (empleado: any) => {
    setSelectedEmpleado(empleado);
    setModalOpen(true);
  };

  const cols: GridColDef[] = [
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'apellido', headerName: 'Apellido', flex: 1 },
    { field: 'cedula', headerName: 'Cédula', flex: 1 },
    { field: 'puesto', headerName: 'Puesto', flex: 1 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 180,
      renderCell: (params) => (
        <>
          <Button onClick={() => handleEdit(params.row)}>Editar</Button>
          <Button color="error" onClick={() => delEmpleado({ variables: { id: params.row.id } })}>
            Eliminar
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="contained" onClick={handleNew}>
        Nuevo Empleado
      </Button>

      <Box sx={{ height: 420, mt: 2 }}>
        <DataGrid
          rows={data?.empleados ?? []}
          columns={cols}
          getRowId={(row) => row.id}
          pageSizeOptions={[5]}
        />
      </Box>

      <EmpleadoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        empleado={selectedEmpleado}
        refetch={refetch}
      />
    </Box>
  );
};

export default EmpleadosTab;
