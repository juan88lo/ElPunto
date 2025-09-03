import { gql } from '@apollo/client';

export const GET_FAMILIAS = gql`
  query GetFamilias {
    familias {
      id
      nombre
      Observaciones
      Estado
    }
  }
`;
