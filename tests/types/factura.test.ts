import { describe, it, expect } from 'vitest'
import type { Factura, Producto } from '../../src/types/factura'

describe('Tipos de Factura', () => {
  describe('Producto', () => {
    it('debería tener la estructura correcta', () => {
      const producto: Producto = {
        nombre: 'Producto Test',
        precio: 100.50,
      }

      expect(producto).toHaveProperty('nombre')
      expect(producto).toHaveProperty('precio')
      expect(typeof producto.nombre).toBe('string')
      expect(typeof producto.precio).toBe('number')
    })

    it('debería aceptar nombres de productos válidos', () => {
      const productos: Producto[] = [
        { nombre: 'Coca Cola', precio: 2.50 },
        { nombre: 'Pan', precio: 1.00 },
        { nombre: 'Leche 1L', precio: 3.75 },
        { nombre: '', precio: 0 }, // nombre vacío válido
      ]

      productos.forEach(producto => {
        expect(typeof producto.nombre).toBe('string')
        expect(typeof producto.precio).toBe('number')
        expect(producto.precio).toBeGreaterThanOrEqual(0)
      })
    })

    it('debería manejar precios decimales correctamente', () => {
      const productosConDecimales: Producto[] = [
        { nombre: 'Producto 1', precio: 10.99 },
        { nombre: 'Producto 2', precio: 0.01 },
        { nombre: 'Producto 3', precio: 999.99 },
      ]

      productosConDecimales.forEach(producto => {
        expect(Number.isFinite(producto.precio)).toBe(true)
        expect(producto.precio).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Factura', () => {
    it('debería tener la estructura correcta', () => {
      const factura: Factura = {
        negocio: 'Mi Negocio',
        fecha: '2024-01-01',
        productos: [
          { nombre: 'Producto 1', precio: 10.00 },
          { nombre: 'Producto 2', precio: 15.50 },
        ],
        total: 25.50,
      }

      expect(factura).toHaveProperty('negocio')
      expect(factura).toHaveProperty('fecha')
      expect(factura).toHaveProperty('productos')
      expect(factura).toHaveProperty('total')
      
      expect(typeof factura.negocio).toBe('string')
      expect(typeof factura.fecha).toBe('string')
      expect(Array.isArray(factura.productos)).toBe(true)
      expect(typeof factura.total).toBe('number')
    })

    it('debería permitir facturas vacías', () => {
      const facturaVacia: Factura = {
        negocio: 'Mi Negocio',
        fecha: '2024-01-01',
        productos: [],
        total: 0,
      }

      expect(facturaVacia.productos).toHaveLength(0)
      expect(facturaVacia.total).toBe(0)
    })

    it('debería calcular el total correctamente (validación lógica)', () => {
      const productos: Producto[] = [
        { nombre: 'Producto 1', precio: 10.25 },
        { nombre: 'Producto 2', precio: 15.75 },
        { nombre: 'Producto 3', precio: 5.00 },
      ]

      const totalCalculado = productos.reduce((sum, producto) => sum + producto.precio, 0)
      
      const factura: Factura = {
        negocio: 'Test Store',
        fecha: '2024-01-01',
        productos,
        total: totalCalculado,
      }

      expect(factura.total).toBe(31.00)
      expect(factura.productos).toHaveLength(3)
    })

    it('debería manejar diferentes formatos de fecha', () => {
      const formatosFecha = [
        '2024-01-01',
        '01/01/2024',
        '2024-12-31T23:59:59Z',
        'January 1, 2024',
      ]

      formatosFecha.forEach(fecha => {
        const factura: Factura = {
          negocio: 'Test',
          fecha,
          productos: [],
          total: 0,
        }

        expect(typeof factura.fecha).toBe('string')
        expect(factura.fecha).toBe(fecha)
      })
    })

    it('debería permitir nombres de negocio diversos', () => {
      const nombresNegocio = [
        'El Punto',
        'Supermercado Central',
        'Tienda 24/7',
        'Mini Market "La Esquina"',
        'Store & Co.',
      ]

      nombresNegocio.forEach(negocio => {
        const factura: Factura = {
          negocio,
          fecha: '2024-01-01',
          productos: [],
          total: 0,
        }

        expect(factura.negocio).toBe(negocio)
        expect(factura.negocio.length).toBeGreaterThan(0)
      })
    })

    it('debería mantener consistencia en la estructura de productos', () => {
      const productos: Producto[] = [
        { nombre: 'Item A', precio: 1.00 },
        { nombre: 'Item B', precio: 2.50 },
        { nombre: 'Item C', precio: 3.75 },
      ]

      const factura: Factura = {
        negocio: 'Test Store',
        fecha: '2024-01-01',
        productos,
        total: 7.25,
      }

      // Verificar que todos los productos mantienen la estructura
      factura.productos.forEach(producto => {
        expect(producto).toHaveProperty('nombre')
        expect(producto).toHaveProperty('precio')
        expect(typeof producto.nombre).toBe('string')
        expect(typeof producto.precio).toBe('number')
      })
    })
  })

  describe('Validaciones de Negocio', () => {
    it('debería crear una factura válida completa', () => {
      const facturaCompleta: Factura = {
        negocio: 'El Punto - Supermercado',
        fecha: new Date().toISOString(),
        productos: [
          { nombre: 'Arroz 1kg', precio: 2.50 },
          { nombre: 'Aceite 1L', precio: 4.25 },
          { nombre: 'Pan integral', precio: 1.75 },
        ],
        total: 8.50,
      }

      // Validaciones de negocio
      expect(facturaCompleta.negocio.trim().length).toBeGreaterThan(0)
      expect(facturaCompleta.productos.length).toBeGreaterThan(0)
      expect(facturaCompleta.total).toBeGreaterThan(0)
      
      // Verificar que el total coincide con la suma
      const totalCalculado = facturaCompleta.productos.reduce(
        (sum, producto) => sum + producto.precio, 
        0
      )
      expect(facturaCompleta.total).toBe(totalCalculado)
    })
  })
})
