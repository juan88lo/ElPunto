import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SesionContext, useSesion } from '../../src/context/SesionContext';

// Componente helper para testing
const TestComponent = () => {
  const sesion = useSesion();
  
  return (
    <div>
      <div data-testid="usuario-id">{sesion.usuario.id}</div>
      <div data-testid="usuario-nombre">{sesion.usuario.nombre}</div>
      <div data-testid="caja-id">{sesion.caja?.id || 'no-caja'}</div>
      <div data-testid="caja-nombre">{sesion.caja?.nombre || 'no-caja-nombre'}</div>
    </div>
  );
};

describe('SesionContext', () => {
  it('debería proporcionar datos de sesión a componentes hijos', () => {
    const mockSesion = {
      usuario: { id: '123', nombre: 'Usuario Test' },
      caja: { id: 'caja-1', nombre: 'Caja Principal' }
    };

    render(
      <SesionContext.Provider value={mockSesion}>
        <TestComponent />
      </SesionContext.Provider>
    );

    expect(screen.getByTestId('usuario-id')).toHaveTextContent('123');
    expect(screen.getByTestId('usuario-nombre')).toHaveTextContent('Usuario Test');
    expect(screen.getByTestId('caja-id')).toHaveTextContent('caja-1');
    expect(screen.getByTestId('caja-nombre')).toHaveTextContent('Caja Principal');
  });

  it('debería manejar sesión sin caja', () => {
    const mockSesion = {
      usuario: { id: '456', nombre: 'Otro Usuario' }
    };

    render(
      <SesionContext.Provider value={mockSesion}>
        <TestComponent />
      </SesionContext.Provider>
    );

    expect(screen.getByTestId('usuario-id')).toHaveTextContent('456');
    expect(screen.getByTestId('usuario-nombre')).toHaveTextContent('Otro Usuario');
    expect(screen.getByTestId('caja-id')).toHaveTextContent('no-caja');
    expect(screen.getByTestId('caja-nombre')).toHaveTextContent('no-caja-nombre');
  });

  it('debería lanzar error cuando useSesion se usa fuera del provider', () => {
    // Suprimir console.error para este test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSesion debe usarse dentro de <SesionProvider>');

    console.error = originalError;
  });

  it('debería manejar contexto null', () => {
    // Suprimir console.error para este test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(
        <SesionContext.Provider value={null}>
          <TestComponent />
        </SesionContext.Provider>
      );
    }).toThrow('useSesion debe usarse dentro de <SesionProvider>');

    console.error = originalError;
  });
});
