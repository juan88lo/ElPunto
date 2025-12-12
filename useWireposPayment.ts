/**
 * Hook: useWireposPayment
 * Gestiona pagos WirePOS con polling on-demand
 * 
 * USO:
 * const { status, pay, isLoading, error } = useWireposPayment();
 * await pay('DEV_001', '200', 'INV-001');
 */

import { useState, useRef, useCallback, useEffect } from 'react';

type PaymentStatus = 'idle' | 'requesting' | 'processing' | 'success' | 'error' | 'timeout' | 'cancelled';

const POLL_INTERVAL = 5000; // 5 segundos
const DEFAULT_TIMEOUT = 120000; // 2 minutos
const API_URL = 'http://localhost:8765';

interface PaymentResult {
  transactionId: string;
  status: string;
  data?: {
    authCode: string;
    cardLast4?: string;
    responseCode?: string;
    message?: string;
  };
}

export function useWireposPayment() {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [data, setData] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTransactionRef = useRef<string | null>(null);
  const lastParamsRef = useRef<any>(null);

  // Limpiar recursos
  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    currentTransactionRef.current = null;
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Hacer pago
  const pay = useCallback(
    async (deviceId: string, amount: string, invoice: string, command: string = 'V') => {
      try {
        cleanup();
        setStatus('requesting');
        setError(null);
        setData(null);

        // 1. Enviar solicitud al backend
        const response = await fetch(`${API_URL}/wirepos/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            command,
            params: `${command}|${deviceId}|${amount}|${invoice}`,
            timestamp: Date.now(),
            callbackUrl: `${window.location.origin}/wirepos/callback`
          })
        });

        if (!response.ok) throw new Error('Server error');
        
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to initiate payment');

        const transactionId = result.transactionId;
        currentTransactionRef.current = transactionId;
        lastParamsRef.current = { deviceId, amount, invoice, command };

        // Invocar protocolo wirepos:// (abre .exe)
        try {
          window.location.href = `wirepos://pay?id=${transactionId}`;
        } catch (e) {
          console.warn('⚠️ Protocol invocation failed:', e);
        }

        // 2. Comenzar polling
        setStatus('processing');
        
        return new Promise<PaymentResult>((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = Math.ceil(DEFAULT_TIMEOUT / POLL_INTERVAL);

          const poll = async () => {
            try {
              const statusResponse = await fetch(`${API_URL}/wirepos/status/${transactionId}`);
              if (!statusResponse.ok) throw new Error('Failed to check status');

              const statusData = await statusResponse.json();

              if (statusData.status === 'DONE' && statusData.result) {
                // ✅ Pago completado
                cleanup();
                setStatus('success');
                setData(statusData);
                resolve(statusData);
              } else if (attempts >= maxAttempts) {
                // ⏱️ Timeout
                cleanup();
                setStatus('timeout');
                setError('Timeout después de 120 segundos');
                reject(new Error('Timeout'));
              } else {
                attempts++;
              }
            } catch (e: any) {
              cleanup();
              setStatus('error');
              setError(e.message || 'Error checking status');
              reject(e);
            }
          };

          // Polling cada 5 segundos
          pollIntervalRef.current = setInterval(poll, POLL_INTERVAL);

          // Timeout después de 2 minutos
          timeoutRef.current = setTimeout(() => {
            cleanup();
            setStatus('timeout');
            setError('Timeout después de 120 segundos');
            reject(new Error('Timeout'));
          }, DEFAULT_TIMEOUT);

          // Primer chequeo inmediatamente
          poll();
        });
      } catch (err: any) {
        cleanup();
        setStatus('error');
        const errorMsg = err.message || 'Error during payment';
        setError(errorMsg);
        throw err;
      }
    },
    [cleanup]
  );

  // Reintentar último pago
  const retry = useCallback(async () => {
    if (!lastParamsRef.current) {
      setError('No hay pago anterior para reintentar');
      return;
    }
    
    const { deviceId, amount, invoice, command } = lastParamsRef.current;
    return pay(deviceId, amount, invoice, command);
  }, [pay]);

  // Cancelar pago actual
  const cancel = useCallback(() => {
    cleanup();
    setStatus('cancelled');
    setError('Pago cancelado por usuario');
    currentTransactionRef.current = null;
  }, [cleanup]);

  return {
    status,
    data,
    error,
    isLoading: status === 'requesting' || status === 'processing',
    pay,
    retry,
    cancel,
    activeRequests: currentTransactionRef.current ? 1 : 0
  };
}
