import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'
import { BrowserRouter } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import LoginPage from '../../src/pages/LoginPage'

// Mock del hook useAuth
const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Crear theme para el provider
const testTheme = createTheme()

// Wrapper con todos los providers necesarios
const LoginWrapper = ({ children, mocks = [] }: { children: React.ReactNode, mocks?: any[] }) => (
  <BrowserRouter>
    <ThemeProvider theme={testTheme}>
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    </ThemeProvider>
  </BrowserRouter>
)

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería renderizar correctamente todos los elementos', () => {
    render(
      <LoginWrapper>
        <LoginPage />
      </LoginWrapper>
    )

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /correo/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('debería mostrar el logo de la empresa', () => {
    render(
      <LoginWrapper>
        <LoginPage />
      </LoginWrapper>
    )

    const logo = screen.getByRole('img')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('alt', 'El Punto')
  })

  it('debería permitir escribir en los campos de entrada', async () => {
    const user = userEvent.setup()
    
    render(
      <LoginWrapper>
        <LoginPage />
      </LoginWrapper>
    )

    const emailInput = screen.getByRole('textbox', { name: /correo/i })
    const passwordInput = screen.getByLabelText(/contraseña/i)

    await user.type(emailInput, 'test@email.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('test@email.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('debería validar campos requeridos', async () => {
    const user = userEvent.setup()
    
    render(
      <LoginWrapper>
        <LoginPage />
      </LoginWrapper>
    )

    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    
    // Test que el formulario no se puede enviar sin campos requeridos
    await user.click(submitButton)

    // Verificar que los campos mantienen el estado required
    const emailInput = screen.getByRole('textbox', { name: /correo/i })
    const passwordInput = screen.getByLabelText(/contraseña/i)
    
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
    expect(emailInput).toHaveValue('')
    expect(passwordInput).toHaveValue('')
  })

  it('debería validar formato de email', async () => {
    const user = userEvent.setup()
    
    render(
      <LoginWrapper>
        <LoginPage />
      </LoginWrapper>
    )

    const emailInput = screen.getByRole('textbox', { name: /correo/i })
    const passwordInput = screen.getByLabelText(/contraseña/i)
    
    // Verificar que el campo de email tiene el tipo correcto
    expect(emailInput).toHaveAttribute('type', 'email')
    
    // Test input con formato válido
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('debería tener campos de entrada accesibles', () => {
    render(
      <LoginWrapper>
        <LoginPage />
      </LoginWrapper>
    )

    const emailInput = screen.getByRole('textbox', { name: /correo/i })
    const passwordInput = screen.getByLabelText(/contraseña/i)

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
  })

  it('debería mantener la estructura visual esperada', () => {
    render(
      <LoginWrapper>
        <LoginPage />
      </LoginWrapper>
    )

    // Verificar que los elementos estén presentes en la estructura esperada
    const paper = screen.getByRole('img').closest('div')
    expect(paper).toBeInTheDocument()
    
    const title = screen.getByText('Iniciar Sesión')
    expect(title).toBeInTheDocument()
  })
})
