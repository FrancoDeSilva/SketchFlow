# 🎨 SketchFlow

### Draw. Collaborate. Create. — In Real Time.

**SketchFlow** is a real-time collaborative whiteboard application built with TypeScript, Vite, and Socket.IO. It allows users to create rooms, join collaborative drawing sessions, and see drawings synchronized instantly across connected users.

Designed to make collaboration simple and interactive, SketchFlow explores real-time communication, canvas rendering, and client-server architecture.

---

## ✨ Features

- 🎨 **Interactive Whiteboard** — Draw freely on a canvas.
- ⚡ **Real-Time Collaboration** — Synchronize drawings between connected users using Socket.IO.
- 🏠 **Room Management** — Create, list, and join drawing rooms.
- 👥 **Multi-User Sessions** — Collaborate with others in the same room.
- 🔄 **Live Updates** — See drawing activity reflected across connected browser tabs.
- 🧩 **TypeScript Architecture** — Organised code for the backend, room interface, and drawing engine.
- 🚀 **Vite Development Server** — Fast frontend development and hot module replacement.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript | Application logic and type safety |
| Vite | Frontend development server and build tooling |
| Node.js | Backend runtime |
| Socket.IO | Real-time, bidirectional communication |
| HTML5 Canvas | Drawing and whiteboard rendering |
| Yarn | Dependency management |

---

## 📂 Project Structure

```text
SketchFlow/
├── src/
│   └── index.ts              # Socket.IO backend and room management
│
├── frontend/
│   └── src/
│       ├── rooms.ts          # Create, list, and join rooms
│       ├── main.ts           # Whiteboard page and socket connection
│       └── whiteboard.ts     # Canvas drawing engine
│
├── package.json              # Backend dependencies and scripts
├── yarn.lock                 # Backend dependency lockfile
├── frontend/
│   ├── package.json          # Frontend dependencies and scripts
│   └── yarn.lock             # Frontend dependency lockfile, if present
│
└── README.md
```

*Note: The structure above represents the main files. Additional configuration files may exist in the repository.*

---

## 🚀 Getting Started

Follow these steps to run SketchFlow locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

Check your installations:

```bash
node --version
yarn --version
```

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd SketchFlow
```

Replace `YOUR_REPOSITORY_URL` with your GitHub repository URL.

### 2. Start the backend

Open your first terminal in the project root:

```bash
yarn install
yarn dev
```

The backend will start using the development script configured in the root `package.json`.

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
yarn install
yarn dev
```

Vite will display the local development URL in the terminal.

### 4. Test real-time collaboration

1. Open the Vite URL shown in your terminal, usually `http://localhost:5173/rooms.html`.
2. Create a room in the first browser tab.
3. Open the application in a second tab.
4. Join the same room.
5. Start drawing and observe the synchronized drawing activity.

**Tip:** Both browser tabs must connect to the same running backend and join the same room for collaboration to work.

---

## 📡 Architecture

SketchFlow separates the frontend drawing experience from the backend's real-time communication and room management.

### Backend — `src/index.ts`

- Runs the Socket.IO server.
- Manages collaborative rooms.
- Maintains in-memory whiteboard state.

### Room Interface — `frontend/src/rooms.ts`

- Provides the room creation interface.
- Lists available rooms.
- Allows users to join existing rooms.

### Whiteboard Interface — `frontend/src/main.ts`

- Initializes the whiteboard page.
- Establishes the Socket.IO connection.
- Connects the interface to real-time events.

### Drawing Engine — `frontend/src/whiteboard.ts`

- Handles canvas-based drawing.
- Manages the drawing interaction logic.

---

## 📦 Dependencies & Installation

**`node_modules` is intentionally not included in this repository.**

The `node_modules` directory contains installed packages and can become very large. Instead, dependency information is maintained in the relevant `package.json` files and lockfiles.

When you clone the project, install the dependencies separately:

```bash
yarn install
```

Run this command in the project root and again inside `frontend` if it has its own `package.json`.

You do not need to upload or commit `node_modules` to GitHub. It should be excluded through `.gitignore`.

Example `.gitignore` entries:

```gitignore
node_modules/
frontend/node_modules/

dist/
frontend/dist/

.env
.env.*
!.env.example

.DS_Store
```

Keep the relevant `yarn.lock` files in the repository to help maintain consistent dependency versions.

---

## ⚠️ Current Limitations

- **In-memory storage:** Rooms and drawings are stored in memory and disappear when the backend restarts.
- **No persistent database:** Whiteboard sessions are not saved permanently.
- **Local development:** The instructions above run the frontend and backend locally.
- **Network access:** Multi-device collaboration requires the clients to reach the same backend server.

---

## 🔮 Future Improvements

- 💾 Persistent room and drawing storage.
- 🖊️ Additional drawing tools, colours, and brush sizes.
- ↩️ Undo and redo functionality.
- 🧹 Clear canvas controls.
- 🔗 Shareable room invitations.
- 🔐 User authentication and room permissions.
- ☁️ Online deployment for collaboration beyond localhost.

---

## 🎯 What I Learned

Through SketchFlow, I am exploring:

- Real-time communication with Socket.IO.
- Building interactive drawing experiences with HTML Canvas.
- Structuring a TypeScript frontend and Node.js backend.
- Managing rooms and synchronizing client activity.
- Running separate frontend and backend development environments.
- Managing project dependencies with Yarn and Git.

---

## 👨‍💻 Author

**Franco De Silva**

Computer Science graduate | Software Developer

[GitHub](https://github.com/YOUR_USERNAME) · [LinkedIn](YOUR_LINKEDIN_URL)

---

<p align="center">
  <b>SketchFlow — Draw together. Create together.</b>
</p>
