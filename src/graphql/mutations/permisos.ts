// src/graphql/mutations/permisos.ts
import { gql } from '@apollo/client';

export const ASIGNAR_PERMISO = gql`
  mutation AsignarPermiso($tipoUsuarioId: ID!, $permisoId: ID!) {
    asignarPermisoARol(tipoUsuarioId: $tipoUsuarioId, permisoId: $permisoId) {
      id       
      nombre
      permisos { id nombrePermiso }
    }
  }
`;

export const QUITAR_PERMISO = gql`
  mutation QuitarPermiso($tipoUsuarioId: ID!, $permisoId: ID!) {
    quitarPermisoARol(tipoUsuarioId: $tipoUsuarioId, permisoId: $permisoId) {
      id
      nombre
      permisos { id nombrePermiso }
    }
  }
`;
