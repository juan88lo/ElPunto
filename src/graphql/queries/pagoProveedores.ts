import { gql } from '@apollo/client';

export const PAGO_PROV_Q = gql`
  query PagosProveedores {
    pagosProveedores {
      id
      proveedor {
        id
        nombre
      }
      fechaPago
      monto
      metodo
      pagado
      referencia
      observacion
    }
  }
`;



export const PROV_Q = gql`
  query Proveedores {
    proveedores {
      id
      nombre
    }
  }
`;