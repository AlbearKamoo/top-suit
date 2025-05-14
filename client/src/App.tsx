import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { GameScreen } from './components/GameScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { Card, CardsEvent, GameCreatedEvent, GameStartedEvent, Player, PlayersEvent, GameStateEvent, CardDrawnEvent, TrickCompleteEvent, PlayedHand, SUIT_HIERARCHY, RANK_VALUES } from './types';

export const socket = io('http://localhost:3001');

export function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  const [drawPileCount, setDrawPileCount] = useState(0);
  const [currentTrick, setCurrentTrick] = useState<PlayedHand[]>([]);
  const [currentTurn, setCurrentTurn] = useState('');
  const [winnerName, setWinnerName] = useState<string | null>(null);

  useEffect(() => {
    socket.on('gameCreated', ({ gameCode }: GameCreatedEvent) => {
      setGameCode(gameCode);
    });

    socket.on('playerJoined', ({ players }: PlayersEvent) => {
      setPlayers(players);
    });

    socket.on('gameStarted', ({ players, drawPileCount, currentTurn }: GameStartedEvent) => {
      setWinnerName(null);
      setPlayers(players);
      setGameStarted(true);
      setDrawPileCount(drawPileCount);
      setCurrentTrick([]);
      setCurrentTurn(currentTurn);
    });

    socket.on('gameOver', ({ players }: { players: Player[] }) => {
      const winner = players.find((p: Player) => p.cardCount === 0);
      setWinnerName(winner ? winner.name : null);
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
      socket.off('gameOver');
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
      onRestartGame={() => {
        setWinnerName(null);
        socket.emit('startGame', gameCode);
        setError('');
      }}
      winnerName={winnerName}
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
      onSortBySuit={() => {
        setCards(prev => [...prev].sort((a, b) => {
          const suitDiff = SUIT_HIERARCHY[a.suit] - SUIT_HIERARCHY[b.suit];
          if (suitDiff !== 0) return suitDiff;
          return RANK_VALUES[a.rank] - RANK_VALUES[b.rank];
        }));
      }}
      onSortByRank={() => {
        setCards(prev => [...prev].sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank]));
      }}
    />
  );
}

export default App
