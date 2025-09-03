import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
} from "@mui/material";

export interface ModalAlertaProps {
  visible: boolean;
  mensaje: string;
  onClose: () => void;
}

const ModalAlerta: React.FC<ModalAlertaProps> = ({ visible, mensaje, onClose }) => (
  <Dialog open={visible} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Atención</DialogTitle>
    <DialogContent dividers>
      <Typography>{mensaje}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} autoFocus>Cerrar</Button>
    </DialogActions>
  </Dialog>
);

export default ModalAlerta;
