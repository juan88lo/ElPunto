// src/pages/reports/ProfitReport.tsx
import { useQuery } from '@apollo/client';
import { UTILIDADES_POR_DIA } from '../../graphql/queries/reporteutilidad';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Paper, Typography, CircularProgress, Stack, Button } from '@mui/material';

export default function ProfitReport() {
  const { data, loading, error } = useQuery(UTILIDADES_POR_DIA, {
    variables: { del: '2025-05-01', al: '2025-05-31' }
  });

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>Utilidades por Día</Typography>
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
            <LineChart data={data.utilidadesPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="utilidad" stroke="#4caf50" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
}
