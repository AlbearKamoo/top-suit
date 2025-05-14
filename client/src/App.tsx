import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { GameScreen } from './components/GameScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { Card, CardsEvent, GameCreatedEvent, GameStartedEvent, Player, PlayersEvent, GameStateEvent, CardDrawnEvent, TrickCompleteEvent, PlayedHand } from './types';

export const socket = io('http://localhost:3001');

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  const [drawPileCount, setDrawPileCount] = useState(0);
  const [currentTrick, setCurrentTrick] = useState<PlayedHand[]>([]);
  const [currentTurn, setCurrentTurn] = useState('');

  useEffect(() => {
    socket.on('gameCreated', ({ gameCode }: GameCreatedEvent) => {
      setGameCode(gameCode);
    });

    socket.on('playerJoined', ({ players }: PlayersEvent) => {
      setPlayers(players);
    });

    socket.on('gameStarted', ({ players, drawPileCount, currentTurn }: GameStartedEvent) => {
      setPlayers(players);
      setGameStarted(true);
      setDrawPileCount(drawPileCount);
      setCurrentTrick([]);
      setCurrentTurn(currentTurn);
    });

    socket.on('dealCards', ({ cards, drawPileCount }: CardsEvent) => {
      setCards(cards);
      setDrawPileCount(drawPileCount);
    });

    socket.on('cardDrawn', ({ card, drawPileCount }: CardDrawnEvent) => {
      setCards(prev => [...prev, card]);
      setDrawPileCount(drawPileCount);
    });

    socket.on('gameState', ({ gameState }: GameStateEvent) => {
      console.log("GAME STATE", JSON.stringify(gameState))
      setPlayers(gameState.players);
      setDrawPileCount(gameState.drawPileCount);
      setCurrentTrick(gameState.currentTrick);
      setCurrentTurn(gameState.currentTurn);
    });

    socket.on('trickComplete', ({ players: updated }: TrickCompleteEvent) => {
      setPlayers(updated);
    });

    socket.on('error', (message: string) => {
      setError(message);
    });

    return () => {
      socket.off('gameCreated');
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('dealCards');
      socket.off('cardDrawn');
      socket.off('gameState');
      socket.off('trickComplete');
      socket.off('error');
    };
  }, []);

  const handleCreateGame = () => {
    if (playerName.trim()) {
      socket.emit('createGame', playerName);
      setError('');
    } else {
      setError('Please enter your name');
    }
  };

  const handleJoinGame = () => {
    if (playerName.trim() && gameCode.trim()) {
      socket.emit('joinGame', { gameCode, playerName });
      setError('');
    } else {
      setError('Please enter your name and game code');
    }
  };

  const handleStartGame = () => {
    socket.emit('startGame', gameCode);
  };

  if (!gameStarted) {
    return (
      <LobbyScreen
        playerName={playerName}
        gameCode={gameCode}
        players={players}
        error={error}
        onPlayerNameChange={setPlayerName}
        onGameCodeChange={setGameCode}
        onCreateGame={handleCreateGame}
        onJoinGame={handleJoinGame}
        onStartGame={handleStartGame}
      />
    );
  }

  return (
    <GameScreen
      players={players}
      currentPlayerId={socket.id || ''}
      cards={cards}
      drawPileCount={drawPileCount}
      currentTrick={currentTrick}
      currentTurn={currentTurn}
      onPlayHand={(indices: number[]) => {
        const selectedCards = indices.map(i => cards[i]);
        socket.emit('playHand', { gameCode, cards: selectedCards });
        setCards(prev => prev.filter((_, idx) => !indices.includes(idx)));
        setError('');
      }}
      onPass={() => {
        socket.emit('pass', gameCode);
        setError('');
      }}
    />
  );
}

export default App
