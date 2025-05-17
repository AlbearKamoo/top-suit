import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { handleCreateGame, handleJoinGame, handleStartGame, handleDisconnect, handlePlayHand, handlePass } from './socketHandlers';

const app = express();
const allowedOrigins = ['http://localhost:5173', 'https://top-suit.vercel.app'];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

// Debug: log allowed origins
console.log('Allowed origins set for CORS:', allowedOrigins);

// Healthcheck endpoint
app.get('/health', (req, res) => {
  console.log('Healthcheck endpoint hit');
  res.status(200).json({ status: 'ok' });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected via WebSocket:', socket.id);

  socket.on('createGame', (playerName: string) => handleCreateGame(io, socket, playerName));
  socket.on('joinGame', (data) => handleJoinGame(io, socket, data));
  socket.on('startGame', (gameCode: string) => handleStartGame(io, socket, gameCode));
  socket.on('playHand', (data) => handlePlayHand(io, socket, data));
  socket.on('pass', (gameCode: string) => handlePass(io, socket, gameCode));
  socket.on('disconnect', () => handleDisconnect(io, socket));
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';
httpServer.listen({ port: PORT, host: HOST }, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
}); 