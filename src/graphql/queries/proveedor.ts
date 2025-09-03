

import { gql } from '@apollo/client';

export const GET_PROVEEDORES = gql`
 query GetProveedores {
    proveedores {
      id
      nombre
      TelCelular
      TelOtro
      AgenteAsignado
      TelefonoAgente
      Supervisor
      TelSupervisor
      Frecuencia
      DiasVisita
      DiaEntrega
      Simpe
      SimpeNombre
      CuentaBancaria
      Banco
      NombrePropietarioCtaBancaria
      Otros
      Observaciones
      Estado
       __typename 
    }
  }
`;