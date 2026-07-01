import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { tryCatch } from "bullmq";
export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookie = socket.handshake.headers.cookie;
    console.log("cookie ", cookie);
    if (!cookie) {
      return next(new Error("Authorization"));
    }
    const token = cookie
      .split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return next(new Error("Token missing"));
    }
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decodedToken.id;
      next()
    } catch (error) {
        return next(new Error("Invalid token"));
    }
    
  });
  io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on("message", (data) => {
      console.log("Message received: ", data);

      io.emit("message", data);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected ${socket.id}`);
    });
  });
}
