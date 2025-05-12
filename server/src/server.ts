import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { handleCreateGame, handleJoinGame, handleStartGame, handleDisconnect, handlePlayHand, handlePass } from './socketHandlers';

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createGame', (playerName: string) => handleCreateGame(io, socket, playerName));
  socket.on('joinGame', (data) => handleJoinGame(io, socket, data));
  socket.on('startGame', (gameCode: string) => handleStartGame(io, socket, gameCode));
  socket.on('playHand', (data) => handlePlayHand(io, socket, data));
  socket.on('pass', (gameCode: string) => handlePass(io, socket, gameCode));
  socket.on('disconnect', () => handleDisconnect(io, socket));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 