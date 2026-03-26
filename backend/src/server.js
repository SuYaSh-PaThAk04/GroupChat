import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { initializeSocket } from "./Utils/Socket.js";

dotenv.config();

const server = http.createServer(app);
initializeSocket(server);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
