import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";

interface Point { x: number; y: number; }
interface Stroke { id: string; points: Point[]; color: string; width: number; }
interface Room { id: string; name: string; strokes: Stroke[]; users: Set<string>; }

const PORT = Number(process.env.PORT ?? 3000);
const rooms = new Map<string, Room>();

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: true, credentials: false } });

function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 60);
}

function roomList() {
  return [...rooms.values()].map(({ id, name, users }) => ({ id, name, users: users.size }));
}

io.on("connection", (socket) => {
  socket.on("get rooms", (callback?: (rooms: ReturnType<typeof roomList>) => void) => {
    callback?.(roomList());
  });

  socket.on("create room", (name: string, callback?: (result: object) => void) => {
    const roomName = cleanName(name ?? "");
    if (!roomName) return callback?.({ ok: false, error: "Please enter a room name." });

    const room: Room = { id: randomUUID(), name: roomName, strokes: [], users: new Set() };
    rooms.set(room.id, room);
    callback?.({ ok: true, room: { id: room.id, name: room.name } });
    io.emit("rooms updated", roomList());
  });

  socket.on("join room", (roomId: string, callback?: (result: object) => void) => {
    const room = rooms.get(roomId);
    if (!room) return callback?.({ ok: false, error: "Room not found." });

    const previousRoom = socket.data.roomId as string | undefined;
    if (previousRoom && previousRoom !== roomId) leaveRoom(socket.id, previousRoom);

    room.users.add(socket.id);
    socket.data.roomId = roomId;
    socket.join(roomId);
    callback?.({ ok: true, room: { id: room.id, name: room.name }, strokes: room.strokes });
    io.to(roomId).emit("room users", room.users.size);
    io.emit("rooms updated", roomList());
  });

  socket.on("draw stroke", (stroke: Stroke) => {
    const roomId = socket.data.roomId as string | undefined;
    const room = roomId ? rooms.get(roomId) : undefined;
    if (!room || !validStroke(stroke)) return;

    const saved = { ...stroke, id: stroke.id || randomUUID() };
    room.strokes.push(saved);
    socket.to(roomId!).emit("draw stroke", saved);
  });

  socket.on("clear board", () => {
    const roomId = socket.data.roomId as string | undefined;
    const room = roomId ? rooms.get(roomId) : undefined;
    if (!room) return;
    room.strokes = [];
    io.to(roomId!).emit("clear board");
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId as string | undefined;
    if (roomId) leaveRoom(socket.id, roomId);
    io.emit("rooms updated", roomList());
  });
});

function validStroke(stroke: Stroke) {
  return !!stroke && Array.isArray(stroke.points) && stroke.points.length > 0 && stroke.points.length < 10000;
}

function leaveRoom(socketId: string, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.users.delete(socketId);
  io.to(roomId).emit("room users", room.users.size);
}

httpServer.listen(PORT, () => console.log(`DrawTogether server running at http://localhost:${PORT}`));
