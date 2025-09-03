import { gql } from '@apollo/client';

export const ABRIR_CAJA = gql`
  mutation AbrirCaja($montoInicial: Float!) {
    abrirCaja(montoInicial: $montoInicial) {
      id
      fechaApertura
      estado
      montoInicial
      numeroDia
    }
  }
`;

export const CERRAR_CAJA = gql`
  mutation CerrarCaja($id: ID!, $montoReal: Float!) {
    cerrarCaja(cajaId: $id, montoReal: $montoReal) {
      id
      estado
      montoSistema
      montoReal
      diferencia
    }
  }
`;