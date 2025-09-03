import { describe, it, expect } from 'vitest'
import type { Familia, GetFamiliasData, CrearFamiliaInput } from '../../src/types/familia'

describe('Tipos de Familia', () => {
  describe('Interface Familia', () => {
    it('debería tener la estructura correcta', () => {
      const familia: Familia = {
        id: 1,
        nombre: 'Electrónicos',
        Observaciones: 'Productos electrónicos y gadgets',
        Estado: true
      }

      expect(familia).toHaveProperty('id')
      expect(familia).toHaveProperty('nombre')
      expect(familia).toHaveProperty('Observaciones')
      expect(familia).toHaveProperty('Estado')
      
      expect(typeof familia.id).toBe('number')
      expect(typeof familia.nombre).toBe('string')
      expect(typeof familia.Observaciones).toBe('string')
      expect(typeof familia.Estado).toBe('boolean')
    })

    it('debería permitir Observaciones opcionales', () => {
      const familia: Familia = {
        id: 2,
        nombre: 'Comestibles',
        Estado: true
      }

      expect(familia.Observaciones).toBeUndefined()
      expect(familia.id).toBe(2)
      expect(familia.nombre).toBe('Comestibles')
      expect(familia.Estado).toBe(true)
    })

    it('debería manejar diferentes estados', () => {
      const familiaActiva: Familia = {
        id: 1,
        nombre: 'Activa',
        Estado: true
      }

      const familiaInactiva: Familia = {
        id: 2,
        nombre: 'Inactiva',
        Estado: false
      }

      expect(familiaActiva.Estado).toBe(true)
      expect(familiaInactiva.Estado).toBe(false)
    })

    it('debería validar IDs como números positivos', () => {
      const familias: Familia[] = [
        { id: 1, nombre: 'Familia 1', Estado: true },
        { id: 100, nombre: 'Familia 100', Estado: false },
        { id: 999, nombre: 'Familia 999', Estado: true }
      ]

      familias.forEach(familia => {
        expect(familia.id).toBeGreaterThan(0)
        expect(Number.isInteger(familia.id)).toBe(true)
      })
    })

    it('debería manejar nombres con caracteres especiales', () => {
      const familias: Familia[] = [
        {
          id: 1,
          nombre: 'Bebidas & Refrescos',
          Observaciones: 'Incluye gaseosas, jugos y agua',
          Estado: true
        },
        {
          id: 2,
          nombre: 'Panadería/Repostería',
          Observaciones: 'Pan fresco y productos horneados',
          Estado: true
        },
        {
          id: 3,
          nombre: 'Limpieza (Hogar)',
          Observaciones: 'Productos para limpieza del hogar',
          Estado: false
        }
      ]

      familias.forEach(familia => {
        expect(typeof familia.nombre).toBe('string')
        expect(familia.nombre.length).toBeGreaterThan(0)
        expect(familia.nombre.trim()).toBe(familia.nombre)
      })
    })

    it('debería permitir observaciones extensas', () => {
      const familia: Familia = {
        id: 1,
        nombre: 'Tecnología',
        Observaciones: 'Esta familia incluye todos los productos relacionados con tecnología moderna como smartphones, tablets, laptops, accesorios de computación, cables, cargadores, auriculares, speakers y otros dispositivos electrónicos de última generación.',
        Estado: true
      }

      expect(familia.Observaciones!.length).toBeGreaterThan(100)
      expect(typeof familia.Observaciones).toBe('string')
    })
  })

  describe('Interface GetFamiliasData', () => {
    it('debería contener un array de familias', () => {
      const data: GetFamiliasData = {
        familias: [
          {
            id: 1,
            nombre: 'Electrónicos',
            Estado: true
          },
          {
            id: 2,
            nombre: 'Ropa',
            Observaciones: 'Vestimenta y accesorios',
            Estado: false
          }
        ]
      }

      expect(Array.isArray(data.familias)).toBe(true)
      expect(data.familias).toHaveLength(2)
      expect(data.familias[0].id).toBe(1)
      expect(data.familias[1].id).toBe(2)
    })

    it('debería permitir array vacío', () => {
      const data: GetFamiliasData = {
        familias: []
      }

      expect(Array.isArray(data.familias)).toBe(true)
      expect(data.familias).toHaveLength(0)
    })

    it('debería manejar múltiples familias con diferentes configuraciones', () => {
      const data: GetFamiliasData = {
        familias: [
          { id: 1, nombre: 'Sin observaciones', Estado: true },
          { id: 2, nombre: 'Con observaciones', Observaciones: 'Nota', Estado: false },
          { id: 3, nombre: 'Activa con obs', Observaciones: 'Descripción larga', Estado: true }
        ]
      }

      const sinObs = data.familias.find(f => f.id === 1)
      const conObs = data.familias.find(f => f.id === 2)
      const activaConObs = data.familias.find(f => f.id === 3)

      expect(sinObs?.Observaciones).toBeUndefined()
      expect(conObs?.Observaciones).toBe('Nota')
      expect(activaConObs?.Estado).toBe(true)
    })
  })

  describe('Interface CrearFamiliaInput', () => {
    it('debería requerir solo el nombre', () => {
      const input: CrearFamiliaInput = {
        nombre: 'Nueva Familia'
      }

      expect(input.nombre).toBe('Nueva Familia')
      expect(input.Observaciones).toBeUndefined()
      expect(input.Estado).toBeUndefined()
    })

    it('debería permitir observaciones opcionales', () => {
      const input: CrearFamiliaInput = {
        nombre: 'Familia con observaciones',
        Observaciones: 'Esta es una observación opcional'
      }

      expect(input.nombre).toBe('Familia con observaciones')
      expect(input.Observaciones).toBe('Esta es una observación opcional')
      expect(input.Estado).toBeUndefined()
    })

    it('debería permitir estado opcional', () => {
      const inputActivo: CrearFamiliaInput = {
        nombre: 'Familia Activa',
        Estado: true
      }

      const inputInactivo: CrearFamiliaInput = {
        nombre: 'Familia Inactiva',
        Estado: false
      }

      expect(inputActivo.Estado).toBe(true)
      expect(inputInactivo.Estado).toBe(false)
    })

    it('debería permitir todos los campos opcionales', () => {
      const input: CrearFamiliaInput = {
        nombre: 'Familia Completa',
        Observaciones: 'Observaciones detalladas',
        Estado: true
      }

      expect(input.nombre).toBe('Familia Completa')
      expect(input.Observaciones).toBe('Observaciones detalladas')
      expect(input.Estado).toBe(true)
    })

    it('debería validar nombres mínimos', () => {
      const inputs: CrearFamiliaInput[] = [
        { nombre: 'A' },
        { nombre: 'AB' },
        { nombre: 'ABC' }
      ]

      inputs.forEach(input => {
        expect(typeof input.nombre).toBe('string')
        expect(input.nombre.length).toBeGreaterThan(0)
      })
    })

    it('debería manejar casos de uso reales', () => {
      const casos: CrearFamiliaInput[] = [
        {
          nombre: 'Bebidas Alcohólicas',
          Observaciones: 'Requiere verificación de edad',
          Estado: true
        },
        {
          nombre: 'Productos Orgánicos',
          Observaciones: 'Certificados como orgánicos',
          Estado: true
        },
        {
          nombre: 'Temporada Navideña',
          Observaciones: 'Productos estacionales',
          Estado: false
        },
        {
          nombre: 'Importados'
        }
      ]

      casos.forEach(caso => {
        expect(typeof caso.nombre).toBe('string')
        expect(caso.nombre.trim().length).toBeGreaterThan(0)
        
        if (caso.Observaciones) {
          expect(typeof caso.Observaciones).toBe('string')
        }
        
        if (caso.Estado !== undefined) {
          expect(typeof caso.Estado).toBe('boolean')
        }
      })
    })
  })

  describe('Interoperabilidad entre interfaces', () => {
    it('debería convertir CrearFamiliaInput a Familia con ID', () => {
      const input: CrearFamiliaInput = {
        nombre: 'Nueva Familia',
        Observaciones: 'Observación de prueba',
        Estado: true
      }

      // Simular creación con ID generado
      const familia: Familia = {
        id: 123, // ID generado por el backend
        nombre: input.nombre,
        Observaciones: input.Observaciones,
        Estado: input.Estado ?? true // Asegurar que Estado no sea undefined
      }

      expect(familia.id).toBe(123)
      expect(familia.nombre).toBe(input.nombre)
      expect(familia.Observaciones).toBe(input.Observaciones)
      expect(familia.Estado).toBe(input.Estado)
    })

    it('debería crear GetFamiliasData desde array de Familia', () => {
      const familias: Familia[] = [
        { id: 1, nombre: 'Familia 1', Estado: true },
        { id: 2, nombre: 'Familia 2', Estado: false }
      ]

      const data: GetFamiliasData = { familias }

      expect(data.familias).toEqual(familias)
      expect(data.familias).toHaveLength(2)
    })

    it('debería manejar valores por defecto', () => {
      const inputMinimo: CrearFamiliaInput = {
        nombre: 'Mínimo'
      }

      // Simular valores por defecto del backend
      const familiaConDefaults: Familia = {
        id: 1,
        nombre: inputMinimo.nombre,
        Observaciones: inputMinimo.Observaciones || undefined,
        Estado: inputMinimo.Estado ?? true // Default true
      }

      expect(familiaConDefaults.Estado).toBe(true)
      expect(familiaConDefaults.Observaciones).toBeUndefined()
    })
  })
})
