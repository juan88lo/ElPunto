import { gql } from '@apollo/client';
 

export const CREAR_EMPLEADO = gql`
  mutation CrearEmpleado(
    $nombre: String!, $apellido: String!, $cedula: String!,
    $puesto: String!, $salarioBase: Float!, $fechaIngreso: String!,
    $diasVacaciones: Float
  ) {
    crearEmpleado(
      nombre: $nombre, apellido: $apellido, cedula: $cedula,
      puesto: $puesto, salarioBase: $salarioBase,
      fechaIngreso: $fechaIngreso, diasVacaciones: $diasVacaciones
    ) { id }
  }
`;
