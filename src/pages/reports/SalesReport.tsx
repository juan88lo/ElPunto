import { useQuery } from "@apollo/client";
import { CircularProgress, Typography, Paper, Box, Stack, Button } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
// Update the import path below to match the actual location and filename of your query file
import { VENTAS_POR_DIA } from "../../graphql/queries/reporteVentas";

export default function SalesReport() {
    const { data, loading, error } = useQuery(VENTAS_POR_DIA);

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", py: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Reporte de Ventas
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mb={2}>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                        Inventario
                    </Typography>
                    <Button href="/reportes" variant="outlined" color="secondary">
                        Volver al Dashboard
                    </Button>
                </Stack>
                {loading && <CircularProgress />}
                {error && <Typography color="error">{error.message}</Typography>}

                {data && (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data.ventasPorDia}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="total" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Paper>
        </Box>
    );
}
