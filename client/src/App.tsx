import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { GameScreen } from './components/GameScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { Card, CardsEvent, GameCreatedEvent, GameStartedEvent, Player, PlayersEvent } from './types';

const socket = io('http://localhost:3001');

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  const [drawPileCount, setDrawPileCount] = useState(0);

  useEffect(() => {
    socket.on('gameCreated', ({ gameCode }: GameCreatedEvent) => {
      setGameCode(gameCode);
    });

    socket.on('playerJoined', ({ players }: PlayersEvent) => {
      setPlayers(players);
    });

    socket.on('gameStarted', ({ players, drawPileCount }: GameStartedEvent) => {
      setPlayers(players);
      setGameStarted(true);
      setDrawPileCount(drawPileCount);
    });

    socket.on('dealCards', ({ cards, drawPileCount }: CardsEvent) => {
      setCards(cards);
      setDrawPileCount(drawPileCount);
    });

    socket.on('error', (message: string) => {
      setError(message);
    });

    return () => {
      socket.off('gameCreated');
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('dealCards');
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
    />
  );
}

export default App
