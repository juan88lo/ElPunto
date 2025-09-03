// src/graphql/queries/roles.ts
import { gql } from '@apollo/client';

export const GET_ROLES = gql`
  query GetRoles {
    roles { id nombre descripcion }
  }
`;

// src/graphql/mutations/roles.ts
export const CREAR_ROL = gql`
  mutation CrearRol($input: TipoUsuarioInput!) {
    crearTipoUsuario(input: $input) { id nombre descripcion }
  }
`;
export const ACTUALIZAR_ROL = gql`
  mutation ActualizarRol($id: ID!, $input: TipoUsuarioInput!) {
    actualizarTipoUsuario(id: $id, input: $input) { id nombre descripcion }
  }
`;
export const ELIMINAR_ROL = gql`
  mutation EliminarRol($id: ID!) { eliminarTipoUsuario(id:$id) }
`;
