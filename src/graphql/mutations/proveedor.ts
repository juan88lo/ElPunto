import { gql } from '@apollo/client';


export const CREAR_PROVEEDOR = gql`
  mutation CrearProveedor($input: ProveedorInput!) {
    crearProveedor(input: $input) {
      id
      nombre
      Estado
       __typename 
    }
  }
`;

export const ACTUALIZAR_PROVEEDOR = gql`
  mutation ActualizarProveedor($id: Int!, $input: ProveedorInput!) {
    actualizarProveedor(id: $id, input: $input) {
      id
      nombre
      Estado
       __typename 
    }
  }
`;

export const ELIMINAR_PROVEEDOR = gql`
  mutation EliminarProveedor($id: Int!) {
    eliminarProveedor(id: $id)
  }
`;
