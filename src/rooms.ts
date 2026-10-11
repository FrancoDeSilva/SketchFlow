import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
const input = document.getElementById("room_name") as HTMLInputElement;
const createBtn = document.getElementById("create_btn") as HTMLButtonElement;
const roomsEl = document.getElementById("rooms")!;
const errorEl = document.getElementById("error")!;

type Room = { id: string; name: string; users: number };

function renderRooms(rooms: Room[]) {
  roomsEl.innerHTML = rooms.length ? rooms.map(room => `
    <div class="card"><div class="meta"><strong>${escapeHtml(room.name)}</strong><br><small>${room.users} user${room.users === 1 ? "" : "s"}</small></div>
    <button data-room="${room.id}">Join</button></div>`).join("") : `<div class="empty">No rooms yet. Create the first one.</div>`;
  roomsEl.querySelectorAll<HTMLButtonElement>("[data-room]").forEach(btn => btn.onclick = () => join(btn.dataset.room!));
}

function create() {
  const name = input.value.trim();
  if (!name) return showError("Please enter a room name.");
  socket.emit("create room", name, (result: any) => {
    if (!result.ok) return showError(result.error);
    window.location.href = `/index.html?room=${encodeURIComponent(result.room.id)}`;
  });
}

function join(id: string) {
  window.location.href = `/index.html?room=${encodeURIComponent(id)}`;
}

function showError(message = "") { errorEl.textContent = message; }
function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]!)); }

createBtn.onclick = create;
input.addEventListener("keydown", e => { if (e.key === "Enter") create(); });
socket.on("connect", () => socket.emit("get rooms", renderRooms));
socket.on("rooms updated", renderRooms);
socket.on("connect_error", () => showError("Cannot connect to the DrawTogether server. Start the backend first."));
