import express from "express";
import { rooms, messages } from "../Utils/Socket.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Room name is required" });
  }

  const room = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  rooms.push(room);
  messages[room.id] = [];

  return res.status(201).json({ data: room, message: "Room created" });
});

router.get("/", (req, res) => {
  return res.status(200).json({ data: rooms });
});

export default router;
