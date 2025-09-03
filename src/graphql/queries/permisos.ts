import { gql } from '@apollo/client';

export const GET_PERMISOS = gql`
  query GetPermisos {
    permisos {
      id
      nombrePermiso 
    }
  }
`;

export const GET_PERMISOS_POR_ROL = gql`
  query GetPermisosPorRol($tipoUsuarioId: ID!) {
    permisosPorTipoUsuario(tipoUsuarioId: $tipoUsuarioId) {
      id
      nombrePermiso
       asignado 
    }
  }
`;
