import React, { useState, useEffect, useMemo } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    DataGrid,
    type GridColDef,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation } from '@apollo/client';
import { useTheme } from '@mui/material/styles';

import {
    CREAR_INVENTARIO,
    ACTUALIZAR_INVENTARIO,
    ELIMINAR_INVENTARIO,
} from '../graphql/mutations/inventario';
import { GET_INVENTARIOS } from '../graphql/queries/inventario';
import { GET_FAMILIAS } from '../graphql/queries/familia';
import { GET_PROVEEDORES } from '../graphql/queries/proveedor';

export interface InventarioRow {
    id: number;
    nombre: string;
    codigoBarras: string;
    precioCostoSinImpuesto: number;
    impuestoPorProducto: number;
    precioFinalVenta: number;
    cantidadExistencias: number;
    familia: { id: number; nombre: string };
    proveedor: { id: number; nombre: string };
}

export interface InventarioInput {
    nombre: string;
    codigoBarras: string;
    precioCostoSinImpuesto: number;
    impuestoPorProducto: number;
    precioFinalVenta: number;
    cantidadExistencias: number;
    familiaId: number;
    proveedorId: number;
}

export default function InventarioPage() {
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<InventarioRow | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const { data, loading, error, refetch } = useQuery(GET_INVENTARIOS, {
        variables: { search: '' }, // Siempre buscar todo mientras se arregla el backend
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all', // Mostrar datos parciales aunque haya errores
        notifyOnNetworkStatusChange: true,
        onError: (error) => {
            console.error('Error en consulta de inventarios:', error);
            if (error.networkError) {
                if (error.networkError.message.includes('ECONNRESET')) {
                    setServerError('Error de conexión. Reintentando automáticamente...');
                    // Reintentar después de 2 segundos
                    setTimeout(() => {
                        refetch().catch(console.error);
                    }, 2000);
                } else {
                    setServerError('Error de red. Verificando conexión...');
                }
            } else {
                setServerError('Error al cargar el inventario');
            }
        },
        onCompleted: () => {
            setServerError(null); // Limpiar errores cuando la consulta es exitosa
        }
    });

    // Filtrado del lado del cliente como solución temporal
    const inventariosFiltrados = useMemo(() => {
        if (!data?.inventarios) return [];
        if (!search.trim()) return data.inventarios;
        
        const searchLower = search.toLowerCase();
        return data.inventarios.filter((item: any) => 
            item.nombre?.toLowerCase().includes(searchLower) ||
            item.codigoBarras?.toLowerCase().includes(searchLower)
        );
    }, [data?.inventarios, search]);

    const [crearInventario] = useMutation(CREAR_INVENTARIO, {
        refetchQueries: [{ query: GET_INVENTARIOS, variables: { search: '' } }],
    });

    const [actualizarInventario] = useMutation(ACTUALIZAR_INVENTARIO, {
        refetchQueries: [{ query: GET_INVENTARIOS, variables: { search: '' } }],
    });

    const [eliminarInventario] = useMutation(ELIMINAR_INVENTARIO, {
        update(cache, { data }, context) {
            if (!data?.eliminarInventario || !context?.variables?.id) return;

            cache.modify({
                fields: {
                    inventarios(existing = [], { readField }) {
                        return existing.filter(
                            (ref: any) => readField('id', ref) !== context.variables!.id,
                        );
                    },
                },
            });
        },
    });

    // Comentado temporalmente mientras se arregla el ILIKE en el backend
    // useEffect(() => {
    //     const t = setTimeout(() => refetch({ search }), 300);
    //     return () => clearTimeout(t);
    // }, [search, refetch]);

    const columns: GridColDef[] = [
        { field: 'nombre', headerName: 'Nombre', flex: 1 },
        { field: 'codigoBarras', headerName: 'Código', flex: 1 },
        { field: 'precioCostoSinImpuesto', headerName: 'Costo NI', width: 110, type: 'number' },
        { field: 'impuestoPorProducto', headerName: 'Impuesto', width: 120, type: 'number' },
        { field: 'precioFinalVenta', headerName: 'Precio Final', width: 110, type: 'number' },
        { field: 'cantidadExistencias', headerName: 'Stock', width: 90, type: 'number' },
        {
            field: 'familia',
            headerName: 'Familia',
            flex: 1,
            valueGetter: (params: any) => params.nombre ?? '',
        },
        {
            field: 'proveedor',
            headerName: 'Proveedor',
            flex: 1,
            valueGetter: (params: any) => params.nombre ?? '',
        },
        {
            field: 'actions',
            headerName: '',
            width: 110,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <IconButton color="primary" onClick={() => { setEditing(params.row); setOpen(true); }}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => eliminarInventario({ variables: { id: params.row.id } })}>
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            ),
        },
    ];

    const rows: InventarioRow[] = inventariosFiltrados ?? [];

    return (
        <Box sx={{ 
            p: { xs: 1, md: 4 }, 
            bgcolor: theme.palette.mode === 'dark' ? '#1a0f1a' : '#f5f6fa', 
            minHeight: '100vh',
            transition: 'background-color 0.3s ease'
        }}>
            <Paper elevation={3} sx={{ 
                p: { xs: 2, md: 4 }, 
                mb: 4,
                bgcolor: theme.palette.mode === 'dark' ? '#2a1a2a' : 'background.paper',
                transition: 'background-color 0.3s ease'
            }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mb={2}>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                        Inventario
                    </Typography>
                    <Button href="/dashboard" variant="outlined" color="secondary">
                        Volver al Dashboard
                    </Button>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                
                {search && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Mostrando {inventariosFiltrados.length} de {data?.inventarios?.length || 0} productos.
                    </Alert>
                )}
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Buscar…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} textAlign="right">
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            sx={{ minWidth: 180, fontWeight: 600 }}
                            onClick={() => {
                                setEditing(null);
                                setOpen(true);
                            }}
                        >
                            Nuevo artículo
                        </Button>
                    </Grid>
                </Grid>
                
                {/* Manejo mejorado de errores */}
                {(error || serverError) && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 2 }}
                        action={
                            <Button 
                                color="inherit" 
                                size="small" 
                                onClick={() => {
                                    setServerError(null);
                                    refetch();
                                }}
                            >
                                Reintentar
                            </Button>
                        }
                    >
                        {serverError || error?.message || 'Error desconocido'}
                    </Alert>
                )}
                <Paper elevation={1} sx={{ 
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' ? '#3a2a3a' : 'background.paper',
                    transition: 'background-color 0.3s ease'
                }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <DataGrid
                            autoHeight
                            rows={rows}
                            columns={columns}
                            pageSizeOptions={[10, 25, 50, 100]}
                            disableRowSelectionOnClick
                            sx={{
                                borderRadius: 2,
                                bgcolor: theme.palette.mode === 'dark' ? '#2a1a2a' : 'background.paper',
                                '& .MuiDataGrid-columnHeaders': { 
                                    bgcolor: theme.palette.mode === 'dark' ? '#4a3a4a' : 'grey.100', 
                                    fontWeight: 700 
                                },
                                '& .MuiDataGrid-cell': {
                                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                                },
                                '& .MuiDataGrid-row': {
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? '#3a2a3a' : 'action.hover',
                                    },
                                },
                                transition: 'background-color 0.3s ease'
                            }}
                        />
                    )}
                </Paper>
            </Paper>
            <Dialog
                open={open}
                onClose={() => {
                    setOpen(false);
                    setServerError(null);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                        {editing ? 'Editar artículo' : 'Nuevo artículo'}
                    </Typography>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    {serverError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {serverError}
                        </Alert>
                    )}
                    <InventarioForm
                        initial={editing}
                        saving={saving}
                        onSave={async (values) => {
                            try {
                                setSaving(true);
                                if (editing) {
                                    await actualizarInventario({ variables: { id: editing.id, ...values } });
                                } else {
                                    await crearInventario({ variables: { ...values } });
                                }
                                setOpen(false);
                                setServerError(null);
                            } catch (err: any) {
                                setServerError(err.message);
                            } finally {
                                setSaving(false);
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
}

interface FormProps {
    initial: InventarioRow | null;
    onSave: (data: InventarioInput) => Promise<void>;
    saving: boolean;
}

function InventarioForm({ initial, onSave, saving }: FormProps) {
    const { data: familiasData } = useQuery(GET_FAMILIAS);
    const { data: proveedoresData } = useQuery(GET_PROVEEDORES);

    const [values, setValues] = useState<InventarioInput>(
        initial
            ? {
                nombre: initial.nombre,
                codigoBarras: initial.codigoBarras,
                precioCostoSinImpuesto: initial.precioCostoSinImpuesto,
                impuestoPorProducto: initial.impuestoPorProducto,
                precioFinalVenta: initial.precioFinalVenta,
                cantidadExistencias: initial.cantidadExistencias,
                familiaId: initial.familia.id,
                proveedorId: initial.proveedor.id,

            }
            : {
                nombre: '',
                codigoBarras: '',
                precioCostoSinImpuesto: 0,
                impuestoPorProducto: 0,
                precioFinalVenta: 0,
                cantidadExistencias: 0,
                familiaId: 0,
                proveedorId: 0,
            },
    );

    // useEffect(() => {
    //     const total = Number(values.precioFinalVenta);
    //     const impuesto = Number(values.impuestoPorProducto);
    //     const rate = impuesto / 100;
    //     const base = Math.round(total / (1 + rate));
    //     if (!isNaN(base)) {
    //         setValues(v => ({
    //             ...v,
    //             precioCostoSinImpuesto: base,
    //         }));
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [values.precioFinalVenta, values.impuestoPorProducto]);

    return (
        <Box
            component="form"
            sx={{ mt: 2 }}
            onSubmit={(e) => {
                e.preventDefault();
                onSave(values);
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Nombre"
                        fullWidth
                        value={values.nombre}
                        onChange={(e) => setValues({ ...values, nombre: e.target.value })}
                        required
                        variant="outlined"
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Código de Barras"
                        fullWidth
                        value={values.codigoBarras}
                        onChange={(e) => setValues({ ...values, codigoBarras: e.target.value })}
                        required
                        variant="outlined"
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Precio de venta (con IVA)"
                        fullWidth
                        type="number"
                        value={values.precioFinalVenta}
                        onChange={(e) => setValues({ ...values, precioFinalVenta: Number(e.target.value) })}
                        required
                        variant="outlined"
                        size="small"
                        inputProps={{ min: 0 }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Impuesto (%)"
                        fullWidth
                        type="number"
                        value={values.impuestoPorProducto}
                        onChange={(e) => setValues({ ...values, impuestoPorProducto: Number(e.target.value) })}
                        required
                        variant="outlined"
                        size="small"
                        inputProps={{ min: 0, max: 100 }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Costo sin impuesto"
                        fullWidth
                        type="number"
                        value={values.precioCostoSinImpuesto}
                        onChange={(e) => setValues({ ...values, precioCostoSinImpuesto: Number(e.target.value) })}
                        variant="outlined"
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Cantidad en inventario"
                        type="number"
                        fullWidth
                        inputProps={{ min: 0 }}
                        value={values.cantidadExistencias}
                        onChange={(e) => setValues({ ...values, cantidadExistencias: Number(e.target.value) })}
                        required
                        variant="outlined"
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        fullWidth
                        label="Familia"
                        value={values.familiaId}
                        onChange={(e) => setValues({ ...values, familiaId: Number(e.target.value) })}
                        required
                        variant="outlined"
                        size="small"
                    >
                        {familiasData?.familias.map((f: any) => (
                            <MenuItem key={f.id} value={f.id}>{f.nombre}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        fullWidth
                        label="Proveedor"
                        value={values.proveedorId}
                        onChange={(e) => setValues({ ...values, proveedorId: Number(e.target.value) })}
                        required
                        variant="outlined"
                        size="small"
                    >
                        {proveedoresData?.proveedores.map((p: any) => (
                            <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={saving}
                            startIcon={saving && <CircularProgress size={20} />}
                            sx={{ minWidth: 120, fontWeight: 600 }}
                        >
                            Guardar
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}