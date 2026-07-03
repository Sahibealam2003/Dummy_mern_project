import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

let socket = null;

export const initiateSocket = (userId, isAdmin = false) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
  });

  socket.connect();

  socket.on("connect", () => {
    console.log("Socket Connected:", socket.id);

    socket.emit("user:online", userId);

    if (isAdmin) {
      socket.emit("join-admin");
      console.log("Admin joined admins room");
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;

  socket.disconnect();
  socket = null;
};