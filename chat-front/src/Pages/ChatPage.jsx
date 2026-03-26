import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatStore } from "../Store/chatStore";
import { formatMessageTime } from "../Lib/Utils";

export default function ChatPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const {
    username,
    rooms,
    messages,
    typingUsers,
    socket,
    currentRoom,
    joinRoom,
    sendMessage,
    setTyping,
  } = chatStore();

  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const room = useMemo(() => rooms.find((r) => r.id === roomId), [rooms, roomId]);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    if (!roomId) {
      navigate("/");
      return;
    }

    if (!currentRoom || currentRoom !== roomId) {
      joinRoom(roomId);
    }
  }, [username, roomId, currentRoom, joinRoom, navigate]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!room) {
    return (
      <div className="p-6">
        <p>Room not found. Please select a valid room.</p>
      </div>
    );
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
    setIsTyping(false);
    setTyping(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setDraft(value);
    if (!isTyping) {
      setIsTyping(true);
      setTyping(true);
    }

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setIsTyping(false);
      setTyping(false);
    }, 700);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Room: {room.name}</h2>
          <p className="text-sm text-zinc-500">You are: {username}</p>
        </div>
        <button className="btn" onClick={() => navigate("/")}>Back</button>
      </div>

      <div className="border rounded h-[60vh] overflow-y-auto p-4 bg-base-100">
        {messages.length ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 ${message.username === username ? "text-right" : "text-left"}`}
            >
              <div className="text-xs text-zinc-500">{message.username} • {formatMessageTime(message.createdAt)}</div>
              <div className={`inline-block px-3 py-2 rounded-lg ${message.username === username ? 'bg-primary text-white' : 'bg-base-200'}`}>
                {message.text}
              </div>
            </div>
          ))
        ) : (
          <div className="text-zinc-500">No messages yet. Say hello!</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="mt-2 text-sm text-zinc-500">
          {typingUsers.filter((u) => u !== username).join(", ")} typing...
        </div>
      )}

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={handleInputChange}
          className="input input-bordered flex-1"
          placeholder="Type message..."
        />
        <button className="btn btn-primary" type="submit" disabled={!draft.trim() || !socket}>
          Send
        </button>
      </form>
    </div>
  );
}
