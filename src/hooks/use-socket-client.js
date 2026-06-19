'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getWebRvmUrl } from '@/lib/web-rvm-url';

export function useSocket(url, options = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const socketRef = useRef(null);

  const {
    onConnect,
    onDisconnect,
    onConnectedEvent,
    onMessage,
    onError,
    onSessionStarted,
    onSessionEnded,
    autoConnect = true,
  } = options;

  useEffect(() => {
    if (!autoConnect) return;

    const socketUrl = url || getWebRvmUrl();

    if (!socketUrl) {
      const message = 'NEXT_PUBLIC_WEB_RVM_URL belum diset untuk production';
      setError(message);
      setIsConnected(false);
      onError?.(new Error(message));
      return undefined;
    }
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', socket.id);
      setIsConnected(true);
      setError(null);
      onConnect?.(socket);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      setIsConnected(false);
      onDisconnect?.(reason);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket.IO connection error:', err);
      setError(err.message);
      setIsConnected(false);
      onError?.(err);
    });

    socket.on('bottle_detected', (message) => {
      console.log('📡 Received bottle detection:', message);
      setLastMessage(message);
      onMessage?.(message);
    });

    socket.on('connected', (message) => {
      console.log('📡 Connected message:', message);
      onConnectedEvent?.(message);
    });

    socket.on('session_started', (message) => {
      console.log('📡 Session started - user opened /bottlein:', message);
      setSessionActive(true);
      onSessionStarted?.(message);
    });

    socket.on('session_ended', (message) => {
      console.log('📡 Session ended:', message);
      setSessionActive(false);
      onSessionEnded?.(message);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
      setSessionActive(false);
    };
  }, [url, autoConnect]);

  const emit = (event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      return true;
    } else {
      console.warn('Socket not connected');
      return false;
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sessionActive,
    lastMessage,
    error,
    emit,
    disconnect,
  };
}
