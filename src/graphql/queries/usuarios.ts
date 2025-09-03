// src/graphql/queries/usuarios.ts
import { gql } from '@apollo/client';

export const GET_USUARIOS = gql`
  query GetUsuarios {
    usuarios {
      id
      nombre
      correo
      estado
      empleado {
        id
        nombre
        apellido
      }
      tipoUsuario {
        id
        nombre
      }
    }
  }
`;