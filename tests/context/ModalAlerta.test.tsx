import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalAlerta from '../../src/context/ModalAlerta';

describe('ModalAlerta', () => {
  const defaultProps = {
    visible: true,
    mensaje: 'Test message',
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el modal cuando visible es true', () => {
    render(<ModalAlerta {...defaultProps} />);

    expect(screen.getByText('Atención')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('no debería renderizar el modal cuando visible es false', () => {
    render(<ModalAlerta {...defaultProps} visible={false} />);

    expect(screen.queryByText('Atención')).not.toBeInTheDocument();
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('debería llamar onClose cuando se hace click en el botón Cerrar', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(<ModalAlerta {...defaultProps} onClose={onCloseMock} />);

    const closeButton = screen.getByRole('button', { name: 'Cerrar' });
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debería mostrar el mensaje correcto', () => {
    const customMessage = 'Este es un mensaje personalizado de alerta';
    
    render(<ModalAlerta {...defaultProps} mensaje={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('debería tener la estructura correcta del diálogo', () => {
    render(<ModalAlerta {...defaultProps} />);

    // Verificar que tiene los elementos básicos de un diálogo MUI
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Verificar el título
    expect(screen.getByText('Atención')).toBeInTheDocument();
    
    // Verificar que el botón existe (autofocus is handled by MUI internally)
    const closeButton = screen.getByRole('button', { name: 'Cerrar' });
    expect(closeButton).toBeInTheDocument();
  });

  it('debería manejar mensajes largos', () => {
    const longMessage = 'Este es un mensaje muy largo '.repeat(10);
    
    render(<ModalAlerta {...defaultProps} mensaje={longMessage} />);

    // Use a partial text match since the message might be wrapped
    expect(screen.getByText(/Este es un mensaje muy largo/)).toBeInTheDocument();
  });

  it('debería manejar mensajes vacíos', () => {
    render(<ModalAlerta {...defaultProps} mensaje="" />);

    // El componente debería renderizar sin problemas
    expect(screen.getByText('Atención')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });
});
