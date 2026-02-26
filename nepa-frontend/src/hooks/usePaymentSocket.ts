import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export const usePaymentSocket = () => {
  const paymentSocketRef = useRef<Socket | null>(null);
  const billingSocketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  useEffect(() => {
    // Connect to the payment service WebSocket
    const paymentUrl = 'http://localhost:3002'; // default payment service port
    const billingUrl = 'http://localhost:3003'; // default billing service port

    paymentSocketRef.current = io(paymentUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    billingSocketRef.current = io(billingUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    paymentSocketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to payment service WebSocket');
    });

    billingSocketRef.current.on('connect', () => {
      console.log('✅ Connected to billing service WebSocket');
    });

    paymentSocketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from payment service WebSocket');
    });

    paymentSocketRef.current.on('payment_success', (data: any) => {
      setPaymentStatus({ type: 'success', data });
    });

    paymentSocketRef.current.on('payment_failed', (data: any) => {
      setPaymentStatus({ type: 'error', data });
    });

    billingSocketRef.current.on('bill_created', (data: any) => {
      // Treat bill creation as a specific type of status update
      setPaymentStatus({ type: 'bill_status', data: { ...data, message: 'New bill created: ' + data.status } });
    });

    return () => {
      if (paymentSocketRef.current) {
        paymentSocketRef.current.disconnect();
      }
      if (billingSocketRef.current) {
        billingSocketRef.current.disconnect();
      }
    };
  }, []);

  return { isConnected, paymentStatus, setPaymentStatus };
};
