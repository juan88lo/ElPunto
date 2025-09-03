// src/context/PagosContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

interface Pago {
  id: number;
  monto: number;
  proveedorId?: number;
  empleadoId?: number;
  fecha: string;
}

interface ResumenPlanilla {
  periodo: string;
  totalEmpleados: number;
  totalNeto: number;
  pendiente: number;
}

interface ResumenProveedor {
  pendientes: number;
  totalPendiente: number;
}

interface PagosContextType {
  pagosProveedores: Pago[];
  pagosPlanilla: Pago[];
  resumenProv: ResumenProveedor | null;
  resumenPlanilla: ResumenPlanilla | null;
  agregarPagoProveedor: (pago: Pago) => void;
  agregarPagoPlanilla: (pago: Pago) => void;
  setResumenProv: (resumen: ResumenProveedor) => void;
  setResumenPlanilla: (resumen: ResumenPlanilla) => void;
}

const PagosContext = createContext<PagosContextType | undefined>(undefined);

interface PagosProviderProps {
  children: ReactNode;
}

export const PagosProvider = ({ children }: PagosProviderProps) => {
  const [pagosProveedores, setPagosProveedores] = useState<Pago[]>([]);
  const [pagosPlanilla, setPagosPlanilla] = useState<Pago[]>([]);
  const [resumenProv, setResumenProv] = useState<ResumenProveedor | null>(null);
  const [resumenPlanilla, setResumenPlanilla] = useState<ResumenPlanilla | null>(null);

  const agregarPagoProveedor = (pago: Pago) => {
    setPagosProveedores(prev => [...prev, pago]);
  };

  const agregarPagoPlanilla = (pago: Pago) => {
    setPagosPlanilla(prev => [...prev, pago]);
  };

  return (
    <PagosContext.Provider value={{
      pagosProveedores,
      pagosPlanilla,
      resumenProv,
      resumenPlanilla,
      agregarPagoProveedor,
      agregarPagoPlanilla,
      setResumenProv,
      setResumenPlanilla
    }}>
      {children}
    </PagosContext.Provider>
  );
};

export const usePagos = (): PagosContextType => {
  const context = useContext(PagosContext);
  if (!context) {
    throw new Error('usePagos debe usarse dentro de un PagosProvider');
  }
  return context;
};
