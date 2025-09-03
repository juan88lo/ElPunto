import { gql } from "@apollo/client";

export const CREAR_FACTURA_MUTATION = gql`
  mutation CrearFactura($input: FacturaInput!) {
    crearFactura(input: $input) {
      id
      consecutivo
      total
      fecha
    }
  }
`;


export const PAGAR_FACTURA_MUTATION = gql`
  mutation PagarFactura($input: PagoInput!) {
    pagarFactura(input: $input) {
      id
      estado
      formaPago
      fechaPago
    }
  }
    `;