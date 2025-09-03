import { gql } from '@apollo/client';

export const CAJA_ABIERTA_QUERY = gql`
  query {
    cajaAbierta {
      id
      fechaApertura
      montoInicial
      montoSistema
      estado
      numeroDia
      totalVentas
    }
  }
`;


export const LISTA_CAJAS = gql`
 query ListaCajas {
    cajas {
      id
      fechaApertura
      fechaCierre
      totalVentas
      montoReal
      estado
      numeroDia
    }
  }
`;
export const REABRIR_CAJA = gql`
  mutation ReabrirCaja($cajaId: ID!, $motivo: String) {
    reabrirCaja(cajaId: $cajaId, motivo: $motivo) {
      id
      estado
      fechaReapertura
      motivoReapertura
      # agrega más campos si los necesitas
    }
  }
`;