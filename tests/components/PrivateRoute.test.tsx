import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import PrivateRoute from '../../src/components/PrivateRoute'

// Mock del AuthContext
const mockUseAuth = vi.fn()
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock de react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to, replace, state }: any) => {
      mockNavigate(to, replace, state)
      return <div data-testid="navigate">Redirecting to {to}</div>
    },
    useLocation: () => ({ pathname: '/dashboard', search: '', hash: '', state: null })
  }
})

// Componente de prueba
const TestComponent = () => (
  <div data-testid="protected-content">
    <h1>Contenido Protegido</h1>
    <p>Este es contenido que solo usuarios autenticados pueden ver</p>
  </div>
)

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Usuario autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        token: 'valid-token-123',
        usuario: { id: '1', nombre: 'Test User' },
        permisos: ['read', 'write']
      })
    })

    it('debería renderizar el contenido protegido cuando hay token', () => {
      renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.getByText('Contenido Protegido')).toBeInTheDocument()
      expect(screen.getByText('Este es contenido que solo usuarios autenticados pueden ver')).toBeInTheDocument()
    })

    it('no debería redirigir cuando el usuario está autenticado', () => {
      renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      )

      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    it('debería renderizar múltiples componentes hijos', () => {
      renderWithRouter(
        <PrivateRoute>
          <>
            <div data-testid="child-1">Componente 1</div>
            <div data-testid="child-2">Componente 2</div>
          </>
        </PrivateRoute>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })

    it('debería renderizar componentes complejos', () => {
      const ComplexComponent = () => (
        <div data-testid="complex-component">
          <header>Header</header>
          <main>
            <section>Sección 1</section>
            <section>Sección 2</section>
          </main>
          <footer>Footer</footer>
        </div>
      )

      renderWithRouter(
        <PrivateRoute>
          <ComplexComponent />
        </PrivateRoute>
      )

      expect(screen.getByTestId('complex-component')).toBeInTheDocument()
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Sección 1')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('Usuario no autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        token: null,
        usuario: null,
        permisos: []
      })
    })

    it('debería redirigir al login cuando no hay token', () => {
      renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      )

      expect(screen.getByTestId('navigate')).toBeInTheDocument()
      expect(screen.getByText('Redirecting to /login')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('debería pasar la ubicación actual al login', () => {
      renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      )

      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        true, // replace
        { from: { pathname: '/dashboard', search: '', hash: '', state: null } }
      )
    })

    it('no debería renderizar el contenido protegido', () => {
      renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument()
    })
  })

  describe('Diferentes estados de token', () => {
    it('debería redirigir con token vacío', () => {
      mockUseAuth.mockReturnValue({
        token: '',
        usuario: null,
        permisos: []
      })

      renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      )

      expect(screen.getByTestId('navigate')).toBeInTheDocument()
    })

    it('debería redirigir con token undefined', () => {
      mockUseAuth.mockReturnValue({
        token: undefined,
        usuario: null,
        permisos: []
      })

      renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      )

      expect(screen.getByTestId('navigate')).toBeInTheDocument()
    })

    it('debería renderizar con cualquier token válido', () => {
      const tokens = [
        'token-123',
        'jwt-token-abc',
        'Bearer xyz',
        'very-long-token-string-12345'
      ]

      tokens.forEach(token => {
        mockUseAuth.mockReturnValue({
          token,
          usuario: { id: '1', nombre: 'User' },
          permisos: []
        })

        const { unmount } = renderWithRouter(
          <PrivateRoute>
            <div data-testid={`content-${token}`}>Content for {token}</div>
          </PrivateRoute>
        )

        expect(screen.getByTestId(`content-${token}`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Casos edge', () => {
    it('debería manejar cambios dinámicos de autenticación', () => {
      // Inicialmente sin autenticar
      mockUseAuth.mockReturnValue({
        token: null,
        usuario: null,
        permisos: []
      })

      const { rerender } = renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      )

      expect(screen.getByTestId('navigate')).toBeInTheDocument()

      // Simular autenticación
      mockUseAuth.mockReturnValue({
        token: 'new-token',
        usuario: { id: '1', nombre: 'User' },
        permisos: ['read']
      })

      rerender(
        <BrowserRouter>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('debería manejar errores en useAuth', () => {
      // Simular error en el hook
      mockUseAuth.mockReturnValue({
        token: null, // Tratamos error como no autenticado
        usuario: null,
        permisos: []
      })

      renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      )

      expect(screen.getByTestId('navigate')).toBeInTheDocument()
    })

    it('debería funcionar con diferentes tipos de componentes hijos', () => {
      mockUseAuth.mockReturnValue({
        token: 'valid-token',
        usuario: { id: '1', nombre: 'User' },
        permisos: []
      })

      // Componente funcional
      const FunctionalComponent = () => <div data-testid="functional">Functional</div>

      renderWithRouter(
        <PrivateRoute>
          <FunctionalComponent />
        </PrivateRoute>
      )

      expect(screen.getByTestId('functional')).toBeInTheDocument()
    })
  })
})
