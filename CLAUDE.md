# Group Chat App

## Overview
Real-time group chat application with simple username-based authentication.

## Tech Stack
- **Backend**: Express.js + WebSocket (ws)
- **Frontend**: React + Tailwind CSS v4
- **Build**: Vite
- **Package Manager**: pnpm

## How to Run

### Server
```bash
cd server
pnpm install
pnpm dev      # runs on port 3001
```

### Client
```bash
cd client
pnpm install
pnpm dev      # runs on port 5173, proxies /ws to server
```

## Project Structure
```
server/
  src/
    index.js          # Express + WebSocket server
client/
  src/
    components/
      LoginForm.jsx   # Username entry screen
      ChatRoom.jsx    # Chat interface
    hooks/
      useChat.js      # WebSocket connection hook
    App.jsx           # Root component
```

## Key Decisions
- No password auth, username-only with UUID per session
- All validation happens server-side, frontend reacts to errors
- WebSocket for real-time messaging
- Minimalist UI: grays, whites, blacks
