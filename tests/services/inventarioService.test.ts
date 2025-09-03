import { describe, it, expect, vi } from 'vitest'
import { fetchInventario, createItem, updateItem, deleteItem } from '../../src/services/inventarioService'
import type { Inventario } from '../../src/types'

describe('InventarioService', () => {
  describe('fetchInventario', () => {
    it('debería retornar un array vacío inicialmente', async () => {
      const result = await fetchInventario()
      expect(result).toEqual([])
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('createItem', () => {
    it('debería crear un item con datos válidos', async () => {
      const itemData: Partial<Inventario> = {
        nombre: 'Producto Test',
        codigoBarras: '123456789',
        precioCostoSinImpuesto: 100,
        cantidadExistencias: 50,
      }

      const result = await createItem(itemData)

      expect(result).toMatchObject({
        nombre: 'Producto Test',
        codigoBarras: '123456789',
        precioCostoSinImpuesto: 100,
        cantidadExistencias: 50,
        impuestoPorProducto: 0,
        precioFinalVenta: 0,
      })
      expect(result.id).toBeDefined()
      expect(typeof result.id).toBe('number')
    })

    it('debería crear un item con valores por defecto cuando no se proporcionan datos', async () => {
      const result = await createItem({})

      expect(result).toMatchObject({
        nombre: '',
        codigoBarras: '',
        precioCostoSinImpuesto: 0,
        cantidadExistencias: 0,
        impuestoPorProducto: 0,
        precioFinalVenta: 0,
      })
      expect(result.id).toBeDefined()
      expect(result.familiaId).toBeDefined()
      expect(result.proveedorId).toBeDefined()
    })

    it('debería convertir strings a números para campos numéricos', async () => {
      const itemData = {
        nombre: 'Test',
        precioCostoSinImpuesto: '150.50' as any,
        cantidadExistencias: '25' as any,
      }

      const result = await createItem(itemData)

      expect(result.precioCostoSinImpuesto).toBe(150.5)
      expect(result.cantidadExistencias).toBe(25)
      expect(typeof result.precioCostoSinImpuesto).toBe('number')
      expect(typeof result.cantidadExistencias).toBe('number')
    })

    it('debería manejar valores numéricos inválidos', async () => {
      const itemData = {
        nombre: 'Test',
        precioCostoSinImpuesto: 'invalid' as any,
        cantidadExistencias: null as any,
      }

      const result = await createItem(itemData)

      expect(result.precioCostoSinImpuesto).toBe(0)
      expect(result.cantidadExistencias).toBe(0)
    })
  })

  describe('updateItem', () => {
    it('debería actualizar un item con nuevos datos', async () => {
      const id = 123
      const updateData: Partial<Inventario> = {
        nombre: 'Producto Actualizado',
        codigoBarras: '987654321',
        precioCostoSinImpuesto: 200,
        cantidadExistencias: 75,
      }

      const result = await updateItem(id, updateData)

      expect(result).toMatchObject({
        id: 123,
        nombre: 'Producto Actualizado',
        codigoBarras: '987654321',
        precioCostoSinImpuesto: 200,
        cantidadExistencias: 75,
      })
    })

    it('debería mantener el ID original', async () => {
      const id = 456
      const result = await updateItem(id, { nombre: 'Test' })

      expect(result.id).toBe(456)
    })

    it('debería usar valores por defecto cuando no se proporcionan datos', async () => {
      const id = 789
      const result = await updateItem(id, {})

      expect(result).toMatchObject({
        id: 789,
        nombre: 'Actualizado',
        codigoBarras: '000',
        precioCostoSinImpuesto: 0,
        cantidadExistencias: 0,
      })
    })

    it('debería convertir strings a números para campos numéricos', async () => {
      const id = 999
      const updateData = {
        precioCostoSinImpuesto: '300.75' as any,
        cantidadExistencias: '100' as any,
      }

      const result = await updateItem(id, updateData)

      expect(result.precioCostoSinImpuesto).toBe(300.75)
      expect(result.cantidadExistencias).toBe(100)
    })
  })

  describe('deleteItem', () => {
    it('debería ejecutar sin errores', async () => {
      await expect(deleteItem(123)).resolves.toBeUndefined()
    })

    it('debería manejar diferentes IDs', async () => {
      const ids = [1, 100, 999, 0, -1]
      
      for (const id of ids) {
        await expect(deleteItem(id)).resolves.toBeUndefined()
      }
    })
  })
})
