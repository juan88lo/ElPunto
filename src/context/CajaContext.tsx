import React, {
  createContext,
  useContext,
  useState,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { CAJA_ABIERTA_QUERY } from '../graphql/queries/caja';
import { ABRIR_CAJA, CERRAR_CAJA } from '../graphql/mutations/caja';
import { useAuth } from './AuthContext';

/* ───────── tipos ───────── */
type CajaContextType = {
  caja: any;
  abrirCaja: () => void;        // muestra modal
  cerrarCaja: (id: string) => void; // muestra modal
};

const CajaContext = createContext<CajaContextType>({
  caja: null,
  abrirCaja: () => { },
  cerrarCaja: () => { },
});

/* ───────── provider ───────── */
export function CajaProvider({ children }: { children: React.ReactNode }) {
  /* auth + datos */
  const { token } = useAuth();
  const { data, refetch } = useQuery(CAJA_ABIERTA_QUERY, {
    pollInterval: 8000,           // <-- refresca cada 8 s
    fetchPolicy: 'network-only',
    skip: !token,
  });

  const [abrirCajaMutation] = useMutation(ABRIR_CAJA);
  const [cerrarCajaMutation] = useMutation(CERRAR_CAJA);

  /* ---------- diálogo CERRAR ---------- */
  const [cerrarOpen, setCerrarOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [montoReal, setMontoReal] = useState('');
  const [montoRealErr, setMontoRealErr] = useState('');

  const cerrarCaja = (id: string) => {
    setSelectedId(id);
    setMontoReal('');
    setMontoRealErr('');
    setCerrarOpen(true);
  };

  const confirmarCierre = async () => {
    const val = Number(montoReal);
    if (isNaN(val) || val < 0 || val > 9999999.99) {
      setMontoRealErr('Monto inválido (0 – 9 999 999,99).');
      return;
    }
    if (!selectedId) return;

    await cerrarCajaMutation({ variables: { id: selectedId, montoReal: val } });
    await refetch();
    setCerrarOpen(false);
  };

  /* ---------- diálogo ABRIR ---------- */
  const [abrirOpen, setAbrirOpen] = useState(false);
  const [montoInicial, setMontoInicial] = useState('');
  const [montoIniErr, setMontoIniErr] = useState('');

  const abrirCaja = () => {
    // if (data?.cajaAbierta) {
    //   console.warn("⚠️ Ya hay una caja abierta");
    //   return;  
    // }

    setMontoInicial('');
    setMontoIniErr('');
    setAbrirOpen(true);
  };

  const confirmarApertura = async () => {
    const val = Number(montoInicial);
    if (isNaN(val) || val < 0 || val > 9999999.99) {
      setMontoIniErr('Monto inválido (0 – 9 999 999,99).');
      return;
    }

    await abrirCajaMutation({ variables: { montoInicial: val } });
    await refetch();
    setAbrirOpen(false);
  };

  /* ---------- JSX ---------- */
  return (
    <CajaContext.Provider value={{ caja: data?.cajaAbierta ?? null, abrirCaja, cerrarCaja }}>
      {children}

      {/* Modal cerrar */}
      <Dialog open={cerrarOpen} onClose={() => setCerrarOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cerrar caja</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Efectivo real contado"
            type="number"
            margin="dense"
            value={montoReal}
            onChange={e => { setMontoReal(e.target.value); setMontoRealErr(''); }}
            error={!!montoRealErr}
            helperText={montoRealErr}
            inputProps={{ min: 0, step: 0.01, max: 9999999.99 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCerrarOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarCierre}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal abrir */}
      <Dialog open={abrirOpen} onClose={() => setAbrirOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Abrir caja</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Monto inicial de la caja"
            type="number"
            margin="dense"
            value={montoInicial}
            onChange={e => { setMontoInicial(e.target.value); setMontoIniErr(''); }}
            error={!!montoIniErr}
            helperText={montoIniErr}
            inputProps={{ min: 0, step: 0.01, max: 9999999.99 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbrirOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarApertura}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </CajaContext.Provider>
  );
}

/* hook */
export const useCaja = () => useContext(CajaContext);
