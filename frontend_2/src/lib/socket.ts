import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Room management
export const joinRoom = (roomId: string) => {
  const sock = getSocket();
  sock.emit('join-room', roomId);
};

// Code synchronization
export const emitCodeChange = (roomId: string, fileName: string, code: string) => {
  const sock = getSocket();
  sock.emit('code-change', { roomId, fileName, code });
};

export const onCodeUpdate = (callback: (data: { fileName: string; code: string }) => void) => {
  const sock = getSocket();
  sock.on('code-update', callback);
};

// Chat
export const sendMessage = (roomId: string, message: string, user: string) => {
  const sock = getSocket();
  sock.emit('send-message', { roomId, message, user });
};

export const onReceiveMessage = (callback: (data: { message: string; user: string; time: string }) => void) => {
  const sock = getSocket();
  sock.on('receive-message', callback);
};

// Typing indicators
export const emitTyping = (roomId: string, user: string) => {
  const sock = getSocket();
  sock.emit('typing', { roomId, user });
};

export const emitStopTyping = (roomId: string, user: string) => {
  const sock = getSocket();
  sock.emit('stop-typing', { roomId, user });
};

export const onUserTyping = (callback: (user: string) => void) => {
  const sock = getSocket();
  sock.on('user-typing', callback);
};

export const onUserStopTyping = (callback: (user: string) => void) => {
  const sock = getSocket();
  sock.on('user-stop-typing', callback);
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  joinRoom,
  emitCodeChange,
  onCodeUpdate,
  sendMessage,
  onReceiveMessage,
  emitTyping,
  emitStopTyping,
  onUserTyping,
  onUserStopTyping,
};
