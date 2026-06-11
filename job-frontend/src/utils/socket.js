import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8080";

let socket = null;

// Returns a single shared socket connection, registering the user once.
export const getSocket = (userId) => {
  if (!socket) {
    socket = io(SERVER_URL, { autoConnect: true });
  }
  if (userId) {
    const register = () => socket.emit("register", userId);
    if (socket.connected) register();
    socket.off("connect", register);
    socket.on("connect", register);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
