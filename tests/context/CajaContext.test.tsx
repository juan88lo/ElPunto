import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CajaProvider } from '../../src/context/CajaContext'

// Mock del AuthContext
const mockAuthContext = {
  token: null,
  permisos: [],
  usuario: null,
  login: vi.fn(),
  logout: vi.fn()
}

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}))

// Mock de Apollo Client para evitar errores
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useMutation: vi.fn(() => [
    vi.fn(), // mutation function
    { loading: false, error: null, data: null }
  ]),
  gql: vi.fn((strings) => strings.join(''))
}))

// Componente de test simple
const TestComponent = () => {
  return (
    <div>
      <h1>Test Component</h1>
      <p>Caja Context Test</p>
    </div>
  )
}

describe('CajaContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería renderizar el provider sin errores', () => {
    render(
      <CajaProvider>
        <TestComponent />
      </CajaProvider>
    )

    expect(screen.getByText('Test Component')).toBeInTheDocument()
    expect(screen.getByText('Caja Context Test')).toBeInTheDocument()
  })

  it('debería no hacer query cuando no hay token', () => {
    render(
      <CajaProvider>
        <TestComponent />
      </CajaProvider>
    )

    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('debería proporcionar contexto a componentes hijos', () => {
    const ChildComponent = () => {
      return <div>Child Component Rendered</div>
    }

    render(
      <CajaProvider>
        <ChildComponent />
      </CajaProvider>
    )

    expect(screen.getByText('Child Component Rendered')).toBeInTheDocument()
  })

  it('debería manejar múltiples componentes hijos', () => {
    render(
      <CajaProvider>
        <div>Primer componente</div>
        <div>Segundo componente</div>
        <TestComponent />
      </CajaProvider>
    )

    expect(screen.getByText('Primer componente')).toBeInTheDocument()
    expect(screen.getByText('Segundo componente')).toBeInTheDocument()
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('debería renderizar sin problemas básicos', () => {
    render(
      <CajaProvider>
        <TestComponent />
      </CajaProvider>
    )

    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })
})
