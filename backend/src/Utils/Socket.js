import { Server } from "socket.io";

let io;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://chat-application-socket-io.vercel.app",
  "https://chat-application-socket-io-git-main-suyash-pathak04s-projects.vercel.app",
  "https://chat-application-socket-io-dun.vercel.app"
];

export const rooms = [];
export const messages = {}; // { roomId: [ messages ] }

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Socket.IO CORS not allowed"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    socket.on("join_room", ({ roomId, username }) => {
      if (!roomId || !username) return;

      socket.join(roomId);
      if (!messages[roomId]) {
        messages[roomId] = [];
      }

      const history = messages[roomId];
      socket.emit("chat_history", history);
      socket.to(roomId).emit("user_joined", { username, roomId });
    });

    socket.on("send_message", ({ roomId, username, text }) => {
      if (!roomId || !username || !text) return;

      const message = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        roomId,
        username,
        text,
        createdAt: new Date().toISOString(),
      };

      messages[roomId] = messages[roomId] || [];
      messages[roomId].push(message);

      io.to(roomId).emit("new_message", message);
    });

    socket.on("typing", ({ roomId, username, isTyping }) => {
      if (!roomId || !username) return;
      socket.to(roomId).emit("typing", { username, isTyping });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
    });
  });
}
