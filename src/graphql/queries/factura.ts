// src/graphql/queries/factura.ts
import { gql } from "@apollo/client";
  
export const GET_ULTIMAS_FACTURAS = gql`
query ultimasFacturas($limit: Int!) {
  ultimasFacturas(limit: $limit) {
        id
      consecutivo
      fecha
      subtotal
      descuento
      impuesto
      total
      formaPago
      estado
      usuario {
        nombre
      } 
      lineas {
        id
        cantidad
        precio
        total
        producto {
          codigoBarras
          nombre
        }
      }
  }
}
`;

