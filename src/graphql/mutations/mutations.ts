import { gql } from '@apollo/client';


export const CREAR_USUARIO = gql`
   mutation Register(
    $nombre: String!
    $correo: String!
    $password: String!
    $tipoUsuarioId: ID!
    $empleadoId: ID
    $estado: Boolean
  ) {
    register(
      nombre: $nombre
      correo: $correo
      password: $password
      tipoUsuarioId: $tipoUsuarioId
      empleadoId: $empleadoId
      estado: $estado
    ) {
      id
      nombre
      correo
      empleado {
        id
        nombre
      }
    }
  }
`;


export const ELIMINAR_USUARIO = gql`
  mutation EliminarUsuario($id: ID!) {
    eliminarUsuario(id: $id)
  }
`;

export const ACTUALIZAR_USUARIO = gql`
 mutation ActualizarUsuario(
    $id: ID!
    $nombre: String
    $correo: String
    $password: String
    $tipoUsuarioId: ID
    $empleadoId: ID
    $estado: Boolean
  ) {
    actualizarUsuario(
      id: $id
      nombre: $nombre
      correo: $correo
      password: $password
      tipoUsuarioId: $tipoUsuarioId
      empleadoId: $empleadoId
      estado: $estado
    ) {
      id
      nombre
      correo
      empleado {
        id
        nombre
      }
    }
  }
`;

export const ASIGNAR_PERMISO = gql`
  mutation AsignarPermiso($tipoUsuarioId: ID!, $permisoId: ID!) {
    asignarPermisoARol(tipoUsuarioId: $tipoUsuarioId, permisoId: $permisoId) {
      id
      nombre
      permisos {
        id
        nombre
      }
    }
  }
`;

export const CREAR_CONFIGURACION = gql`
  mutation CrearConfiguracion($clave: String!, $valor: Float!) {
    crearConfiguracion(clave: $clave, valor: $valor) {
      id
      clave
      valor
    }
  }
`;

export const ACTUALIZAR_CONFIGURACION = gql`
  mutation ActualizarConfiguracion($id: ID!, $valor: Float!) {
    actualizarConfiguracion(id: $id, valor: $valor) {
      id
      clave
      valor
    }
  }
`;

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