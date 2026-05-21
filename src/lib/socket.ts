'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: '/api/socketio',
      addTrailingSlash: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket.io] Connection error:', error.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function emitProductUpdate(data: unknown) {
  getSocket().emit('product:updated', data);
}

export function emitStockAdjustment(data: unknown) {
  getSocket().emit('stock:adjusted', data);
}

// Server-side: broadcast to all clients
export function broadcastToInventory(event: string, data: unknown) {
  if (typeof global !== 'undefined' && (global as any).io) {
    (global as any).io.to('inventory').emit(event, data);
  }
}
