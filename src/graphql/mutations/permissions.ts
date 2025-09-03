// src/graphql/permissions.ts
import { gql } from '@apollo/client';

export const LISTAR_PERMISOS = gql`
  query ListarPermisos {
    permisos {
      id
      nombrePermiso
      Pantalla
    }
  }
`;

export const CREAR_PERMISO = gql`
  mutation CrearPermiso($nombre: String!, $pantalla: String!) {
    crearPermiso(input: { nombrePermiso: $nombre, Pantalla: $pantalla }) {
      id
      nombrePermiso
      Pantalla
    }
  }
`;


export const EDITAR_PERMISO = gql`
  mutation ActualizarPermiso($id: ID!, $nombre: String!, $pantalla: String!) {
    actualizarPermiso(
      id: $id,
      input: { nombrePermiso: $nombre, Pantalla: $pantalla }
    ) {
      id
      nombrePermiso
      Pantalla
    }
  }
`;


 
export const ELIMINAR_PERMISO = gql`
  mutation EliminarPermiso($id: ID!) {
    eliminarPermiso(id: $id)
  }
`;
