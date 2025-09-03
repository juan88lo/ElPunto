import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { PagosProvider, usePagos } from '../../src/context/PagosContext'

// Componente de prueba para acceder al contexto
const TestComponent = () => {
  const { 
    pagosProveedores, 
    pagosPlanilla, 
    resumenProv, 
    resumenPlanilla,
    agregarPagoProveedor,
    agregarPagoPlanilla,
    setResumenProv,
    setResumenPlanilla
  } = usePagos()
  
  const handleAgregarProveedor = () => {
    agregarPagoProveedor({
      id: 1,
      monto: 1000,
      proveedorId: 1,
      fecha: '2024-01-01'
    })
  }

  const handleAgregarPlanilla = () => {
    agregarPagoPlanilla({
      id: 1,
      monto: 2000,
      empleadoId: 1,
      fecha: '2024-01-01'
    })
  }

  const handleSetResumenProv = () => {
    setResumenProv({
      pendientes: 5,
      totalPendiente: 10000
    })
  }

  const handleSetResumenPlanilla = () => {
    setResumenPlanilla({
      periodo: '2024-01',
      totalEmpleados: 10,
      totalNeto: 50000,
      pendiente: 5000
    })
  }
  
  return (
    <div>
      <div data-testid="pagos-proveedores-count">{pagosProveedores.length}</div>
      <div data-testid="pagos-planilla-count">{pagosPlanilla.length}</div>
      <div data-testid="resumen-prov">{resumenProv ? `${resumenProv.pendientes} - ${resumenProv.totalPendiente}` : 'null'}</div>
      <div data-testid="resumen-planilla">{resumenPlanilla ? `${resumenPlanilla.periodo} - ${resumenPlanilla.totalEmpleados}` : 'null'}</div>
      
      <button onClick={handleAgregarProveedor}>Agregar Pago Proveedor</button>
      <button onClick={handleAgregarPlanilla}>Agregar Pago Planilla</button>
      <button onClick={handleSetResumenProv}>Set Resumen Proveedor</button>
      <button onClick={handleSetResumenPlanilla}>Set Resumen Planilla</button>
    </div>
  )
}

// Componente para probar el error del hook sin provider
const ComponentWithoutProvider = () => {
  usePagos()
  return <div>Test</div>
}

describe('PagosContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería renderizar el provider sin errores', () => {
    render(
      <PagosProvider>
        <div>Test</div>
      </PagosProvider>
    )
    
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('debería inicializar con valores por defecto', () => {
    render(
      <PagosProvider>
        <TestComponent />
      </PagosProvider>
    )
    
    expect(screen.getByTestId('pagos-proveedores-count')).toHaveTextContent('0')
    expect(screen.getByTestId('pagos-planilla-count')).toHaveTextContent('0')
    expect(screen.getByTestId('resumen-prov')).toHaveTextContent('null')
    expect(screen.getByTestId('resumen-planilla')).toHaveTextContent('null')
  })

  it('debería agregar pagos de proveedores correctamente', () => {
    render(
      <PagosProvider>
        <TestComponent />
      </PagosProvider>
    )
    
    expect(screen.getByTestId('pagos-proveedores-count')).toHaveTextContent('0')
    
    act(() => {
      screen.getByText('Agregar Pago Proveedor').click()
    })
    
    expect(screen.getByTestId('pagos-proveedores-count')).toHaveTextContent('1')
  })

  it('debería agregar pagos de planilla correctamente', () => {
    render(
      <PagosProvider>
        <TestComponent />
      </PagosProvider>
    )
    
    expect(screen.getByTestId('pagos-planilla-count')).toHaveTextContent('0')
    
    act(() => {
      screen.getByText('Agregar Pago Planilla').click()
    })
    
    expect(screen.getByTestId('pagos-planilla-count')).toHaveTextContent('1')
  })

  it('debería establecer resumen de proveedores correctamente', () => {
    render(
      <PagosProvider>
        <TestComponent />
      </PagosProvider>
    )
    
    expect(screen.getByTestId('resumen-prov')).toHaveTextContent('null')
    
    act(() => {
      screen.getByText('Set Resumen Proveedor').click()
    })
    
    expect(screen.getByTestId('resumen-prov')).toHaveTextContent('5 - 10000')
  })

  it('debería establecer resumen de planilla correctamente', () => {
    render(
      <PagosProvider>
        <TestComponent />
      </PagosProvider>
    )
    
    expect(screen.getByTestId('resumen-planilla')).toHaveTextContent('null')
    
    act(() => {
      screen.getByText('Set Resumen Planilla').click()
    })
    
    expect(screen.getByTestId('resumen-planilla')).toHaveTextContent('2024-01 - 10')
  })

  it('debería manejar múltiples pagos', () => {
    render(
      <PagosProvider>
        <TestComponent />
      </PagosProvider>
    )
    
    // Agregar múltiples pagos de proveedores
    act(() => {
      screen.getByText('Agregar Pago Proveedor').click()
      screen.getByText('Agregar Pago Proveedor').click()
      screen.getByText('Agregar Pago Proveedor').click()
    })
    
    expect(screen.getByTestId('pagos-proveedores-count')).toHaveTextContent('3')
    
    // Agregar múltiples pagos de planilla
    act(() => {
      screen.getByText('Agregar Pago Planilla').click()
      screen.getByText('Agregar Pago Planilla').click()
    })
    
    expect(screen.getByTestId('pagos-planilla-count')).toHaveTextContent('2')
  })

  it('debería proporcionar contexto a múltiples componentes hijos', () => {
    render(
      <PagosProvider>
        <TestComponent />
        <div data-testid="otro-componente">Otro componente</div>
      </PagosProvider>
    )
    
    expect(screen.getByTestId('pagos-proveedores-count')).toBeInTheDocument()
    expect(screen.getByTestId('otro-componente')).toBeInTheDocument()
  })

  it('debería lanzar error si usePagos se usa sin PagosProvider', () => {
    // Suprimir console.error para este test
    const originalError = console.error
    console.error = vi.fn()

    expect(() => {
      render(<ComponentWithoutProvider />)
    }).toThrow('usePagos debe usarse dentro de un PagosProvider')

    console.error = originalError
  })
})
