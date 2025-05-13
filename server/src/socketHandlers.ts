import { Server, Socket } from 'socket.io';
import { Card, PlayedHand } from '@shared/types';
import { isTrickComplete, findWinningHand } from './gameLogic';
import { validateHand } from '@shared/gameLogic';
import { generateGameCode, shuffle } from './helpers';

interface Player {
  id: string;
  name: string;
  cards: Card[];
  score: number;
}

interface Game {
  id: string;
  players: Player[];
  deck: Card[];
  drawPile: Card[];
  currentTurn: number;
  status: 'waiting' | 'playing' | 'finished';
  currentTrick: PlayedHand[];
  lastValidHand: PlayedHand | null;
}

// Global games map
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

export function handleCreateGame(io: Server, socket: Socket, playerName: string) {
  const gameCode = generateGameCode();
  const game: Game = {
    id: gameCode,
    players: [{
      id: socket.id,
      name: playerName,
      cards: [],
      score: 0
    }],
    deck: createDeck(),
    drawPile: [],
    currentTurn: 0,
    status: 'waiting',
    currentTrick: [],
    lastValidHand: null
  };
  
  games.set(gameCode, game);
  socket.join(gameCode);
  socket.emit('gameCreated', { gameCode, playerId: socket.id });
}

export function handleJoinGame(io: Server, socket: Socket, data: { gameCode: string, playerName: string }) {
  const { gameCode, playerName } = data;
  const game = games.get(gameCode);
  
  if (!game) {
    socket.emit('error', 'Game not found');
    return;
  }

  // Reconnection logic: if name exists but socket is disconnected, update id and rejoin
  const existingPlayer = game.players.find(p => p.name === playerName);
  if (existingPlayer) {
    // If player name is taken by an active socket, reject
    if (io.sockets.sockets.has(existingPlayer.id)) {
      socket.emit('error', 'Player name already exists');
      return;
    }
    // Otherwise, treat as reconnection
    existingPlayer.id = socket.id;
    socket.join(gameCode);
    io.to(gameCode).emit('playerRejoined', {
      players: game.players.map(p => ({ id: p.id, name: p.name, score: p.score, cardCount: p.cards.length }))
    });
    // Send rejoin success with full game state
    socket.emit('rejoinSuccess', {
      playerId: socket.id,
      gameState: {
        currentTurn: game.players[game.currentTurn].id,
        currentTrick: game.currentTrick,
        lastValidHand: game.lastValidHand,
        drawPileCount: game.drawPile.length,
        players: game.players.map(p => ({ id: p.id, name: p.name, score: p.score, cardCount: p.cards.length })),
        status: game.status
      }
    });
    // Send private cards to rejoined player
    socket.emit('dealCards', {
      cards: existingPlayer.cards,
      drawPileCount: game.drawPile.length
    });
    return;
  }

  // New player joining
  if (game.players.length >= 4) {
    socket.emit('error', 'Game is full');
    return;
  }

  game.players.push({
    id: socket.id,
    name: playerName,
    cards: [],
    score: 0
  });

  socket.join(gameCode);
  io.to(gameCode).emit('playerJoined', {
    players: game.players.map(p => ({ id: p.id, name: p.name, score: p.score, cardCount: p.cards.length }))
  });
}

export function handleStartGame(io: Server, socket: Socket, gameCode: string) {
  const game = games.get(gameCode);

  if (!game) {
    socket.emit('error', 'Game not found');
    return;
  }

  if (game.players.length !== 3 && game.players.length !== 4) {
    socket.emit('error', 'Must have 3 or 4 players to start the game');
    return;
  }

  // Start the game if we have 3 or 4 players
  if (game.players.length >= 3) {
    game.status = 'playing';
    game.currentTrick = [];
    game.lastValidHand = null;
    
    // Initialize scores
    game.players.forEach(player => {
      player.score = 0;
    });
    
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
      players: game.players.map(p => ({ id: p.id, name: p.name, score: p.score, cardCount: p.cards.length })),
      currentTurn: game.players[game.currentTurn].id,
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
}

export function handlePlayHand(io: Server, socket: Socket, data: { gameCode: string, cards: Card[] }) {
  console.log("PLAY HAND", data)
  const { gameCode, cards } = data;
  const game = games.get(gameCode);

  if (!game) {
    socket.emit('error', 'Game not found');
    console.log("GAME NOT FOUND")
    return;
  }

  // Check if it's the player's turn
  if (game.players[game.currentTurn].id !== socket.id) {
    console.log("NOT YOUR TURN", game.players[game.currentTurn].id, socket.id)
    socket.emit('error', 'Not your turn');
    return;
  }

  // Validate the played hand
  const validation = validateHand(cards, game.lastValidHand);
  if (!validation.valid) {
    console.log("INVALID HAND", validation.error)
    socket.emit('error', validation.error);
    return;
  }

  // Remove played cards from player's hand
  const player = game.players[game.currentTurn];
  cards.forEach(playedCard => {
    const cardIndex = player.cards.findIndex(
      card => card.suit === playedCard.suit && card.rank === playedCard.rank
    );
    if (cardIndex !== -1) {
      player.cards.splice(cardIndex, 1);
    }
  });

  // Add the hand to the current trick
  const playedHand: PlayedHand = {
    type: validation.type,
    cards,
    playerId: socket.id
  };
  console.log("PLAYED HAND", playedHand)
  game.currentTrick.push(playedHand);

  // Update the last valid hand if this wasn't a pass
  if (validation.type !== 'none') {
    game.lastValidHand = playedHand;
  }

  // Check if trick is complete
  if (isTrickComplete(game.currentTrick, game.players)) {
    // Find winning hand and update scores
    const winningHand = findWinningHand(game.currentTrick);
    const winningPlayer = game.players.find(p => p.id === winningHand.playerId);
    if (winningPlayer) {
      winningPlayer.score += 1;
    }

    // Reset for next trick
    game.currentTrick = [];
    game.lastValidHand = null;
    game.currentTurn = game.players.findIndex(p => p.id === winningHand.playerId);

    // Emit trick result
    io.to(gameCode).emit('trickComplete', {
      winningPlayerId: winningHand.playerId,
      players: game.players.map(p => ({ id: p.id, name: p.name, score: p.score, cardCount: p.cards.length }))
    });
  } else {
    // Move to next player
    game.currentTurn = (game.currentTurn + 1) % game.players.length;
  }

  // Check if game is over (any player has no cards left)
  if (game.players.some(p => p.cards.length === 0)) {
    game.status = 'finished';
    io.to(gameCode).emit('gameOver', {
      players: game.players.map(p => ({ id: p.id, name: p.name, score: p.score, cardCount: p.cards.length }))
    });
  } else {

    console.log("GAME STATE", JSON.stringify(game))
    // Emit updated game state
    io.to(gameCode).emit('gameState', { gameState: {
      currentTurn: game.players[game.currentTurn].id,
      currentTrick: game.currentTrick,
      lastValidHand: game.lastValidHand,
      drawPileCount: game.drawPile.length,
      players: game.players.map(p => ({ id: p.id, name: p.name, score: p.score, cardCount: p.cards.length })),
      status: game.status
    }});
  }
}

export function handlePass(io: Server, socket: Socket, gameCode: string) {
  const game = games.get(gameCode);

  if (!game) {
    socket.emit('error', 'Game not found');
    return;
  }

  // Check if it's the player's turn
  if (game.players[game.currentTurn].id !== socket.id) {
    socket.emit('error', 'Not your turn');
    return;
  }

  const player = game.players[game.currentTurn];

  // Draw a card if there are cards in the draw pile
  if (game.drawPile.length > 0) {
    const drawnCard = game.drawPile.pop()!;
    player.cards.push(drawnCard);
    
    // Notify the player of their new card
    socket.emit('cardDrawn', {
      card: drawnCard,
      drawPileCount: game.drawPile.length
    });
  }

  // Add a "pass" hand to the current trick
  const passHand: PlayedHand = {
    type: 'none',
    cards: [],
    playerId: socket.id
  };
  game.currentTrick.push(passHand);

  // Check if trick is complete (everyone has played or passed)
  if (isTrickComplete(game.currentTrick, game.players)) {
    // Find winning hand and update scores
    const winningHand = game.lastValidHand || findWinningHand(game.currentTrick);
    const winningPlayer = game.players.find(p => p.id === winningHand.playerId);
    if (winningPlayer) {
      winningPlayer.score += 1;
    }

    // Reset for next trick
    game.currentTrick = [];
    game.lastValidHand = null;
    // Winner of the trick starts the next one
    game.currentTurn = game.players.findIndex(p => p.id === winningHand.playerId);

    // Emit trick result
    io.to(gameCode).emit('trickComplete', {
      winningPlayerId: winningHand.playerId,
      players: game.players.map(p => ({ id: p.id, name: p.name, score: p.score, cardCount: p.cards.length }))
    });
  } else {
    // Move to next player
    game.currentTurn = (game.currentTurn + 1) % game.players.length;
  }

  // Emit updated game state
  io.to(gameCode).emit('gameState', {
    currentTurn: game.players[game.currentTurn].id,
    currentTrick: game.currentTrick,
    lastValidHand: game.lastValidHand,
    drawPileCount: game.drawPile.length,
    players: game.players.map(p => ({ id: p.id, name: p.name, score: p.score, cardCount: p.cards.length })),
    status: game.status
  });
}

export function handleDisconnect(io: Server, socket: Socket) {
  games.forEach((game, gameCode) => {
    const player = game.players.find(p => p.id === socket.id);
    if (player) {
      // Remove socket from room
      socket.leave(gameCode);
      // Notify others that player disconnected
      io.to(gameCode).emit('playerDisconnected', {
        id: player.id,
        name: player.name
      });

      // If no more sockets in the room, drop the game
      const room = io.sockets.adapter.rooms.get(gameCode);
      if (!room || room.size === 0) {
        games.delete(gameCode);
      }
    }
  });
}

// Export games map for potential use in other modules
export { games }; 