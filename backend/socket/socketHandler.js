const Notification = require('../models/Notification.model');

module.exports = (io) => {
  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('register', (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  // Helper to send notification to specific user
  const sendNotification = async (userId, notificationData) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(socketId).emit('notification', notificationData);
    }
    
    // Save to database
    const notification = new Notification({
      user: userId,
      ...notificationData
    });
    await notification.save();
  };

  return { sendNotification };
};