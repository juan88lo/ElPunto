import { gql } from '@apollo/client';

export const CREAR_FAMILIA = gql`
  mutation CrearFamilia($nombre: String!, $Observaciones: String, $Estado: Boolean) {
    crearFamilia(nombre: $nombre, Observaciones: $Observaciones, Estado: $Estado) {
      id
      nombre
      Observaciones
      Estado
    }
  }
`;


export const ACTUALIZAR_FAMILIA = gql`
  mutation ActualizarFamilia($id: ID!, $nombre: String, $Observaciones: String, $Estado: Boolean) {
    actualizarFamilia(id: $id, nombre: $nombre, Observaciones: $Observaciones, Estado: $Estado) {
      id nombre Observaciones Estado
    }
  }
`;

export const ELIMINAR_FAMILIA = gql`
  mutation EliminarFamilia($id: ID!) {
    eliminarFamilia(id: $id)
  }
`;