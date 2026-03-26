import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatStore } from "../Store/chatStore";

export default function RoomsPage() {
  const navigate = useNavigate();
  const { username, rooms, isRoomsLoading, getRooms, createRoom, joinRoom } = chatStore();
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    if (!username) return;
    getRooms();
  }, [username, getRooms]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    const room = await createRoom(roomName.trim());
    setRoomName("");
    if (room) {
      joinRoom(room.id);
      navigate(`/rooms/${room.id}`);
    }
  };

  const handleSelectRoom = (room) => {
    joinRoom(room.id);
    navigate(`/rooms/${room.id}`);
  };

  if (!username) {
    return <div className="p-8">Enter a username to continue.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Welcome, {username}</h2>

      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="input input-bordered flex-1"
          placeholder="New room name"
        />
        <button type="submit" className="btn btn-primary">
          Create Room
        </button>
      </form>

      <div>
        <h3 className="text-lg font-medium mb-2">Available Rooms</h3>
        {isRoomsLoading ? (
          <p>Loading rooms ...</p>
        ) : rooms.length ? (
          <ul className="space-y-2">
            {rooms.map((room) => (
              <li key={room.id}>
                <button
                  onClick={() => handleSelectRoom(room)}
                  className="w-full text-left p-3 border rounded hover:bg-base-200"
                >
                  <div className="font-semibold">{room.name}</div>
                  <div className="text-xs text-zinc-500">{new Date(room.createdAt).toLocaleString()}</div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No rooms yet. Create one.</p>
        )}
      </div>
    </div>
  );
}
