/**
 * Ejemplo: Componente de Pago WirePOS
 * 
 * Uso: <WireposPaymentButton deviceId="DEV_001" amount="200" invoiceNumber="INV-001" />
 */

import React from 'react';
import { useWireposPayment } from './useWireposPayment';

interface Props {
  deviceId: string;
  amount: string;
  invoiceNumber: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function WireposPaymentButton({
  deviceId,
  amount,
  invoiceNumber,
  onSuccess,
  onError
}: Props) {
  const { status, isLoading, error, data, pay, retry, cancel } = useWireposPayment();

  const handlePay = async () => {
    try {
      const result = await pay(deviceId, amount, invoiceNumber);
      onSuccess?.(result);
    } catch (err: any) {
      onError?.(err.message);
    }
  };

  return (
    <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>💳 Pago WirePOS</h3>
      
      <p style={{ fontSize: '13px', margin: '5px 0' }}>
        <strong>Dispositivo:</strong> {deviceId}
      </p>
      <p style={{ fontSize: '13px', margin: '5px 0' }}>
        <strong>Monto:</strong> ₡{amount}
      </p>
      <p style={{ fontSize: '13px', margin: '5px 0' }}>
        <strong>Factura:</strong> {invoiceNumber}
      </p>

      <div style={{
        padding: '10px',
        marginTop: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '13px'
      }}>
        <strong>Estado:</strong> {getStatusLabel(status)}
        {error && <div style={{ color: '#d32f2f', marginTop: '5px' }}>❌ {error}</div>}
        {data?.data?.authCode && (
          <div style={{ color: '#388e3c', marginTop: '5px' }}>✅ Código: {data.data.authCode}</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button
          onClick={handlePay}
          disabled={isLoading || status === 'success'}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || status === 'success' ? 'not-allowed' : 'pointer',
            opacity: isLoading || status === 'success' ? 0.6 : 1
          }}
        >
          {isLoading ? '⏳ Procesando...' : status === 'success' ? '✅ Aprobado' : '💳 Pagar'}
        </button>

        {isLoading && (
          <button
            onClick={cancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#9e9e9e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✕ Cancelar
          </button>
        )}

        {error && status !== 'success' && (
          <button
            onClick={retry}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Reintentar
          </button>
        )}
      </div>

    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    idle: '⚪ Listo',
    requesting: '🔄 Enviando...',
    processing: '⏳ Procesando...',
    success: '✅ Éxito',
    error: '❌ Error',
    timeout: '⏱️ Timeout',
    cancelled: '❌ Cancelado'
  };
  return labels[status] || status;
}

export default WireposPaymentButton;
