import { gql } from "@apollo/client";
export const VACACIONES_PENDIENTES_Q = gql`
  query vacacionesPendientes {
    vacacionesPendientes {
      id
      empleado { id nombre apellido }
      dias
      fecha
    }
  }
`;

 
export const EMPLEADOS_Q = gql`
  query empleados {
    empleados {
      id
      nombre
      apellido
      diasVacaciones
    }
  }
`;

export const GET_VACACIONES = gql`
  query vacacionesTomadas {
    vacacionesTomadas {
      id
      empleado { id nombre apellido }
      dias
      fecha
      estado
    }
  }
`;

export const CREAR_VACACION = gql`
  mutation crearVacacionTomada($empleadoId: ID!, $dias: Float!, $fecha: String!) {
    crearVacacionTomada(empleadoId: $empleadoId, dias: $dias, fecha: $fecha) {
      id
    }
  }
`;