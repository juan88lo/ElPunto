import { describe, it, expect } from 'vitest'
import { print } from 'graphql'
import { GET_INVENTARIOS, REPORTE_INVENTARIO } from '../../src/graphql/queries/inventario'

describe('Inventario GraphQL Queries', () => {
  describe('GET_INVENTARIOS', () => {
    it('debería tener la estructura correcta de query', () => {
      const queryString = print(GET_INVENTARIOS)
      
      expect(queryString).toContain('query GetInventarios')
      expect(queryString).toContain('$search: String')
      expect(queryString).toContain('inventarios(search: $search)')
    })

    it('debería incluir todos los campos necesarios', () => {
      const queryString = print(GET_INVENTARIOS)
      
      // Campos principales
      expect(queryString).toContain('id')
      expect(queryString).toContain('nombre')
      expect(queryString).toContain('codigoBarras')
      expect(queryString).toContain('cantidadExistencias')
      expect(queryString).toContain('precioCostoSinImpuesto')
      expect(queryString).toContain('impuestoPorProducto')
      expect(queryString).toContain('precioFinalVenta')
      
      // Campos relacionados
      expect(queryString).toContain('familia')
      expect(queryString).toContain('proveedor')
    })

    it('debería aceptar parámetro de búsqueda opcional', () => {
      const queryString = print(GET_INVENTARIOS)
      
      expect(queryString).toMatch(/\$search:\s*String[^!]/)
    })
  })

  describe('REPORTE_INVENTARIO', () => {
    it('debería tener la estructura correcta de query', () => {
      const queryString = print(REPORTE_INVENTARIO)
      
      expect(queryString).toContain('query ReporteInventario')
      expect(queryString).toContain('reporteInventario')
    })

    it('debería incluir todos los parámetros de filtro', () => {
      const queryString = print(REPORTE_INVENTARIO)
      
      expect(queryString).toContain('$familiaId: Int')
      expect(queryString).toContain('$proveedorId: Int')
      expect(queryString).toContain('$stockMenorQue: Int')
      expect(queryString).toContain('$stockMayorQue: Int')
    })

    it('debería pasar los parámetros correctamente a la función', () => {
      const queryString = print(REPORTE_INVENTARIO)
      
      expect(queryString).toContain('familiaId: $familiaId')
      expect(queryString).toContain('proveedorId: $proveedorId')
      expect(queryString).toContain('stockMenorQue: $stockMenorQue')
      expect(queryString).toContain('stockMayorQue: $stockMayorQue')
    })

    it('debería incluir campos básicos en la respuesta', () => {
      const queryString = print(REPORTE_INVENTARIO)
      
      expect(queryString).toContain('id')
      expect(queryString).toContain('nombre')
      expect(queryString).toContain('codigoBarras')
    })

    it('todos los parámetros deberían ser opcionales', () => {
      const queryString = print(REPORTE_INVENTARIO)
      
      // Verificar que ningún parámetro tiene ! (required)
      expect(queryString).not.toMatch(/\$familiaId:\s*Int!/)
      expect(queryString).not.toMatch(/\$proveedorId:\s*Int!/)
      expect(queryString).not.toMatch(/\$stockMenorQue:\s*Int!/)
      expect(queryString).not.toMatch(/\$stockMayorQue:\s*Int!/)
    })
  })

  describe('Query Validation', () => {
    it('todas las queries deberían ser documentos válidos de GraphQL', () => {
      expect(() => print(GET_INVENTARIOS)).not.toThrow()
      expect(() => print(REPORTE_INVENTARIO)).not.toThrow()
    })

    it('las queries deberían tener nombres únicos', () => {
      const getInventariosString = print(GET_INVENTARIOS)
      const reporteInventarioString = print(REPORTE_INVENTARIO)
      
      expect(getInventariosString).toContain('GetInventarios')
      expect(reporteInventarioString).toContain('ReporteInventario')
      expect(getInventariosString).not.toContain('ReporteInventario')
      expect(reporteInventarioString).not.toContain('GetInventarios')
    })
  })
})
