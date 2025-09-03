import { gql } from '@apollo/client';

export const CONFIGURACIONES = gql`
query Configuraciones($clave: String, $estado: Boolean, $prioridad: Int) {
  configuraciones(clave: $clave, estado: $estado, prioridad: $prioridad) {
    id
    clave
    valor
    prioridad
    estado
    pantalla
  }
}
`;
