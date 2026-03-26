import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../Axios/axios";
import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export const chatStore = create((set, get) => ({
  username: localStorage.getItem("chat_username") || "",
  rooms: [],
  currentRoom: null,
  messages: [],
  typingUsers: [],
  socket: null,
  isRoomsLoading: false,
  isCreatingRoom: false,

  setUsername: (username) => {
    localStorage.setItem("chat_username", username);
    set({ username });
  },

  connectSocket: () => {
    const { username, socket } = get();
    if (!username || socket) return;

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("🟢 Socket connected", newSocket.id);
    });

    newSocket.on("chat_history", (history) => {
      set({ messages: history || [] });
    });

    newSocket.on("new_message", (message) => {
      set({ messages: [...get().messages, message] });
    });

    newSocket.on("typing", ({ username: user, isTyping }) => {
      if (isTyping) {
        set({ typingUsers: [...new Set([...get().typingUsers, user])] });
      } else {
        set({ typingUsers: get().typingUsers.filter((u) => u !== user) });
      }
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  getRooms: async () => {
    set({ isRoomsLoading: true });
    try {
      const res = await axiosInstance.get("/rooms");
      set({ rooms: res.data.data || [] });
    } catch (error) {
      toast.error("Failed to load rooms");
      console.error(error);
    } finally {
      set({ isRoomsLoading: false });
    }
  },

  createRoom: async (name) => {
    set({ isCreatingRoom: true });
    try {
      const res = await axiosInstance.post("/rooms", { name });
      set({ rooms: [...get().rooms, res.data.data] });
      toast.success("Room created");
      return res.data.data;
    } catch (error) {
      toast.error("Failed to create room");
      console.error(error);
      return null;
    } finally {
      set({ isCreatingRoom: false });
    }
  },

  joinRoom: (roomId) => {
    const { socket, username } = get();
    if (!socket || !roomId || !username) return;
    socket.emit("join_room", { roomId, username });
    set({ currentRoom: roomId, messages: [], typingUsers: [] });
  },

  sendMessage: (text) => {
    const { socket, currentRoom, username } = get();
    if (!socket || !currentRoom || !username || !text?.trim()) return;

    socket.emit("send_message", { roomId: currentRoom, username, text: text.trim() });
  },

  setTyping: (isTyping) => {
    const { socket, currentRoom, username } = get();
    if (!socket || !currentRoom || !username) return;
    socket.emit("typing", { roomId: currentRoom, username, isTyping });
  },
}));
