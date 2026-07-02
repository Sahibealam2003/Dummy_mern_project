import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisConnection } from "../config/redis.js";

export let io;

export async function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : null
      ].filter(Boolean),
      credentials: true,
    },
  });
  //redis connecrtion pub nad sub
  const pubClient = redisConnection.duplicate()
  const subClient = redisConnection.duplicate()

  console.log("Socket Redis Adapter Connected")
  //Adapter
  io.adapter(createAdapter(pubClient, subClient))
  //Socket.io
  io.on("connection", (socket) => {
    console.log("User connected", socket.id)
    socket.on("join", (userId) => {
      socket.join(userId.toString())
      console.log("User join room", userId)
    });
    socket.on("user:online", (userId) => {
      socket.join(userId.toString())
      console.log("User join room (user:online)", userId)
    });
    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id)
    })
  })

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized")
  }
  return io;
}
