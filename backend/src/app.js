import express from "express";
import roomsRouter from "./Routes/rooms.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://chat-application-socket-io.vercel.app",
  "https://chat-application-socket-io-git-main-suyash-pathak04s-projects.vercel.app",
  "https://chat-application-socket-io-dun.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const cleanedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleanedOrigin)) {
      callback(null, true);
    } else {
      console.log("⛔ CORS Blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  console.log("Origin:", req.headers.origin);
  next();
});

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/api/rooms", roomsRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the backend of the chat application");
});

export default app;
