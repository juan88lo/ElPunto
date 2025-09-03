
import { gql } from "@apollo/client";

export const GET_FACTURAS_EMITIDAS = gql`
  query {
    facturasEmitidas {
      id
      consecutivo 
      fecha
      total
      estado
    }
  }
`; 