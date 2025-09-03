import { gql } from '@apollo/client';

export const APROBAR_VACACION = gql`
  mutation AprobarVacacion($id: ID!, $estado: String!) {
    aprobarVacacion(id: $id, estado: $estado) {
      id
      estado 
    }
  }
`;

export const CREAR_VACACION = gql`
mutation CrearVacacionTomada($empleadoId: ID!, $dias: Float!, $fecha: String!, $estado: String) {
  crearVacacionTomada(empleadoId: $empleadoId, dias: $dias, fecha: $fecha, estado: $estado) {
    id
    dias
    fecha
    estado
    empleado {
      id
      nombre
      apellido
    }
  }
}
`;

export const EDITAR_VACACION = gql`
  mutation ActualizarVacacionTomada(
    $id: ID!
    $dias: Float
    $fecha: String
    $estado: String
  ) {
    actualizarVacacionTomada(
      id: $id
      dias: $dias
      fecha: $fecha
      estado: $estado
    ) {
      id
      dias
      fecha
      estado
      empleado {
        id
        nombre
        apellido
      }
    }
  }
`;

export const ELIMINAR_VACACION = gql`
  mutation EliminarVacacionTomada($id: ID!) {
    eliminarVacacionTomada(id: $id)
  }
`;