// components/CajaDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface CajaDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (montoReal: number) => void;
}

export const CajaDialog: React.FC<CajaDialogProps> = ({ open, onClose, onConfirm }) => {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    const value = Number(inputValue);
    if (isNaN(value) || value < 0 || value > 999999.99) {
      alert('Monto inválido. Debe ser un número positivo menor a 10 millón.');
      return;
    }
    onConfirm(value);
    setInputValue('');
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Confirmar cierre de caja</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Efectivo real contado"
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          type="number"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained">Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
};
