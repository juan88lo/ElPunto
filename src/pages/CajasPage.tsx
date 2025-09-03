import { useState } from 'react';
import {
    DataGrid,
    type GridRenderCellParams,
} from '@mui/x-data-grid';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    Box,
    Typography,
    Paper,
    Stack,
    useTheme,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { LISTA_CAJAS, REABRIR_CAJA } from '../graphql/queries/caja';

export default function CajasPage() {
    const theme = useTheme();
    const { data } = useQuery(LISTA_CAJAS);
    const [reabrirCaja] = useMutation(REABRIR_CAJA, {
        refetchQueries: [{ query: LISTA_CAJAS }],
        awaitRefetchQueries: true,
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [cajaSeleccionada, setCajaSeleccionada] = useState<any | null>(null);
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const abrirDialogo = (row: any) => {
        setCajaSeleccionada(row);
        setMotivo('');
        setDialogOpen(true);
    };

    const confirmarReapertura = async () => {
        if (!cajaSeleccionada) return;

        try {
            await reabrirCaja({
                variables: {
                    cajaId: cajaSeleccionada.id,
                    motivo: motivo.trim() || null,
                },
            });
            setDialogOpen(false);
        } catch (error: any) {
            const mensaje = error?.message ?? 'Ocurrió un error';
            setErrorMessage(mensaje.includes('Sin permiso') ? 'No tienes permisos para reabrir la caja.' : mensaje);
            setErrorSnackbarOpen(true);
        }
    };

    const columns = [
        { field: 'id', headerName: '#', width: 70 },
        { field: 'numeroDia', headerName: 'Caja #', width: 90 },
        { field: 'fechaApertura', headerName: 'Apertura', flex: 1 },
        { field: 'fechaCierre', headerName: 'Cierre', flex: 1 },
        {
            field: 'totalVentas',
            headerName: '₡ Ventas',
            flex: 1,
            renderCell: ({ row }: GridRenderCellParams) =>
                row.totalVentas != null
                    ? `₡${row.totalVentas.toLocaleString('es-CR', {
                        minimumFractionDigits: 2,
                    })}`
                    : '0.00',
        },
        {
            field: 'montoReal',
            headerName: 'Efectivo contado',
            flex: 1,
            renderCell: ({ row }: GridRenderCellParams) =>
                row.montoReal != null
                    ? `₡${row.montoReal.toLocaleString('es-CR', {
                        minimumFractionDigits: 2,
                    })}`
                    : '0.00',
        },
        { field: 'estado', headerName: 'Estado', width: 110 },
        {
            field: 'accion',
            headerName: 'Acción',
            width: 140,
            renderCell: ({ row }: GridRenderCellParams) =>
                row.estado === 'cerrada' ? (
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => abrirDialogo(row)}
                        sx={{ boxShadow: 1, textTransform: 'none' }}
                    >
                        Reabrir
                    </Button>
                ) : null,
        },
    ];

    const rows =
        (data?.cajas ?? []).map((caja: any) => {
            const apertura = caja.fechaApertura
                ? new Date(Number(caja.fechaApertura))
                : null;
            const cierre = caja.fechaCierre
                ? new Date(Number(caja.fechaCierre))
                : null;

            return {
                ...caja,
                fechaApertura: apertura && !isNaN(apertura.getTime())
                    ? apertura.toLocaleString('es-CR')
                    : '—',
                fechaCierre: cierre && !isNaN(cierre.getTime())
                    ? cierre.toLocaleString('es-CR')
                    : '—',
                totalVentas:
                    caja.totalVentas != null ? Number(caja.totalVentas) : null,
                montoReal:
                    caja.montoReal != null ? Number(caja.montoReal) : null,
            };
        }) ?? [];

    return (
        <Box
            sx={{
                background: theme.palette.background.default,
                minHeight: '100vh',
                py: 4,
                px: { xs: 1, sm: 3, md: 6 },
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    maxWidth: 1200,
                    mx: 'auto',
                    p: { xs: 2, sm: 4 },
                    borderRadius: 3,
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                    mb={3}
                >
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                        Cajas
                    </Typography>
                    <Button
                        href="/dashboard"
                        variant="outlined"
                        color="secondary"
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Volver al Dashboard
                    </Button>
                </Stack>
                <Box
                    sx={{
                        '& .MuiDataGrid-root': {
                            background: theme.palette.background.paper,
                            borderRadius: 2,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            background: theme.palette.grey[100],
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-row:hover': {
                            background: theme.palette.action.hover,
                        },
                    }}
                >
                    <DataGrid
                        autoHeight
                        rows={rows}
                        columns={columns}
                        pageSizeOptions={[10]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10, page: 0 } },
                        }}
                        disableRowSelectionOnClick
                        sx={{
                            border: 'none',
                            fontSize: 16,
                        }}
                    />
                </Box>
            </Paper>

            {/* diálogo para el motivo */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Motivo de reapertura
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="Motivo"
                        fullWidth
                        margin="dense"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        multiline
                        minRows={2}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={confirmarReapertura}
                        disabled={!motivo.trim()}
                        sx={{ borderRadius: 2 }}
                    >
                        Reabrir
                    </Button>
                </DialogActions>
            </Dialog>

            {/* snackbar para errores */}
            <Snackbar
                open={errorSnackbarOpen}
                autoHideDuration={6000}
                onClose={() => setErrorSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="error"
                    onClose={() => setErrorSnackbarOpen(false)}
                    sx={{ width: '100%' }}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
