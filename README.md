# Top Suit

A real-time multiplayer trick-taking card game built in React and Node.js.

## Overview
Top Suit is a novel playing card game where 3–4 players compete by playing valid hands (Single, Pair, Triple, Quad, or Run) in clockwise order. Each trick is won by the highest hand based on both rank and suit hierarchy. The first player to play all of their cards wins.

For the full game rules, see [RULES.md](client/public/RULES.md).

## Technologies Used
- **Client:** React, TypeScript, Vite, Emotion (CSS-in-JS)
- **Server:** Node.js, Express, Socket.IO, TypeScript
- **Shared:** TypeScript for game logic and shared types
- **Build & Tooling:** tsc, tsconfig-paths, tsc-alias

## Project Structure
- `client/` — React frontend
- `server/` — Node.js + Socket.IO backend
- `shared/` — Shared TypeScript types and game logic

Enjoy playing Top Suit! 