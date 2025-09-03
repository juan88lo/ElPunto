import { describe, it, expect } from 'vitest'
import type { Inventario } from '../../src/types/index'

describe('Tipos de Inventario', () => {
  describe('Interface Inventario', () => {
    it('debería tener la estructura correcta para un producto básico', () => {
      const producto: Inventario = {
        id: 1,
        nombre: 'Producto Test',
        codigoBarras: '123456789012',
        precioCostoSinImpuesto: 100.00,
        impuestoPorProducto: 19.00,
        precioFinalVenta: 119.00,
        cantidadExistencias: 50,
        familiaId: 1,
        proveedorId: 1
      }

      expect(producto).toHaveProperty('id')
      expect(producto).toHaveProperty('nombre')
      expect(producto).toHaveProperty('codigoBarras')
      expect(producto).toHaveProperty('precioCostoSinImpuesto')
      expect(producto).toHaveProperty('impuestoPorProducto')
      expect(producto).toHaveProperty('precioFinalVenta')
      expect(producto).toHaveProperty('cantidadExistencias')
      expect(producto).toHaveProperty('familiaId')
      expect(producto).toHaveProperty('proveedorId')
    })

    it('debería validar tipos de datos correctos', () => {
      const producto: Inventario = {
        id: 1,
        nombre: 'Test Product',
        codigoBarras: '987654321098',
        precioCostoSinImpuesto: 25.50,
        impuestoPorProducto: 4.85,
        precioFinalVenta: 30.35,
        cantidadExistencias: 100,
        familiaId: 2,
        proveedorId: 3
      }

      expect(typeof producto.id).toBe('number')
      expect(typeof producto.nombre).toBe('string')
      expect(typeof producto.codigoBarras).toBe('string')
      expect(typeof producto.precioCostoSinImpuesto).toBe('number')
      expect(typeof producto.impuestoPorProducto).toBe('number')
      expect(typeof producto.precioFinalVenta).toBe('number')
      expect(typeof producto.cantidadExistencias).toBe('number')
      expect(typeof producto.familiaId).toBe('number')
      expect(typeof producto.proveedorId).toBe('number')
    })

    it('debería permitir valores decimales en precios', () => {
      const producto: Inventario = {
        id: 1,
        nombre: 'Producto con decimales',
        codigoBarras: '111111111111',
        precioCostoSinImpuesto: 99.99,
        impuestoPorProducto: 18.998,
        precioFinalVenta: 118.988,
        cantidadExistencias: 25,
        familiaId: 1,
        proveedorId: 1
      }

      expect(producto.precioCostoSinImpuesto).toBe(99.99)
      expect(producto.impuestoPorProducto).toBe(18.998)
      expect(producto.precioFinalVenta).toBe(118.988)
      expect(Number.isFinite(producto.precioCostoSinImpuesto)).toBe(true)
      expect(Number.isFinite(producto.impuestoPorProducto)).toBe(true)
      expect(Number.isFinite(producto.precioFinalVenta)).toBe(true)
    })

    it('debería manejar productos con stock cero', () => {
      const producto: Inventario = {
        id: 999,
        nombre: 'Producto sin stock',
        codigoBarras: '000000000000',
        precioCostoSinImpuesto: 50.00,
        impuestoPorProducto: 9.50,
        precioFinalVenta: 59.50,
        cantidadExistencias: 0,
        familiaId: 5,
        proveedorId: 2
      }

      expect(producto.cantidadExistencias).toBe(0)
      expect(producto.cantidadExistencias).toBeGreaterThanOrEqual(0)
    })

    it('debería permitir productos sin impuesto', () => {
      const producto: Inventario = {
        id: 2,
        nombre: 'Producto sin impuesto',
        codigoBarras: '222222222222',
        precioCostoSinImpuesto: 15.00,
        impuestoPorProducto: 0,
        precioFinalVenta: 15.00,
        cantidadExistencias: 75,
        familiaId: 3,
        proveedorId: 4
      }

      expect(producto.impuestoPorProducto).toBe(0)
      expect(producto.precioCostoSinImpuesto).toBe(producto.precioFinalVenta)
    })

    it('debería manejar códigos de barras de diferentes longitudes', () => {
      const productos: Inventario[] = [
        {
          id: 1,
          nombre: 'Código corto',
          codigoBarras: '12345',
          precioCostoSinImpuesto: 10,
          impuestoPorProducto: 1.9,
          precioFinalVenta: 11.9,
          cantidadExistencias: 10,
          familiaId: 1,
          proveedorId: 1
        },
        {
          id: 2,
          nombre: 'Código estándar',
          codigoBarras: '123456789012',
          precioCostoSinImpuesto: 20,
          impuestoPorProducto: 3.8,
          precioFinalVenta: 23.8,
          cantidadExistencias: 20,
          familiaId: 1,
          proveedorId: 1
        },
        {
          id: 3,
          nombre: 'Código largo',
          codigoBarras: '12345678901234567890',
          precioCostoSinImpuesto: 30,
          impuestoPorProducto: 5.7,
          precioFinalVenta: 35.7,
          cantidadExistencias: 30,
          familiaId: 1,
          proveedorId: 1
        }
      ]

      productos.forEach(producto => {
        expect(typeof producto.codigoBarras).toBe('string')
        expect(producto.codigoBarras.length).toBeGreaterThan(0)
      })
    })

    it('debería calcular correctamente precios con diferentes impuestos', () => {
      const productosConImpuesto = [
        {
          id: 1,
          nombre: 'IVA 19%',
          codigoBarras: '111111111111',
          precioCostoSinImpuesto: 100,
          impuestoPorProducto: 19,
          precioFinalVenta: 119,
          cantidadExistencias: 10,
          familiaId: 1,
          proveedorId: 1
        },
        {
          id: 2,
          nombre: 'IVA 5%',
          codigoBarras: '222222222222',
          precioCostoSinImpuesto: 100,
          impuestoPorProducto: 5,
          precioFinalVenta: 105,
          cantidadExistencias: 10,
          familiaId: 1,
          proveedorId: 1
        },
        {
          id: 3,
          nombre: 'Sin IVA',
          codigoBarras: '333333333333',
          precioCostoSinImpuesto: 100,
          impuestoPorProducto: 0,
          precioFinalVenta: 100,
          cantidadExistencias: 10,
          familiaId: 1,
          proveedorId: 1
        }
      ]

      productosConImpuesto.forEach(producto => {
        const costoConImpuesto = producto.precioCostoSinImpuesto + producto.impuestoPorProducto
        expect(producto.precioFinalVenta).toBe(costoConImpuesto)
      })
    })

    it('debería validar IDs como números positivos', () => {
      const producto: Inventario = {
        id: 1,
        nombre: 'Test',
        codigoBarras: '123456789012',
        precioCostoSinImpuesto: 50,
        impuestoPorProducto: 9.5,
        precioFinalVenta: 59.5,
        cantidadExistencias: 25,
        familiaId: 5,
        proveedorId: 10
      }

      expect(producto.id).toBeGreaterThan(0)
      expect(producto.familiaId).toBeGreaterThan(0)
      expect(producto.proveedorId).toBeGreaterThan(0)
      expect(Number.isInteger(producto.id)).toBe(true)
      expect(Number.isInteger(producto.familiaId)).toBe(true)
      expect(Number.isInteger(producto.proveedorId)).toBe(true)
    })

    it('debería manejar nombres con caracteres especiales', () => {
      const productos: Inventario[] = [
        {
          id: 1,
          nombre: 'Café "Premium" - 100% Colombiano',
          codigoBarras: '123456789012',
          precioCostoSinImpuesto: 25.50,
          impuestoPorProducto: 4.85,
          precioFinalVenta: 30.35,
          cantidadExistencias: 50,
          familiaId: 1,
          proveedorId: 1
        },
        {
          id: 2,
          nombre: 'Azúcar & Sal (500g)',
          codigoBarras: '987654321098',
          precioCostoSinImpuesto: 15.00,
          impuestoPorProducto: 2.85,
          precioFinalVenta: 17.85,
          cantidadExistencias: 100,
          familiaId: 2,
          proveedorId: 2
        },
        {
          id: 3,
          nombre: 'Ñame @ $2.000/kg',
          codigoBarras: '555555555555',
          precioCostoSinImpuesto: 1.50,
          impuestoPorProducto: 0,
          precioFinalVenta: 1.50,
          cantidadExistencias: 200,
          familiaId: 3,
          proveedorId: 3
        }
      ]

      productos.forEach(producto => {
        expect(typeof producto.nombre).toBe('string')
        expect(producto.nombre.length).toBeGreaterThan(0)
        expect(producto.nombre.trim()).toBe(producto.nombre) // Sin espacios extra
      })
    })

    it('debería permitir crear arrays de inventario', () => {
      const inventario: Inventario[] = [
        {
          id: 1,
          nombre: 'Producto 1',
          codigoBarras: '111111111111',
          precioCostoSinImpuesto: 10,
          impuestoPorProducto: 1.9,
          precioFinalVenta: 11.9,
          cantidadExistencias: 50,
          familiaId: 1,
          proveedorId: 1
        },
        {
          id: 2,
          nombre: 'Producto 2',
          codigoBarras: '222222222222',
          precioCostoSinImpuesto: 20,
          impuestoPorProducto: 3.8,
          precioFinalVenta: 23.8,
          cantidadExistencias: 75,
          familiaId: 2,
          proveedorId: 2
        }
      ]

      expect(Array.isArray(inventario)).toBe(true)
      expect(inventario).toHaveLength(2)
      expect(inventario[0].id).toBe(1)
      expect(inventario[1].id).toBe(2)
    })
  })
})
