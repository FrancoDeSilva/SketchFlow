# DrawTogether

Real-time collaborative whiteboard built with TypeScript, Vite and Socket.IO.

## Run with Yarn

Terminal 1 (backend):

```bash
yarn install
yarn dev
```

Terminal 2 (frontend):

```bash
cd frontend
yarn install
yarn dev
```

Open the Vite URL (usually http://localhost:5173/rooms.html) in two browser tabs.
Create a room in one tab and join it from the other. Drawing is synchronized live.

## Architecture

- `src/index.ts` — Socket.IO backend, room management and in-memory whiteboard state.
- `frontend/src/rooms.ts` — create/list/join rooms UI.
- `frontend/src/main.ts` — whiteboard page and Socket.IO connection.
- `frontend/src/whiteboard.ts` — canvas drawing engine.

Rooms and drawings are stored in memory, so they disappear when the backend restarts.
