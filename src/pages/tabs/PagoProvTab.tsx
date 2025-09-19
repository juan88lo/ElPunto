import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, IconButton, Tooltip, Button, Paper } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import { PAGO_PROV_Q } from '../../graphql/queries/pagoProveedores';
import { PAGAR, DELETE_PAGO, ACTUALIZAR_PAGO, CREAR_PAGO } from '../../graphql/mutations/pagorproveedor';

import PagoProvForm from './forms/PagoProvForm';

interface PagoProveedor {
    id: string;
    proveedor: {
        id: string;
        nombre: string;
    } | null;
    fechaPago: string;
    monto: number;
    metodo: string;
    referencia?: string;
    pagado: boolean;
    observacion?: string;
}

const PagoProvTab = () => {
    const { data, refetch } = useQuery(PAGO_PROV_Q);
    const [pagar] = useMutation(PAGAR, { onCompleted: () => refetch() });
    const [del] = useMutation(DELETE_PAGO, { onCompleted: () => refetch() });
    const [actualizarPago] = useMutation(ACTUALIZAR_PAGO, { onCompleted: () => refetch() });
    const [open, setOpen] = useState(false);
    const [editPago, setEditPago] = useState<PagoProveedor | null>(null);
    const [crearPago] = useMutation(CREAR_PAGO, { onCompleted: () => refetch() });
    const rows: PagoProveedor[] = data?.pagosProveedores ?? [];

    const cols: GridColDef[] = [
        {
            field: 'proveedorNombre',
            headerName: 'Proveedor',
            flex: 1,
            renderCell: (params: any) => params.row?.proveedor?.nombre ?? '',
        },
        { field: 'fechaPago', headerName: 'Fecha', flex: 1 },
        { field: 'monto', headerName: 'Monto', flex: 1 },
        { field: 'metodo', headerName: 'Método', flex: 1 },
        {
            field: 'pagado',
            headerName: 'Pagado',
            flex: 0.6,
            renderCell: (params) => (
                <Typography
                    color={params.value ? 'success.main' : 'warning.main'}
                    sx={{ display: 'flex', alignItems: 'center', height: '100%' }}
                >
                    {params.value ? 'Sí' : 'No'}
                </Typography>
            ),
        },
        {
            field: 'observacion',
            headerName: 'Observación',
            flex: 1.2,
            renderCell: (params: any) => params.row?.observacion ?? '',
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 180,
            sortable: false,
            renderCell: (params) => {
                const row = params.row as PagoProveedor;
                return (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Editar">
                            <IconButton
                                color="secondary"
                                size="small"
                                onClick={() => setEditPago(row)}
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
                        <Tooltip title="Eliminar">
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() => del({ variables: { id: row.id } })}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        },
    ];

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                maxWidth: '100%',
                overflowX: 'auto', // Esto evita desbordamiento horizontal
                bgcolor: 'background.paper',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Pagos a Proveedores
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    Registrar Pago
                </Button>
            </Box>

            <Box sx={{ minWidth: '1000px' /* ajusta si necesario */ }}>
                <DataGrid
                    rows={rows}
                    columns={cols}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    getRowId={(row) => row.id}
                    autoHeight
                    disableRowSelectionOnClick
                />
            </Box>

            <PagoProvForm
                open={open}
                onClose={() => {
                    setOpen(false);
                    refetch();
                }}
                crearPago={crearPago}
                refetch={refetch}
            />

            {editPago && (
                <PagoProvForm
                    open={!!editPago}
                    onClose={() => setEditPago(null)}
                    actualizarPago={actualizarPago}
                    refetch={refetch}
                    pago={editPago}
                />
            )}
        </Paper>
    );
};

export default PagoProvTab;
