import { gql, useQuery, useMutation } from '@apollo/client';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogTitle, DialogContent, TextField, Autocomplete, Typography, IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import PaymentIcon from '@mui/icons-material/Payment';
import DeleteIcon from '@mui/icons-material/Delete';

// Queries y Mutations
const PLANILLAS_Q = gql`
  query planillas {
    planillas {
      id
      empleado {
        id
        nombre
        apellido
      }
      fechaInicio
      fechaFin
      salarioBruto
      deducciones
      salarioNeto
      pagado
    }
  }
`;

const EMPLEADOS_Q = gql`
  query empleados {
    empleados {
      id
      nombre
      apellido
    }
  }
`;

const CREAR_PLANILLA = gql`
  mutation crearPlanilla(
    $empleadoId: ID!
    $fechaInicio: String!
    $fechaFin: String!
    $salarioBruto: Float!
    $deducciones: Float
    $salarioNeto: Float!
  ) {
    crearPlanilla(
      empleadoId: $empleadoId
      fechaInicio: $fechaInicio
      fechaFin: $fechaFin
      salarioBruto: $salarioBruto
      deducciones: $deducciones
      salarioNeto: $salarioNeto
    ) {
      id
    }
  }
`;

const PAGAR_PLANILLA = gql`
  mutation pagarPlanilla($id: ID!) {
    pagarPlanilla(id: $id)
  }
`;

const DELETE_PLANILLA = gql`
  mutation eliminarPlanilla($id: ID!) {
    eliminarPlanilla(id: $id)
  }
`;

const ACTUALIZAR_PLANILLA = gql`
  mutation actualizarPlanilla(
    $id: ID!
    $empleadoId: ID
    $fechaInicio: String
    $fechaFin: String
    $salarioBruto: Float
    $deducciones: Float
    $salarioNeto: Float
    $pagado: Boolean
  ) {
    actualizarPlanilla(
      id: $id
      empleadoId: $empleadoId
      fechaInicio: $fechaInicio
      fechaFin: $fechaFin
      salarioBruto: $salarioBruto
      deducciones: $deducciones
      salarioNeto: $salarioNeto
      pagado: $pagado
    ) {
      id
    }
  }
`;

// Tipado
interface Planilla {
  id: string;
  empleado: {
    id: string;
    nombre: string;
    apellido: string;
  };
  fechaInicio: string;
  fechaFin: string;
  salarioBruto: number;
  deducciones: number;
  salarioNeto: number;
  pagado: boolean;
}

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
}

const PlanillasTab = () => {
  const { data, refetch } = useQuery(PLANILLAS_Q);
  const { data: empleadosData } = useQuery(EMPLEADOS_Q);
  const [crearPlanilla] = useMutation(CREAR_PLANILLA, { onCompleted: refetch });
  const [pagar] = useMutation(PAGAR_PLANILLA, { onCompleted: refetch });
  const [eliminar] = useMutation(DELETE_PLANILLA, { onCompleted: refetch });
  const [actualizarPlanilla] = useMutation(ACTUALIZAR_PLANILLA, { onCompleted: refetch });

  // Estado para edición y creación
  const [editPlanilla, setEditPlanilla] = useState<Planilla | null>(null);
  const [form, setForm] = useState<any>(null);
  const [openCrear, setOpenCrear] = useState(false);

  // Al abrir el diálogo de edición
  const handleEdit = (row: Planilla) => {
    setEditPlanilla(row);
    setForm({
      ...row,
      salarioBruto: row.salarioBruto.toString(),
      deducciones: row.deducciones.toString(),
      salarioNeto: row.salarioNeto.toString(),
    });
  };

  // Guardar cambios de edición
  const handleSave = async () => {
    await actualizarPlanilla({
      variables: {
        id: editPlanilla?.id,
        empleadoId: form.empleado?.id,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        salarioBruto: parseFloat(form.salarioBruto),
        deducciones: parseFloat(form.deducciones),
        salarioNeto: parseFloat(form.salarioNeto),
        pagado: form.pagado,
      },
    });
    setEditPlanilla(null);
    setForm(null);
    refetch();
  };

  // Guardar nueva planilla
  const handleCrear = async () => {
    await crearPlanilla({
      variables: {
        empleadoId: form.empleado?.id,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        salarioBruto: parseFloat(form.salarioBruto),
        deducciones: parseFloat(form.deducciones) || 0,
        salarioNeto: parseFloat(form.salarioNeto),
      },
    });
    setOpenCrear(false);
    setForm(null);
    refetch();
  };

  // Columnas
  const cols: GridColDef[] = [
    {
      field: 'empleado',
      headerName: 'Empleado',
      flex: 1,
      renderCell: (params: any) => params.row?.empleado ? `${params.row.empleado.nombre} ${params.row.empleado.apellido}` : '',
    },
    { field: 'fechaInicio', headerName: 'Inicio', flex: 1 },
    { field: 'fechaFin', headerName: 'Fin', flex: 1 },
    { field: 'salarioNeto', headerName: 'Neto', flex: 1 },
    {
      field: 'pagado',
      headerName: 'Pagado',
      flex: 0.5,
      renderCell: (params: any) => params.value ? 'Sí' : 'No',
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 260,
      sortable: false,
      renderCell: (params: { row: any }) => {
        const row = params.row;
        return (
            <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Editar">
              <IconButton
              color="secondary"
              size="small"
              onClick={() => handleEdit(row)}
              >
              <EditIcon />
              </IconButton>
            </Tooltip>
            {!row.pagado && (
              <Tooltip title="Pagar">
              <IconButton
                color="primary"
                size="small"
                onClick={() => pagar({ variables: { id: row.id } })}
              >
                <PaymentIcon />
              </IconButton>
              </Tooltip>
            )}
            {!row.pagado && (
              <Tooltip title="Eliminar">
              <IconButton
                color="error"
                size="small"
                onClick={() => eliminar({ variables: { id: row.id } })}
              >
                <DeleteIcon />
              </IconButton>
              </Tooltip>
            )}
            </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Planillas</Typography>
        <Button
          variant="contained"
          size="small" // <-- esto lo hace más bajo
          onClick={() => { setOpenCrear(true); setForm({ empleado: null, fechaInicio: '', fechaFin: '', salarioBruto: '', deducciones: '', salarioNeto: '' }); }}
        >
          Registrar Planilla
        </Button>
      </Box>
      <Box sx={{ height: 420 }}>
        <DataGrid
          rows={data?.planillas ?? []}
          columns={cols}
          pageSizeOptions={[5]}
          getRowId={(row: Planilla) => row.id}
        />
      </Box>
      {/* Diálogo de edición */}
      <Dialog open={!!editPlanilla} onClose={() => setEditPlanilla(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Editar Planilla</DialogTitle>
        <DialogContent>
          {form && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
              <TextField
                label="Empleado"
                value={`${form.empleado?.nombre ?? ''} ${form.empleado?.apellido ?? ''}`}
                disabled
              />
              <TextField
                type="date"
                label="Fecha Inicio"
                InputLabelProps={{ shrink: true }}
                value={form.fechaInicio}
                onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
              />
              <TextField
                type="date"
                label="Fecha Fin"
                InputLabelProps={{ shrink: true }}
                value={form.fechaFin}
                onChange={e => setForm({ ...form, fechaFin: e.target.value })}
              />
              <TextField
                label="Salario Bruto"
                value={form.salarioBruto}
                onChange={e => setForm({ ...form, salarioBruto: e.target.value })}
                type="number"
              />
              <TextField
                label="Deducciones"
                value={form.deducciones}
                onChange={e => setForm({ ...form, deducciones: e.target.value })}
                type="number"
              />
              <TextField
                label="Salario Neto"
                value={form.salarioNeto}
                onChange={e => setForm({ ...form, salarioNeto: e.target.value })}
                type="number"
              />
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{ alignSelf: 'flex-end', mt: 1 }}
              >
                Guardar
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {/* Diálogo de creación */}
      <Dialog open={openCrear} onClose={() => setOpenCrear(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Registrar Planilla</DialogTitle>
        <DialogContent>
          {form && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
              <Autocomplete
                options={empleadosData?.empleados ?? []}
                getOptionLabel={(option: Empleado) => `${option.nombre} ${option.apellido}`}
                value={form.empleado}
                onChange={(_, value) => setForm({ ...form, empleado: value })}
                renderInput={(params) => (
                  <TextField {...params} label="Empleado" />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="No hay empleados"
              />
              <TextField
                type="date"
                label="Fecha Inicio"
                InputLabelProps={{ shrink: true }}
                value={form.fechaInicio}
                onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
              />
              <TextField
                type="date"
                label="Fecha Fin"
                InputLabelProps={{ shrink: true }}
                value={form.fechaFin}
                onChange={e => setForm({ ...form, fechaFin: e.target.value })}
              />
              <TextField
                label="Salario Bruto"
                value={form.salarioBruto}
                onChange={e => setForm({ ...form, salarioBruto: e.target.value })}
                type="number"
              />
              <TextField
                label="Deducciones"
                value={form.deducciones}
                onChange={e => setForm({ ...form, deducciones: e.target.value })}
                type="number"
              />
              <TextField
                label="Salario Neto"
                value={form.salarioNeto}
                onChange={e => setForm({ ...form, salarioNeto: e.target.value })}
                type="number"
              />
              <Button
                variant="contained"
                onClick={handleCrear}
                sx={{ alignSelf: 'flex-end', mt: 1 }}
                disabled={!form.empleado || !form.fechaInicio || !form.fechaFin || !form.salarioBruto || !form.salarioNeto}
              >
                Registrar
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PlanillasTab;