import { gql } from '@apollo/client';

export const PAGAR = gql`
  mutation PagarProveedor($id: ID!) {
    pagarProveedor(id: $id)
  }
`;


export const CREAR_PAGO = gql`
  mutation CrearPagoProveedor(
    $proveedorId: ID!
    $fechaPago: String!
    $monto: Float!
    $metodo: String!
    $referencia: String
    $observacion: String
  ) {
    crearPagoProveedor(
      proveedorId: $proveedorId
      fechaPago: $fechaPago
      monto: $monto
      metodo: $metodo
      referencia: $referencia
      observacion: $observacion
    ) {
      id
    }
  }
`;

export const DELETE_PAGO = gql`
  mutation EliminarPagoProveedor($id: ID!) {
    eliminarPagoProveedor(id: $id)
  }
`;

export const ACTUALIZAR_PAGO = gql`
  mutation ActualizarPagoProveedor(
    $id: ID!
    $proveedorId: ID!
    $fechaPago: String!
    $monto: Float!
    $metodo: String!
    $referencia: String
    $observacion: String
  ) {
    actualizarPagoProveedor(
      id: $id
      proveedorId: $proveedorId
      fechaPago: $fechaPago
      monto: $monto
      metodo: $metodo
      referencia: $referencia
      observacion: $observacion
    ) {
      id
    }
  }
`;