import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket = null;

export const initializeSocket = (userId) => {
  socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    socket.emit('register', userId);
  });

  socket.on('notification', (notification) => {
    toast(
      <div>
        <strong>{notification.title}</strong>
        <p className="text-sm mt-1">{notification.message}</p>
      </div>,
      { duration: 5000 }
    );
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;