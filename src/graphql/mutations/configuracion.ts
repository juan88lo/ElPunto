import { gql } from '@apollo/client';

export const CREAR_CONFIGURACION = gql`
  mutation CrearConfiguracion($input: ConfiguracionInput!) {
    crearConfiguracion(datos: $input) {
      id
      clave
    }
  }
`;

export const ACTUALIZAR_CONFIGURACION = gql`
  mutation ActualizarConfiguracion($id: ID!, $input: ConfiguracionInput!) {
    actualizarConfiguracion(id: $id, datos: $input) {
      id
      clave
    }
  }
`;

export const ELIMINAR_CONFIGURACION = gql`
  mutation EliminarConfiguracion($id: ID!) {
    eliminarConfiguracion(id: $id)
  }
`;