import { useState, useEffect } from 'react'
import { io } from 'socket.io-client';
import styled from '@emotion/styled'

const socket = io('http://localhost:3001');

interface Player {
  id: string;
  name: string;
}

interface GameCreatedEvent {
  gameCode: string;
  playerId: string;
}

interface PlayersEvent {
  players: Player[];
}

interface CardsEvent {
  cards: string[];
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`

const Input = styled.input`
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
`

const Card = styled.div`
  display: inline-block;
  width: 60px;
  height: 90px;
  margin: 5px;
  padding: 10px;
  border: 1px solid #000;
  border-radius: 5px;
  background: white;
  font-size: 20px;
  cursor: pointer;
  user-select: none;

  &.red {
    color: red;
  }
`

const GameCode = styled.div`
  font-size: 24px;
  margin: 20px 0;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: inline-block;
`

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [cards, setCards] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');

  // Socket event handlers
  useEffect(() => {
    socket.on('gameCreated', ({ gameCode }: GameCreatedEvent) => {
      setGameCode(gameCode);
    });

    socket.on('playerJoined', ({ players }: PlayersEvent) => {
      setPlayers(players);
    });

    socket.on('gameStarted', ({ players }: PlayersEvent) => {
      setPlayers(players);
      setGameStarted(true);
    });

    socket.on('dealCards', ({ cards }: CardsEvent) => {
      setCards(cards);
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

  const createGame = () => {
    if (playerName.trim()) {
      socket.emit('createGame', playerName);
      setError('');
    } else {
      setError('Please enter your name');
    }
  };

  const joinGame = () => {
    if (playerName.trim() && gameCode.trim()) {
      socket.emit('joinGame', { gameCode, playerName });
      setError('');
    } else {
      setError('Please enter your name and game code');
    }
  };

  const isRedSuit = (card: string) => {
    return card.includes('♥') || card.includes('♦');
  };

  if (!gameStarted) {
    return (
      <Container>
        <h1>Card Game</h1>
        <div>
          <Input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
        <div>
          <Button onClick={createGame}>Create New Game</Button>
        </div>
        <div>
          <Input
            type="text"
            placeholder="Enter game code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          />
          <Button onClick={joinGame}>Join Game</Button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {gameCode && (
          <div>
            <h2>Game Code:</h2>
            <GameCode>{gameCode}</GameCode>
            <h3>Players:</h3>
            <ul>
              {players.map(player => (
                <li key={player.id}>{player.name}</li>
              ))}
            </ul>
            <p>Waiting for players... (3-4 players needed)</p>
          </div>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <h1>Game Started!</h1>
      <div>
        <h2>Players:</h2>
        <ul>
          {players.map(player => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Your Cards:</h2>
        <div>
          {cards.map((card, index) => (
            <Card
              key={index}
              className={isRedSuit(card) ? 'red' : ''}
            >
              {card}
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}

export default App
