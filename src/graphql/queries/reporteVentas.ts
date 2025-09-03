import { gql } from "@apollo/client";

export const GET_REPORTE_VENTAS = gql`
  query {
    reporteVentas {
      fecha
      total
    }
  }
`;

export const VENTAS_POR_DIA = gql`
  query GetVentasPorDia {
    ventasPorDia {
      fecha
      total
    }
  }
`;