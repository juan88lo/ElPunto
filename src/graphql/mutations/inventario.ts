import { gql } from '@apollo/client';



export const CREAR_INVENTARIO = gql`
  mutation CrearInventario(
    $nombre: String!,
    $codigoBarras: String!,
    $precioCostoSinImpuesto: Float!,
    $impuestoPorProducto: Float!,
    $precioFinalVenta: Float!,
    $cantidadExistencias: Int!,
    $familiaId: ID!,
    $proveedorId: ID!
  ) {
    crearInventario(
      nombre: $nombre,
      codigoBarras: $codigoBarras,
      precioCostoSinImpuesto: $precioCostoSinImpuesto,
      impuestoPorProducto: $impuestoPorProducto,
      precioFinalVenta: $precioFinalVenta,
      cantidadExistencias: $cantidadExistencias,
      familiaId: $familiaId,
      proveedorId: $proveedorId
    ) {
      id
      nombre
      codigoBarras
      cantidadExistencias
      precioCostoSinImpuesto
      impuestoPorProducto
      precioFinalVenta
      familia {
        id
        nombre
      }
      proveedor {
        id
        nombre
      }
    }
  }
`;

export const ACTUALIZAR_INVENTARIO = gql`
  mutation ActualizarInventario(
    $id: ID!,
    $nombre: String,
    $codigoBarras: String,
    $precioCostoSinImpuesto: Float,
    $impuestoPorProducto: Float,
    $precioFinalVenta: Float,
    $cantidadExistencias: Int,
    $familiaId: ID,
    $proveedorId: ID
  ) {
    actualizarInventario(
      id: $id,
      nombre: $nombre,
      codigoBarras: $codigoBarras,
      precioCostoSinImpuesto: $precioCostoSinImpuesto,
      impuestoPorProducto: $impuestoPorProducto,
      precioFinalVenta: $precioFinalVenta,
      cantidadExistencias: $cantidadExistencias,
      familiaId: $familiaId,
      proveedorId: $proveedorId
    ) {
      id
      nombre
      codigoBarras
      cantidadExistencias
      precioFinalVenta
      familia {
        id
        nombre
      }
      proveedor {
        id
        nombre
      }
    }
  }
`;

/* ➌  ELIMINAR —sin cambios */
export const ELIMINAR_INVENTARIO = gql`
  mutation EliminarInventario($id: ID!) {
    eliminarInventario(id: $id)
  }
`;



export const GENERAR_INVENTARIO_PDF = gql`
  mutation InventarioPDF(
    $familiaId: Int
    $proveedorId: Int
    $stockMenorQue: Int
    $stockMayorQue: Int
  ) {
    generarInventarioPDF(
      familiaId: $familiaId
      proveedorId: $proveedorId
      stockMenorQue: $stockMenorQue
      stockMayorQue: $stockMayorQue
    )
  }
`;


export const CARGAR_INVENTARIO_MASIVO = gql`
  mutation CargarInventarioMasivo($productos: [InventarioInput!]!) {
    cargarInventarioMasivo(productos: $productos) {
      id
      nombre
      codigoBarras
      precioCostoSinImpuesto
      impuestoPorProducto
      precioFinalVenta
      cantidadExistencias
      familia {
        id
        nombre
      }
      proveedor {
        id
        nombre
      }
    }
  }
`;