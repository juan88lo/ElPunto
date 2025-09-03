import { gql } from "@apollo/client";
 
export const CANCELAR_FACTURA = gql`
  mutation CancelarFactura($facturaId: ID!, $motivo: String) {
    cancelarFactura(facturaId: $facturaId, motivo: $motivo) {
      id
      total
      fecha
    }
  }
`;