import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils/test-utils'
import { CajaDialog } from '../../src/components/CajaDialog'

describe('CajaDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería renderizar correctamente cuando está abierto', () => {
    render(<CajaDialog {...defaultProps} />)
    
    expect(screen.getByText('Confirmar cierre de caja')).toBeInTheDocument()
    expect(screen.getByLabelText('Efectivo real contado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
  })

  it('no debería renderizar cuando está cerrado', () => {
    render(<CajaDialog {...defaultProps} open={false} />)
    
    expect(screen.queryByText('Confirmar cierre de caja')).not.toBeInTheDocument()
  })

  it('debería llamar onClose cuando se hace clic en Cancelar', async () => {
    const user = userEvent.setup()
    render(<CajaDialog {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('debería actualizar el valor del input cuando el usuario escribe', async () => {
    const user = userEvent.setup()
    render(<CajaDialog {...defaultProps} />)
    
    const input = screen.getByLabelText('Efectivo real contado')
    await user.type(input, '100.50')
    
    expect(input).toHaveValue(100.5)
  })

  it('debería llamar onConfirm con el valor correcto cuando se ingresa un monto válido', async () => {
    const user = userEvent.setup()
    render(<CajaDialog {...defaultProps} />)
    
    const input = screen.getByLabelText('Efectivo real contado')
    const confirmButton = screen.getByRole('button', { name: 'Confirmar' })
    
    await user.type(input, '250.75')
    await user.click(confirmButton)
    
    expect(mockOnConfirm).toHaveBeenCalledWith(250.75)
  })

  it('debería mostrar alert para valores inválidos (negativos)', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<CajaDialog {...defaultProps} />)
    
    const input = screen.getByLabelText('Efectivo real contado')
    const confirmButton = screen.getByRole('button', { name: 'Confirmar' })
    
    await user.type(input, '-50')
    await user.click(confirmButton)
    
    expect(alertSpy).toHaveBeenCalledWith('Monto inválido. Debe ser un número positivo menor a 10 millón.')
    expect(mockOnConfirm).not.toHaveBeenCalled()
    
    alertSpy.mockRestore()
  })

  it('debería mostrar alert para valores muy grandes', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<CajaDialog {...defaultProps} />)
    
    const input = screen.getByLabelText('Efectivo real contado')
    const confirmButton = screen.getByRole('button', { name: 'Confirmar' })
    
    await user.type(input, '1000000')
    await user.click(confirmButton)
    
    expect(alertSpy).toHaveBeenCalledWith('Monto inválido. Debe ser un número positivo menor a 10 millón.')
    expect(mockOnConfirm).not.toHaveBeenCalled()
    
    alertSpy.mockRestore()
  })

  it('debería limpiar el input al cerrar el diálogo', async () => {
    const user = userEvent.setup()
    render(<CajaDialog {...defaultProps} />)
    
    const input = screen.getByLabelText('Efectivo real contado')
    await user.type(input, '100')
    
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('debería limpiar el input después de confirmar', async () => {
    const user = userEvent.setup()
    render(<CajaDialog {...defaultProps} />)
    
    const input = screen.getByLabelText('Efectivo real contado')
    const confirmButton = screen.getByRole('button', { name: 'Confirmar' })
    
    await user.type(input, '100')
    await user.click(confirmButton)
    
    expect(mockOnConfirm).toHaveBeenCalledWith(100)
  })
})
