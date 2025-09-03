import { gql } from '@apollo/client';

export const GET_INVENTARIOS = gql`
  query GetInventarios($search: String) {
    inventarios(search: $search) {
      id nombre codigoBarras cantidadExistencias
      precioCostoSinImpuesto impuestoPorProducto precioFinalVenta
      familia { id nombre }
      proveedor { id nombre }
    }
  }
`;

// reporte de inventario
export const REPORTE_INVENTARIO = gql`
  query ReporteInventario(
    $familiaId: Int
    $proveedorId: Int
    $stockMenorQue: Int
    $stockMayorQue: Int
  ) {
    reporteInventario(
      familiaId:     $familiaId
      proveedorId:   $proveedorId
      stockMenorQue: $stockMenorQue
      stockMayorQue: $stockMayorQue
    ) {
      id
      nombre
      codigoBarras
      familia
      proveedor
      existencias
      costoUnitario
      costoTotal
      precioVenta
      margenUnitario
    }
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
  }`;