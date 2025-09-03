import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import EmpleadoModal from '../../src/modal/EmpleadoModal';

// Mock de Apollo Client
const mocks = [];

// Props básicas para el modal
const defaultProps = {
  open: true,
  onClose: vi.fn(),
  refetch: vi.fn(),
  empleado: null
};

// Wrapper con Apollo Provider
const ModalWrapper = ({ children, apolloMocks = mocks }: { children: React.ReactNode, apolloMocks?: any[] }) => (
  <MockedProvider mocks={apolloMocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('EmpleadoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el modal en modo creación cuando no hay empleado', () => {
    render(
      <ModalWrapper>
        <EmpleadoModal {...defaultProps} />
      </ModalWrapper>
    );

    expect(screen.getByText('Registrar empleado')).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cédula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/puesto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salario base/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de ingreso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/días de vacaciones/i)).toBeInTheDocument();
  });

  it('debería renderizar el modal en modo edición cuando hay empleado', () => {
    const empleado = {
      id: '1',
      nombre: 'Juan',
      apellido: 'Pérez',
      cedula: '12345678',
      puesto: 'Desarrollador',
      salarioBase: 50000,
      fechaIngreso: '2023-01-01',
      diasVacaciones: 15,
      estado: true
    };

    render(
      <ModalWrapper>
        <EmpleadoModal {...defaultProps} empleado={empleado} />
      </ModalWrapper>
    );

    expect(screen.getByText('Editar empleado')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desarrollador')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50000')).toBeInTheDocument();
  });

  it('no debería renderizar cuando open es false', () => {
    render(
      <ModalWrapper>
        <EmpleadoModal {...defaultProps} open={false} />
      </ModalWrapper>
    );

    expect(screen.queryByText('Crear Empleado')).not.toBeInTheDocument();
  });

  it('debería llamar onClose cuando se hace click en Cancelar', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(
      <ModalWrapper>
        <EmpleadoModal {...defaultProps} onClose={onCloseMock} />
      </ModalWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debería permitir escribir en los campos de entrada', async () => {
    const user = userEvent.setup();

    render(
      <ModalWrapper>
        <EmpleadoModal {...defaultProps} />
      </ModalWrapper>
    );

    const nombreField = screen.getByLabelText(/nombre/i);
    const apellidoField = screen.getByLabelText(/apellido/i);

    await user.type(nombreField, 'Test Name');
    await user.type(apellidoField, 'Test Lastname');

    expect(nombreField).toHaveValue('Test Name');
    expect(apellidoField).toHaveValue('Test Lastname');
  });

  it('debería mostrar botones de acción', () => {
    render(
      <ModalWrapper>
        <EmpleadoModal {...defaultProps} />
      </ModalWrapper>
    );

    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  });

  it('debería mostrar botón guardar en modo edición', () => {
    const empleado = {
      id: '1',
      nombre: 'Juan',
      apellido: 'Pérez',
      cedula: '12345678',
      puesto: 'Desarrollador',
      salarioBase: 50000,
      fechaIngreso: '2023-01-01',
      diasVacaciones: 15,
      estado: true
    };

    render(
      <ModalWrapper>
        <EmpleadoModal {...defaultProps} empleado={empleado} />
      </ModalWrapper>
    );

    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /crear/i })).not.toBeInTheDocument();
  });

  it('debería limpiar el formulario cuando se abre sin empleado', () => {
    const { rerender } = render(
      <ModalWrapper>
        <EmpleadoModal {...defaultProps} open={false} />
      </ModalWrapper>
    );

    // Abrir modal sin empleado
    rerender(
      <ModalWrapper>
        <EmpleadoModal {...defaultProps} open={true} empleado={null} />
      </ModalWrapper>
    );

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('');
    expect(screen.getByLabelText(/apellido/i)).toHaveValue('');
    expect(screen.getByLabelText(/cédula/i)).toHaveValue('');
  });
});
