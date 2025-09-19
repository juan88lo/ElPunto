import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Autocomplete, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useQuery } from '@apollo/client';
import { PROV_Q } from '../../../graphql/queries/pagoProveedores';

interface Proveedor {
  id: string;
  nombre: string;
}

interface PagoProveedor {
  id: string;
  proveedor: Proveedor | null;
  fechaPago: string;
  monto: number;
  metodo: string;
  referencia?: string;
  observacion?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  crearPago?: (options: any) => Promise<any>;
  actualizarPago?: (options: any) => Promise<any>;
  refetch: () => void;
  pago?: PagoProveedor | null;
}

const PagoProvForm = ({
  open,
  onClose,
  crearPago,
  actualizarPago,
  refetch,
  pago
}: Props) => {
  const { data } = useQuery(PROV_Q);
  const proveedores: Proveedor[] = data?.proveedores ?? [];

  const [form, setForm] = useState({
    proveedorId: '',
    fechaPago: '',
    monto: '',
    metodo: 'Transferencia',
    referencia: '',
    observacion: ''
  });

  useEffect(() => {
    if (pago) {
      setForm({
        proveedorId: pago.proveedor?.id ?? '',
        fechaPago: pago.fechaPago ?? '',
        monto: pago.monto?.toString() ?? '',
        metodo: pago.metodo ?? 'Transferencia',
        referencia: pago.referencia ?? '',
        observacion: pago.observacion ?? ''
      });
    } else {
      setForm({
        proveedorId: '',
        fechaPago: '',
        monto: '',
        metodo: 'Transferencia',
        referencia: '',
        observacion: ''
      });
    }
  }, [pago, open]);

  const handleSubmit = async () => {
    if (pago && actualizarPago) {
      const variables = {
        id: pago.id,
        proveedorId: form.proveedorId,
        fechaPago: form.fechaPago,
        monto: parseFloat(form.monto),
        metodo: form.metodo,
        referencia: form.referencia,
        observacion: form.observacion
      };
      await actualizarPago({
        variables
      });
    } else if (crearPago) {
      const variables = {
        proveedorId: form.proveedorId,
        fechaPago: form.fechaPago,
        monto: parseFloat(form.monto),
        metodo: form.metodo,
        referencia: form.referencia,
        observacion: form.observacion
      };
      await crearPago({
        variables
      });
    }
    refetch();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{pago ? 'Actualizar Pago' : 'Registrar Pago'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
          <Autocomplete
            options={proveedores}
            getOptionLabel={(option: Proveedor) => option.nombre}
            value={proveedores.find((p) => p.id === form.proveedorId) || null}
            onChange={(_, value) =>
              setForm({ ...form, proveedorId: value ? value.id : '' })
            }
            renderInput={(params) => (
              <TextField {...params} label="Proveedor" sx={{ minWidth: 220 }} />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No hay proveedores"
          />
          <TextField
            type="date"
            label="Fecha"
            InputLabelProps={{ shrink: true }}
            value={form.fechaPago}
            onChange={e => setForm({ ...form, fechaPago: e.target.value })}
          />
          <TextField
            label="Monto"
            value={form.monto}
            onChange={e => setForm({ ...form, monto: e.target.value })}
            type="number"
            inputProps={{ min: 0 }}
          />
          <TextField
            select
            label="Método"
            value={form.metodo}
            onChange={e => setForm({ ...form, metodo: e.target.value })}
          >
            <MenuItem value="Transferencia">Transferencia</MenuItem>
            <MenuItem value="SIMPE">SIMPE</MenuItem>
            <MenuItem value="Efectivo">Efectivo</MenuItem>
          </TextField>
          <TextField
            label="Referencia"
            value={form.referencia}
            onChange={e => setForm({ ...form, referencia: e.target.value })}
          />
          <TextField
            label="Observación"
            value={form.observacion}
            onChange={e => setForm({ ...form, observacion: e.target.value })}
            multiline
            minRows={2}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ alignSelf: 'flex-end', mt: 1 }}
            disabled={!form.proveedorId || !form.fechaPago || !form.monto}
          >
            {pago ? 'Actualizar' : 'Registrar'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PagoProvForm;