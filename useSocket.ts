import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketConfig {
  url?: string;
  token?: string;
  autoConnect?: boolean;
}

export const useSocket = ({ token }: { token: string | null }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!token) return;

    const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    // Initialize socket connection
    socketRef.current = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Connection events
    const onConnect = () => {
      setIsConnected(true);
      console.log('✅ Socket connected');
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      console.log('❌ Socket disconnected:', reason);
    };

    const onConnectError = (err: Error) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    };

    const onNotification = (data: any) => {
      setLastMessage(data);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('notification', onNotification);

    // Cleanup function
    return () => {
      // Remove all event listeners
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('notification', onNotification);

      // Clean up any additional event listeners created by subscribe
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];

      // Disconnect socket properly
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
      }
      
      // Clear the reference
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token]);

  // Helper to subscribe to specific events with proper cleanup
  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!socketRef.current) {
      return () => {}; // Return empty cleanup function if socket doesn't exist
    }

    const socket = socketRef.current;
    socket.on(event, callback);

    // Create cleanup function for this specific event
    const cleanup = () => {
      socket.off(event, callback);
    };

    // Store cleanup function for later use
    cleanupRef.current.push(cleanup);

    return cleanup;
  }, []);

  // Manual cleanup function for external use
  const cleanup = useCallback(() => {
    cleanupRef.current.forEach(cleanup => cleanup());
    cleanupRef.current = [];
    
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.disconnect();
    }
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  return { 
    socket: socketRef.current, 
    isConnected, 
    lastMessage,
    subscribe,
    cleanup
  };
};
