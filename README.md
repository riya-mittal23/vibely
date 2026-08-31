# VIBELY

Vibely is an original social party game built around a subjective spectrum. Players get a spectrum (e.g., "Chill" to "Chaotic"), one player gives a clue that they believe lands exactly where the hidden target is on that spectrum, and the others guess where it belongs. The closer the guess, the higher the score!

## Project Overview
This repository contains Phase 1 of the Vibely game, consisting of a local-first playable experience.
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript

## Folder Structure
- `/frontend`: The web client application.
- `/backend`: The REST API backend.

## Tech Stack
- Frontend: Vite + React (TypeScript), Tailwind CSS for styling, Framer Motion for animations, Zustand for local game state management, React Router DOM for routing.
- Backend: Node.js + Express (TypeScript), CORS, dotenv.

## Development Setup

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
(You may need to add `"dev": "nodemon src/server.ts"` to `backend/package.json` scripts if it isn't there already. By default you can run `npx ts-node src/server.ts` or set it up in your scripts).

## Environment Variables
(Create `.env` in both folders based on `.env.example` if applicable).

- **Frontend**: `VITE_API_URL=http://localhost:3001`
- **Backend**: `PORT=3001`, `CLIENT_URL=http://localhost:5173`

## Architecture Overview
- **Game Engine**: Isolated in `frontend/src/services/game/`.
- **State Management**: Built on `Zustand` in `frontend/src/store/useGameStore.ts` which manages the round, scoring, and UI flows.
- **Design System**: Responsive mobile-first design with a custom animation system using TailwindCSS utility classes and Framer Motion micro-interactions.

## Future Phases
- Phase 2: Socket.IO + Redis for real-time multiplayer rooms.
- Phase 3: AI integrations via Ollama for dynamic spectrum generation and clue assistance.