import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import specialOfferRoutes from "./routes/specialOfferRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { seedProducts } from "./controllers/productController.js";
import { seedSpecialOffers } from "./controllers/specialOfferController.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import "./queues/emailWorker.js";
import {Server} from "socket.io"
// import http from "http";
// import WebSocket,{WebSocketServer} from "ws"
// import {Server} from "socket.io"
//Without websocket lib 
// import crypto from "crypto";
// function decodeMessage(buffer) {
//   const secondByte = buffer[1];

//   let length = secondByte & 127;

//   let offset = 2;

//   if (length === 126) {
//     length = buffer.readUInt16BE(2);
//     offset = 4;
//   } else if (length === 127) {
//     length = Number(buffer.readBigUInt64BE(2));

//     offset = 10;
//   }

//   const mask = buffer.slice(offset, offset + 4);

//   offset += 4;

//   const payload = buffer.slice(offset, offset + length);

//   for (let i = 0; i < payload.length; i++) {
//     payload[i] ^= mask[i % 4];
//   }

//   return payload.toString();
// }
// function encodeMessage(message) {
//   const data = Buffer.from(message);

//   const frame = Buffer.alloc(data.length + 2);

//   frame[0] = 0x81; // text frame

//   frame[1] = data.length;

//   data.copy(frame, 2);

//   return frame;
// }

// server.on("upgrade", (req, socket, head) => {
//   const key = req.headers["sec-websocket-key"];

//   const acceptKey = crypto
//     .createHash("sha1")
//     .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
//     .digest("base64");

//   socket.write(
//     [
//       "HTTP/1.1 101 Switching Protocols",
//       "Upgrade: websocket",
//       "Connection: Upgrade",
//       `Sec-WebSocket-Accept: ${acceptKey}`,
//     ].join("\r\n") + "\r\n\r\n",
//   );

//   console.log("WebSocket Connected");

//   socket.on("data", (message) => {
//     const text = decodeMessage(message);

//     console.log("Message Received:", text);

//     socket.write(encodeMessage("Server Received Your Message"));
//   });

//   socket.on("error", (error) => {
//     console.log("Socket Error:", error.message);
//   });
// });


const app = express();

const PORT = process.env.PORT;

const clientUrl = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.replace(/\/$/, "")
  : null;
const allowedOrigins = [
  clientUrl,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);
//for without lib and socket.io
// const server = http.createServer(app);


// websocket server
// const io = new Server(server,{
  //   cors:"http://localhost:5173",
  // })
  // jab user connect hoga
  // io.on("connection",(socket)=>{
    //   console.log("UserID: ",socket.id)
      
//   // message receive
//   socket.on("sendMessage", (data) => {
//     console.log("Message Received:", data);
//     // sab clients ko bhejna
//     io.emit("receiveMessage", data);
//   });
//   // disconnect
//   socket.on("disconnect", () => {
//     console.log("User disconnected", socket.id);
//   });

// })
//for ws lib

// const wss = new WebSocketServer({port: 8080})
// wss.on("connection",(socket)=>{
//   console.log("client connected");
//   socket.on("message",(msg)=>{
//     console.log(msg.toString())
//     socket.send("server recived")
//   })
// })



app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is live on Render",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/special-offers", specialOfferRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);

connectDB().then(() => {
  seedProducts();
  seedSpecialOffers();
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
