import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { generateGameCode, shuffle } from './helpers';
const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

interface Card {
  suit: '♠' | '♥' | '♣' | '♦';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

interface Player {
  id: string;
  name: string;
  cards: Card[];
}

interface Game {
  id: string;
  players: Player[];
  deck: Card[];
  drawPile: Card[];
  currentTurn: number;
  status: 'waiting' | 'playing' | 'finished';
}

const games = new Map<string, Game>();

// Create a new deck of cards
function createDeck(): Card[] {
  const suits = ['♠', '♥', '♣', '♦'] as const;
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  
  return shuffle(deck);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new game
  socket.on('createGame', (playerName: string) => {
    const gameCode = generateGameCode();
    const game: Game = {
      id: gameCode,
      players: [{
        id: socket.id,
        name: playerName,
        cards: []
      }],
      deck: createDeck(),
      drawPile: [],
      currentTurn: 0,
      status: 'waiting'
    };
    
    games.set(gameCode, game);
    socket.join(gameCode);
    socket.emit('gameCreated', { gameCode, playerId: socket.id });
  });

  // Join an existing game
  socket.on('joinGame', ({ gameCode, playerName }: { gameCode: string, playerName: string }) => {
    const game = games.get(gameCode);
    
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }

    if (game.players.length >= 4) {
      socket.emit('error', 'Game is full');
      return;
    }

    game.players.push({
      id: socket.id,
      name: playerName,
      cards: []
    });

    socket.join(gameCode);
    io.to(gameCode).emit('playerJoined', {
      players: game.players.map(p => ({ id: p.id, name: p.name }))
    });

    // Start the game if we have 3 or 4 players
    if (game.players.length >= 3) {
      game.status = 'playing';
      
      // Determine cards per player based on player count
      const cardsPerPlayer = game.players.length === 3 ? 10 : 8;
      
      // Deal cards to players
      game.players.forEach((player, index) => {
        player.cards = game.deck.slice(index * cardsPerPlayer, (index + 1) * cardsPerPlayer);
      });

      // Set remaining cards as draw pile
      const totalDealtCards = cardsPerPlayer * game.players.length;
      game.drawPile = game.deck.slice(totalDealtCards);
      game.deck = []; // Clear the main deck as all cards are either dealt or in draw pile
      
      io.to(gameCode).emit('gameStarted', {
        players: game.players.map(p => ({ id: p.id, name: p.name })),
        currentTurn: game.currentTurn,
        drawPileCount: game.drawPile.length
      });

      // Send private messages to each player with their cards
      game.players.forEach(player => {
        io.to(player.id).emit('dealCards', { 
          cards: player.cards,
          drawPileCount: game.drawPile.length
        });
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    games.forEach((game, gameCode) => {
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        if (game.players.length === 0) {
          games.delete(gameCode);
        } else {
          io.to(gameCode).emit('playerLeft', {
            players: game.players.map(p => ({ id: p.id, name: p.name }))
          });
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 