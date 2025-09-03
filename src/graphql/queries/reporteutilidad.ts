// src/graphql/queries/utilidad.ts
import { gql } from '@apollo/client';

export const UTILIDADES_POR_DIA = gql`
  query UtilidadesPorDia($del: String!, $al: String!) {
    utilidadesPorDia(fechaInicio: $del, fechaFin: $al) {
      fecha
      utilidad
    }
  }
`;
export const UTILIDAD_TOTAL = gql`
  query UtilidadTotal($del: String!, $al: String!) {
    utilidadTotal(fechaInicio: $del, fechaFin: $al)
  }
`;